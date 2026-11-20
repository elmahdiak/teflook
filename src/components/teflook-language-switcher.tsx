"use client";

import React from "react";
import { useTefLookLanguage, type Locale } from "@/lib/teflook-language";

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
      className={`inline-flex items-center rounded-full border border-border bg-card/60 p-0.5 text-xs font-semibold ${className}`}
      role="group"
      aria-label="Sélectionner la langue"
    >
      <button
        type="button"
        onClick={() => setLocale("fr")}
        className={`rounded-full transition-all duration-200 ${
          compact ? "px-2 py-0.5 text-[11px]" : "px-3 py-1 text-xs"
        } ${
          locale === "fr"
            ? "bg-[#1A3C34] text-white shadow-xs"
            : "text-muted-foreground hover:text-foreground"
        }`}
        aria-pressed={locale === "fr"}
      >
        FR
      </button>
      <button
        type="button"
        onClick={() => setLocale("ar")}
        className={`rounded-full transition-all duration-200 ${
          compact ? "px-2 py-0.5 text-[11px]" : "px-3 py-1 text-xs"
        } ${
          locale === "ar"
            ? "bg-[#1A3C34] text-white shadow-xs"
            : "text-muted-foreground hover:text-foreground"
        }`}
        aria-pressed={locale === "ar"}
      >
        عربي
      </button>
    </div>
  );
}
