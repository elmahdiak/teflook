"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface BrandLogoProps {
  className?: string;
  size?: "sm" | "md" | "lg" | "xl";
  asLink?: boolean;
  href?: string;
}

export function BrandLogo({
  className,
  size = "md",
  asLink = true,
  href = "/",
}: BrandLogoProps) {
  // Significantly enlarged mark (at least 3x original size, isolated without white background box)
  const markSizes = {
    sm: "h-10 w-10",
    md: "h-13 w-13 sm:h-16 sm:w-16",
    lg: "h-16 w-16 sm:h-20 sm:w-20",
    xl: "h-20 w-20 sm:h-24 sm:w-24",
  };

  const textSizes = {
    sm: "text-2xl",
    md: "text-3xl sm:text-4xl",
    lg: "text-4xl sm:text-5xl",
    xl: "text-5xl sm:text-6xl",
  };

  const content = (
    <div className={cn("inline-flex items-center gap-3 sm:gap-4 group select-none", className)}>
      {/* 1. Isolated, Enlarged Logo Mark (Transparent Background, No White Container Box) */}
      <div
        className={cn(
          "relative shrink-0 transition-transform duration-300 group-hover:scale-105",
          markSizes[size]
        )}
      >
        <Image
          src="/images/teflook-mark.png"
          alt="TefLook Logo Mark"
          fill
          sizes="128px"
          priority
          className="object-contain drop-shadow-xs"
        />
      </div>

      {/* 2. Sharp, Clean 'TefLook' Wordmark ('Tef' in Teal, 'Look' in Orange) */}
      <div
        className={cn(
          "font-black tracking-tight leading-none flex items-baseline font-sans transition-colors",
          textSizes[size]
        )}
      >
        <span className="text-[#4A9099] tracking-tight">Tef</span>
        <span className="text-[#FF6B00] tracking-tight">Look</span>
      </div>
    </div>
  );

  if (asLink) {
    return (
      <Link
        href={href}
        className="inline-flex items-center focus:outline-none focus-visible:ring-2 focus-visible:ring-[#FF6B00] rounded-xl"
        aria-label="TefLook - Accueil"
      >
        {content}
      </Link>
    );
  }

  return content;
}
