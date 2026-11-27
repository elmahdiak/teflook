"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  CheckCircle2,
  LoaderCircle,
  Package,
  ShoppingBag,
  Truck,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  CheckoutFieldAddonIcon,
  DEFAULT_SHIPPING_FEE_MAD,
  SPLIT_INPUT_GROUP_CLASS,
  getAddonBoxClass,
} from "@/components/cart/CheckoutFieldAddonIcon";
import {
  DEFAULT_CHECKOUT_FIELDS,
  MOROCCAN_CITIES_OPTIONS,
  fetchCheckoutFields,
  type CheckoutFieldConfig,
} from "@/lib/checkout-fields";
import {
  saveCODOrder,
  type CODOrderCustomFieldEntry,
  type CODOrderItem,
} from "@/lib/cod-service";
import { useCartStore } from "@/lib/shopify-cart";
import { cleanWhatsAppNumber, fetchSiteSettings } from "@/lib/site-settings";
import { useTefLookLanguage } from "@/lib/teflook-language";
import { cn } from "@/lib/utils";

interface CODCheckoutModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  directItem?: CODOrderItem;
  shippingFee?: number;
}

interface CreatedOrderSnapshot {
  id: string;
  customerName: string;
  customerPhone: string;
  customerCity: string;
  totalWithShipping: number;
  shippingFee: number;
  customSummary: CODOrderCustomFieldEntry[];
}

function buildInitialFieldValues(
  fields: CheckoutFieldConfig[],
  existing: Record<string, string | boolean> = {}
): Record<string, string | boolean> {
  const next: Record<string, string | boolean> = { ...existing };

  for (const field of fields) {
    if (next[field.field_key] !== undefined) continue;

    if (field.field_type === "checkbox") {
      next[field.field_key] = false;
    } else {
      next[field.field_key] = "";
    }
  }

  return next;
}

function sortFields(fields: CheckoutFieldConfig[]): CheckoutFieldConfig[] {
  return [...fields].sort((a, b) => a.display_order - b.display_order);
}

export function CODCheckoutModal({
  open,
  onOpenChange,
  directItem,
  shippingFee,
}: CODCheckoutModalProps) {
  const { items } = useCartStore();
  const { locale, direction, isMounted } = useTefLookLanguage();
  const currentLocale = isMounted ? locale : "fr";
  const currentDirection = isMounted ? direction : "ltr";
  const isAr = currentLocale === "ar";

  const checkoutItems: CODOrderItem[] = directItem
    ? [directItem]
    : items.map((i) => ({
        productId: i.product.id,
        title: i.product.title,
        variantTitle: i.variantTitle,
        price: Number(i.price.amount),
        quantity: i.quantity,
        imageUrl: i.product.images.edges[0]?.node?.url,
      }));

  const subtotalMad = checkoutItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  const effectiveShippingFee =
    checkoutItems.length === 0
      ? 0
      : typeof shippingFee === "number" && Number.isFinite(shippingFee)
        ? Math.max(0, shippingFee)
        : DEFAULT_SHIPPING_FEE_MAD;

  const totalWithShipping = subtotalMad + effectiveShippingFee;

  const [fieldsConfig, setFieldsConfig] = useState<CheckoutFieldConfig[]>(
    DEFAULT_CHECKOUT_FIELDS
  );
  const [fieldValues, setFieldValues] = useState<Record<string, string | boolean>>(
    () => buildInitialFieldValues(DEFAULT_CHECKOUT_FIELDS)
  );
  const [isLoadingFields, setIsLoadingFields] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createdOrder, setCreatedOrder] = useState<CreatedOrderSnapshot | null>(null);
  const [errorMsg, setErrorMsg] = useState("");
  const [whatsappPhone, setWhatsappPhone] = useState("212600000000");

  const loadFields = useCallback(async () => {
    setIsLoadingFields(true);
    try {
      const { fields } = await fetchCheckoutFields();
      const sorted = sortFields(fields);
      setFieldsConfig(sorted);
      setFieldValues((prev) => buildInitialFieldValues(sorted, prev));
    } finally {
      setIsLoadingFields(false);
    }
  }, []);

  useEffect(() => {
    fetchSiteSettings().then((s) => {
      const cleaned = cleanWhatsAppNumber(s?.whatsapp_phone || "");
      if (cleaned) setWhatsappPhone(cleaned);
    });
  }, []);

  useEffect(() => {
    if (open) {
      loadFields();
    }
  }, [open, loadFields]);

  useEffect(() => {
    const handleCustomUpdate = (e: Event) => {
      const detail = (e as CustomEvent<CheckoutFieldConfig[]>).detail;
      if (Array.isArray(detail) && detail.length > 0) {
        const sorted = sortFields(detail);
        setFieldsConfig(sorted);
        setFieldValues((prev) => buildInitialFieldValues(sorted, prev));
      } else {
        loadFields();
      }
    };

    const handleStorage = (e: StorageEvent) => {
      if (e.key === "teflook_checkout_fields_v1") {
        loadFields();
      }
    };

    window.addEventListener("teflook:checkout-fields-updated", handleCustomUpdate);
    window.addEventListener("storage", handleStorage);

    let channel: BroadcastChannel | null = null;
    if (typeof BroadcastChannel !== "undefined") {
      channel = new BroadcastChannel("teflook_sync");
      channel.onmessage = (event) => {
        if (
          event.data?.type === "checkout-fields-updated" &&
          Array.isArray(event.data.fields)
        ) {
          const sorted = sortFields(event.data.fields);
          setFieldsConfig(sorted);
          setFieldValues((prev) => buildInitialFieldValues(sorted, prev));
        }
      };
    }

    return () => {
      window.removeEventListener(
        "teflook:checkout-fields-updated",
        handleCustomUpdate
      );
      window.removeEventListener("storage", handleStorage);
      if (channel) channel.close();
    };
  }, [loadFields]);

  const activeFields = useMemo(
    () => sortFields(fieldsConfig.filter((f) => f.is_enabled)),
    [fieldsConfig]
  );

  if (!open) return null;

  function setValue(key: string, value: string | boolean) {
    setFieldValues((prev) => ({ ...prev, [key]: value }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    for (const field of activeFields) {
      const label = isAr
        ? field.label_ar || field.label_fr
        : field.label_fr || field.label_ar;
      const val = fieldValues[field.field_key];

      if (field.is_required) {
        if (field.field_type === "checkbox") {
          if (!val) {
            setErrorMsg(
              isAr
                ? `يرجى تأكيد « ${label} ».`
                : `Veuillez confirmer le champ « ${label} ».`
            );
            return;
          }
        } else if (!String(val ?? "").trim()) {
          setErrorMsg(
            isAr
              ? `يرجى ملء حقل « ${label} ».`
              : `Veuillez renseigner le champ « ${label} ».`
          );
          return;
        }
      }

      if (field.field_key === "phone" || field.field_type === "tel") {
        const cleanedPhone = String(val ?? "").replace(/\s+/g, "").trim();
        if (
          (field.is_required || cleanedPhone.length > 0) &&
          cleanedPhone.length < 8
        ) {
          setErrorMsg(
            isAr
              ? "يرجى إدخال رقم هاتف مغربي صحيح."
              : "Veuillez renseigner un numéro de téléphone valide."
          );
          return;
        }
      }

      if (field.field_type === "email") {
        const emailVal = String(val ?? "").trim();
        if (emailVal && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailVal)) {
          setErrorMsg(
            isAr
              ? `يرجى إدخال بريد إلكتروني صحيح في حقل « ${label} ».`
              : `Veuillez saisir une adresse e-mail valide pour « ${label} ».`
          );
          return;
        }
      }

      if (field.field_type === "url") {
        const urlVal = String(val ?? "").trim();
        if (urlVal) {
          try {
            const parsedUrl = new URL(urlVal);
            if (!["http:", "https:"].includes(parsedUrl.protocol)) {
              throw new Error("invalid protocol");
            }
          } catch {
            setErrorMsg(
              isAr
                ? `يرجى إدخال رابط صحيح (https://...) في حقل « ${label} ».`
                : `Veuillez saisir une URL valide (ex: https://...) pour « ${label} ».`
            );
            return;
          }
        }
      }
    }

    setErrorMsg("");
    setIsSubmitting(true);

    try {
      const customFields: Record<string, string | boolean> = {};
      const customFieldsSummary: CODOrderCustomFieldEntry[] = [];

      for (const field of activeFields) {
        const raw = fieldValues[field.field_key];
        if (field.field_type === "checkbox") {
          const checked = Boolean(raw);
          customFields[field.field_key] = checked;
          customFieldsSummary.push({
            key: field.field_key,
            labelFr: field.label_fr,
            labelAr: field.label_ar,
            value: checked ? "Oui / نعم" : "Non / لا",
          });
        } else {
          const textVal = String(raw ?? "").trim();
          customFields[field.field_key] = textVal;
          if (textVal) {
            customFieldsSummary.push({
              key: field.field_key,
              labelFr: field.label_fr,
              labelAr: field.label_ar,
              value: textVal,
            });
          }
        }
      }

      const firstNonEmptyText =
        activeFields
          .filter(
            (f) =>
              f.field_type !== "checkbox" &&
              typeof fieldValues[f.field_key] === "string" &&
              String(fieldValues[f.field_key]).trim().length > 0
          )
          .map((f) => String(fieldValues[f.field_key]).trim())[0] || "";

      const customerName =
        String(fieldValues.full_name ?? "").trim() ||
        firstNonEmptyText ||
        (isAr ? "زبون تيفلوك" : "Client TefLook");
      const customerPhone = String(fieldValues.phone ?? "").trim();
      const customerCity = String(fieldValues.city ?? "").trim() || "-";
      const neighborhoodVal = String(fieldValues.neighborhood ?? "").trim();
      const customerAddress =
        String(fieldValues.address ?? "").trim() || neighborhoodVal || "-";
      const rawNotes = String(fieldValues.notes ?? "").trim();
      const combinedNotes =
        [
          neighborhoodVal ? `Quartier: ${neighborhoodVal}` : "",
          rawNotes,
        ]
          .filter(Boolean)
          .join(" • ") || undefined;

      const order = saveCODOrder({
        customerName,
        customerPhone,
        customerCity,
        customerAddress,
        notes: combinedNotes,
        customFields,
        customFieldsSummary,
        items: checkoutItems,
        totalMad: totalWithShipping,
      });

      if (!directItem) {
        useCartStore.setState({ items: [] });
      }

      setCreatedOrder({
        id: order.id,
        customerName,
        customerPhone,
        customerCity,
        totalWithShipping,
        shippingFee: effectiveShippingFee,
        customSummary: customFieldsSummary,
      });
    } catch {
      setErrorMsg(
        isAr
          ? "حدث خطأ أثناء تسجيل طلبكم. يرجى المحاولة مرة أخرى."
          : "Une erreur est survenue lors de l'enregistrement de votre commande."
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleClose() {
    setCreatedOrder(null);
    setErrorMsg("");
    setFieldValues(buildInitialFieldValues(fieldsConfig));
    onOpenChange(false);
  }

  const whatsappMessage = createdOrder
    ? isAr
      ? `مرحباً TefLook، لقد أتممت الطلب رقم #${createdOrder.id} بمبلغ ${createdOrder.totalWithShipping} درهم (الدفع عند الاستلام). يرجى تأكيد التوصيل.`
      : `Bonjour TefLook, je viens de passer la commande #${createdOrder.id} pour un montant de ${createdOrder.totalWithShipping} MAD (Paiement à la livraison). Merci de me confirmer la livraison.`
    : "";

  const addonBoxClass = getAddonBoxClass(isAr);

  return (
    <div
      dir={currentDirection}
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto"
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-[#1A3C34]/55 backdrop-blur-xs transition-opacity"
        onClick={handleClose}
        aria-hidden="true"
      />

      {/* Modal Dialog */}
      <div className="relative z-10 w-full max-w-lg overflow-hidden rounded-2xl bg-white border border-[#4B9393]/20 shadow-2xl my-auto animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#4B9393]/15 px-5 py-4 bg-[#F3EFE6]/70">
          <div className="flex items-center gap-3 min-w-0">
            <div className="grid size-10 place-items-center rounded-xl bg-[#4B9393] text-white shrink-0 shadow-xs">
              <ShoppingBag size={18} />
            </div>
            <div className="min-w-0">
              <h2 className="font-display text-base sm:text-lg font-bold text-[#1A3C34] leading-snug">
                {isAr
                  ? "يرجى ملء الاستمارة للطلب"
                  : "Veuillez remplir le formulaire pour commander"}
              </h2>
              <p className="text-[11px] font-medium text-[#4B9393]">
                {isAr
                  ? "الدفع نقداً عند الاستلام • لجميع مدن المغرب"
                  : "Paiement en espèces à la livraison • Partout au Maroc"}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleClose}
            aria-label={isAr ? "إغلاق" : "Fermer"}
            className="grid size-8 shrink-0 place-items-center rounded-full text-[#1A3C34]/60 hover:bg-white hover:text-[#1A3C34] transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Body */}
        {createdOrder ? (
          /* Confirmation Success View */
          <div className="p-6 text-center space-y-4">
            <div className="mx-auto grid size-16 place-items-center rounded-full bg-[#4B9393]/15 text-[#4B9393]">
              <CheckCircle2 size={36} />
            </div>

            <div>
              <span className="inline-block rounded-full bg-[#F3EFE6] border border-[#4B9393]/20 px-3 py-1 text-xs font-bold text-[#4B9393] mb-2">
                {isAr
                  ? `الطلب رقم #${createdOrder.id}`
                  : `Commande N° #${createdOrder.id}`}
              </span>
              <h3 className="font-display text-2xl font-bold text-[#1A3C34]">
                {isAr
                  ? "تم تأكيد طلبك بنجاح!"
                  : "Commande confirmée avec succès !"}
              </h3>
              <p className="mt-2 text-sm text-[#1A3C34]/75 max-w-md mx-auto leading-relaxed">
                {isAr ? (
                  <>
                    شكراً لك <strong>{createdOrder.customerName}</strong>! تم
                    إرسال طلبك إلى ورشتنا. ستدفع{" "}
                    <strong>{createdOrder.totalWithShipping} درهم نقداً</strong>{" "}
                    لعامل التوصيل عند باب منزلك.
                  </>
                ) : (
                  <>
                    Merci <strong>{createdOrder.customerName}</strong> ! Votre
                    commande a été transmise à notre atelier. Vous paierez{" "}
                    <strong>{createdOrder.totalWithShipping} MAD en espèces</strong>{" "}
                    au livreur à votre porte.
                  </>
                )}
              </p>
            </div>

            {/* Delivery Recap Card */}
            <div
              className={cn(
                "rounded-xl border border-[#4B9393]/20 bg-[#F3EFE6]/50 p-4 text-xs space-y-2",
                isAr ? "text-right" : "text-left"
              )}
            >
              {createdOrder.customerCity && createdOrder.customerCity !== "-" && (
                <div className="flex justify-between gap-3">
                  <span className="text-[#1A3C34]/65">
                    {isAr ? "مدينة التوصيل :" : "Ville de livraison :"}
                  </span>
                  <span className="font-bold text-[#1A3C34]">
                    {createdOrder.customerCity}
                  </span>
                </div>
              )}
              {createdOrder.customerPhone && (
                <div className="flex justify-between gap-3">
                  <span className="text-[#1A3C34]/65">
                    {isAr ? "رقم الهاتف :" : "Téléphone :"}
                  </span>
                  <span className="font-bold text-[#1A3C34]" dir="ltr">
                    {createdOrder.customerPhone}
                  </span>
                </div>
              )}
              {createdOrder.customSummary
                .filter(
                  (entry) =>
                    !["full_name", "phone", "city"].includes(entry.key)
                )
                .map((entry) => (
                  <div key={entry.key} className="flex justify-between gap-3">
                    <span className="text-[#1A3C34]/65">
                      {(isAr ? entry.labelAr || entry.labelFr : entry.labelFr) +
                        " :"}
                    </span>
                    <span className="font-bold text-[#1A3C34] truncate max-w-[60%]">
                      {entry.value}
                    </span>
                  </div>
                ))}
              <div className="flex justify-between gap-3">
                <span className="text-[#1A3C34]/65">
                  {isAr ? "الشحن :" : "Expédition (Partout au Maroc) :"}
                </span>
                <span className="font-bold text-[#4B9393]">
                  {createdOrder.shippingFee <= 0
                    ? isAr
                      ? "مجاني"
                      : "Gratuit"
                    : isAr
                      ? `${createdOrder.shippingFee} درهم`
                      : `${createdOrder.shippingFee} MAD`}
                </span>
              </div>
              <div className="flex justify-between gap-3">
                <span className="text-[#1A3C34]/65">
                  {isAr ? "مدة التوصيل المقدرة :" : "Délai estimé :"}
                </span>
                <span className="font-bold text-[#4B9393]">
                  {isAr ? "24 إلى 48 ساعة عمل" : "24h à 48h ouvrées"}
                </span>
              </div>
              <div className="flex justify-between gap-3 border-t border-[#4B9393]/15 pt-2 font-bold text-sm text-[#1A3C34]">
                <span>
                  {isAr
                    ? "المبلغ المستحق عند التسليم :"
                    : "Total à régler au livreur :"}
                </span>
                <span className="text-[#F67D56]">
                  {createdOrder.totalWithShipping} MAD
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="pt-2 flex flex-col gap-2.5">
              <a
                href={`https://wa.me/${whatsappPhone}?text=${encodeURIComponent(whatsappMessage)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#25D366] text-white font-bold text-sm hover:bg-[#20ba59] transition-all shadow-md shadow-[#25D366]/20"
              >
                <img
                  src="https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg"
                  alt=""
                  className="size-5"
                />
                {isAr
                  ? "تتبع طلبي عبر واتساب"
                  : "Recevoir le suivi de commande sur WhatsApp"}
              </a>
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                className="h-11 rounded-xl border-[#4B9393]/25 text-[#1A3C34] hover:bg-[#F3EFE6] cursor-pointer"
              >
                {isAr ? "مواصلة التسوق" : "Continuer mes achats"}
              </Button>
            </div>
          </div>
        ) : (
          /* COD Dynamic Form View */
          <form
            onSubmit={handleSubmit}
            className="p-5 sm:p-6 space-y-4 max-h-[80vh] overflow-y-auto"
          >
            {errorMsg && (
              <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-700 font-medium flex items-center gap-2">
                <X size={15} className="shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* 1. Compact Horizontal Product Summary Row(s) with Floating Quantity Badge */}
            {checkoutItems.length > 0 && (
              <div className="rounded-xl border border-[#4B9393]/20 bg-[#F3EFE6]/45 px-3.5 py-2.5 divide-y divide-[#4B9393]/15 max-h-40 overflow-y-auto">
                {checkoutItems.map((item, idx) => (
                  <div
                    key={`${item.productId}-${idx}`}
                    className="flex items-center justify-between gap-3 py-2 first:pt-1 last:pb-0.5"
                  >
                    <div className="flex items-center gap-3.5 min-w-0">
                      <div className="relative shrink-0 mt-1 me-1">
                        {item.imageUrl ? (
                          <img
                            src={item.imageUrl}
                            alt={item.title}
                            className="w-14 h-14 rounded-xl object-cover border border-[#4B9393]/15 bg-white"
                          />
                        ) : (
                          <div className="w-14 h-14 rounded-xl border border-[#4B9393]/15 bg-[#F3EFE6] flex items-center justify-center text-[#4B9393]">
                            <Package size={22} />
                          </div>
                        )}
                        <span className="absolute -top-2 -right-2 bg-[#1A3C34] text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center shadow-xs tabular-nums">
                          {item.quantity}
                        </span>
                      </div>

                      <div className="min-w-0">
                        <p className="text-sm font-bold text-[#1A3C34] line-clamp-2 leading-snug">
                          {item.title}
                        </p>
                        {item.variantTitle &&
                          item.variantTitle !== "Default Title" && (
                            <p className="text-[11px] text-[#1A3C34]/65 truncate mt-0.5">
                              {item.variantTitle}
                            </p>
                          )}
                      </div>
                    </div>

                    <span className="text-sm font-extrabold text-[#1A3C34] whitespace-nowrap shrink-0 tabular-nums">
                      {item.price * item.quantity} {isAr ? "درهم" : "MAD"}
                    </span>
                  </div>
                ))}
              </div>
            )}

            {/* 2. Dedicated Shipping Option Card */}
            <div className="space-y-1.5">
              <p className="text-xs font-bold uppercase tracking-wider text-[#1A3C34]/75">
                {isAr ? "خيارات الشحن" : "Options d'expédition"}
              </p>
              <div className="border border-[#4B9393]/25 bg-[#F3EFE6]/40 rounded-xl p-3.5 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5 min-w-0">
                  <span
                    aria-hidden="true"
                    className="size-4 shrink-0 rounded-full border-2 border-[#4B9393] bg-white flex items-center justify-center"
                  >
                    <span className="size-2 rounded-full bg-[#4B9393]" />
                  </span>
                  <span className="text-xs sm:text-sm font-semibold text-[#1A3C34]">
                    {isAr
                      ? "التوصيل لجميع المدن المغربية"
                      : "Partout au Maroc"}
                  </span>
                </div>
                <span className="text-xs sm:text-sm font-extrabold text-[#1A3C34] shrink-0">
                  {effectiveShippingFee <= 0
                    ? isAr
                      ? "مجاني"
                      : "Gratuit"
                    : isAr
                      ? `${effectiveShippingFee} درهم`
                      : `${effectiveShippingFee} MAD`}
                </span>
              </div>
            </div>

            {/* 3. Dynamic Split-Group Form Inputs */}
            <div className="space-y-3">
              {isLoadingFields && activeFields.length === 0 ? (
                <div className="py-6 flex items-center justify-center text-xs text-[#1A3C34]/70 gap-2">
                  <LoaderCircle className="animate-spin size-4 text-[#4B9393]" />
                  <span>
                    {isAr
                      ? "جاري تحميل استمارة الطلب..."
                      : "Chargement du formulaire..."}
                  </span>
                </div>
              ) : (
                activeFields.map((field) => {
                  const label = isAr
                    ? field.label_ar || field.label_fr
                    : field.label_fr || field.label_ar;
                  const placeholder = isAr
                    ? field.placeholder_ar || field.placeholder_fr
                    : field.placeholder_fr || field.placeholder_ar;
                  const rawValue = fieldValues[field.field_key];

                  if (field.field_type === "checkbox") {
                    const checked = Boolean(rawValue);
                    return (
                      <label
                        key={field.id}
                        className="flex items-start gap-3 rounded-xl border border-[#4B9393]/25 bg-[#F3EFE6]/30 px-3.5 py-3 cursor-pointer hover:border-[#4B9393]/50 transition-colors"
                      >
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={(e) =>
                            setValue(field.field_key, e.target.checked)
                          }
                          className="mt-0.5 size-4 rounded border-[#4B9393]/30 accent-[#4B9393] cursor-pointer"
                        />
                        <div className="text-xs leading-relaxed">
                          <span className="font-bold text-[#1A3C34]">
                            {label}{" "}
                            {field.is_required && (
                              <span className="text-[#F67D56]">*</span>
                            )}
                          </span>
                          {placeholder && (
                            <p className="text-[11px] text-[#1A3C34]/65 mt-0.5">
                              {placeholder}
                            </p>
                          )}
                        </div>
                      </label>
                    );
                  }

                  if (field.field_type === "radio") {
                    const options =
                      field.options && field.options.length > 0
                        ? field.options
                        : ["Option 1", "Option 2"];
                    const selectedVal = String(rawValue ?? "");

                    return (
                      <fieldset key={field.id} className="space-y-1.5">
                        <legend className="block text-xs font-bold text-[#1A3C34] mb-1">
                          {label}{" "}
                          {field.is_required && (
                            <span className="text-[#F67D56]">*</span>
                          )}
                        </legend>
                        {placeholder && (
                          <p className="text-[11px] text-[#1A3C34]/65 mb-1">
                            {placeholder}
                          </p>
                        )}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {options.map((opt) => {
                            const isSelected = selectedVal === opt;
                            return (
                              <label
                                key={opt}
                                className={cn(
                                  "flex items-center gap-2.5 rounded-xl border px-3 py-2.5 text-xs font-semibold cursor-pointer transition-all",
                                  isSelected
                                    ? "border-[#4B9393] bg-[#F3EFE6]/65 text-[#1A3C34]"
                                    : "border-[#4B9393]/20 bg-white text-[#1A3C34] hover:border-[#4B9393]/45"
                                )}
                              >
                                <input
                                  type="radio"
                                  name={`cod-radio-${field.field_key}`}
                                  value={opt}
                                  required={field.is_required}
                                  checked={isSelected}
                                  onChange={() => setValue(field.field_key, opt)}
                                  className="size-4 accent-[#4B9393] cursor-pointer"
                                />
                                <span>{opt}</span>
                              </label>
                            );
                          })}
                        </div>
                      </fieldset>
                    );
                  }

                  if (
                    field.field_key === "phone" ||
                    field.field_type === "tel"
                  ) {
                    return (
                      <div key={field.id}>
                        <label className="block text-xs font-bold text-[#1A3C34] mb-1">
                          {label}{" "}
                          {field.is_required && (
                            <span className="text-[#F67D56]">*</span>
                          )}
                        </label>
                        <div className={SPLIT_INPUT_GROUP_CLASS}>
                          <div className={cn(addonBoxClass, "gap-1.5")}>
                            <CheckoutFieldAddonIcon field={field} size={16} />
                            {field.field_key === "phone" && (
                              <span
                                dir="ltr"
                                className="text-[11px] font-bold text-[#1A3C34]/80"
                              >
                                +212
                              </span>
                            )}
                          </div>
                          <input
                            type="tel"
                            inputMode="tel"
                            dir="ltr"
                            required={field.is_required}
                            placeholder={placeholder || "06 XX XX XX XX"}
                            value={String(rawValue ?? "")}
                            onChange={(e) =>
                              setValue(field.field_key, e.target.value)
                            }
                            className={cn(
                              "flex-1 min-w-0 h-11 px-3.5 text-sm text-[#1A3C34] bg-transparent outline-none placeholder:text-[#1A3C34]/40",
                              isAr && "text-right"
                            )}
                          />
                        </div>
                      </div>
                    );
                  }

                  if (field.field_type === "select") {
                    const options =
                      field.options && field.options.length > 0
                        ? field.options
                        : field.field_key === "city"
                          ? MOROCCAN_CITIES_OPTIONS
                          : [];
                    const selectValue = String(rawValue ?? "");
                    const placeholderOptionLabel =
                      placeholder ||
                      (field.field_key === "city"
                        ? isAr
                          ? "اختر مدينتك..."
                          : "Choisir votre ville..."
                        : isAr
                          ? "اختر خياراً..."
                          : "Sélectionner...");

                    return (
                      <div key={field.id}>
                        <label className="block text-xs font-bold text-[#1A3C34] mb-1">
                          {label}{" "}
                          {field.is_required && (
                            <span className="text-[#F67D56]">*</span>
                          )}
                        </label>
                        <div className={SPLIT_INPUT_GROUP_CLASS}>
                          <div className={addonBoxClass}>
                            <CheckoutFieldAddonIcon field={field} size={16} />
                          </div>
                          <select
                            required={field.is_required}
                            value={selectValue}
                            onChange={(e) =>
                              setValue(field.field_key, e.target.value)
                            }
                            className={cn(
                              "flex-1 min-w-0 h-11 px-3.5 text-sm bg-transparent outline-none cursor-pointer",
                              selectValue === ""
                                ? "text-[#1A3C34]/45"
                                : "text-[#1A3C34]"
                            )}
                          >
                            <option value="" disabled className="text-[#1A3C34]/50">
                              {placeholderOptionLabel}
                            </option>
                            {options.map((opt) => (
                              <option
                                key={opt}
                                value={opt}
                                className="text-[#1A3C34]"
                              >
                                {opt}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                    );
                  }

                  if (field.field_type === "textarea") {
                    return (
                      <div key={field.id}>
                        <label className="block text-xs font-bold text-[#1A3C34] mb-1">
                          {label}{" "}
                          {field.is_required && (
                            <span className="text-[#F67D56]">*</span>
                          )}
                        </label>
                        <div className={SPLIT_INPUT_GROUP_CLASS}>
                          <div className={addonBoxClass}>
                            <CheckoutFieldAddonIcon field={field} size={16} />
                          </div>
                          <textarea
                            required={field.is_required}
                            rows={2}
                            placeholder={placeholder}
                            value={String(rawValue ?? "")}
                            onChange={(e) =>
                              setValue(field.field_key, e.target.value)
                            }
                            className="flex-1 min-w-0 p-3 text-sm text-[#1A3C34] bg-transparent outline-none resize-none placeholder:text-[#1A3C34]/40"
                          />
                        </div>
                      </div>
                    );
                  }

                  const inputType =
                    field.field_type === "email" ||
                    field.field_type === "number" ||
                    field.field_type === "date" ||
                    field.field_type === "time" ||
                    field.field_type === "url"
                      ? field.field_type
                      : "text";

                  const inputMode =
                    field.field_type === "email"
                      ? "email"
                      : field.field_type === "number"
                        ? "decimal"
                        : field.field_type === "url"
                          ? "url"
                          : undefined;

                  return (
                    <div key={field.id}>
                      <label className="block text-xs font-bold text-[#1A3C34] mb-1">
                        {label}{" "}
                        {field.is_required && (
                          <span className="text-[#F67D56]">*</span>
                        )}
                      </label>
                      <div className={SPLIT_INPUT_GROUP_CLASS}>
                        <div className={addonBoxClass}>
                          <CheckoutFieldAddonIcon field={field} size={16} />
                        </div>
                        <input
                          type={inputType}
                          inputMode={inputMode}
                          required={field.is_required}
                          placeholder={
                            placeholder ||
                            (field.field_key === "city"
                              ? isAr
                                ? "مدينتك"
                                : "Votre ville"
                              : "")
                          }
                          value={String(rawValue ?? "")}
                          onChange={(e) =>
                            setValue(field.field_key, e.target.value)
                          }
                          className="flex-1 min-w-0 h-11 px-3.5 text-sm text-[#1A3C34] bg-transparent outline-none placeholder:text-[#1A3C34]/40"
                        />
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* 4. High-Conversion Coral Submit CTA & Single-Line Trust Footer */}
            <div className="pt-1 space-y-2.5">
              <Button
                type="submit"
                disabled={isSubmitting || checkoutItems.length === 0}
                className="h-auto bg-[#F67D56] hover:bg-[#e56c45] text-white font-bold py-4 px-6 rounded-xl shadow-md transition-all w-full flex items-center justify-center gap-2.5 text-sm sm:text-base cursor-pointer disabled:opacity-50"
              >
                {isSubmitting ? (
                  <LoaderCircle className="animate-spin size-5" />
                ) : (
                  <>
                    <ShoppingBag size={18} className="shrink-0" />
                    <span>
                      {isAr
                        ? `اطلب الآن • ${totalWithShipping} درهم`
                        : `Commander maintenant • ${totalWithShipping} MAD`}
                    </span>
                  </>
                )}
              </Button>

              <p className="text-center text-[11px] font-medium text-[#1A3C34]/70 flex items-center justify-center gap-1.5">
                <Truck size={13} className="text-[#4B9393] shrink-0" />
                <span>
                  {isAr
                    ? "توصيل خلال 24-48 ساعة • الدفع نقداً عند الاستلام"
                    : "Livraison 24–48h • Paiement en espèces à la livraison"}
                </span>
              </p>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
