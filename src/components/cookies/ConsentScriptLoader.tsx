"use client";

import React, { useEffect } from "react";
import Script from "next/script";
import { useCookieConsent } from "@/lib/cookies";
import { CookieBanner } from "./CookieBanner";
import { CookiePreferencesModal } from "./CookiePreferencesModal";

/**
 * Conditionally loads and triggers Analytics & Marketing scripts
 * strictly when explicit user consent is granted.
 */
export function ConsentScriptLoader() {
  const { consent, isMounted } = useCookieConsent();

  // Listen and react to consent changes to inform external trackers (e.g., GTM, Meta Pixel)
  useEffect(() => {
    if (!isMounted) return;

    // 1. Google Consent Mode v2 synchronization
    if (typeof window !== "undefined" && typeof (window as any).gtag === "function") {
      (window as any).gtag("consent", "update", {
        analytics_storage: consent.analytics ? "granted" : "denied",
        ad_storage: consent.marketing ? "granted" : "denied",
        ad_user_data: consent.marketing ? "granted" : "denied",
        ad_personalization: consent.marketing ? "granted" : "denied",
      });
    }

    // 2. Meta / Facebook Pixel consent
    if (typeof window !== "undefined" && typeof (window as any).fbq === "function") {
      (window as any).fbq("consent", consent.marketing ? "grant" : "revoke");
    }

    // 3. Dispatch global custom event for any analytics integrations
    window.dispatchEvent(
      new CustomEvent("teflook:scripts-consent-change", {
        detail: {
          analytics: consent.analytics,
          marketing: consent.marketing,
          preferences: consent.preferences,
        },
      })
    );
  }, [consent, isMounted]);

  return (
    <>
      {/* Cookie Banner (Appears when hasConsented === false) */}
      <CookieBanner />

      {/* Granular Cookie Preferences Modal */}
      <CookiePreferencesModal />

      {/* Optional: Load Analytics script only when consented */}
      {isMounted && consent.analytics && (
        <Script
          id="teflook-analytics-init"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              window.__TEFLOOK_ANALYTICS_ENABLED__ = true;
              console.log("[TefLook] Analytics cookies enabled with user consent.");
            `,
          }}
        />
      )}

      {/* Optional: Load Marketing script only when consented */}
      {isMounted && consent.marketing && (
        <Script
          id="teflook-marketing-init"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              window.__TEFLOOK_MARKETING_ENABLED__ = true;
              console.log("[TefLook] Marketing cookies & pixels enabled with user consent.");
            `,
          }}
        />
      )}
    </>
  );
}
