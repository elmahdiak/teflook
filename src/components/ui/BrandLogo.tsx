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
    sm: "w-9 h-9 rounded-xl",
    md: "w-11 h-11 rounded-2xl",
    lg: "w-13 h-13 sm:w-14 sm:h-14 rounded-2xl",
    xl: "w-16 h-16 sm:w-20 sm:h-20 rounded-3xl",
  };

  const svgSizes = {
    sm: "w-6 h-6",
    md: "w-7 h-7",
    lg: "w-8 h-8 sm:w-9 sm:h-9",
    xl: "w-10 h-10 sm:w-12 sm:h-12",
  };

  const textSizes = {
    sm: "text-lg sm:text-xl",
    md: "text-[22px] sm:text-[24px]",
    lg: "text-2xl sm:text-3xl",
    xl: "text-4xl sm:text-5xl",
  };

  const content = (
    <div
      dir="ltr"
      style={{ unicodeBidi: "isolate" }}
      className={cn(
        "inline-flex flex-row items-center gap-2.5 sm:gap-3 group select-none shrink-0",
        className
      )}
    >
      {/* 1. White Rounded-2xl Icon Container with Minimalist Parent & Child SVG */}
      <span
        className={cn(
          "relative shrink-0 bg-white flex items-center justify-center transition-transform duration-300 group-hover:scale-105",
          variant === "dark"
            ? "border border-white/30 shadow-xs shadow-black/15"
            : "border border-[#E8E2D9]/80 shadow-[0_3px_12px_-3px_rgba(26,60,52,0.12)]",
          markSizes[size]
        )}
      >
        <svg
          className={svgSizes[size]}
          viewBox="0 0 36 36"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          {/* Parent Figure (Teal #4b9797) */}
          <circle cx="12.5" cy="11.5" r="3.4" fill="#4b9797" />
          <path
            d="M7.5 25.5C7.5 20.8 9.6 17.5 13 17.5C15.5 17.5 17.2 18.8 18.2 20.6C18.6 21.3 18.2 22.1 17.4 22.3L16 22.6V25.5C16 26.3 15.3 27 14.5 27H9C8.2 27 7.5 26.3 7.5 25.5Z"
            fill="#4b9797"
          />
          {/* Shared Warm Spark / Block Between Parent & Child (Amber #ffbf00) */}
          <rect x="16.4" y="18.2" width="3.6" height="3.6" rx="1" fill="#ffbf00" />
          {/* Child Figure (Coral #E86F51) */}
          <circle cx="24.2" cy="15.2" r="2.7" fill="#E86F51" />
          <path
            d="M20.2 25.5C20.2 22.1 21.8 19.8 24.3 19.8C26.8 19.8 28.5 22.1 28.5 25.5C28.5 26.3 27.8 27 27 27H21.7C20.9 27 20.2 26.3 20.2 25.5Z"
            fill="#E86F51"
          />
        </svg>
      </span>

      {/* 2. Bold Poppins Wordmark with Dual-Color Split (Always LTR) */}
      {showText && (
        <div
          dir="ltr"
          style={{ unicodeBidi: "isolate" }}
          className="flex flex-col justify-center leading-none select-none font-brand-logo shrink-0"
        >
          <div
            dir="ltr"
            style={{ unicodeBidi: "isolate" }}
            className={cn(
              "font-extrabold tracking-tight inline-flex flex-row items-center leading-none transition-colors whitespace-nowrap",
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
                <span className="text-[#1A4D4B] tracking-tight">Tef</span>
                <span className="text-[#E86F51] tracking-tight">Look</span>
              </>
            )}
          </div>
          {subtitle && (
            <span
              className={cn(
                "block text-[10px] font-bold uppercase tracking-widest mt-1 text-left whitespace-nowrap",
                variant === "dark" ? "text-[#ffbf00]" : "text-[#1A4D4B]"
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
        dir="ltr"
        className="inline-flex items-center shrink-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#4b9797] rounded-2xl p-1 -m-1"
        aria-label="Accueil TefLook"
      >
        {content}
      </Link>
    );
  }

  return content;
}
