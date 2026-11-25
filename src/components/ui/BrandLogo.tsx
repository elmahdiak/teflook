"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
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
    lg: "w-14 h-14 rounded-2xl",
    xl: "w-20 h-20 rounded-3xl",
  };

  const pixelSizes = {
    sm: 36,
    md: 44,
    lg: 56,
    xl: 80,
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
      {/* 1. White Rounded-2xl Icon Container with TefLook Brand Image */}
      <span
        className={cn(
          "relative shrink-0 overflow-hidden bg-white flex items-center justify-center p-1 transition-transform duration-300 group-hover:scale-105",
          variant === "dark"
            ? "border border-white/30 shadow-xs shadow-black/15"
            : "border border-[#E8E2D9]/80 shadow-sm",
          markSizes[size]
        )}
      >
        <Image
          src="/images/teflook-logo.png"
          alt="TefLook"
          width={pixelSizes[size]}
          height={pixelSizes[size]}
          priority
          className="size-full object-contain"
        />
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
