"use client";

import React, { useEffect, useRef, useState } from "react";
import { useTefLookLanguage, type Locale } from "@/lib/teflook-language";
import { cn } from "@/lib/utils";

interface TefLookLanguageSwitcherProps {
  compact?: boolean;
  className?: string;
}

const LANGUAGE_OPTIONS: ReadonlyArray<{
  code: Locale;
  label: "FR" | "AR";
  name: string;
}> = [
  { code: "fr", label: "FR", name: "Français" },
  { code: "ar", label: "AR", name: "العربية" },
];

export function TefLookLanguageSwitcher({
  compact = false,
  className = "",
}: TefLookLanguageSwitcherProps) {
  const { locale, setLocale } = useTefLookLanguage();
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const activeLabel = locale === "ar" ? "AR" : "FR";

  useEffect(() => {
    if (!open) return;

    function handleOutsideClick(e: MouseEvent | TouchEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    }

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handleOutsideClick);
    document.addEventListener("touchstart", handleOutsideClick);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
      document.removeEventListener("touchstart", handleOutsideClick);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  function handleSelect(code: Locale) {
    setLocale(code);
    setOpen(false);
  }

  return (
    <div
      ref={containerRef}
      className={cn("relative inline-block shrink-0", className)}
    >
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={locale === "ar" ? "تغيير اللغة" : "Changer de langue"}
        className={cn(
          "inline-flex items-center gap-1.5 px-2 py-1.5 text-xs sm:text-sm font-display font-semibold tracking-wider text-[#1A3C34] hover:text-[#4b9797] transition-colors cursor-pointer rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-[#4b9797]",
          compact && "px-1.5 sm:px-2"
        )}
      >
        <span>{activeLabel}</span>
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
          className={cn(
            "w-3.5 h-3.5 transition-transform duration-200",
            open && "rotate-180"
          )}
        >
          <path d="m6 9 6 6 6-6" />
        </svg>
      </button>

      {open && (
        <div
          role="listbox"
          aria-label={locale === "ar" ? "اختر اللغة" : "Choisir la langue"}
          className="absolute top-full mt-2 start-0 z-50 min-w-[72px] bg-white border border-slate-100 shadow-[0_10px_28px_-6px_rgba(26,60,52,0.14)] py-1.5 flex flex-col"
        >
          {LANGUAGE_OPTIONS.map((option) => {
            const isSelected = locale === option.code;
            return (
              <button
                key={option.code}
                type="button"
                role="option"
                aria-selected={isSelected}
                aria-label={option.name}
                onClick={() => handleSelect(option.code)}
                className={cn(
                  "px-3.5 py-2 text-start text-xs sm:text-sm font-display font-semibold tracking-wider transition-colors cursor-pointer",
                  isSelected
                    ? "bg-[#FAF8F5] text-[#4b9797]"
                    : "text-[#1A3C34] hover:bg-[#FAF8F5] hover:text-[#4b9797]"
                )}
              >
                {option.label}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
