"use client";

import React, { useEffect, useState } from "react";
import { ChevronUp } from "lucide-react";
import { useTefLookLanguage } from "@/lib/teflook-language";
import { useCookieConsent } from "@/lib/cookies";
import {
  fetchSiteSettings,
  type SiteSettings,
  type WhatsAppPosition,
} from "@/lib/site-settings";
import { cn } from "@/lib/utils";

export function BackToTopButton() {
  const { locale } = useTefLookLanguage();
  const { hasConsented } = useCookieConsent();
  const [isMounted, setIsMounted] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [whatsappPosition, setWhatsappPosition] = useState<WhatsAppPosition>("right");

  useEffect(() => {
    setIsMounted(true);

    // Sync WhatsApp position so BackToTop stays on the opposite bottom corner
    fetchSiteSettings().then((s) => {
      if (s?.whatsapp_position) {
        setWhatsappPosition(s.whatsapp_position);
      }
    });

    const handleSettingsUpdate = (e: Event) => {
      const customEvent = e as CustomEvent<SiteSettings>;
      if (customEvent.detail?.whatsapp_position) {
        setWhatsappPosition(customEvent.detail.whatsapp_position);
      }
    };

    const handleStorageUpdate = () => {
      fetchSiteSettings().then((s) => {
        if (s?.whatsapp_position) {
          setWhatsappPosition(s.whatsapp_position);
        }
      });
    };

    const handleScroll = () => {
      setIsVisible(window.scrollY > 350);
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("teflook:settings-updated", handleSettingsUpdate);
    window.addEventListener("storage", handleStorageUpdate);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("teflook:settings-updated", handleSettingsUpdate);
      window.removeEventListener("storage", handleStorageUpdate);
    };
  }, []);

  if (!isMounted) return null;

  const isAr = locale === "ar";
  // Opposite corner of the WhatsApp floating button
  const isLeftCorner = whatsappPosition === "right";
  const label = isAr ? "العودة إلى الأعلى" : "Retour en haut";

  // Keep clean spacing above the mobile cookie banner when unconsented
  const bottomOffsetClass = !hasConsented
    ? "bottom-40 sm:bottom-5"
    : "bottom-5";

  const handleScrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <button
      type="button"
      onClick={handleScrollToTop}
      aria-label={label}
      title={label}
      className={cn(
        "fixed z-40 w-11 h-11 rounded-full bg-[#4b9797] hover:bg-[#3d7d7d] text-white shadow-lg hover:shadow-xl flex items-center justify-center border border-white/25 transition-all duration-300 cursor-pointer active:scale-95",
        bottomOffsetClass,
        isLeftCorner ? "left-5" : "right-5",
        isVisible
          ? "opacity-100 scale-100 translate-y-0"
          : "opacity-0 scale-90 translate-y-3 pointer-events-none"
      )}
    >
      <ChevronUp size={21} strokeWidth={2.5} aria-hidden="true" />
    </button>
  );
}
