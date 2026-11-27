import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/review-server";
import {
  DEFAULT_MARKETING_METRICS,
  parseAnalyticsDateRange,
  type AnalyticsDateRange,
  type MarketingMetricsConfig,
} from "@/lib/analytics";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const NO_STORE_HEADERS = {
  "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0",
  Pragma: "no-cache",
  Expires: "0",
};

function parseRange(raw: string | null): AnalyticsDateRange {
  return parseAnalyticsDateRange(raw);
}

function normalizeMetrics(
  raw: Record<string, unknown> | null | undefined,
  range: AnalyticsDateRange
): MarketingMetricsConfig {
  const base = DEFAULT_MARKETING_METRICS[range];
  return {
    id: range,
    ad_spend_mad: Math.max(0, Number(raw?.ad_spend_mad ?? base.ad_spend_mad) || 0),
    brand_searches: Math.max(
      0,
      Number(raw?.brand_searches ?? base.brand_searches) || 0
    ),
    rewards_engagements: Math.max(
      0,
      Number(raw?.rewards_engagements ?? base.rewards_engagements) || 0
    ),
    account_activations: Math.max(
      0,
      Number(raw?.account_activations ?? base.account_activations) || 0
    ),
    updated_at:
      typeof raw?.updated_at === "string" ? raw.updated_at : undefined,
  };
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

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const range = parseRange(searchParams.get("range"));

  try {
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from("marketing_metrics")
      .select("*")
      .in("id", [range, "default"]);

    if (error) {
      if (isMissingTableError(error)) {
        return NextResponse.json(
          {
            metrics: DEFAULT_MARKETING_METRICS[range],
            needsMigration: true,
          },
          { headers: NO_STORE_HEADERS }
        );
      }
      return NextResponse.json(
        { error: error.message },
        { status: 500, headers: NO_STORE_HEADERS }
      );
    }

    const exactRow = Array.isArray(data)
      ? data.find((r) => r.id === range) || data.find((r) => r.id === "default")
      : null;

    return NextResponse.json(
      {
        metrics: normalizeMetrics(exactRow, range),
        needsMigration: false,
      },
      { headers: NO_STORE_HEADERS }
    );
  } catch {
    return NextResponse.json(
      { metrics: DEFAULT_MARKETING_METRICS[range], needsMigration: false },
      { headers: NO_STORE_HEADERS }
    );
  }
}

async function handleSaveMetrics(req: NextRequest) {
  try {
    const body = await req.json();
    const range = parseRange(body?.range ?? body?.id ?? "30d");
    const normalized = normalizeMetrics(body, range);

    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from("marketing_metrics")
      .upsert(
        {
          ...normalized,
          id: range,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "id" }
      )
      .select("*")
      .single();

    if (error) {
      if (isMissingTableError(error)) {
        return NextResponse.json(
          {
            success: false,
            needsMigration: true,
            error:
              "Table marketing_metrics absente dans Supabase. Exécutez la migration SQL ci-dessous.",
          },
          { status: 200, headers: NO_STORE_HEADERS }
        );
      }
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500, headers: NO_STORE_HEADERS }
      );
    }

    return NextResponse.json(
      {
        success: true,
        needsMigration: false,
        metrics: normalizeMetrics(data, range),
      },
      { headers: NO_STORE_HEADERS }
    );
  } catch {
    return NextResponse.json(
      { success: false, error: "Erreur lors de la sauvegarde des métriques." },
      { status: 500, headers: NO_STORE_HEADERS }
    );
  }
}

export async function PUT(req: NextRequest) {
  return handleSaveMetrics(req);
}

export async function POST(req: NextRequest) {
  return handleSaveMetrics(req);
}
