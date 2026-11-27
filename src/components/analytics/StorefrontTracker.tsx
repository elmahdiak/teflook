"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { ADMIN_BASE_PATH } from "@/lib/admin-config";
import {
  detectAndPersistTrafficSource,
  getOrCreateSessionId,
  getOrCreateVisitorId,
  trackAnalyticsEvent,
} from "@/lib/analytics";

interface ActivePageState {
  path: string;
  enteredAt: number;
  isVisible: boolean;
}

export function StorefrontTracker() {
  const pathname = usePathname();
  const activePageRef = useRef<ActivePageState | null>(null);

  useEffect(() => {
    const currentPath = pathname || "/";
    if (currentPath.startsWith(ADMIN_BASE_PATH)) {
      if (activePageRef.current?.isVisible) {
        const duration = Math.max(
          1,
          Math.round((Date.now() - activePageRef.current.enteredAt) / 1000)
        );
        trackAnalyticsEvent({
          eventType: "page_exit",
          pagePath: activePageRef.current.path,
          durationSeconds: duration,
        });
      }
      activePageRef.current = null;
      return;
    }

    getOrCreateVisitorId();
    getOrCreateSessionId();
    const attribution = detectAndPersistTrafficSource();

    // Flush exit duration for previous storefront route on client-side navigation
    if (activePageRef.current && activePageRef.current.path !== currentPath) {
      if (activePageRef.current.isVisible) {
        const duration = Math.max(
          1,
          Math.round((Date.now() - activePageRef.current.enteredAt) / 1000)
        );
        trackAnalyticsEvent({
          eventType: "page_exit",
          pagePath: activePageRef.current.path,
          durationSeconds: duration,
        });
      }
    }

    // Avoid double-logging if pathname effect runs twice for same active route
    if (activePageRef.current?.path === currentPath) return;

    activePageRef.current = {
      path: currentPath,
      enteredAt: Date.now(),
      isVisible:
        typeof document === "undefined"
          ? true
          : document.visibilityState === "visible",
    };

    trackAnalyticsEvent({
      eventType: "page_view",
      pagePath: currentPath,
      metadata: {
        traffic_source: attribution.traffic_source,
        ...(attribution.utm_source ? { utm_source: attribution.utm_source } : {}),
        ...(attribution.utm_medium ? { utm_medium: attribution.utm_medium } : {}),
      },
    });
  }, [pathname]);

  useEffect(() => {
    function flushExit(useBeacon: boolean) {
      const active = activePageRef.current;
      if (!active || !active.isVisible) return;
      if (active.path.startsWith(ADMIN_BASE_PATH)) return;

      const duration = Math.max(
        1,
        Math.round((Date.now() - active.enteredAt) / 1000)
      );
      active.isVisible = false;

      trackAnalyticsEvent({
        eventType: "page_exit",
        pagePath: active.path,
        durationSeconds: duration,
        useBeacon,
      });
    }

    function handleVisibilityChange() {
      const active = activePageRef.current;
      if (!active) return;

      if (document.visibilityState === "hidden") {
        flushExit(true);
      } else if (document.visibilityState === "visible") {
        active.enteredAt = Date.now();
        active.isVisible = true;
      }
    }

    function handlePageHide() {
      flushExit(true);
    }

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("pagehide", handlePageHide);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("pagehide", handlePageHide);
    };
  }, []);

  return null;
}
