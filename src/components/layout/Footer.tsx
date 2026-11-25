"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { BrandLogo } from "@/components/ui/BrandLogo";
import { FooterSocialLinks } from "@/components/footer/FooterSocialLinks";
import { useCookieConsent } from "@/lib/cookies";
import { cleanWhatsAppNumber, fetchSiteSettings, type SiteSettings } from "@/lib/site-settings";
import { translations, useTefLookLanguage } from "@/lib/teflook-language";
import { cn } from "@/lib/utils";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function Footer() {
  const { locale, direction } = useTefLookLanguage();
  const { openSettingsModal } = useCookieConsent();
  const [isMounted, setIsMounted] = useState(false);
  const [email, setEmail] = useState("");
  const [feedback, setFeedback] = useState<{
    type: "error" | "success";
    message: string;
  } | null>(null);
  const [whatsappPhone, setWhatsappPhone] = useState("212600000000");

  useEffect(() => {
    setIsMounted(true);

    fetchSiteSettings().then((s) => {
      if (s?.whatsapp_phone && s.whatsapp_enabled !== false) {
        const cleaned = cleanWhatsAppNumber(s.whatsapp_phone);
        if (cleaned) setWhatsappPhone(cleaned);
      }
    });

    const handleSettingsUpdate = (e: Event) => {
      const customEvent = e as CustomEvent<SiteSettings>;
      if (customEvent.detail?.whatsapp_phone) {
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
  const messages = translations[currentLocale];
  const currentYear = isMounted ? new Date().getFullYear() : 2026;

  const helpHref = whatsappPhone
    ? `https://wa.me/${whatsappPhone}?text=${encodeURIComponent(
        isAr
          ? "مرحباً تيفلوك، أحتاج إلى مساعدة بخصوص منتجاتكم."
          : "Bonjour TefLook, j'ai besoin d'aide concernant vos produits."
      )}`
    : "/#faq";

  function handleNewsletterSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const trimmed = email.trim();

    if (!trimmed) {
      setFeedback({
        type: "error",
        message: isAr
          ? "يرجى إدخال عنوان بريد إلكتروني."
          : "Veuillez entrer une adresse e-mail.",
      });
      return;
    }

    if (!EMAIL_REGEX.test(trimmed)) {
      setFeedback({
        type: "error",
        message: isAr
          ? "عنوان البريد الإلكتروني غير صالح. يرجى التحقق."
          : "Adresse e-mail invalide. Veuillez vérifier.",
      });
      return;
    }

    setFeedback({
      type: "success",
      message: isAr
        ? "شكراً لك! تم تسجيل اشتراكك بنجاح."
        : "Merci ! Votre inscription a bien été enregistrée.",
    });
    setEmail("");
  }

  return (
    <footer
      dir={currentDirection}
      aria-label={isAr ? "تذييل صفحة تيفلوك" : "Pied de page TefLook"}
      className="relative w-full text-white mt-auto select-none"
    >
      {/* Signature Diagonal Slanted Top Edge */}
      <div
        className="w-full overflow-hidden leading-none bg-white -mb-px"
        aria-hidden="true"
      >
        <svg
          className="relative block w-full h-14 sm:h-20 md:h-24 lg:h-28"
          viewBox="0 0 1440 120"
          preserveAspectRatio="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <polygon points="0,120 1440,0 1440,120" fill="#4b9797" />
        </svg>
      </div>

      {/* Main Teal Footer Body */}
      <div className="bg-[#4b9797]">
        <div className="max-w-6xl mx-auto px-6 sm:px-8 lg:px-10 pt-10 sm:pt-14 pb-2">
          {/* 3-Column Airy Grid (12-column layout on desktop: 5 / 3 / 4) */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-12 md:gap-8 lg:gap-12 items-start">
            {/* Column 1: Brand Identity + Email Subscription Form */}
            <div className="md:col-span-5 flex flex-col items-start">
              <BrandLogo size="md" variant="dark" href="/" />

              <h2
                className={cn(
                  "mt-6 font-display font-bold text-xl sm:text-[22px] text-white tracking-tight",
                  isAr && "font-sans tracking-normal"
                )}
              >
                {messages["footer.tagline"]}
              </h2>

              <p
                className={cn(
                  "mt-2.5 text-[15px] text-white/90 max-w-sm leading-relaxed",
                  isAr && "font-sans"
                )}
              >
                {messages["footer.description"]}
              </p>

              {/* Email Subscription Form */}
              <form
                onSubmit={handleNewsletterSubmit}
                className="mt-6 w-full max-w-sm"
                noValidate
              >
                <label htmlFor="footer-email" className="sr-only">
                  {isAr ? "البريد الإلكتروني" : "Adresse e-mail"}
                </label>
                <input
                  id="footer-email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (feedback) setFeedback(null);
                  }}
                  placeholder={isAr ? "البريد الإلكتروني" : "E-mail"}
                  className={cn(
                    "w-full rounded-xl bg-white/5 border border-white/60 focus:border-white focus:bg-white/10 focus:outline-none focus:ring-2 focus:ring-white/25 px-4 py-3.5 text-[15px] text-white placeholder:text-white/75 transition-all duration-200",
                    isAr && "font-sans"
                  )}
                />

                <button
                  type="submit"
                  className={cn(
                    "mt-3 w-full rounded-2xl bg-white hover:bg-[#FAF8F5] active:scale-[0.99] py-3.5 px-6 font-display font-semibold text-[#4b9797] text-[15px] shadow-sm transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-[#4b9797] focus-visible:ring-white cursor-pointer",
                    isAr && "font-sans"
                  )}
                >
                  {isAr ? "اشترك الآن" : "S’inscrire maintenant"}
                </button>

                <p
                  role="status"
                  aria-live="polite"
                  className={cn(
                    "mt-2.5 min-h-[20px] text-[13px] font-medium transition-opacity duration-200",
                    feedback ? "opacity-100" : "opacity-0",
                    feedback?.type === "error" ? "text-amber-200" : "text-white",
                    isAr && "font-sans"
                  )}
                >
                  {feedback?.message ?? ""}
                </p>
              </form>
            </div>

            {/* Column 2: LA BOUTIQUE */}
            <div className="md:col-span-3 md:pt-2">
              <h3
                className={cn(
                  "font-display text-xs sm:text-[13px] font-bold uppercase tracking-[0.12em] text-white/95 mb-5",
                  isAr && "font-sans tracking-normal text-sm"
                )}
              >
                {isAr ? messages["footer.shop"] : "LA BOUTIQUE"}
              </h3>
              <ul className="space-y-3.5">
                <li>
                  <Link
                    href="/#boutique"
                    className="inline-block text-[15px] text-white/90 hover:text-white hover:translate-x-0.5 transition-all duration-200"
                  >
                    {messages["footer.allProducts"]}
                  </Link>
                </li>
                <li>
                  <Link
                    href="/#univers"
                    className="inline-block text-[15px] text-white/90 hover:text-white hover:translate-x-0.5 transition-all duration-200"
                  >
                    {messages["footer.values"]}
                  </Link>
                </li>
              </ul>
            </div>

            {/* Column 3: TEFLOOK */}
            <div className="md:col-span-4 md:pt-2">
              <h3
                className={cn(
                  "font-display text-xs sm:text-[13px] font-bold uppercase tracking-[0.12em] text-white/95 mb-5",
                  isAr && "font-sans tracking-normal text-sm"
                )}
              >
                {isAr ? messages["footer.brand"] : "TEFLOOK"}
              </h3>
              <ul className="space-y-3.5">
                <li>
                  <Link
                    href="/#boutique"
                    className="inline-block text-[15px] text-white/90 hover:text-white hover:translate-x-0.5 transition-all duration-200"
                  >
                    {messages["footer.children"]}
                  </Link>
                </li>
                <li>
                  <Link
                    href="/#univers"
                    className="inline-block text-[15px] text-white/90 hover:text-white hover:translate-x-0.5 transition-all duration-200"
                  >
                    {messages["footer.families"]}
                  </Link>
                </li>
                <li>
                  {whatsappPhone ? (
                    <a
                      href={helpHref}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-block text-[15px] text-white/90 hover:text-white hover:translate-x-0.5 transition-all duration-200"
                    >
                      {messages["footer.help"]}
                    </a>
                  ) : (
                    <Link
                      href="/#faq"
                      className="inline-block text-[15px] text-white/90 hover:text-white hover:translate-x-0.5 transition-all duration-200"
                    >
                      {messages["footer.help"]}
                    </Link>
                  )}
                </li>
                <li>
                  <button
                    type="button"
                    onClick={openSettingsModal}
                    className="inline-block text-start text-[15px] text-white/90 hover:text-white hover:translate-x-0.5 transition-all duration-200 focus:outline-none focus-visible:underline cursor-pointer"
                  >
                    {messages["cookies.manageLink"]}
                  </button>
                </li>
              </ul>
            </div>
          </div>

          {/* Centered Social Icon Row */}
          <div className="py-8 sm:py-10 flex items-center justify-center">
            <FooterSocialLinks />
          </div>
        </div>

        {/* Full-Width Subtle Horizontal Divider & Copyright Bottom Row */}
        <div className="w-full border-t border-white/25">
          <div className="max-w-6xl mx-auto px-6 sm:px-8 lg:px-10 py-6 pb-24 sm:pb-7 flex flex-col sm:flex-row items-center justify-between gap-3 text-[13.5px] text-white/90">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-x-2.5 gap-y-1 sm:ps-12 lg:ps-0">
              <span>© {currentYear} TefLook</span>
              <span aria-hidden="true" className="text-white/60">
                •
              </span>
              <button
                type="button"
                onClick={openSettingsModal}
                className="underline underline-offset-4 decoration-white/70 hover:decoration-white hover:text-white transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-white rounded cursor-pointer"
              >
                {messages["cookies.manageLink"]}
              </button>
            </div>

            <p className="text-center sm:text-end text-white/90 sm:pe-20 lg:pe-24">
              {messages["footer.note"]}
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
