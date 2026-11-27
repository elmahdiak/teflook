export type AnalyticsEventType =
  | "page_view"
  | "page_exit"
  | "cart_add"
  | "checkout_open"
  | "order_completed"
  | "newsletter_signup";

export type AnalyticsDateRange = "24h" | "3d" | "7d" | "30d" | "all" | "custom";

export interface MarketingMetricsConfig {
  id: AnalyticsDateRange;
  ad_spend_mad: number;
  brand_searches: number;
  rewards_engagements: number;
  account_activations: number;
  updated_at?: string;
}

function makeDefaultMetrics(id: AnalyticsDateRange): MarketingMetricsConfig {
  return {
    id,
    ad_spend_mad: 0,
    brand_searches: 0,
    rewards_engagements: 0,
    account_activations: 0,
  };
}

export const DEFAULT_MARKETING_METRICS: Record<
  AnalyticsDateRange,
  MarketingMetricsConfig
> = {
  "24h": makeDefaultMetrics("24h"),
  "3d": makeDefaultMetrics("3d"),
  "7d": makeDefaultMetrics("7d"),
  "30d": makeDefaultMetrics("30d"),
  all: makeDefaultMetrics("all"),
  custom: makeDefaultMetrics("custom"),
};

export function parseAnalyticsDateRange(
  raw: string | null | undefined
): AnalyticsDateRange {
  if (
    raw === "24h" ||
    raw === "3d" ||
    raw === "7d" ||
    raw === "30d" ||
    raw === "all" ||
    raw === "custom"
  ) {
    return raw;
  }
  return "30d";
}

export interface FunnelStageSummary {
  key: "awareness" | "consideration" | "conversion" | "loyalty";
  title: string;
  primaryMetricLabel: string;
  primaryMetricValue: number;
  primaryFormatted: string;
  secondaryNote: string;
  conversionToNextPct: number | null;
}

export interface TrafficSourceBreakdownItem {
  source: string;
  visitorsCount: number;
  sessionsCount: number;
  percentage: number;
}

export interface FunnelAnalyticsData {
  range: AnalyticsDateRange;
  needsMigration: boolean;
  missingTables: string[];
  marketingMetrics: MarketingMetricsConfig;
  stages: FunnelStageSummary[];
  kpis: {
    // Stage 1: Awareness (from analytics_events)
    impressions: number;
    reach: number;
    frequency: number;
    // Stage 2: Consideration
    uniqueTrafficSourcesCount: number;
    trafficSourcesBreakdown: TrafficSourceBreakdownItem[];
    firstTimeVisitors: number;
    totalUniqueVisitors: number;
    totalPageViews: number;
    pagesPerVisitor: number;
    avgTimePerPageSeconds: number;
    emailNewsletterSignups: number;
    // Stage 3: Conversion
    conversionsCount: number;
    totalRevenueMad: number;
    avgTimeToConversionSeconds: number | null;
    costPerConversionMad: number;
    avgTouchpoints: number;
    averageOrderSizeMad: number;
    abandonedCartVisitorsCount: number;
    cartIntentVisitorsCount: number;
    checkoutOpensCount: number;
    // Stage 4: Loyalty
    repeatPurchaseRatePct: number;
    repeatCustomersCount: number;
    uniqueCustomersCount: number;
    avgDaysBetweenPurchases: number | null;
    ordersPerCustomer: number;
    accountActivationRatePct: number;
    accountActivationsCount: number;
    loyaltyRewardsEngagements: number;
  };
}

export const ANALYTICS_SQL_MIGRATION = `CREATE TABLE IF NOT EXISTS public.analytics_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  visitor_id text NOT NULL,
  session_id text NOT NULL,
  event_type text NOT NULL CHECK (event_type IN ('page_view', 'page_exit', 'cart_add', 'checkout_open', 'order_completed', 'newsletter_signup')),
  page_path text NOT NULL DEFAULT '/',
  duration_seconds integer,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb
);

ALTER TABLE public.analytics_events
  DROP CONSTRAINT IF EXISTS analytics_events_event_type_check;
ALTER TABLE public.analytics_events
  ADD CONSTRAINT analytics_events_event_type_check
  CHECK (event_type IN ('page_view', 'page_exit', 'cart_add', 'checkout_open', 'order_completed', 'newsletter_signup'));

CREATE INDEX IF NOT EXISTS idx_analytics_events_created_at ON public.analytics_events (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_analytics_events_visitor ON public.analytics_events (visitor_id, created_at);
CREATE INDEX IF NOT EXISTS idx_analytics_events_type ON public.analytics_events (event_type, created_at DESC);

ALTER TABLE public.analytics_events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public storefront analytics insert" ON public.analytics_events;
CREATE POLICY "Allow public storefront analytics insert"
  ON public.analytics_events
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE TABLE IF NOT EXISTS public.marketing_metrics (
  id text PRIMARY KEY,
  impressions bigint NOT NULL DEFAULT 0,
  reach bigint NOT NULL DEFAULT 0,
  ad_spend_mad numeric NOT NULL DEFAULT 0,
  brand_searches bigint NOT NULL DEFAULT 0,
  rewards_engagements bigint NOT NULL DEFAULT 0,
  account_activations bigint NOT NULL DEFAULT 0,
  updated_at timestamptz NOT NULL DEFAULT now()
);`;

const VISITOR_ID_KEY = "teflook_visitor_id_v1";
const SESSION_ID_KEY = "teflook_session_id_v1";
const SESSION_TRAFFIC_KEY = "teflook_session_traffic_v1";

export interface SessionTrafficAttribution {
  traffic_source: string;
  utm_source?: string;
  utm_medium?: string;
  referrer_host?: string;
}

function classifyTrafficSource(params: {
  utmSource: string;
  utmMedium: string;
  fbclid: string;
  gclid: string;
  ttclid: string;
  referrerHost: string;
}): string {
  const { utmSource, utmMedium, fbclid, gclid, ttclid, referrerHost } = params;
  const isPaid =
    Boolean(fbclid || gclid || ttclid) ||
    ["cpc", "paid", "ads", "paid_social", "ppc", "meta"].includes(utmMedium);

  if (utmSource) {
    if (utmSource.includes("instagram") || utmSource === "ig") return "Instagram";
    if (
      utmSource.includes("facebook") ||
      utmSource === "fb" ||
      utmSource.includes("meta")
    ) {
      return isPaid ? "Meta Ads" : "Facebook";
    }
    if (utmSource.includes("tiktok") || utmSource === "tt") return "TikTok";
    if (utmSource.includes("whatsapp") || utmSource === "wa") return "WhatsApp";
    if (utmSource.includes("google")) return "Google";
    if (utmSource.includes("youtube") || utmSource === "yt") return "YouTube";
    return utmSource.charAt(0).toUpperCase() + utmSource.slice(1);
  }

  if (referrerHost) {
    if (referrerHost.includes("instagram.com")) return "Instagram";
    if (
      referrerHost.includes("facebook.com") ||
      referrerHost === "fb.com" ||
      referrerHost.endsWith(".fb.com")
    ) {
      return isPaid ? "Meta Ads" : "Facebook";
    }
    if (referrerHost.includes("tiktok.com")) return "TikTok";
    if (referrerHost.includes("whatsapp.com") || referrerHost === "wa.me") {
      return "WhatsApp";
    }
    if (referrerHost.includes("google.")) return "Google";
    if (
      referrerHost === "t.co" ||
      referrerHost.includes("twitter.com") ||
      referrerHost.includes("x.com")
    ) {
      return "X / Twitter";
    }
    if (referrerHost.includes("youtube.com") || referrerHost === "youtu.be") {
      return "YouTube";
    }
    return referrerHost.replace(/^www\./, "");
  }

  if (fbclid) return "Meta Ads";
  if (gclid) return "Google";
  if (ttclid) return "TikTok";

  return "Direct";
}

export function detectAndPersistTrafficSource(): SessionTrafficAttribution {
  if (typeof window === "undefined") {
    return { traffic_source: "Direct" };
  }

  let existing: SessionTrafficAttribution | null = null;
  try {
    const raw = window.sessionStorage.getItem(SESSION_TRAFFIC_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed.traffic_source === "string") {
        existing = parsed as SessionTrafficAttribution;
      }
    }
  } catch {}

  const searchParams = new URLSearchParams(window.location.search);
  const utmSource = searchParams.get("utm_source")?.trim().toLowerCase() || "";
  const utmMedium = searchParams.get("utm_medium")?.trim().toLowerCase() || "";
  const fbclid = searchParams.get("fbclid")?.trim() || "";
  const gclid = searchParams.get("gclid")?.trim() || "";
  const ttclid = searchParams.get("ttclid")?.trim() || "";

  let referrerHost = "";
  if (document.referrer) {
    try {
      const refUrl = new URL(document.referrer);
      if (refUrl.hostname && refUrl.hostname !== window.location.hostname) {
        referrerHost = refUrl.hostname.toLowerCase();
      }
    } catch {}
  }

  const hasExplicitAttribution = Boolean(
    utmSource || referrerHost || fbclid || gclid || ttclid
  );

  if (existing && !hasExplicitAttribution) {
    return existing;
  }

  if (existing && existing.traffic_source !== "Direct" && !utmSource) {
    return existing;
  }

  const trafficSource = classifyTrafficSource({
    utmSource,
    utmMedium,
    fbclid,
    gclid,
    ttclid,
    referrerHost,
  });

  const nextAttribution: SessionTrafficAttribution = {
    traffic_source: trafficSource,
    ...(utmSource ? { utm_source: utmSource } : {}),
    ...(utmMedium ? { utm_medium: utmMedium } : {}),
    ...(referrerHost ? { referrer_host: referrerHost } : {}),
  };

  try {
    window.sessionStorage.setItem(
      SESSION_TRAFFIC_KEY,
      JSON.stringify(nextAttribution)
    );
  } catch {}

  return nextAttribution;
}

function generateAnonId(prefix: string): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return `${prefix}_${crypto.randomUUID()}`;
  }
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`;
}

export function getOrCreateVisitorId(): string {
  if (typeof window === "undefined") return "";
  try {
    let id = window.localStorage.getItem(VISITOR_ID_KEY);
    if (!id) {
      id = generateAnonId("vis");
      window.localStorage.setItem(VISITOR_ID_KEY, id);
    }
    return id;
  } catch {
    return generateAnonId("vis");
  }
}

export function getOrCreateSessionId(): string {
  if (typeof window === "undefined") return "";
  try {
    let id = window.sessionStorage.getItem(SESSION_ID_KEY);
    if (!id) {
      id = generateAnonId("ses");
      window.sessionStorage.setItem(SESSION_ID_KEY, id);
    }
    return id;
  } catch {
    return generateAnonId("ses");
  }
}

export function trackAnalyticsEvent(params: {
  eventType: AnalyticsEventType;
  pagePath?: string;
  durationSeconds?: number;
  metadata?: Record<string, unknown>;
  useBeacon?: boolean;
}): void {
  if (typeof window === "undefined") return;

  const currentPath = params.pagePath || window.location.pathname || "/";
  if (currentPath.startsWith("/tl-k9x4m-control-7v2p")) return;

  const attribution = detectAndPersistTrafficSource();

  const payload = {
    visitor_id: getOrCreateVisitorId(),
    session_id: getOrCreateSessionId(),
    event_type: params.eventType,
    page_path: currentPath,
    duration_seconds:
      typeof params.durationSeconds === "number" &&
      Number.isFinite(params.durationSeconds)
        ? Math.max(0, Math.round(params.durationSeconds))
        : null,
    metadata: {
      traffic_source: attribution.traffic_source,
      ...(attribution.utm_source ? { utm_source: attribution.utm_source } : {}),
      ...(attribution.utm_medium ? { utm_medium: attribution.utm_medium } : {}),
      ...(attribution.referrer_host
        ? { referrer_host: attribution.referrer_host }
        : {}),
      ...(params.metadata || {}),
    },
  };

  try {
    const serialized = JSON.stringify(payload);
    if (
      params.useBeacon &&
      typeof navigator !== "undefined" &&
      typeof navigator.sendBeacon === "function"
    ) {
      const blob = new Blob([serialized], { type: "application/json" });
      const sent = navigator.sendBeacon("/api/analytics/track", blob);
      if (sent) return;
    }

    void fetch("/api/analytics/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: serialized,
      keepalive: true,
    }).catch(() => {});
  } catch {}
}

export function formatDurationCompact(seconds: number | null | undefined): string {
  if (seconds === null || seconds === undefined || !Number.isFinite(seconds)) {
    return "—";
  }
  const rounded = Math.max(0, Math.round(seconds));
  if (rounded === 0) return "0m 00s";

  const days = Math.floor(rounded / 86400);
  const hours = Math.floor((rounded % 86400) / 3600);
  const mins = Math.floor((rounded % 3600) / 60);
  const secs = rounded % 60;

  if (days > 0) {
    return hours > 0 ? `${days}j ${hours}h` : `${days}j`;
  }
  if (hours > 0) {
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  }
  return `${mins}m ${secs.toString().padStart(2, "0")}s`;
}
