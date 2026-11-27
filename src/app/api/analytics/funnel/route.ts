import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/review-server";
import {
  DEFAULT_MARKETING_METRICS,
  type AnalyticsDateRange,
  type FunnelAnalyticsData,
  type MarketingMetricsConfig,
  type TrafficSourceBreakdownItem,
} from "@/lib/analytics";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const NO_STORE_HEADERS = {
  "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0",
  Pragma: "no-cache",
  Expires: "0",
};

function parseRange(raw: string | null): AnalyticsDateRange {
  if (raw === "7d" || raw === "30d" || raw === "all") return raw;
  return "30d";
}

function getCutoffMs(range: AnalyticsDateRange): number | null {
  const now = Date.now();
  if (range === "7d") return now - 7 * 24 * 60 * 60 * 1000;
  if (range === "30d") return now - 30 * 24 * 60 * 60 * 1000;
  return null;
}

function isMissingTableError(err: { code?: string; message?: string } | null): boolean {
  if (!err) return false;
  const code = (err.code || "").toUpperCase();
  const msg = (err.message || "").toLowerCase();
  return (
    code === "42P01" ||
    code === "PGRST205" ||
    msg.includes("does not exist") ||
    msg.includes("could not find the table")
  );
}

function normalizePhoneKey(rawPhone: unknown): string {
  if (typeof rawPhone !== "string") return "";
  const digits = rawPhone.replace(/\D/g, "");
  if (digits.length < 6) return "";
  // Normalize Moroccan numbers (0612345678 / 212612345678 -> last 9 digits)
  return digits.length >= 9 ? digits.slice(-9) : digits;
}

function extractOrderEmail(row: Record<string, any>): string {
  const cf =
    row.custom_fields && typeof row.custom_fields === "object"
      ? (row.custom_fields as Record<string, unknown>)
      : null;
  if (cf) {
    for (const [k, v] of Object.entries(cf)) {
      if (
        typeof v === "string" &&
        v.includes("@") &&
        (k.toLowerCase().includes("mail") || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()))
      ) {
        return v.trim().toLowerCase();
      }
    }
  }
  if (typeof row.customer_email === "string" && row.customer_email.includes("@")) {
    return row.customer_email.trim().toLowerCase();
  }
  return "";
}

function hasReferralOrPromoUsage(row: Record<string, any>): boolean {
  const notesStr = typeof row.notes === "string" ? row.notes.toLowerCase() : "";
  const cfStr = row.custom_fields ? JSON.stringify(row.custom_fields).toLowerCase() : "";
  return (
    notesStr.includes("teflook10") ||
    notesStr.includes("parrain") ||
    notesStr.includes("referral") ||
    notesStr.includes("promo") ||
    cfStr.includes("teflook10") ||
    cfStr.includes("parrain") ||
    cfStr.includes("referral") ||
    cfStr.includes("promo")
  );
}

interface AnalyticsEventRow {
  id: string;
  created_at: string;
  visitor_id: string;
  session_id: string;
  event_type: string;
  page_path: string;
  duration_seconds: number | null;
  metadata: Record<string, any> | null;
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const range = parseRange(searchParams.get("range"));
  const cutoffMs = getCutoffMs(range);

  try {
    const supabase = getSupabaseAdmin();
    const missingTables: string[] = [];

    const [ordersRes, eventsRes, metricsRes] = await Promise.all([
      supabase
        .from("orders")
        .select(
          "id, created_at, customer_phone, total_mad, status, custom_fields, notes"
        )
        .order("created_at", { ascending: true }),
      supabase
        .from("analytics_events")
        .select(
          "id, created_at, visitor_id, session_id, event_type, page_path, duration_seconds, metadata"
        )
        .order("created_at", { ascending: true })
        .limit(15000),
      supabase
        .from("marketing_metrics")
        .select("*")
        .in("id", [range, "default"]),
    ]);

    if (isMissingTableError(ordersRes.error)) missingTables.push("orders");
    if (isMissingTableError(eventsRes.error)) missingTables.push("analytics_events");
    if (isMissingTableError(metricsRes.error)) missingTables.push("marketing_metrics");

    const allValidOrders = Array.isArray(ordersRes.data)
      ? ordersRes.data.filter((o) => o.status !== "cancelled")
      : [];

    const allEvents: AnalyticsEventRow[] = Array.isArray(eventsRes.data)
      ? (eventsRes.data as AnalyticsEventRow[])
      : [];

    const metricsRow = Array.isArray(metricsRes.data)
      ? metricsRes.data.find((r) => r.id === range) ||
        metricsRes.data.find((r) => r.id === "default")
      : null;

    const baseMetrics = DEFAULT_MARKETING_METRICS[range];
    const marketingMetrics: MarketingMetricsConfig = {
      id: range,
      ad_spend_mad: Math.max(0, Number(metricsRow?.ad_spend_mad ?? baseMetrics.ad_spend_mad) || 0),
      brand_searches: Math.max(0, Number(metricsRow?.brand_searches ?? baseMetrics.brand_searches) || 0),
      rewards_engagements: Math.max(
        0,
        Number(metricsRow?.rewards_engagements ?? baseMetrics.rewards_engagements) || 0
      ),
      account_activations: Math.max(
        0,
        Number(metricsRow?.account_activations ?? baseMetrics.account_activations) || 0
      ),
      updated_at:
        typeof metricsRow?.updated_at === "string"
          ? metricsRow.updated_at
          : undefined,
    };

    // Build visitor lifetime history for accurate first-time visitors, time to conversion, and touchpoints
    const earliestSeenByVisitor = new Map<string, number>();
    const firstPageViewByVisitor = new Map<string, number>();
    const pageViewsByVisitor = new Map<string, AnalyticsEventRow[]>();

    for (const ev of allEvents) {
      const ts = Date.parse(ev.created_at);
      if (!Number.isFinite(ts) || !ev.visitor_id) continue;

      const prevEarliest = earliestSeenByVisitor.get(ev.visitor_id);
      if (prevEarliest === undefined || ts < prevEarliest) {
        earliestSeenByVisitor.set(ev.visitor_id, ts);
      }

      if (ev.event_type === "page_view") {
        const prevPv = firstPageViewByVisitor.get(ev.visitor_id);
        if (prevPv === undefined || ts < prevPv) {
          firstPageViewByVisitor.set(ev.visitor_id, ts);
        }
        const list = pageViewsByVisitor.get(ev.visitor_id) || [];
        list.push(ev);
        pageViewsByVisitor.set(ev.visitor_id, list);
      }
    }

    const ordersInPeriod =
      cutoffMs === null
        ? allValidOrders
        : allValidOrders.filter((o) => {
            const ts = Date.parse(o.created_at);
            return Number.isFinite(ts) && ts >= cutoffMs;
          });

    const eventsInPeriod =
      cutoffMs === null
        ? allEvents
        : allEvents.filter((ev) => {
            const ts = Date.parse(ev.created_at);
            return Number.isFinite(ts) && ts >= cutoffMs;
          });

    // Stage 1: Awareness (directly calculated from storefront analytics_events)
    const sessionsInPeriod = new Set(
      eventsInPeriod.map((e) => e.session_id).filter(Boolean)
    ).size;
    const visitorsInPeriodSet = new Set(
      eventsInPeriod.map((e) => e.visitor_id).filter(Boolean)
    );
    const totalUniqueVisitors = visitorsInPeriodSet.size;

    const impressions = sessionsInPeriod;
    const reach = totalUniqueVisitors;
    const frequency = reach > 0 ? impressions / reach : 0;

    // Stage 2: Consideration (including automatic Traffic Sources attribution)
    const sessionSourceMap = new Map<string, string>();
    const sessionVisitorMap = new Map<string, string>();
    for (const ev of eventsInPeriod) {
      if (!ev.session_id) continue;
      if (ev.visitor_id && !sessionVisitorMap.has(ev.session_id)) {
        sessionVisitorMap.set(ev.session_id, ev.visitor_id);
      }
      const rawSource =
        typeof ev.metadata?.traffic_source === "string" &&
        ev.metadata.traffic_source.trim()
          ? ev.metadata.traffic_source.trim()
          : typeof ev.metadata?.utm_source === "string" &&
              ev.metadata.utm_source.trim()
            ? ev.metadata.utm_source.trim()
            : "Direct";
      const existing = sessionSourceMap.get(ev.session_id);
      if (!existing || (existing === "Direct" && rawSource !== "Direct")) {
        sessionSourceMap.set(ev.session_id, rawSource);
      }
    }

    const sourceGroups = new Map<
      string,
      { sessions: Set<string>; visitors: Set<string> }
    >();
    for (const [sessionId, sourceName] of sessionSourceMap.entries()) {
      const bucket = sourceGroups.get(sourceName) || {
        sessions: new Set<string>(),
        visitors: new Set<string>(),
      };
      bucket.sessions.add(sessionId);
      const vid = sessionVisitorMap.get(sessionId);
      if (vid) bucket.visitors.add(vid);
      sourceGroups.set(sourceName, bucket);
    }

    const totalAttributedSessions = sessionSourceMap.size;
    const trafficSourcesBreakdown: TrafficSourceBreakdownItem[] = Array.from(
      sourceGroups.entries()
    )
      .map(([source, bucket]) => ({
        source,
        sessionsCount: bucket.sessions.size,
        visitorsCount: bucket.visitors.size,
        percentage:
          totalAttributedSessions > 0
            ? Math.round((bucket.sessions.size / totalAttributedSessions) * 100)
            : 0,
      }))
      .sort((a, b) => b.sessionsCount - a.sessionsCount);

    const uniqueTrafficSourcesCount = trafficSourcesBreakdown.length;

    let firstTimeVisitors = 0;
    for (const vid of visitorsInPeriodSet) {
      const firstTs = earliestSeenByVisitor.get(vid);
      if (cutoffMs === null || (firstTs !== undefined && firstTs >= cutoffMs)) {
        firstTimeVisitors += 1;
      }
    }

    const pageViewsInPeriod = eventsInPeriod.filter(
      (e) => e.event_type === "page_view"
    );
    const totalPageViews = pageViewsInPeriod.length;
    const pagesPerVisitor =
      totalUniqueVisitors > 0 ? totalPageViews / totalUniqueVisitors : 0;

    const pageExitDurations = eventsInPeriod
      .filter(
        (e) =>
          e.event_type === "page_exit" &&
          typeof e.duration_seconds === "number" &&
          e.duration_seconds > 0
      )
      .map((e) => Number(e.duration_seconds));

    const avgTimePerPageSeconds =
      pageExitDurations.length > 0
        ? pageExitDurations.reduce((a, b) => a + b, 0) / pageExitDurations.length
        : 0;

    const newsletterEmails = new Set<string>();
    let anonymousNewsletterCount = 0;

    for (const ev of eventsInPeriod) {
      if (ev.event_type === "newsletter_signup") {
        const email =
          typeof ev.metadata?.email === "string"
            ? ev.metadata.email.trim().toLowerCase()
            : "";
        if (email) {
          newsletterEmails.add(email);
        } else {
          anonymousNewsletterCount += 1;
        }
      }
    }
    for (const o of ordersInPeriod) {
      const email = extractOrderEmail(o);
      if (email) newsletterEmails.add(email);
    }

    const emailNewsletterSignups =
      newsletterEmails.size + anonymousNewsletterCount;

    // Stage 3: Conversion
    const conversionsCount = ordersInPeriod.length;
    const totalRevenueMad = ordersInPeriod.reduce(
      (sum, o) => sum + (Number(o.total_mad) || 0),
      0
    );

    const orderCompletedEvents = eventsInPeriod.filter(
      (e) => e.event_type === "order_completed"
    );

    const conversionDurationsSec: number[] = [];
    const touchpointsList: number[] = [];

    for (const oc of orderCompletedEvents) {
      const orderTs = Date.parse(oc.created_at);
      if (!Number.isFinite(orderTs) || !oc.visitor_id) continue;

      const firstPvTs =
        firstPageViewByVisitor.get(oc.visitor_id) ??
        earliestSeenByVisitor.get(oc.visitor_id);
      if (firstPvTs !== undefined && orderTs >= firstPvTs) {
        conversionDurationsSec.push((orderTs - firstPvTs) / 1000);
      }

      const visitorEventsUpToOrder = allEvents.filter((ev) => {
        if (ev.visitor_id !== oc.visitor_id) return false;
        const ts = Date.parse(ev.created_at);
        return Number.isFinite(ts) && ts <= orderTs;
      });
      const distinctSessions = new Set(
        visitorEventsUpToOrder.map((ev) => ev.session_id).filter(Boolean)
      );
      const pvCount = visitorEventsUpToOrder.filter(
        (ev) => ev.event_type === "page_view"
      ).length;
      touchpointsList.push(Math.max(1, distinctSessions.size, pvCount > 0 ? 1 : 0));
    }

    const avgTimeToConversionSeconds =
      conversionDurationsSec.length > 0
        ? conversionDurationsSec.reduce((a, b) => a + b, 0) /
          conversionDurationsSec.length
        : null;

    const avgTouchpoints =
      touchpointsList.length > 0
        ? touchpointsList.reduce((a, b) => a + b, 0) / touchpointsList.length
        : conversionsCount > 0 && pagesPerVisitor > 0
          ? 1
          : 0;

    const costPerConversionMad =
      conversionsCount > 0 && marketingMetrics.ad_spend_mad > 0
        ? marketingMetrics.ad_spend_mad / conversionsCount
        : 0;

    const averageOrderSizeMad =
      conversionsCount > 0 ? totalRevenueMad / conversionsCount : 0;

    const checkoutOpensCount = eventsInPeriod.filter(
      (e) => e.event_type === "checkout_open" || e.event_type === "cart_add"
    ).length;

    // Visitor-level Cart Abandonment Count with Recovery Exclusion:
    // Find unique visitor_ids who triggered cart_add or checkout_open in the period,
    // and exclude any visitor who completed an order at or after their intent (including later sessions).
    const earliestCartIntentByVisitor = new Map<string, number>();
    for (const ev of eventsInPeriod) {
      if (ev.event_type !== "cart_add" && ev.event_type !== "checkout_open") {
        continue;
      }
      const ts = Date.parse(ev.created_at);
      if (!ev.visitor_id || !Number.isFinite(ts)) continue;
      const existingTs = earliestCartIntentByVisitor.get(ev.visitor_id);
      if (existingTs === undefined || ts < existingTs) {
        earliestCartIntentByVisitor.set(ev.visitor_id, ts);
      }
    }

    const orderCompletedTimestampsByVisitor = new Map<string, number[]>();
    for (const ev of allEvents) {
      if (ev.event_type !== "order_completed" || !ev.visitor_id) continue;
      const ts = Date.parse(ev.created_at);
      if (!Number.isFinite(ts)) continue;
      const list = orderCompletedTimestampsByVisitor.get(ev.visitor_id) || [];
      list.push(ts);
      orderCompletedTimestampsByVisitor.set(ev.visitor_id, list);
    }

    const cartIntentVisitorsCount = earliestCartIntentByVisitor.size;
    let abandonedCartVisitorsCount = 0;

    for (const [visitorId, firstIntentTs] of earliestCartIntentByVisitor.entries()) {
      const completionTimestamps =
        orderCompletedTimestampsByVisitor.get(visitorId) || [];
      const hasRecoveredOrPurchased = completionTimestamps.some(
        (completedTs) => completedTs >= firstIntentTs - 5000
      );
      if (!hasRecoveredOrPurchased) {
        abandonedCartVisitorsCount += 1;
      }
    }

    // Stage 4: Loyalty
    // Map lifetime orders by normalized customer_phone for repeat cohort detection
    const lifetimeOrdersByPhone = new Map<string, number[]>();
    for (const o of allValidOrders) {
      const phoneKey = normalizePhoneKey(o.customer_phone);
      const ts = Date.parse(o.created_at);
      if (!phoneKey || !Number.isFinite(ts)) continue;
      const arr = lifetimeOrdersByPhone.get(phoneKey) || [];
      arr.push(ts);
      lifetimeOrdersByPhone.set(phoneKey, arr);
    }

    const periodPhones = new Set<string>();
    for (const o of ordersInPeriod) {
      const phoneKey = normalizePhoneKey(o.customer_phone);
      if (phoneKey) periodPhones.add(phoneKey);
    }

    const uniqueCustomersCount = periodPhones.size;
    let repeatCustomersCount = 0;
    const interPurchaseDays: number[] = [];

    for (const phoneKey of periodPhones) {
      const timestamps = (lifetimeOrdersByPhone.get(phoneKey) || []).sort(
        (a, b) => a - b
      );
      if (timestamps.length > 1) {
        repeatCustomersCount += 1;
        for (let i = 1; i < timestamps.length; i += 1) {
          const diffDays = (timestamps[i] - timestamps[i - 1]) / (1000 * 60 * 60 * 24);
          if (diffDays >= 0) {
            interPurchaseDays.push(diffDays);
          }
        }
      }
    }

    const repeatPurchaseRatePct =
      uniqueCustomersCount > 0
        ? (repeatCustomersCount / uniqueCustomersCount) * 100
        : 0;

    const avgDaysBetweenPurchases =
      interPurchaseDays.length > 0
        ? interPurchaseDays.reduce((a, b) => a + b, 0) / interPurchaseDays.length
        : null;

    const ordersPerCustomer =
      uniqueCustomersCount > 0 ? conversionsCount / uniqueCustomersCount : 0;

    const activationDenominator =
      emailNewsletterSignups > 0 ? emailNewsletterSignups : conversionsCount;
    const accountActivationRatePct =
      activationDenominator > 0
        ? Math.min(
            100,
            (marketingMetrics.account_activations / activationDenominator) * 100
          )
        : 0;

    const referralOrdersCount = ordersInPeriod.filter(hasReferralOrPromoUsage).length;
    const loyaltyRewardsEngagements =
      marketingMetrics.rewards_engagements + referralOrdersCount;

    // Compute 4-Stage Visual Funnel Progression
    const awarenessVolume = impressions;
    const considerationVolume = totalUniqueVisitors;
    const conversionVolume = conversionsCount;
    const loyaltyVolume = repeatCustomersCount;

    const awarenessToConsideration =
      awarenessVolume > 0
        ? Math.min(100, (considerationVolume / awarenessVolume) * 100)
        : 0;

    const considerationToConversion =
      considerationVolume > 0
        ? Math.min(100, (conversionVolume / considerationVolume) * 100)
        : conversionVolume > 0
          ? 100
          : 0;

    const conversionToLoyalty =
      conversionVolume > 0
        ? Math.min(100, (loyaltyVolume / conversionVolume) * 100)
        : 0;

    const responsePayload: FunnelAnalyticsData = {
      range,
      needsMigration: missingTables.length > 0,
      missingTables,
      marketingMetrics,
      stages: [
        {
          key: "awareness",
          title: "1. Awareness (Notoriété)",
          primaryMetricLabel: "Visites totales (Impressions)",
          primaryMetricValue: awarenessVolume,
          primaryFormatted: awarenessVolume.toLocaleString("fr-FR"),
          secondaryNote: `${reach.toLocaleString("fr-FR")} visiteurs uniques • ${frequency.toFixed(2)}x`,
          conversionToNextPct: Number(awarenessToConsideration.toFixed(1)),
        },
        {
          key: "consideration",
          title: "2. Consideration",
          primaryMetricLabel: "Visiteurs uniques",
          primaryMetricValue: considerationVolume,
          primaryFormatted: considerationVolume.toLocaleString("fr-FR"),
          secondaryNote: `${totalPageViews.toLocaleString("fr-FR")} pages vues`,
          conversionToNextPct: Number(considerationToConversion.toFixed(1)),
        },
        {
          key: "conversion",
          title: "3. Conversion (COD)",
          primaryMetricLabel: "Commandes confirmées",
          primaryMetricValue: conversionVolume,
          primaryFormatted: conversionVolume.toLocaleString("fr-FR"),
          secondaryNote: `${Math.round(totalRevenueMad).toLocaleString("fr-FR")} MAD CA`,
          conversionToNextPct: Number(conversionToLoyalty.toFixed(1)),
        },
        {
          key: "loyalty",
          title: "4. Loyalty (Fidélité)",
          primaryMetricLabel: "Clients fidèles (2+)",
          primaryMetricValue: loyaltyVolume,
          primaryFormatted: loyaltyVolume.toLocaleString("fr-FR"),
          secondaryNote: `${repeatPurchaseRatePct.toFixed(1)}% achat répété`,
          conversionToNextPct: null,
        },
      ],
      kpis: {
        impressions,
        reach,
        frequency,
        uniqueTrafficSourcesCount,
        trafficSourcesBreakdown,
        firstTimeVisitors,
        totalUniqueVisitors,
        totalPageViews,
        pagesPerVisitor,
        avgTimePerPageSeconds,
        emailNewsletterSignups,
        conversionsCount,
        totalRevenueMad,
        avgTimeToConversionSeconds,
        costPerConversionMad,
        avgTouchpoints,
        averageOrderSizeMad,
        abandonedCartVisitorsCount,
        cartIntentVisitorsCount,
        checkoutOpensCount,
        repeatPurchaseRatePct,
        repeatCustomersCount,
        uniqueCustomersCount,
        avgDaysBetweenPurchases,
        ordersPerCustomer,
        accountActivationRatePct,
        accountActivationsCount: marketingMetrics.account_activations,
        loyaltyRewardsEngagements,
      },
    };

    return NextResponse.json(responsePayload, { headers: NO_STORE_HEADERS });
  } catch (err) {
    console.error("GET /api/analytics/funnel error:", err);
    return NextResponse.json(
      { error: "Erreur serveur lors du calcul des analytics." },
      { status: 500, headers: NO_STORE_HEADERS }
    );
  }
}
