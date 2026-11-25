"use client";

import React from "react";
import { useTefLookLanguage } from "@/lib/teflook-language";
import { cn } from "@/lib/utils";

interface TefLookLanguageSwitcherProps {
  compact?: boolean;
  className?: string;
}

export function TefLookLanguageSwitcher({
  compact = false,
  className = "",
}: TefLookLanguageSwitcherProps) {
  const { locale, setLocale } = useTefLookLanguage();

  return (
    <div
      dir="ltr"
      className={cn(
        "inline-flex shrink-0 items-center whitespace-nowrap rounded-full border border-[#E2DCD3] bg-white/80 p-1",
        className
      )}
      role="group"
      aria-label="Sélecteur de langue"
    >
      <button
        type="button"
        onClick={() => setLocale("fr")}
        className={cn(
          "rounded-full font-brand-logo font-bold tracking-wide transition-all duration-200 cursor-pointer",
          compact ? "px-2.5 py-1 text-[11px]" : "px-3 py-1 text-xs",
          locale === "fr"
            ? "bg-[#4b9797] text-white shadow-xs"
            : "text-[#1A3C34] hover:text-[#4b9797]"
        )}
        aria-pressed={locale === "fr"}
      >
        FR
      </button>
      <button
        type="button"
        onClick={() => setLocale("ar")}
        className={cn(
          "rounded-full font-sans font-semibold transition-all duration-200 cursor-pointer",
          compact ? "px-2.5 py-1 text-[12px]" : "px-3 py-1 text-xs",
          locale === "ar"
            ? "bg-[#4b9797] text-white shadow-xs"
            : "text-[#1A3C34] hover:text-[#4b9797]"
        )}
        aria-pressed={locale === "ar"}
      >
        عربي
      </button>
    </div>
  );
}
