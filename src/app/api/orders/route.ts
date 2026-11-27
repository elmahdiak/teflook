import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/review-server";
import type { CODOrder, OrderStatus } from "@/lib/cod-service";

export const dynamic = "force-dynamic";
export const revalidate = 0;

function mapRowToCODOrder(row: any): CODOrder {
  return {
    id: String(row.id),
    createdAt: row.created_at || row.createdAt || new Date().toISOString(),
    customerName: row.customer_name || row.customerName || "",
    customerPhone: row.customer_phone || row.customerPhone || "",
    customerCity: row.customer_city || row.customerCity || "",
    customerAddress: row.customer_address || row.customerAddress || "",
    notes: row.notes || undefined,
    customFields:
      row.custom_fields && typeof row.custom_fields === "object"
        ? row.custom_fields
        : undefined,
    customFieldsSummary: Array.isArray(row.custom_fields_summary)
      ? row.custom_fields_summary
      : undefined,
    items: Array.isArray(row.items) ? row.items : [],
    totalMad: Number(row.total_mad ?? row.totalMad ?? 0),
    status: (row.status || "pending") as OrderStatus,
    paymentMethod: "COD",
  };
}

export async function GET() {
  try {
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from("cod_orders")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      return NextResponse.json([]);
    }

    return NextResponse.json((data || []).map(mapRowToCODOrder));
  } catch {
    return NextResponse.json([]);
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as Partial<CODOrder>;
    const supabase = getSupabaseAdmin();

    const payload = {
      id: body.id || `CMD-${Math.floor(10000 + Math.random() * 90000)}`,
      created_at: body.createdAt || new Date().toISOString(),
      customer_name: body.customerName || "",
      customer_phone: body.customerPhone || "",
      customer_city: body.customerCity || "",
      customer_address: body.customerAddress || "",
      notes: body.notes || null,
      custom_fields: body.customFields || {},
      custom_fields_summary: body.customFieldsSummary || [],
      items: body.items || [],
      total_mad: Number(body.totalMad || 0),
      status: body.status || "pending",
      payment_method: "COD",
    };

    const { data, error } = await supabase
      .from("cod_orders")
      .upsert(payload, { onConflict: "id" })
      .select("*")
      .single();

    if (error) {
      return NextResponse.json(
        { success: false, savedToSupabase: false, error: error.message },
        { status: 200 }
      );
    }

    return NextResponse.json({
      success: true,
      savedToSupabase: true,
      order: mapRowToCODOrder(data),
    });
  } catch (err) {
    console.error("POST /api/orders error:", err);
    return NextResponse.json(
      { success: false, savedToSupabase: false },
      { status: 200 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    if (!body?.id || !body?.status) {
      return NextResponse.json({ error: "id et status requis." }, { status: 400 });
    }
    const supabase = getSupabaseAdmin();
    const { error } = await supabase
      .from("cod_orders")
      .update({ status: body.status })
      .eq("id", body.id);

    if (error) {
      return NextResponse.json({ success: false }, { status: 200 });
    }
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ success: false }, { status: 200 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) {
      return NextResponse.json({ error: "id requis." }, { status: 400 });
    }
    const supabase = getSupabaseAdmin();
    const { error } = await supabase.from("cod_orders").delete().eq("id", id);
    if (error) {
      return NextResponse.json({ success: false }, { status: 200 });
    }
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ success: false }, { status: 200 });
  }
}
