"use client";

import React, { useEffect, useState } from "react";
import { CheckCircle2, LoaderCircle, MessageCircle, Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { CODCheckoutModal } from "@/components/cart/CODCheckoutModal";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useCartStore } from "@/lib/shopify-cart";
import { cleanWhatsAppNumber, fetchSiteSettings, type SiteSettings } from "@/lib/site-settings";
import { useTefLookLanguage } from "@/lib/teflook-language";
import { cn } from "@/lib/utils";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function ContactPageView() {
  const { locale, direction } = useTefLookLanguage();
  const [isMounted, setIsMounted] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCODModalOpen, setIsCODModalOpen] = useState(false);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const [whatsappPhone, setWhatsappPhone] = useState("212600000000");
  const [whatsappEnabled, setWhatsappEnabled] = useState(true);

  useEffect(() => {
    setIsMounted(true);
    void useCartStore.persist.rehydrate();

    fetchSiteSettings().then((s) => {
      if (s) {
        setWhatsappEnabled(s.whatsapp_enabled !== false);
        const cleaned = cleanWhatsAppNumber(s.whatsapp_phone);
        if (cleaned) setWhatsappPhone(cleaned);
      }
    });

    const handleSettingsUpdate = (e: Event) => {
      const customEvent = e as CustomEvent<SiteSettings>;
      if (customEvent.detail) {
        setWhatsappEnabled(customEvent.detail.whatsapp_enabled !== false);
        const cleaned = cleanWhatsAppNumber(customEvent.detail.whatsapp_phone);
        if (cleaned) setWhatsappPhone(cleaned);
      }
    };

    window.addEventListener("teflook:settings-updated", handleSettingsUpdate);
    return () => {
      window.removeEventListener("teflook:settings-updated", handleSettingsUpdate);
    };
  }, []);

  const currentLocale = isMounted ? locale : "fr";
  const currentDirection = isMounted ? direction : "ltr";
  const isAr = currentLocale === "ar";

  const whatsappUrl = `https://wa.me/${whatsappPhone}?text=${encodeURIComponent(
    isAr
      ? "مرحباً تيفلوك، أود التواصل معكم بخصوص استفسار عاجل."
      : "Bonjour TefLook, je souhaite vous contacter pour une question urgente."
  )}`;

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const trimmedName = name.trim();
    const trimmedEmail = email.trim();
    const trimmedPhone = phone.trim();
    const trimmedMessage = message.trim();

    if (trimmedName.length < 2) {
      setStatus({
        type: "error",
        text: isAr
          ? "يرجى إدخال اسمك الكامل."
          : "Veuillez entrer votre nom.",
      });
      return;
    }

    if (!EMAIL_REGEX.test(trimmedEmail)) {
      setStatus({
        type: "error",
        text: isAr
          ? "يرجى إدخال عنوان بريد إلكتروني صالح."
          : "Veuillez entrer une adresse e-mail valide.",
      });
      return;
    }

    if (trimmedMessage.length < 3) {
      setStatus({
        type: "error",
        text: isAr
          ? "يرجى كتابة رسالتك أو تعليقك."
          : "Veuillez écrire votre commentaire ou message.",
      });
      return;
    }

    setIsSubmitting(true);
    setStatus(null);

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: trimmedName,
          email: trimmedEmail,
          phone: trimmedPhone,
          message: trimmedMessage,
        }),
      });

      const data = await res.json();

      if (!res.ok || data.error) {
        setStatus({
          type: "error",
          text:
            data.error ||
            (isAr
              ? "تعذر إرسال رسالتك. يرجى المحاولة مرة أخرى."
              : "Impossible d'envoyer votre message. Veuillez réessayer."),
        });
        return;
      }

      setName("");
      setEmail("");
      setPhone("");
      setMessage("");
      setStatus({
        type: "success",
        text: isAr
          ? "شكراً لتواصلك معنا! تم إرسال رسالتك بنجاح وسنرد عليك في أقرب وقت."
          : "Merci ! Votre message a bien été envoyé. Notre équipe vous répondra très rapidement.",
      });
    } catch {
      setStatus({
        type: "error",
        text: isAr
          ? "حدث خطأ في الاتصال. يرجى المحاولة لاحقاً."
          : "Erreur réseau lors de l'envoi. Veuillez réessayer.",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div
      lang={currentLocale}
      dir={currentDirection}
      className="min-h-screen flex flex-col bg-white text-[#1A3C34]"
    >
      <Header onOpenCart={() => setIsCartOpen(true)} defaultSearchOpen={false} />

      <main className="flex-1 bg-white">
        <section
          aria-labelledby="contact-page-heading"
          className="max-w-2xl mx-auto px-4 sm:px-6 pt-12 pb-16"
        >
          <h1
            id="contact-page-heading"
            className={cn(
              "font-display text-3xl sm:text-4xl font-extrabold text-[#1A3C34] text-center mb-10",
              isAr && "font-sans"
            )}
          >
            {isAr ? "تواصل معنا" : "Contactez-Nous"}
          </h1>

          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            {/* Row 1: Nom & E-mail */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="contact-name" className="sr-only">
                  {isAr ? "الاسم" : "Nom"}
                </label>
                <input
                  id="contact-name"
                  name="name"
                  type="text"
                  autoComplete="name"
                  required
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    if (status?.type === "error") setStatus(null);
                  }}
                  placeholder={isAr ? "الاسم" : "Nom"}
                  className={cn(
                    "w-full rounded-xl bg-white border border-slate-300/90 px-4 py-3.5 text-sm sm:text-[15px] text-[#1A3C34] placeholder:text-slate-400 focus:border-[#4b9797] focus:ring-2 focus:ring-[#4b9797]/20 focus:outline-none transition-all",
                    isAr && "font-sans"
                  )}
                />
              </div>

              <div>
                <label htmlFor="contact-email" className="sr-only">
                  {isAr ? "البريد الإلكتروني" : "E-mail"}
                </label>
                <input
                  id="contact-email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (status?.type === "error") setStatus(null);
                  }}
                  placeholder={isAr ? "البريد الإلكتروني" : "E-mail"}
                  className={cn(
                    "w-full rounded-xl bg-white border border-slate-300/90 px-4 py-3.5 text-sm sm:text-[15px] text-[#1A3C34] placeholder:text-slate-400 focus:border-[#4b9797] focus:ring-2 focus:ring-[#4b9797]/20 focus:outline-none transition-all",
                    isAr && "font-sans"
                  )}
                />
              </div>
            </div>

            {/* Row 2: Numéro de téléphone */}
            <div>
              <label htmlFor="contact-phone" className="sr-only">
                {isAr ? "رقم الهاتف" : "Numéro de téléphone"}
              </label>
              <input
                id="contact-phone"
                name="phone"
                type="tel"
                autoComplete="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder={isAr ? "رقم الهاتف" : "Numéro de téléphone"}
                className={cn(
                  "w-full rounded-xl bg-white border border-slate-300/90 px-4 py-3.5 text-sm sm:text-[15px] text-[#1A3C34] placeholder:text-slate-400 focus:border-[#4b9797] focus:ring-2 focus:ring-[#4b9797]/20 focus:outline-none transition-all",
                  isAr && "font-sans"
                )}
              />
            </div>

            {/* Row 3: Commentaire */}
            <div>
              <label htmlFor="contact-message" className="sr-only">
                {isAr ? "رسالتك أو تعليقك" : "Commentaire"}
              </label>
              <textarea
                id="contact-message"
                name="message"
                rows={5}
                required
                value={message}
                onChange={(e) => {
                  setMessage(e.target.value);
                  if (status?.type === "error") setStatus(null);
                }}
                placeholder={isAr ? "رسالتك أو تعليقك" : "Commentaire"}
                className={cn(
                  "w-full rounded-xl bg-white border border-slate-300/90 px-4 py-3.5 text-sm sm:text-[15px] text-[#1A3C34] placeholder:text-slate-400 focus:border-[#4b9797] focus:ring-2 focus:ring-[#4b9797]/20 focus:outline-none transition-all resize-y",
                  isAr && "font-sans"
                )}
              />
            </div>

            {/* Full-Width Pill Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className={cn(
                  "w-full py-3.5 px-6 rounded-full bg-[#4b9797] hover:bg-[#3a7d7d] active:scale-[0.99] text-white font-display font-bold text-sm sm:text-base shadow-[0_8px_20px_-6px_rgba(75,151,151,0.45)] transition-all duration-200 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2",
                  isAr && "font-sans"
                )}
              >
                {isSubmitting && <LoaderCircle size={18} className="animate-spin" />}
                <span>
                  {isSubmitting
                    ? isAr
                      ? "جاري الإرسال..."
                      : "Envoi en cours..."
                    : isAr
                    ? "إرسال"
                    : "Envoyer"}
                </span>
              </button>
            </div>

            {/* Inline Status Feedback & Quick WhatsApp Option */}
            {status && (
              <div
                role={status.type === "error" ? "alert" : "status"}
                className={cn(
                  "mt-4 rounded-xl border px-4 py-3.5 text-sm font-medium flex flex-col gap-2",
                  status.type === "success"
                    ? "border-[#4b9797]/30 bg-[#4b9797]/8 text-[#1A3C34]"
                    : "border-[#ff3500]/30 bg-[#ff3500]/8 text-[#ff3500]",
                  isAr && "font-sans"
                )}
              >
                <div className="flex items-start gap-2.5">
                  {status.type === "success" && (
                    <CheckCircle2 size={18} className="text-[#4b9797] shrink-0 mt-0.5" />
                  )}
                  <span>{status.text}</span>
                </div>
                {status.type === "success" && whatsappEnabled && (
                  <a
                    href={whatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-[#4b9797] hover:text-[#3a7d7d] underline underline-offset-4 w-fit"
                  >
                    <MessageCircle size={15} className="shrink-0" />
                    <span>
                      {isAr
                        ? "هل تحتاج إلى رد عاجل؟ تواصل معنا مباشرة عبر واتساب"
                        : "Besoin d'une réponse urgente ? Écrivez-nous sur WhatsApp"}
                    </span>
                  </a>
                )}
              </div>
            )}
          </form>

          {whatsappEnabled && !status?.text && (
            <div className="mt-8 text-center">
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={cn(
                  "inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-[#4b9797] hover:text-[#1A3C34] transition-colors",
                  isAr && "font-sans"
                )}
              >
                <MessageCircle size={16} aria-hidden="true" />
                <span>
                  {isAr
                    ? "أو تواصل معنا مباشرة عبر واتساب"
                    : "Besoin d'une réponse immédiate ? Discutez sur WhatsApp"}
                </span>
              </a>
            </div>
          )}
        </section>
      </main>

      <Footer />

      <ContactCartSheet
        open={isCartOpen}
        onOpenChange={setIsCartOpen}
        onOpenCODCheckout={() => setIsCODModalOpen(true)}
      />

      <CODCheckoutModal open={isCODModalOpen} onOpenChange={setIsCODModalOpen} />
    </div>
  );
}

function ContactCartSheet({
  open,
  onOpenChange,
  onOpenCODCheckout,
}: {
  open: boolean;
  onOpenChange: (value: boolean) => void;
  onOpenCODCheckout: () => void;
}) {
  const { locale, direction, t } = useTefLookLanguage();
  const { items, isLoading, error } = useCartStore();
  const updateQuantity = useCartStore((state) => state.updateQuantity);
  const removeItem = useCartStore((state) => state.removeItem);

  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const currency = items[0]?.price.currencyCode ?? "MAD";
  const total = items.reduce(
    (sum, item) => sum + Number(item.price.amount) * item.quantity,
    0
  );

  function formatCartPrice(price: { amount: string; currencyCode: string }) {
    return `${Number(price.amount).toFixed(2).replace(".", ",")} ${price.currencyCode || "MAD"}`;
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        dir={direction}
        className="flex w-[min(100vw,440px)] flex-col gap-0 border-s border-border p-0 sm:max-w-[440px]"
      >
        <SheetHeader className="border-b border-border px-6 py-5 pe-14 text-start">
          <div className="flex items-center gap-2">
            <ShoppingBag size={19} className="text-primary" />
            <SheetTitle className="font-display text-xl">{t("cart.title")}</SheetTitle>
          </div>
          <SheetDescription>
            {itemCount
              ? `${itemCount} ${itemCount === 1 ? t("cart.countItem") : t("cart.countItems")}${t("cart.countPrefix")}`
              : t("cart.emptyText")}
          </SheetDescription>
        </SheetHeader>

        <div className="flex flex-1 flex-col overflow-hidden px-6">
          {items.length === 0 ? (
            <div className="flex flex-1 flex-col items-center justify-center text-center">
              <div className="grid size-14 place-items-center border border-border text-primary">
                <ShoppingBag size={23} />
              </div>
              <p className="mt-5 font-display text-lg font-semibold">{t("cart.empty")}</p>
              <Button onClick={() => onOpenChange(false)} className="mt-5 rounded-[3px] px-5">
                {t("cart.keepShopping")}
              </Button>
            </div>
          ) : (
            <>
              <div className="flex-1 divide-y divide-border overflow-y-auto">
                {items.map((item) => {
                  const image = item.product.images.edges[0]?.node;
                  return (
                    <article key={item.variantId} className="flex gap-3 py-4">
                      <div className="size-[76px] shrink-0 overflow-hidden bg-secondary">
                        {image && (
                          <img
                            src={image.url}
                            alt={image.altText || item.product.title}
                            className="size-full object-cover"
                          />
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="line-clamp-2 text-[13px] font-semibold leading-5">
                          {item.product.title}
                        </p>
                        <p className="mt-1.5 text-sm font-bold text-brand-orange-deep">
                          {formatCartPrice(item.price)}
                        </p>
                        <div className="mt-2 flex items-center gap-3">
                          <div className="flex h-8 items-center border border-border">
                            <button
                              type="button"
                              disabled={isLoading || item.quantity <= 1}
                              aria-label={`Diminuer ${item.product.title}`}
                              onClick={() => void updateQuantity(item.variantId, item.quantity - 1)}
                              className="grid size-8 place-items-center text-muted-foreground hover:text-foreground disabled:opacity-40"
                            >
                              <Minus size={13} />
                            </button>
                            <span className="w-7 text-center text-xs font-semibold">
                              {item.quantity}
                            </span>
                            <button
                              type="button"
                              disabled={isLoading}
                              aria-label={`Augmenter ${item.product.title}`}
                              onClick={() => void updateQuantity(item.variantId, item.quantity + 1)}
                              className="grid size-8 place-items-center text-muted-foreground hover:text-foreground disabled:opacity-40"
                            >
                              <Plus size={13} />
                            </button>
                          </div>
                          <button
                            type="button"
                            disabled={isLoading}
                            aria-label={`Retirer ${item.product.title}`}
                            onClick={() => void removeItem(item.variantId)}
                            className="grid size-8 place-items-center text-muted-foreground hover:text-destructive disabled:opacity-40"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
              <div className="space-y-4 border-t border-border py-5">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">{t("cart.subtotal")}</span>
                  <span className="font-display text-xl font-semibold">
                    {new Intl.NumberFormat(locale === "ar" ? "ar-MA" : "fr-MA", {
                      style: "currency",
                      currency,
                      maximumFractionDigits: 2,
                    }).format(total)}
                  </span>
                </div>
                {error && (
                  <p role="alert" className="text-sm text-destructive">
                    {error}
                  </p>
                )}
                <Button
                  onClick={() => {
                    onOpenChange(false);
                    onOpenCODCheckout();
                  }}
                  disabled={items.length === 0}
                  className="h-12 w-full justify-between rounded-[4px] bg-brand-orange px-5 text-white hover:bg-brand-orange/90 font-bold shadow-md cursor-pointer"
                >
                  <span>Commander • Paiement à la livraison</span>
                  <ShoppingBag size={18} />
                </Button>
              </div>
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
