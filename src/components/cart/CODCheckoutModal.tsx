"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { CheckCircle2, LoaderCircle, ShieldCheck, Truck, X } from "lucide-react";
import { Button } from "@/components/ui/button";
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
}

interface CreatedOrderSnapshot {
  id: string;
  customerName: string;
  customerPhone: string;
  customerCity: string;
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
    } else if (field.field_type === "select" || field.field_type === "radio") {
      const opts =
        field.options && field.options.length > 0
          ? field.options
          : field.field_key === "city"
            ? MOROCCAN_CITIES_OPTIONS
            : [];
      next[field.field_key] =
        field.field_key === "city" && opts.length > 0 ? opts[0] : "";
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

  const totalMad = checkoutItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

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
        if ((field.is_required || cleanedPhone.length > 0) && cleanedPhone.length < 8) {
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
        totalMad,
      });

      if (!directItem) {
        useCartStore.setState({ items: [] });
      }

      setCreatedOrder({
        id: order.id,
        customerName,
        customerPhone,
        customerCity,
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
      ? `مرحباً TefLook، لقد أتممت الطلب رقم #${createdOrder.id} بمبلغ ${totalMad} درهم (الدفع عند الاستلام). يرجى تأكيد التوصيل.`
      : `Bonjour TefLook, je viens de passer la commande #${createdOrder.id} pour un montant de ${totalMad} MAD (Paiement à la livraison). Merci de me confirmer la livraison.`
    : "";

  return (
    <div
      dir={currentDirection}
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto"
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
        onClick={handleClose}
        aria-hidden="true"
      />

      {/* Modal Dialog */}
      <div className="relative z-10 w-full max-w-lg overflow-hidden rounded-2xl bg-card border border-border shadow-2xl my-auto animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border px-5 py-4 bg-[#F7FAFA]">
          <div className="flex items-center gap-2.5">
            <div className="grid size-9 place-items-center rounded-xl bg-brand-orange text-white shrink-0">
              <Truck size={18} />
            </div>
            <div>
              <h2 className="font-display text-base sm:text-lg font-bold text-foreground">
                {isAr
                  ? "الدفع عند الاستلام (COD)"
                  : "Paiement à la livraison (Cash on Delivery)"}
              </h2>
              <p className="text-[11px] text-muted-foreground">
                {isAr
                  ? "ادفع نقداً عند استلام طلبك في جميع مدن المغرب"
                  : "Réglez en espèces directement à la réception de votre colis partout au Maroc"}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleClose}
            aria-label={isAr ? "إغلاق" : "Fermer"}
            className="grid size-8 place-items-center rounded-full text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Body */}
        {createdOrder ? (
          /* Confirmation Success View */
          <div className="p-6 text-center space-y-4">
            <div className="mx-auto grid size-16 place-items-center rounded-full bg-emerald-100 text-emerald-600">
              <CheckCircle2 size={36} />
            </div>

            <div>
              <span className="inline-block rounded-full bg-brand-teal/10 px-3 py-1 text-xs font-bold text-brand-teal mb-2">
                {isAr
                  ? `الطلب رقم #${createdOrder.id}`
                  : `Commande N° #${createdOrder.id}`}
              </span>
              <h3 className="font-display text-2xl font-bold text-foreground">
                {isAr
                  ? "تم تأكيد طلبك بنجاح!"
                  : "Commande confirmée avec succès !"}
              </h3>
              <p className="mt-2 text-sm text-muted-foreground max-w-md mx-auto leading-relaxed">
                {isAr ? (
                  <>
                    شكراً لك <strong>{createdOrder.customerName}</strong>! تم
                    إرسال طلبك إلى ورشتنا. ستدفع{" "}
                    <strong>{totalMad} درهم نقداً</strong> لعامل التوصيل عند
                    باب منزلك.
                  </>
                ) : (
                  <>
                    Merci <strong>{createdOrder.customerName}</strong> ! Votre
                    commande a été transmise à notre atelier. Vous paierez{" "}
                    <strong>{totalMad} MAD en espèces</strong> au livreur à votre
                    porte.
                  </>
                )}
              </p>
            </div>

            {/* Delivery Recap Card */}
            <div
              className={cn(
                "rounded-xl border border-border/80 bg-secondary/50 p-4 text-xs space-y-2",
                isAr ? "text-right" : "text-left"
              )}
            >
              {createdOrder.customerCity && createdOrder.customerCity !== "-" && (
                <div className="flex justify-between gap-3">
                  <span className="text-muted-foreground">
                    {isAr ? "مدينة التوصيل :" : "Ville de livraison :"}
                  </span>
                  <span className="font-bold text-foreground">
                    {createdOrder.customerCity}
                  </span>
                </div>
              )}
              {createdOrder.customerPhone && (
                <div className="flex justify-between gap-3">
                  <span className="text-muted-foreground">
                    {isAr ? "رقم الهاتف :" : "Téléphone :"}
                  </span>
                  <span className="font-bold text-foreground" dir="ltr">
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
                    <span className="text-muted-foreground">
                      {(isAr ? entry.labelAr || entry.labelFr : entry.labelFr) +
                        " :"}
                    </span>
                    <span className="font-bold text-foreground truncate max-w-[60%]">
                      {entry.value}
                    </span>
                  </div>
                ))}
              <div className="flex justify-between gap-3">
                <span className="text-muted-foreground">
                  {isAr ? "مدة التوصيل المقدرة :" : "Délai estimé :"}
                </span>
                <span className="font-bold text-emerald-700">
                  {isAr ? "24 إلى 48 ساعة عمل" : "24h à 48h ouvrées"}
                </span>
              </div>
              <div className="flex justify-between gap-3 border-t border-border/60 pt-2 font-bold text-sm">
                <span>
                  {isAr
                    ? "المبلغ المستحق عند التسليم :"
                    : "Montant à régler au livreur :"}
                </span>
                <span className="text-brand-orange-deep">{totalMad} MAD</span>
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
                className="h-11 rounded-xl"
              >
                {isAr ? "مواصلة التسوق" : "Continuer mes achats"}
              </Button>
            </div>
          </div>
        ) : (
          /* COD Dynamic Form View */
          <form
            onSubmit={handleSubmit}
            className="p-5 sm:p-6 space-y-4 max-h-[75vh] overflow-y-auto"
          >
            {errorMsg && (
              <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-3 text-xs text-destructive font-medium flex items-center gap-2">
                <X size={15} className="shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Order Items Preview */}
            <div className="rounded-xl border border-border bg-[#FBF9F5] p-3">
              <div className="flex items-center justify-between text-xs font-semibold text-muted-foreground mb-2">
                <span>
                  {isAr
                    ? `المنتجات (${checkoutItems.reduce((acc, i) => acc + i.quantity, 0)})`
                    : `Articles (${checkoutItems.reduce((acc, i) => acc + i.quantity, 0)})`}
                </span>
                <span className="font-bold text-foreground">{totalMad} MAD</span>
              </div>
              <div className="max-h-24 overflow-y-auto divide-y divide-border/60 text-xs">
                {checkoutItems.map((item, idx) => (
                  <div
                    key={idx}
                    className="py-1.5 flex justify-between items-center gap-2"
                  >
                    <span className="truncate max-w-[260px] text-foreground">
                      {item.quantity}x {item.title}
                    </span>
                    <span className="font-bold shrink-0 text-brand-orange-deep">
                      {item.price * item.quantity} MAD
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Dynamic Inputs */}
            <div className="space-y-3">
              {isLoadingFields && activeFields.length === 0 ? (
                <div className="py-6 flex items-center justify-center text-xs text-muted-foreground gap-2">
                  <LoaderCircle className="animate-spin size-4" />
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
                        className="flex items-start gap-3 rounded-xl border border-border bg-background px-3.5 py-3 cursor-pointer hover:border-[#4B9393]/40 transition-colors"
                      >
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={(e) =>
                            setValue(field.field_key, e.target.checked)
                          }
                          className="mt-0.5 size-4 rounded border-border accent-[#4B9393] cursor-pointer"
                        />
                        <div className="text-xs leading-relaxed">
                          <span className="font-bold text-foreground">
                            {label}{" "}
                            {field.is_required && (
                              <span className="text-destructive">*</span>
                            )}
                          </span>
                          {placeholder && (
                            <p className="text-[11px] text-muted-foreground mt-0.5">
                              {placeholder}
                            </p>
                          )}
                        </div>
                      </label>
                    );
                  }

                  if (
                    field.field_key === "phone" &&
                    (field.field_type === "text" ||
                      field.field_type === "tel" ||
                      field.field_type === "number")
                  ) {
                    return (
                      <div key={field.id}>
                        <label className="block text-xs font-bold text-foreground mb-1">
                          {label}{" "}
                          {field.is_required && (
                            <span className="text-destructive">*</span>
                          )}
                        </label>
                        <div
                          dir="ltr"
                          className="flex rounded-xl border border-border bg-background overflow-hidden focus-within:border-brand-teal focus-within:ring-2 focus-within:ring-brand-teal/20 transition-all"
                        >
                          <span className="flex items-center gap-1 bg-secondary px-3 text-xs font-bold text-foreground border-r border-border">
                            <span>🇲🇦</span>
                            <span>+212</span>
                          </span>
                          <input
                            type="tel"
                            inputMode="tel"
                            required={field.is_required}
                            placeholder={placeholder || "06 XX XX XX XX"}
                            value={String(rawValue ?? "")}
                            onChange={(e) =>
                              setValue(field.field_key, e.target.value)
                            }
                            className="flex-1 h-10 px-3 text-sm bg-transparent outline-none"
                          />
                        </div>
                        <p className="mt-1 text-[11px] text-muted-foreground">
                          {isAr
                            ? "سيقوم عامل التوصيل بالاتصال بك على هذا الرقم قبل الوصول."
                            : "Le livreur vous appellera sur ce numéro avant d'arriver chez vous."}
                        </p>
                      </div>
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
                        <legend className="block text-xs font-bold text-foreground mb-1">
                          {label}{" "}
                          {field.is_required && (
                            <span className="text-destructive">*</span>
                          )}
                        </legend>
                        {placeholder && (
                          <p className="text-[11px] text-muted-foreground mb-1">
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
                                    ? "border-brand-teal bg-[#4B9393]/10 text-[#1A3C34]"
                                    : "border-border bg-background text-foreground hover:border-[#4B9393]/40"
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

                  if (field.field_type === "select") {
                    const options =
                      field.options && field.options.length > 0
                        ? field.options
                        : field.field_key === "city"
                          ? MOROCCAN_CITIES_OPTIONS
                          : [];

                    return (
                      <div key={field.id}>
                        <label className="block text-xs font-bold text-foreground mb-1">
                          {label}{" "}
                          {field.is_required && (
                            <span className="text-destructive">*</span>
                          )}
                        </label>
                        <select
                          required={field.is_required}
                          value={String(rawValue ?? "")}
                          onChange={(e) =>
                            setValue(field.field_key, e.target.value)
                          }
                          className="w-full h-10 px-3 rounded-xl border border-border bg-background text-sm outline-none focus:border-brand-teal focus:ring-2 focus:ring-brand-teal/20 transition-all"
                        >
                          {field.field_key !== "city" && (
                            <option value="">
                              {placeholder ||
                                (isAr ? "اختر خياراً..." : "Sélectionner...")}
                            </option>
                          )}
                          {options.map((opt) => (
                            <option key={opt} value={opt}>
                              {opt}
                            </option>
                          ))}
                        </select>
                      </div>
                    );
                  }

                  if (field.field_type === "textarea") {
                    return (
                      <div key={field.id}>
                        <label className="block text-xs font-bold text-foreground mb-1">
                          {label}{" "}
                          {field.is_required && (
                            <span className="text-destructive">*</span>
                          )}
                        </label>
                        <textarea
                          required={field.is_required}
                          rows={2}
                          placeholder={placeholder}
                          value={String(rawValue ?? "")}
                          onChange={(e) =>
                            setValue(field.field_key, e.target.value)
                          }
                          className="w-full p-3 rounded-xl border border-border bg-background text-sm outline-none focus:border-brand-teal focus:ring-2 focus:ring-brand-teal/20 transition-all resize-none"
                        />
                      </div>
                    );
                  }

                  const inputType =
                    field.field_type === "tel" ||
                    field.field_type === "email" ||
                    field.field_type === "number" ||
                    field.field_type === "date" ||
                    field.field_type === "time" ||
                    field.field_type === "url"
                      ? field.field_type
                      : "text";

                  const inputMode =
                    field.field_type === "tel"
                      ? "tel"
                      : field.field_type === "email"
                        ? "email"
                        : field.field_type === "number"
                          ? "decimal"
                          : field.field_type === "url"
                            ? "url"
                            : undefined;

                  return (
                    <div key={field.id}>
                      <label className="block text-xs font-bold text-foreground mb-1">
                        {label}{" "}
                        {field.is_required && (
                          <span className="text-destructive">*</span>
                        )}
                      </label>
                      <input
                        type={inputType}
                        inputMode={inputMode}
                        required={field.is_required}
                        placeholder={placeholder}
                        value={String(rawValue ?? "")}
                        onChange={(e) =>
                          setValue(field.field_key, e.target.value)
                        }
                        className="w-full h-10 px-3 rounded-xl border border-border bg-background text-sm outline-none focus:border-brand-teal focus:ring-2 focus:ring-brand-teal/20 transition-all"
                      />
                    </div>
                  );
                })
              )}
            </div>

            {/* Trust Badges */}
            <div className="flex flex-wrap items-center justify-between gap-2 py-2 text-[11px] text-muted-foreground border-y border-border/60">
              <span className="flex items-center gap-1">
                <Truck size={14} className="text-brand-teal" />
                {isAr ? "توصيل خلال 24-48 ساعة" : "Livraison 24-48h"}
              </span>
              <span className="flex items-center gap-1">
                <ShieldCheck size={14} className="text-brand-teal" />
                {isAr ? "بدون دفع إلكتروني" : "Zéro paiement en ligne"}
              </span>
              <span className="flex items-center gap-1 font-semibold text-emerald-700">
                💵 {isAr ? "نقداً عند الاستلام" : "Espèces à la livraison"}
              </span>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={isSubmitting || checkoutItems.length === 0}
              className="w-full h-12 rounded-xl bg-brand-orange text-white font-extrabold text-sm sm:text-base hover:bg-brand-orange/90 shadow-md shadow-brand-orange/25 transition-all cursor-pointer"
            >
              {isSubmitting ? (
                <LoaderCircle className="animate-spin size-5" />
              ) : isAr ? (
                `تأكيد الطلب • ${totalMad} درهم (الدفع عند الاستلام)`
              ) : (
                `Valider ma commande • ${totalMad} MAD (Paiement à la livraison)`
              )}
            </Button>
          </form>
        )}
      </div>
    </div>
  );
}
