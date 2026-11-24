"use client";

import React, { useState, useEffect } from "react";
import {
  Check,
  Cookie,
  Lock,
  RotateCcw,
  ShieldCheck,
  Sliders,
  Sparkles,
  TrendingUp,
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
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 overflow-y-auto"
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity animate-in fade-in"
        onClick={closeSettingsModal}
      />

      {/* Modal Dialog Card */}
      <div className="relative w-full max-w-2xl overflow-hidden rounded-2xl sm:rounded-3xl border border-[#E6E1D8] bg-white shadow-2xl z-10 my-auto animate-in fade-in zoom-in-95 duration-200">
        {/* Top Header Accent */}
        <div className="h-1.5 w-full bg-gradient-to-r from-[#4b9797] via-[#ffbf00] to-[#ff3500]" />

        {/* Modal Header */}
        <div className="p-5 sm:p-6 pb-4 border-b border-[#F1ECE4] flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="grid size-11 shrink-0 place-items-center rounded-2xl bg-[#4b9797]/10 text-[#4b9797]">
              <Sliders className="size-6 stroke-[2.2]" />
            </div>
            <div>
              <h2
                id="cookie-modal-title"
                className="font-display text-lg sm:text-xl font-extrabold text-[#1E293B]"
              >
                {t("cookies.modalTitle")}
              </h2>
              <p className="text-xs sm:text-[13px] text-muted-foreground mt-0.5">
                {t("cookies.modalSubtitle")}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={closeSettingsModal}
            className="grid size-8 place-items-center rounded-xl text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
            aria-label="Fermer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Categories List */}
        <div className="p-5 sm:p-6 space-y-4 max-h-[60vh] overflow-y-auto divide-y divide-[#F1ECE4]">
          {/* 1. Essential Cookies (Strictly Necessary - Locked ON) */}
          <div className="pt-2 first:pt-0 flex items-start justify-between gap-4">
            <div className="space-y-1 pr-2 flex-1">
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm text-[#1E293B]">
                  {t("cookies.essentialTitle")}
                </span>
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 border border-emerald-200 px-2 py-0.5 text-[10px] font-bold text-emerald-800">
                  <Lock size={10} />
                  <span>{t("cookies.essentialBadge")}</span>
                </span>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {t("cookies.essentialDesc")}
              </p>
            </div>

            {/* Locked Switch */}
            <div className="shrink-0 pt-1">
              <div
                aria-disabled="true"
                className="w-11 h-6 rounded-full bg-[#4b9797] p-0.5 flex items-center justify-end cursor-not-allowed opacity-90"
              >
                <div className="size-5 rounded-full bg-white shadow-xs grid place-items-center">
                  <Check size={12} className="text-[#4b9797] stroke-[3]" />
                </div>
              </div>
            </div>
          </div>

          {/* 2. Preferences Cookies */}
          <div className="pt-4 flex items-start justify-between gap-4">
            <div className="space-y-1 pr-2 flex-1">
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm text-[#1E293B]">
                  {t("cookies.preferencesTitle")}
                </span>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {t("cookies.preferencesDesc")}
              </p>
            </div>

            {/* Toggle Switch */}
            <div className="shrink-0 pt-1">
              <button
                type="button"
                role="switch"
                aria-checked={prefs.preferences}
                onClick={() =>
                  setPrefs((prev) => ({ ...prev, preferences: !prev.preferences }))
                }
                className={cn(
                  "w-11 h-6 rounded-full p-0.5 transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#4b9797] cursor-pointer flex items-center",
                  prefs.preferences ? "bg-[#4b9797] justify-end" : "bg-neutral-300 justify-start"
                )}
              >
                <span className="size-5 rounded-full bg-white shadow-xs" />
              </button>
            </div>
          </div>

          {/* 3. Analytics Cookies */}
          <div className="pt-4 flex items-start justify-between gap-4">
            <div className="space-y-1 pr-2 flex-1">
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm text-[#1E293B]">
                  {t("cookies.analyticsTitle")}
                </span>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {t("cookies.analyticsDesc")}
              </p>
            </div>

            {/* Toggle Switch */}
            <div className="shrink-0 pt-1">
              <button
                type="button"
                role="switch"
                aria-checked={prefs.analytics}
                onClick={() =>
                  setPrefs((prev) => ({ ...prev, analytics: !prev.analytics }))
                }
                className={cn(
                  "w-11 h-6 rounded-full p-0.5 transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#4b9797] cursor-pointer flex items-center",
                  prefs.analytics ? "bg-[#4b9797] justify-end" : "bg-neutral-300 justify-start"
                )}
              >
                <span className="size-5 rounded-full bg-white shadow-xs" />
              </button>
            </div>
          </div>

          {/* 4. Marketing Cookies */}
          <div className="pt-4 flex items-start justify-between gap-4">
            <div className="space-y-1 pr-2 flex-1">
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm text-[#1E293B]">
                  {t("cookies.marketingTitle")}
                </span>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {t("cookies.marketingDesc")}
              </p>
            </div>

            {/* Toggle Switch */}
            <div className="shrink-0 pt-1">
              <button
                type="button"
                role="switch"
                aria-checked={prefs.marketing}
                onClick={() =>
                  setPrefs((prev) => ({ ...prev, marketing: !prev.marketing }))
                }
                className={cn(
                  "w-11 h-6 rounded-full p-0.5 transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#4b9797] cursor-pointer flex items-center",
                  prefs.marketing ? "bg-[#4b9797] justify-end" : "bg-neutral-300 justify-start"
                )}
              >
                <span className="size-5 rounded-full bg-white shadow-xs" />
              </button>
            </div>
          </div>
        </div>

        {/* Modal Footer Controls */}
        <div className="p-4 sm:p-6 bg-[#F9F8F6] border-t border-[#E6E1D8] flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              type="button"
              onClick={rejectOptional}
              className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1 rounded-xl border border-border bg-white px-3 py-2 text-xs font-bold text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
            >
              <span>{t("cookies.rejectOptional")}</span>
            </button>
            <button
              type="button"
              onClick={acceptAll}
              className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1 rounded-xl border border-[#4b9797]/40 bg-[#4b9797]/10 text-[#4b9797] px-3 py-2 text-xs font-bold hover:bg-[#4b9797]/20 transition-colors cursor-pointer"
            >
              <span>{t("cookies.acceptAll")}</span>
            </button>
          </div>

          <button
            type="button"
            onClick={handleSave}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 rounded-xl bg-[#ff3500] hover:bg-[#ff3500]/90 px-5 py-2.5 text-xs font-extrabold text-white shadow-md shadow-[#ff3500]/20 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
          >
            <Check size={14} className="stroke-[3]" />
            <span>{t("cookies.save")}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
