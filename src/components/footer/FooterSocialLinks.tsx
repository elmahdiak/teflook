"use client";

import React, { useEffect, useState } from "react";
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
  const [instagramUrl, setInstagramUrl] = useState<string>(DEFAULT_INSTAGRAM_URL);

  useEffect(() => {
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

  const resolvedHref = instagramUrl || DEFAULT_INSTAGRAM_URL;

  return (
    <div className={cn("flex items-center justify-center gap-3", className)}>
      <a
        href={resolvedHref}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Suivre TefLook sur Instagram"
        title="Instagram"
        className="w-11 h-11 rounded-full bg-white/10 hover:bg-white/20 border border-white/25 inline-flex items-center justify-center text-white transition-all duration-200 hover:scale-110 active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
      >
        {/* Official Instagram SVG Icon */}
        <svg
          viewBox="0 0 24 24"
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.9}
          strokeLinecap="round"
          strokeLinejoin="round"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          <rect x="2.5" y="2.5" width="19" height="19" rx="5" ry="5" />
          <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
          <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
        </svg>
      </a>
    </div>
  );
}
