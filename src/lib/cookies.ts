"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";

export interface CookieConsentCategories {
  essential: boolean; // Always true
  preferences: boolean;
  analytics: boolean;
  marketing: boolean;
}

export interface StoredCookieConsent {
  version: string;
  timestamp: string;
  consent: CookieConsentCategories;
}

export const COOKIE_CONSENT_NAME = "teflook_cookie_consent";
export const STORAGE_KEY = "teflook_cookie_consent_v1";
export const POLICY_VERSION = "v1.0";
export const CONSENT_EXPIRATION_DAYS = 180;

export const DEFAULT_CONSENT: CookieConsentCategories = {
  essential: true,
  preferences: false,
  analytics: false,
  marketing: false,
};

export const ALL_CONSENT: CookieConsentCategories = {
  essential: true,
  preferences: true,
  analytics: true,
  marketing: true,
};

/**
 * Safely reads stored consent from first-party cookie or localStorage.
 */
export function getStoredConsent(): StoredCookieConsent | null {
  if (typeof window === "undefined") return null;

  // 1. Try reading from cookie
  try {
    const cookies = document.cookie.split(";").map((c) => c.trim());
    const cookiePrefix = `${COOKIE_CONSENT_NAME}=`;
    const foundCookie = cookies.find((c) => c.startsWith(cookiePrefix));

    if (foundCookie) {
      const rawVal = decodeURIComponent(foundCookie.substring(cookiePrefix.length));
      const parsed = JSON.parse(rawVal) as StoredCookieConsent;
      if (parsed?.consent?.essential) {
        return parsed;
      }
    }
  } catch (e) {
    console.warn("Error reading cookie consent:", e);
  }

  // 2. Fallback to localStorage
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored) as StoredCookieConsent;
      if (parsed?.consent?.essential) {
        return parsed;
      }
    }
  } catch (e) {
    console.warn("Error reading localStorage consent:", e);
  }

  return null;
}

/**
 * Persists user cookie consent to both a 180-day cookie and localStorage.
 */
export function setStoredConsent(consent: CookieConsentCategories): StoredCookieConsent {
  const payload: StoredCookieConsent = {
    version: POLICY_VERSION,
    timestamp: new Date().toISOString(),
    consent: {
      essential: true, // Always locked to true
      preferences: Boolean(consent.preferences),
      analytics: Boolean(consent.analytics),
      marketing: Boolean(consent.marketing),
    },
  };

  if (typeof window !== "undefined") {
    try {
      const jsonStr = JSON.stringify(payload);
      const maxAge = CONSENT_EXPIRATION_DAYS * 24 * 60 * 60;
      // 180-day first-party cookie with SameSite=Lax
      document.cookie = `${COOKIE_CONSENT_NAME}=${encodeURIComponent(
        jsonStr
      )}; max-age=${maxAge}; path=/; SameSite=Lax`;

      // localStorage backup
      localStorage.setItem(STORAGE_KEY, jsonStr);

      // Dispatch event for any script listeners (Google Tag, Meta Pixel, etc.)
      window.dispatchEvent(
        new CustomEvent("teflook:cookie-consent-updated", { detail: payload })
      );
    } catch (e) {
      console.warn("Error saving cookie consent:", e);
    }
  }

  return payload;
}

export interface CookieConsentContextType {
  consent: CookieConsentCategories;
  hasConsented: boolean;
  isMounted: boolean;
  isSettingsModalOpen: boolean;
  acceptAll: () => void;
  rejectOptional: () => void;
  savePreferences: (prefs: Partial<CookieConsentCategories>) => void;
  openSettingsModal: () => void;
  closeSettingsModal: () => void;
}

const CookieConsentContext = createContext<CookieConsentContextType | null>(null);

export function CookieConsentProvider({ children }: { children: React.ReactNode }) {
  const [isMounted, setIsMounted] = useState(false);
  const [hasConsented, setHasConsented] = useState<boolean>(true); // default true for SSR safety
  const [consent, setConsent] = useState<CookieConsentCategories>(DEFAULT_CONSENT);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);

  // Initialize consent on client mount (hydration-safe)
  useEffect(() => {
    setIsMounted(true);
    const stored = getStoredConsent();
    if (stored) {
      setConsent(stored.consent);
      setHasConsented(true);
    } else {
      setConsent(DEFAULT_CONSENT);
      setHasConsented(false);
    }

    // Listen for cross-tab or external changes
    const handleStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue);
          if (parsed?.consent) {
            setConsent(parsed.consent);
            setHasConsented(true);
          }
        } catch {}
      }
    };

    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  const acceptAll = useCallback(() => {
    const saved = setStoredConsent(ALL_CONSENT);
    setConsent(saved.consent);
    setHasConsented(true);
    setIsSettingsModalOpen(false);
  }, []);

  const rejectOptional = useCallback(() => {
    const saved = setStoredConsent(DEFAULT_CONSENT);
    setConsent(saved.consent);
    setHasConsented(true);
    setIsSettingsModalOpen(false);
  }, []);

  const savePreferences = useCallback((prefs: Partial<CookieConsentCategories>) => {
    const updated: CookieConsentCategories = {
      essential: true,
      preferences: Boolean(prefs.preferences),
      analytics: Boolean(prefs.analytics),
      marketing: Boolean(prefs.marketing),
    };
    const saved = setStoredConsent(updated);
    setConsent(saved.consent);
    setHasConsented(true);
    setIsSettingsModalOpen(false);
  }, []);

  const openSettingsModal = useCallback(() => {
    setIsSettingsModalOpen(true);
  }, []);

  const closeSettingsModal = useCallback(() => {
    setIsSettingsModalOpen(false);
  }, []);

  return React.createElement(
    CookieConsentContext.Provider,
    {
      value: {
        consent,
        hasConsented,
        isMounted,
        isSettingsModalOpen,
        acceptAll,
        rejectOptional,
        savePreferences,
        openSettingsModal,
        closeSettingsModal,
      },
    },
    children
  );
}

export function useCookieConsent(): CookieConsentContextType {
  const ctx = useContext(CookieConsentContext);
  if (!ctx) {
    // Return fallback for components used outside provider
    return {
      consent: DEFAULT_CONSENT,
      hasConsented: true,
      isMounted: false,
      isSettingsModalOpen: false,
      acceptAll: () => {},
      rejectOptional: () => {},
      savePreferences: () => {},
      openSettingsModal: () => {},
      closeSettingsModal: () => {},
    };
  }
  return ctx;
}
