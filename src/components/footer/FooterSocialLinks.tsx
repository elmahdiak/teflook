"use client";

import React, { useEffect, useState } from "react";
import { useTefLookLanguage } from "@/lib/teflook-language";
import {
  DEFAULT_INSTAGRAM_URL,
  fetchSiteSettings,
  normalizeInstagramUrl,
  type SiteSettings,
} from "@/lib/site-settings";
import { cn } from "@/lib/utils";

interface FooterSocialLinksProps {
  className?: string;
}

export function FooterSocialLinks({ className }: FooterSocialLinksProps) {
  const { locale } = useTefLookLanguage();
  const [isMounted, setIsMounted] = useState(false);
  const [instagramUrl, setInstagramUrl] = useState<string>(DEFAULT_INSTAGRAM_URL);

  useEffect(() => {
    setIsMounted(true);

    fetchSiteSettings().then((s) => {
      if (s) {
        const normalized = normalizeInstagramUrl(s.instagram_url);
        setInstagramUrl(normalized || DEFAULT_INSTAGRAM_URL);
      }
    });

    const handleSettingsUpdate = (e: Event) => {
      const customEvent = e as CustomEvent<SiteSettings>;
      if (customEvent.detail) {
        const normalized = normalizeInstagramUrl(customEvent.detail.instagram_url);
        setInstagramUrl(normalized || DEFAULT_INSTAGRAM_URL);
      }
    };

    const handleStorageUpdate = () => {
      fetchSiteSettings().then((s) => {
        if (s) {
          const normalized = normalizeInstagramUrl(s.instagram_url);
          setInstagramUrl(normalized || DEFAULT_INSTAGRAM_URL);
        }
      });
    };

    window.addEventListener("teflook:settings-updated", handleSettingsUpdate);
    window.addEventListener("storage", handleStorageUpdate);
    return () => {
      window.removeEventListener("teflook:settings-updated", handleSettingsUpdate);
      window.removeEventListener("storage", handleStorageUpdate);
    };
  }, []);

  const currentLocale = isMounted ? locale : "fr";
  const isAr = currentLocale === "ar";
  const resolvedHref = instagramUrl || DEFAULT_INSTAGRAM_URL;

  return (
    <div className={cn("mt-4 flex items-center gap-3", className)}>
      <a
        href={resolvedHref}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={isAr ? "تابع تيفلوك على إنستغرام" : "Suivre TefLook sur Instagram"}
        title={isAr ? "حساب تيفلوك الرسمي على إنستغرام" : "Suivez TefLook sur Instagram"}
        className="group inline-flex items-center gap-2.5 rounded-full border border-white/20 bg-white/10 px-3.5 py-2 text-xs font-bold text-white transition-all duration-200 hover:border-[#ff3500] hover:bg-[#ff3500] hover:shadow-md hover:shadow-[#ff3500]/25"
      >
        {/* Official Instagram SVG Icon */}
        <svg
          viewBox="0 0 24 24"
          className="size-4 shrink-0 fill-none stroke-current stroke-[2] transition-transform duration-200 group-hover:scale-110"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
          <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
          <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
        </svg>
        <span className={cn(isAr && "font-sans")}>
          {isAr ? "إنستغرام تيفلوك" : "Instagram TefLook"}
        </span>
      </a>
    </div>
  );
}
