"use client";

import React, { useState, useEffect } from "react";
import {
  Check,
  Lock,
  Sliders,
  X,
} from "lucide-react";
import { useCookieConsent, CookieConsentCategories } from "@/lib/cookies";
import { useTefLookLanguage } from "@/lib/teflook-language";
import { cn } from "@/lib/utils";

export function CookiePreferencesModal() {
  const {
    consent,
    isSettingsModalOpen,
    closeSettingsModal,
    savePreferences,
    acceptAll,
    rejectOptional,
    isMounted,
  } = useCookieConsent();
  const { locale, direction, t } = useTefLookLanguage();

  const [prefs, setPrefs] = useState<CookieConsentCategories>(consent);

  // Synchronize local form state with context consent whenever modal opens
  useEffect(() => {
    if (isSettingsModalOpen) {
      setPrefs(consent);
    }
  }, [isSettingsModalOpen, consent]);

  // Handle ESC key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isSettingsModalOpen) {
        closeSettingsModal();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isSettingsModalOpen, closeSettingsModal]);

  if (!isMounted || !isSettingsModalOpen) {
    return null;
  }

  const isAr = locale === "ar";

  function handleSave() {
    savePreferences(prefs);
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="cookie-modal-title"
      dir={direction}
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto"
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity animate-in fade-in"
        onClick={closeSettingsModal}
      />

      {/* Modal Dialog Card (Compact max-w-md footprint) */}
      <div className="relative w-full max-w-md overflow-hidden rounded-2xl sm:rounded-3xl border border-[#E6E1D8] bg-white shadow-2xl z-10 my-auto animate-in fade-in zoom-in-95 duration-200">
        {/* Top Header Accent */}
        <div className="h-1 w-full bg-gradient-to-r from-[#4b9797] via-[#ffbf00] to-[#ff3500]" />

        {/* Modal Header */}
        <div className="p-4 sm:p-5 pb-3 border-b border-[#F1ECE4] flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="grid size-9 shrink-0 place-items-center rounded-xl bg-[#4b9797]/10 text-[#4b9797]">
              <Sliders className="size-5 stroke-[2.2]" />
            </div>
            <div>
              <h2
                id="cookie-modal-title"
                className="font-display text-base sm:text-lg font-extrabold text-[#1E293B] leading-tight"
              >
                {t("cookies.modalShortTitle")}
              </h2>
              <p className="text-[11px] sm:text-xs text-muted-foreground mt-0.5">
                {t("cookies.modalShortSubtitle")}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={closeSettingsModal}
            className="grid size-7 place-items-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors cursor-pointer"
            aria-label="Fermer"
          >
            <X size={16} />
          </button>
        </div>

        {/* Categories List */}
        <div className="p-4 sm:p-5 space-y-3 max-h-[55vh] overflow-y-auto divide-y divide-[#F1ECE4]">
          {/* 1. Essential Cookies (Strictly Necessary - Locked ON) */}
          <div className="pt-1.5 first:pt-0 flex items-start justify-between gap-3">
            <div className="space-y-0.5 pr-2 flex-1">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="font-bold text-xs sm:text-[13px] text-[#1E293B]">
                  {t("cookies.essentialTitle")}
                </span>
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 border border-emerald-200 px-1.5 py-0.2 text-[9px] font-bold text-emerald-800">
                  <Lock size={9} />
                  <span>{t("cookies.essentialBadge")}</span>
                </span>
              </div>
              <p className="text-[11px] text-muted-foreground leading-snug">
                {t("cookies.essentialDesc")}
              </p>
            </div>

            {/* Locked Switch */}
            <div className="shrink-0 pt-0.5">
              <div
                aria-disabled="true"
                className="w-9 h-5 rounded-full bg-[#4b9797] p-0.5 flex items-center justify-end cursor-not-allowed opacity-90"
              >
                <div className="size-4 rounded-full bg-white shadow-xs grid place-items-center">
                  <Check size={10} className="text-[#4b9797] stroke-[3]" />
                </div>
              </div>
            </div>
          </div>

          {/* 2. Preferences Cookies */}
          <div className="pt-3 flex items-start justify-between gap-3">
            <div className="space-y-0.5 pr-2 flex-1">
              <span className="font-bold text-xs sm:text-[13px] text-[#1E293B] block">
                {t("cookies.preferencesTitle")}
              </span>
              <p className="text-[11px] text-muted-foreground leading-snug">
                {t("cookies.preferencesDesc")}
              </p>
            </div>

            {/* Toggle Switch */}
            <div className="shrink-0 pt-0.5">
              <button
                type="button"
                role="switch"
                aria-checked={prefs.preferences}
                onClick={() =>
                  setPrefs((prev) => ({ ...prev, preferences: !prev.preferences }))
                }
                className={cn(
                  "w-9 h-5 rounded-full p-0.5 transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#4b9797] cursor-pointer flex items-center",
                  prefs.preferences ? "bg-[#4b9797] justify-end" : "bg-neutral-300 justify-start"
                )}
              >
                <span className="size-4 rounded-full bg-white shadow-xs" />
              </button>
            </div>
          </div>

          {/* 3. Analytics Cookies */}
          <div className="pt-3 flex items-start justify-between gap-3">
            <div className="space-y-0.5 pr-2 flex-1">
              <span className="font-bold text-xs sm:text-[13px] text-[#1E293B] block">
                {t("cookies.analyticsTitle")}
              </span>
              <p className="text-[11px] text-muted-foreground leading-snug">
                {t("cookies.analyticsDesc")}
              </p>
            </div>

            {/* Toggle Switch */}
            <div className="shrink-0 pt-0.5">
              <button
                type="button"
                role="switch"
                aria-checked={prefs.analytics}
                onClick={() =>
                  setPrefs((prev) => ({ ...prev, analytics: !prev.analytics }))
                }
                className={cn(
                  "w-9 h-5 rounded-full p-0.5 transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#4b9797] cursor-pointer flex items-center",
                  prefs.analytics ? "bg-[#4b9797] justify-end" : "bg-neutral-300 justify-start"
                )}
              >
                <span className="size-4 rounded-full bg-white shadow-xs" />
              </button>
            </div>
          </div>

          {/* 4. Marketing Cookies */}
          <div className="pt-3 flex items-start justify-between gap-3">
            <div className="space-y-0.5 pr-2 flex-1">
              <span className="font-bold text-xs sm:text-[13px] text-[#1E293B] block">
                {t("cookies.marketingTitle")}
              </span>
              <p className="text-[11px] text-muted-foreground leading-snug">
                {t("cookies.marketingDesc")}
              </p>
            </div>

            {/* Toggle Switch */}
            <div className="shrink-0 pt-0.5">
              <button
                type="button"
                role="switch"
                aria-checked={prefs.marketing}
                onClick={() =>
                  setPrefs((prev) => ({ ...prev, marketing: !prev.marketing }))
                }
                className={cn(
                  "w-9 h-5 rounded-full p-0.5 transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#4b9797] cursor-pointer flex items-center",
                  prefs.marketing ? "bg-[#4b9797] justify-end" : "bg-neutral-300 justify-start"
                )}
              >
                <span className="size-4 rounded-full bg-white shadow-xs" />
              </button>
            </div>
          </div>
        </div>

        {/* Modal Footer Controls (Compact layout) */}
        <div className="p-3.5 sm:p-4 bg-[#F9F8F6] border-t border-[#E6E1D8] flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={rejectOptional}
              className="inline-flex items-center justify-center rounded-xl border border-border bg-white px-2.5 py-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
            >
              <span>{t("cookies.reject")}</span>
            </button>
            <button
              type="button"
              onClick={acceptAll}
              className="inline-flex items-center justify-center rounded-xl border border-[#4b9797]/40 bg-[#4b9797]/10 text-[#4b9797] px-2.5 py-1.5 text-xs font-bold hover:bg-[#4b9797]/20 transition-colors cursor-pointer"
            >
              <span>{t("cookies.acceptAll")}</span>
            </button>
          </div>

          <button
            type="button"
            onClick={handleSave}
            className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-[#ff3500] hover:bg-[#ff3500]/90 px-4 py-1.5 text-xs font-extrabold text-white shadow-sm hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
          >
            <Check size={13} className="stroke-[3]" />
            <span>{t("cookies.save")}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
