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
  variant?: "light" | "dark";
  showText?: boolean;
}

export function BrandLogo({
  className,
  size = "md",
  asLink = true,
  href = "/",
  variant = "light",
  showText = true,
}: BrandLogoProps) {
  const markSizes = {
    sm: "size-8 sm:size-9",
    md: "size-10 sm:size-11",
    lg: "size-12 sm:size-14",
    xl: "size-16 sm:size-20",
  };

  const textSizes = {
    sm: "text-lg sm:text-xl",
    md: "text-2xl sm:text-[26px]",
    lg: "text-3xl sm:text-4xl",
    xl: "text-4xl sm:text-5xl",
  };

  const logoSrc = variant === "dark" ? "/images/logoodark.png" : "/images/logoo.png";

  const content = (
    <div className={cn("inline-flex items-center gap-2.5 sm:gap-3 group select-none", className)}>
      {/* 1. Logo Icon with subtle rounded corners */}
      <div
        className={cn(
          "relative shrink-0 overflow-hidden rounded-xl shadow-xs transition-transform duration-300 group-hover:scale-105",
          markSizes[size]
        )}
      >
        <Image
          src={logoSrc}
          alt="TefLook Logo"
          fill
          sizes="96px"
          priority
          className="object-cover"
        />
      </div>

      {/* 2. Sharp Wordmark ('Tef' in Forest Green / Cream, 'Look' in Terracotta / Amber) */}
      {showText && (
        <div
          className={cn(
            "font-black tracking-tight leading-none flex items-baseline font-sans transition-colors",
            textSizes[size]
          )}
        >
          {variant === "dark" ? (
            <>
              <span className="text-[#F9F8F6] tracking-tight">Tef</span>
              <span className="text-[#E6A15C] tracking-tight">Look</span>
            </>
          ) : (
            <>
              <span className="text-[#1A3C34] tracking-tight">Tef</span>
              <span className="text-[#C85A32] tracking-tight">Look</span>
            </>
          )}
        </div>
      )}
    </div>
  );

  if (asLink) {
    return (
      <Link
        href={href}
        className="inline-flex items-center focus:outline-none focus-visible:ring-2 focus-visible:ring-[#C85A32] rounded-xl"
        aria-label="TefLook - Accueil"
      >
        {content}
      </Link>
    );
  }

  return content;
}
