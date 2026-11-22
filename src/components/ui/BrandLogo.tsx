"use client";

import React from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";

export interface BrandLogoProps {
  className?: string;
  size?: "sm" | "md" | "lg" | "xl";
  asLink?: boolean;
  href?: string;
  variant?: "light" | "dark";
  showText?: boolean;
  subtitle?: string;
}

export function BrandLogo({
  className,
  size = "md",
  asLink = true,
  href = "/",
  variant = "light",
  showText = true,
  subtitle,
}: BrandLogoProps) {
  const markSizes = {
    sm: "size-8 sm:size-9 rounded-xl p-1",
    md: "size-10 sm:size-11 rounded-xl sm:rounded-2xl p-1 sm:p-1.5",
    lg: "size-12 sm:size-14 rounded-2xl p-1.5 sm:p-2",
    xl: "size-16 sm:size-20 rounded-2xl sm:rounded-3xl p-2 sm:p-2.5",
  };

  const textSizes = {
    sm: "text-lg sm:text-xl",
    md: "text-[22px] sm:text-2xl",
    lg: "text-2xl sm:text-3xl",
    xl: "text-4xl sm:text-5xl",
  };

  // The icon container is a clean white rounded card. Using Untitled Design.png guarantees seamless integration with zero background bleeding.
  const logoSrc = "/images/Untitled Design.png";

  const content = (
    <div className={cn("inline-flex items-center gap-2.5 sm:gap-3 group select-none", className)}>
      {/* 1. Icon Container: Rounded white card with clean padding, subtle border & soft shadow */}
      <div
        className={cn(
          "relative shrink-0 overflow-hidden bg-white flex items-center justify-center transition-all duration-300 group-hover:scale-105",
          variant === "dark"
            ? "border border-white/30 shadow-xs shadow-black/10"
            : "border border-[#E6E1D8]/80 shadow-xs sm:shadow-sm",
          markSizes[size]
        )}
      >
        <img
          src={logoSrc}
          alt="TefLook"
          className="size-full object-contain"
          loading="eager"
        />
      </div>

      {/* 2. Wordmark: Modern rounded geometric sans typography with exact dual-color split */}
      {showText && (
        <div className="flex flex-col justify-center leading-none select-none font-brand-logo">
          <div
            className={cn(
              "font-bold tracking-tight flex items-center leading-none transition-colors",
              textSizes[size]
            )}
          >
            {variant === "dark" ? (
              <>
                <span className="text-white tracking-tight">Tef</span>
                <span className="text-[#ffbf00] tracking-tight">Look</span>
              </>
            ) : (
              <>
                <span className="text-[#2B6E73] tracking-tight">Tef</span>
                <span className="text-[#E06D53] tracking-tight">Look</span>
              </>
            )}
          </div>
          {subtitle && (
            <span
              className={cn(
                "block text-[10px] font-bold uppercase tracking-widest mt-1",
                variant === "dark" ? "text-[#ffbf00]" : "text-[#2B6E73]"
              )}
            >
              {subtitle}
            </span>
          )}
        </div>
      )}
    </div>
  );

  if (asLink) {
    return (
      <Link
        href={href}
        className="inline-flex items-center focus:outline-none focus-visible:ring-2 focus-visible:ring-[#E06D53] rounded-xl"
        aria-label="TefLook - Accueil"
      >
        {content}
      </Link>
    );
  }

  return content;
}
