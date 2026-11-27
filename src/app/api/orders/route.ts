import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/review-server";
import {
  isMissingOrderColumnError,
  mapRowToCODOrder,
  type CODOrder,
} from "@/lib/cod-service";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const NO_STORE_HEADERS = {
  "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0",
  Pragma: "no-cache",
  Expires: "0",
};

export async function GET() {
  try {
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from("orders")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("GET /api/orders Supabase error:", error.message);
      return NextResponse.json(
        { error: error.message },
        { status: 500, headers: NO_STORE_HEADERS }
      );
    }

    return NextResponse.json((data || []).map(mapRowToCODOrder), {
      headers: NO_STORE_HEADERS,
    });
  } catch (err) {
    console.error("GET /api/orders exception:", err);
    return NextResponse.json(
      { error: "Erreur lors de la récupération des commandes." },
      { status: 500, headers: NO_STORE_HEADERS }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as Partial<CODOrder>;
    const supabase = getSupabaseAdmin();

    const corePayload = {
      id: body.id || `CMD-${Math.floor(10000 + Math.random() * 90000)}`,
      created_at: body.createdAt || new Date().toISOString(),
      customer_name: body.customerName || "",
      customer_phone: body.customerPhone || "",
      customer_city: body.customerCity || "",
      customer_address: body.customerAddress || "",
      notes: body.notes || null,
      items: body.items || [],
      total_mad: Number(body.totalMad || 0),
      status: body.status || "pending",
      payment_method: "COD",
    };

    const fullPayload = {
      ...corePayload,
      custom_fields: body.customFields || {},
      custom_fields_summary: body.customFieldsSummary || [],
    };

    let { data, error } = await supabase
      .from("orders")
      .insert([fullPayload])
      .select("*")
      .single();

    if (error && isMissingOrderColumnError(error)) {
      const retry = await supabase
        .from("orders")
        .insert([corePayload])
        .select("*")
        .single();
      data = retry.data;
      error = retry.error;
    }

    if (error) {
      console.error("POST /api/orders Supabase error:", error.message);
      return NextResponse.json(
        { success: false, savedToSupabase: false, error: error.message },
        { status: 500, headers: NO_STORE_HEADERS }
      );
    }

    return NextResponse.json(
      {
        success: true,
        savedToSupabase: true,
        order: mapRowToCODOrder(data),
      },
      { headers: NO_STORE_HEADERS }
    );
  } catch (err) {
    console.error("POST /api/orders exception:", err);
    return NextResponse.json(
      {
        success: false,
        savedToSupabase: false,
        error: "Erreur serveur lors de l'enregistrement de la commande.",
      },
      { status: 500, headers: NO_STORE_HEADERS }
    );
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    if (!body?.id || !body?.status) {
      return NextResponse.json(
        { error: "id et status requis." },
        { status: 400, headers: NO_STORE_HEADERS }
      );
    }
    const supabase = getSupabaseAdmin();
    const { error } = await supabase
      .from("orders")
      .update({ status: body.status })
      .eq("id", body.id);

    if (error) {
      console.error("PATCH /api/orders Supabase error:", error.message);
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500, headers: NO_STORE_HEADERS }
      );
    }
    return NextResponse.json({ success: true }, { headers: NO_STORE_HEADERS });
  } catch {
    return NextResponse.json(
      { success: false, error: "Erreur lors de la mise à jour." },
      { status: 500, headers: NO_STORE_HEADERS }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) {
      return NextResponse.json(
        { error: "id requis." },
        { status: 400, headers: NO_STORE_HEADERS }
      );
    }
    const supabase = getSupabaseAdmin();
    const { error } = await supabase.from("orders").delete().eq("id", id);
    if (error) {
      console.error("DELETE /api/orders Supabase error:", error.message);
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500, headers: NO_STORE_HEADERS }
      );
    }
    return NextResponse.json({ success: true }, { headers: NO_STORE_HEADERS });
  } catch {
    return NextResponse.json(
      { success: false, error: "Erreur lors de la suppression." },
      { status: 500, headers: NO_STORE_HEADERS }
    );
  }
}
