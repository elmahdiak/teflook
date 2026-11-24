"use client";

import React from "react";
import { Cookie, Settings2, Check, X } from "lucide-react";
import { useCookieConsent } from "@/lib/cookies";
import { useTefLookLanguage } from "@/lib/teflook-language";
import { cn } from "@/lib/utils";

export function CookieBanner() {
  const { hasConsented, isMounted, acceptAll, rejectOptional, openSettingsModal } = useCookieConsent();
  const { locale, direction, t } = useTefLookLanguage();

  // Guard: Never render on server or during initial client hydration pass
  if (!isMounted || hasConsented) {
    return null;
  }

  const isAr = locale === "ar";

  return (
    <aside
      aria-label={t("cookies.bannerTitle")}
      role="region"
      dir={direction}
      className={cn(
        // Anchored to bottom-left on LTR, bottom-right on RTL
        "fixed z-50 bottom-3 inset-x-3 sm:inset-x-auto sm:bottom-4",
        isAr ? "sm:right-4" : "sm:left-4",
        "w-auto sm:w-[360px] max-w-sm",
        "animate-in fade-in slide-in-from-bottom-4 duration-300"
      )}
    >
      <div className="relative overflow-hidden rounded-2xl border border-[#E6E1D8] bg-white/95 backdrop-blur-md p-3.5 sm:p-4 shadow-xl shadow-black/10">
        {/* Subtle top brand gradient bar */}
        <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-[#4b9797] via-[#ffbf00] to-[#ff3500]" />

        {/* Header & Icon */}
        <div className="flex items-center gap-2 mb-1.5">
          <div className="grid size-6 shrink-0 place-items-center rounded-lg bg-[#4b9797]/15 text-[#4b9797]">
            <Cookie size={14} className="stroke-[2.5]" />
          </div>
          <span className="font-display text-xs font-bold text-[#1E293B]">
            {t("cookies.bannerTitle")}
          </span>
        </div>

        {/* Concise 1-2 Lines of Text */}
        <p
          className={cn(
            "text-[12px] leading-snug text-muted-foreground",
            isAr && "font-sans leading-normal"
          )}
        >
          {t("cookies.bannerShortText")}
        </p>

        {/* Compact Action Row */}
        <div className="flex items-center gap-2 pt-2.5 mt-2.5 border-t border-[#F1ECE4]">
          {/* 1. Accept (Primary compact button in #ff3500) */}
          <button
            type="button"
            onClick={acceptAll}
            className="flex-1 inline-flex items-center justify-center gap-1 rounded-xl bg-[#ff3500] hover:bg-[#ff3500]/90 py-1.5 px-3 text-xs font-bold text-white shadow-xs hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
          >
            <Check size={13} className="stroke-[3]" />
            <span>{t("cookies.accept")}</span>
          </button>

          {/* 2. Refuse / Reject Optional */}
          <button
            type="button"
            onClick={rejectOptional}
            className="inline-flex items-center justify-center gap-1 rounded-xl border border-border bg-[#F9F8F6] py-1.5 px-2.5 text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
          >
            <span>{t("cookies.reject")}</span>
          </button>

          {/* 3. Options / Customize Modal */}
          <button
            type="button"
            onClick={openSettingsModal}
            className="inline-flex items-center justify-center gap-1 py-1.5 px-1.5 text-xs font-bold text-[#4b9797] hover:text-[#2B6E73] hover:underline transition-colors cursor-pointer shrink-0"
          >
            <Settings2 size={13} />
            <span>{t("cookies.options")}</span>
          </button>
        </div>
      </div>
    </aside>
  );
}
