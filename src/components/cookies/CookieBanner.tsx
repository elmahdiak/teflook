"use client";

import React from "react";
import { Cookie, ShieldCheck, Settings2, Check, X } from "lucide-react";
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
        "fixed bottom-4 sm:bottom-6 left-3 right-3 sm:left-6 sm:right-6 mx-auto max-w-4xl z-50",
        "animate-in fade-in slide-in-from-bottom-5 duration-500"
      )}
    >
      <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl border border-[#E6E1D8] bg-white/95 backdrop-blur-md p-4 sm:p-6 shadow-2xl shadow-black/10">
        {/* Subtle top brand color accent line */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#4b9797] via-[#ffbf00] to-[#ff3500]" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 sm:gap-6">
          {/* Text and Icon Area */}
          <div className="flex items-start gap-3 sm:gap-4 flex-1">
            <div className="grid size-10 sm:size-11 shrink-0 place-items-center rounded-2xl bg-[#4b9797]/10 text-[#4b9797] mt-0.5 border border-[#4b9797]/20">
              <Cookie className="size-5 sm:size-6 stroke-[2.2]" />
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h3 className="font-display text-sm sm:text-base font-extrabold text-[#1E293B]">
                  {t("cookies.bannerTitle")}
                </h3>
                <span className="inline-flex items-center gap-1 rounded-full bg-[#4b9797]/10 px-2 py-0.5 text-[10px] font-bold text-[#4b9797]">
                  <ShieldCheck size={11} />
                  <span>RGPD / CNDP</span>
                </span>
              </div>
              <p
                className={cn(
                  "text-xs sm:text-[13px] leading-relaxed text-muted-foreground",
                  isAr && "font-sans leading-normal"
                )}
              >
                {t("cookies.bannerText")}
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap sm:flex-nowrap items-center gap-2 sm:gap-2.5 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-[#F1ECE4]">
            {/* 1. Customize / Settings */}
            <button
              type="button"
              onClick={openSettingsModal}
              className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 rounded-xl border border-[#E6E1D8] bg-[#F9F8F6] px-3.5 py-2 text-xs font-bold text-[#1E293B] hover:bg-muted hover:border-[#4b9797]/40 transition-colors cursor-pointer"
            >
              <Settings2 size={14} className="text-[#4b9797]" />
              <span>{t("cookies.customize")}</span>
            </button>

            {/* 2. Reject Optional */}
            <button
              type="button"
              onClick={rejectOptional}
              className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 rounded-xl border border-border bg-white px-3.5 py-2 text-xs font-bold text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
            >
              <X size={14} />
              <span>{t("cookies.rejectOptional")}</span>
            </button>

            {/* 3. Accept All (Primary CTA in #ff3500) */}
            <button
              type="button"
              onClick={acceptAll}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 rounded-xl bg-[#ff3500] hover:bg-[#ff3500]/90 px-4 py-2 text-xs font-extrabold text-white shadow-md shadow-[#ff3500]/20 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
            >
              <Check size={14} className="stroke-[3]" />
              <span>{t("cookies.acceptAll")}</span>
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
}
