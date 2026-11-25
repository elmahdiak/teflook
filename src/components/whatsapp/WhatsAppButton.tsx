"use client";

import React, { useEffect, useState } from "react";
import { useTefLookLanguage } from "@/lib/teflook-language";
import { useCookieConsent } from "@/lib/cookies";
import { cleanWhatsAppNumber, fetchSiteSettings, type SiteSettings } from "@/lib/site-settings";
import { cn } from "@/lib/utils";

export interface WhatsAppButtonProps {
  className?: string;
  defaultMessage?: string;
}

export function WhatsAppButton({ className, defaultMessage }: WhatsAppButtonProps) {
  const { locale } = useTefLookLanguage();
  const { hasConsented } = useCookieConsent();
  const [isMounted, setIsMounted] = useState(false);
  const [settings, setSettings] = useState<SiteSettings | null>(null);

  useEffect(() => {
    setIsMounted(true);

    // Fetch live settings from Supabase / API with cache: 'no-store'
    fetchSiteSettings().then((s) => {
      if (s) setSettings(s);
    });

    // Listen to live updates if modified in admin without reload
    const handleSettingsUpdate = (e: Event) => {
      const customEvent = e as CustomEvent<SiteSettings>;
      if (customEvent.detail) {
        setSettings(customEvent.detail);
      }
    };

    const handleStorageUpdate = () => {
      fetchSiteSettings().then((s) => {
        if (s) setSettings(s);
      });
    };

    window.addEventListener("teflook:settings-updated", handleSettingsUpdate);
    window.addEventListener("storage", handleStorageUpdate);
    return () => {
      window.removeEventListener("teflook:settings-updated", handleSettingsUpdate);
      window.removeEventListener("storage", handleStorageUpdate);
    };
  }, []);

  // Hydration safety & avoid flashing stale fallback before live settings load
  if (!isMounted || !settings) return null;

  // If store owner disabled WhatsApp support in admin, hide cleanly
  if (settings.whatsapp_enabled === false) return null;

  const cleanedPhone = cleanWhatsAppNumber(settings.whatsapp_phone);
  if (!cleanedPhone) return null;

  const isAr = locale === "ar";

  // Pre-filled bilingual message
  const greetingText =
    defaultMessage ||
    (isAr
      ? "مرحباً تيفلوك، أود الحصول على معلومات بخصوص منتجاتكم وتطوير مهارات الطفل."
      : "Bonjour TefLook, je souhaite avoir des informations sur vos produits et services.");

  const whatsappUrl = `https://wa.me/${cleanedPhone}?text=${encodeURIComponent(greetingText)}`;

  const isLeft = settings.whatsapp_position === "left";
  const bottomOffsetClass = !hasConsented ? "bottom-40 sm:bottom-5" : "bottom-4 sm:bottom-5";

  return (
    <aside
      aria-label="Contact WhatsApp"
      className={cn(
        "fixed z-40 flex items-center group select-none transition-all duration-300",
        bottomOffsetClass,
        isLeft ? "left-4 sm:left-6" : "right-4 sm:right-6",
        className
      )}
    >
      <a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={isAr ? "واتساب — خدمة العملاء" : "WhatsApp — Service client"}
        title={isAr ? "تواصل مباشرة مع خدمة العملاء" : "Contacter le service client TefLook"}
        className="w-13 h-13 sm:w-14 sm:h-14 rounded-full bg-[#25D366] hover:bg-[#20bd5a] text-white shadow-[0_10px_25px_-5px_rgba(37,211,102,0.45)] border-2 border-white flex items-center justify-center hover:scale-105 active:scale-95 transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#25D366] cursor-pointer"
      >
        <svg
          className="w-7 h-7 fill-current"
          viewBox="0 0 32 32"
          aria-hidden="true"
        >
          <path d="M16.004 2.667C8.64 2.667 2.67 8.636 2.67 16c0 2.352.616 4.648 1.787 6.67L2.56 29.44l6.944-1.82A13.27 13.27 0 0 0 16.004 29.333c7.363 0 13.33-5.969 13.33-13.333 0-7.364-5.967-13.333-13.33-13.333zm0 24.426a11.05 11.05 0 0 1-5.64-1.544l-.404-.24-4.121 1.08 1.1-4.017-.263-.419a11.035 11.035 0 0 1-1.7-5.953c0-6.112 4.974-11.086 11.088-11.086 2.961 0 5.744 1.153 7.837 3.247a11.015 11.015 0 0 1 3.248 7.839c0 6.113-4.974 11.093-11.145 11.093zm6.08-8.304c-.333-.167-1.971-.973-2.276-1.084-.305-.111-.527-.167-.75.167-.222.333-.86 1.084-1.054 1.306-.194.222-.389.25-.722.083-.333-.167-1.406-.518-2.679-1.653-.99-.883-1.658-1.974-1.852-2.307-.194-.333-.021-.513.146-.68.15-.149.333-.389.5-.583.166-.195.222-.334.333-.556.111-.222.055-.417-.028-.583-.083-.167-.75-1.806-1.027-2.473-.27-.65-.546-.562-.75-.572l-.638-.011c-.222 0-.583.083-.888.417-.305.333-1.166 1.139-1.166 2.778s1.194 3.223 1.36 3.445c.167.222 2.348 3.586 5.69 5.028.795.343 1.416.548 1.9.701.798.254 1.525.218 2.099.132.64-.096 1.971-.806 2.248-1.584.278-.778.278-1.445.195-1.584-.083-.139-.305-.222-.638-.389z" />
        </svg>
      </a>
    </aside>
  );
}
