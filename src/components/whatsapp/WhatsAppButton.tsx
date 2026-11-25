"use client";

import React, { useEffect, useState } from "react";
import { useTefLookLanguage } from "@/lib/teflook-language";
import { cleanWhatsAppNumber, fetchSiteSettings, type SiteSettings } from "@/lib/site-settings";
import { cn } from "@/lib/utils";

export interface WhatsAppButtonProps {
  className?: string;
  defaultMessage?: string;
}

export function WhatsAppButton({ className, defaultMessage }: WhatsAppButtonProps) {
  const { locale } = useTefLookLanguage();
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

  const buttonLabel = isAr ? "تواصل معنا" : "Besoin d'aide ?";

  return (
    <aside
      aria-label="Contact WhatsApp"
      className={cn(
        "fixed bottom-5 right-4 sm:bottom-6 sm:right-6 z-40 select-none",
        className
      )}
    >
      <a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={isAr ? "محادثة عبر واتساب" : "Discuter sur WhatsApp"}
        title={isAr ? "تواصل مباشرة مع خدمة العملاء" : "Contacter le service client TefLook"}
        className="group relative flex items-center gap-2.5 rounded-full bg-[#25D366] hover:bg-[#20ba59] text-white pl-3.5 pr-4 py-2.5 sm:pl-4 sm:pr-5 sm:py-3 shadow-xl hover:shadow-2xl hover:scale-105 active:scale-95 transition-all duration-300 border border-[#20ba59]/40 cursor-pointer"
      >
        {/* Subtle Radar/Ping Animation */}
        <span
          className="absolute -inset-1 rounded-full bg-[#25D366] opacity-35 animate-ping pointer-events-none"
          aria-hidden="true"
        />

        {/* Official WhatsApp SVG Icon */}
        <div className="relative grid place-items-center size-6 sm:size-7 text-white shrink-0">
          <svg
            viewBox="0 0 24 24"
            className="size-full fill-current drop-shadow-xs transition-transform duration-300 group-hover:rotate-6"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M17.472 14.382c-.301-.15-1.78-.879-2.056-.98-.276-.1-.476-.15-.677.15-.2.301-.777.98-.952 1.18-.175.201-.351.226-.652.075-.301-.15-1.27-.468-2.42-1.493-.895-.798-1.5-1.784-1.676-2.085-.175-.301-.019-.464.132-.614.136-.135.301-.351.451-.527.151-.175.201-.301.301-.502.1-.201.05-.376-.025-.526-.075-.15-.677-1.631-.927-2.233-.244-.586-.492-.507-.677-.516l-.577-.01c-.2 0-.526.075-.802.376-.276.301-1.053 1.028-1.053 2.508 0 1.48 1.078 2.909 1.229 3.11.15.201 2.122 3.24 5.141 4.544.718.31 1.279.496 1.716.635.722.23 1.378.197 1.9.119.58-.088 1.78-.727 2.03-1.43.25-.702.25-1.304.175-1.43-.075-.125-.276-.201-.577-.351zM12.042 21.75c-1.75 0-3.465-.47-4.966-1.36l-.356-.21-3.693.968.986-3.599-.232-.37a9.7 9.7 0 0 1-1.49-5.188c0-5.38 4.38-9.76 9.761-9.76 2.607 0 5.058 1.015 6.9 2.859a9.7 9.7 0 0 1 2.858 6.9c0 5.382-4.38 9.76-9.764 9.76zm8.307-18.067C18.132 1.465 15.197.375 12.042.375c-6.42 0-11.645 5.224-11.645 11.645 0 2.052.535 4.057 1.551 5.82L0 24l6.326-1.659c1.706.93 3.627 1.42 5.716 1.42h.005c6.419 0 11.645-5.225 11.645-11.646 0-3.111-1.211-6.037-3.343-8.082z" />
          </svg>
        </div>

        {/* Text Pill (Subtle & Clean) */}
        <div className="flex flex-col text-left leading-tight">
          <span className="hidden sm:inline text-[10px] font-medium text-white/90 uppercase tracking-wider">
            WhatsApp
          </span>
          <span
            className={cn(
              "font-bold text-xs sm:text-sm text-white tracking-tight",
              isAr && "font-sans font-bold"
            )}
          >
            {buttonLabel}
          </span>
        </div>
      </a>
    </aside>
  );
}
