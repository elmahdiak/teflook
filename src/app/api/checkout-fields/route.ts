import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getSupabaseAdmin } from "@/lib/review-server";
import {
  DEFAULT_CHECKOUT_FIELDS,
  normalizeCheckoutField,
  sortCheckoutFields,
  type CheckoutFieldConfig,
} from "@/lib/checkout-fields";
import { ADMIN_BASE_PATH, ADMIN_CHECKOUT_FIELDS_PATH } from "@/lib/admin-config";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const NO_STORE_HEADERS = {
  "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0",
  Pragma: "no-cache",
  Expires: "0",
};

function isMissingTableError(err: { code?: string; message?: string } | null): boolean {
  if (!err) return false;
  const code = (err.code || "").toUpperCase();
  const msg = (err.message || "").toLowerCase();
  return (
    code === "42P01" ||
    code === "PGRST205" ||
    msg.includes("could not find the table") ||
    msg.includes("does not exist")
  );
}

export async function GET() {
  try {
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from("checkout_fields")
      .select("*")
      .order("display_order", { ascending: true });

    if (error) {
      if (isMissingTableError(error)) {
        return NextResponse.json(
          { fields: DEFAULT_CHECKOUT_FIELDS, needsMigration: true },
          { headers: NO_STORE_HEADERS }
        );
      }
      console.warn("GET /api/checkout-fields error:", error.message);
      return NextResponse.json(
        { fields: DEFAULT_CHECKOUT_FIELDS },
        { headers: NO_STORE_HEADERS }
      );
    }

    if (!Array.isArray(data) || data.length === 0) {
      return NextResponse.json(
        { fields: DEFAULT_CHECKOUT_FIELDS, needsMigration: false },
        { headers: NO_STORE_HEADERS }
      );
    }

    const normalized = sortCheckoutFields(
      data.map((row, idx) => normalizeCheckoutField(row, idx))
    );

    return NextResponse.json(
      { fields: normalized, needsMigration: false },
      { headers: NO_STORE_HEADERS }
    );
  } catch (error) {
    console.error("GET /api/checkout-fields exception:", error);
    return NextResponse.json(
      { fields: DEFAULT_CHECKOUT_FIELDS },
      { headers: NO_STORE_HEADERS }
    );
  }
}

async function handleSaveCheckoutFields(req: NextRequest) {
  try {
    const body = await req.json();
    const incoming = Array.isArray(body?.fields) ? body.fields : null;

    if (!incoming || incoming.length === 0) {
      return NextResponse.json(
        { error: "La liste des champs du formulaire est requise." },
        { status: 400, headers: NO_STORE_HEADERS }
      );
    }

    const normalized: CheckoutFieldConfig[] = sortCheckoutFields(
      incoming.map((item: Partial<CheckoutFieldConfig>, idx: number) =>
        normalizeCheckoutField(item, idx)
      )
    );

    // Ensure unique field_key values
    const seenKeys = new Set<string>();
    const deduped = normalized.map((field, idx) => {
      let key = field.field_key;
      if (seenKeys.has(key)) {
        key = `${key}_${idx + 1}`;
      }
      seenKeys.add(key);
      return { ...field, field_key: key, display_order: idx + 1 };
    });

    const supabase = getSupabaseAdmin();
    const nowIso = new Date().toISOString();

    const rowsToUpsert = deduped.map((field) => ({
      id: field.id,
      field_key: field.field_key,
      label_fr: field.label_fr,
      label_ar: field.label_ar,
      field_type: field.field_type,
      is_required: field.is_required,
      is_enabled: field.is_enabled,
      display_order: field.display_order,
      placeholder_fr: field.placeholder_fr,
      placeholder_ar: field.placeholder_ar,
      options: field.options ?? [],
      is_system: Boolean(field.is_system),
      updated_at: nowIso,
    }));

    const { data: existingRows, error: fetchErr } = await supabase
      .from("checkout_fields")
      .select("id");

    if (fetchErr) {
      if (isMissingTableError(fetchErr)) {
        return NextResponse.json(
          {
            success: true,
            needsMigration: true,
            fields: deduped,
            message:
              "Table checkout_fields introuvable dans Supabase — configuration sauvegardée localement.",
          },
          { headers: NO_STORE_HEADERS }
        );
      }
      return NextResponse.json(
        { error: fetchErr.message },
        { status: 500, headers: NO_STORE_HEADERS }
      );
    }

    const keepIds = new Set(deduped.map((f) => f.id));
    const idsToDelete = (existingRows || [])
      .map((r) => String(r.id))
      .filter((id) => !keepIds.has(id));

    if (idsToDelete.length > 0) {
      const { error: delErr } = await supabase
        .from("checkout_fields")
        .delete()
        .in("id", idsToDelete);
      if (delErr) {
        console.warn("Delete removed checkout_fields error:", delErr.message);
      }
    }

    const { data: upsertedData, error: upsertErr } = await supabase
      .from("checkout_fields")
      .upsert(rowsToUpsert, { onConflict: "id" })
      .select("*")
      .order("display_order", { ascending: true });

    if (upsertErr) {
      return NextResponse.json(
        { error: `Erreur Supabase : ${upsertErr.message}` },
        { status: 500, headers: NO_STORE_HEADERS }
      );
    }

    try {
      revalidatePath("/", "layout");
      revalidatePath(ADMIN_BASE_PATH);
      revalidatePath(ADMIN_CHECKOUT_FIELDS_PATH);
    } catch {}

    const savedFields = Array.isArray(upsertedData)
      ? sortCheckoutFields(
          upsertedData.map((row, idx) => normalizeCheckoutField(row, idx))
        )
      : deduped;

    return NextResponse.json(
      { success: true, needsMigration: false, fields: savedFields },
      { headers: NO_STORE_HEADERS }
    );
  } catch (error) {
    console.error("PUT /api/checkout-fields error:", error);
    return NextResponse.json(
      { error: "Erreur serveur lors de l'enregistrement des champs." },
      { status: 500, headers: NO_STORE_HEADERS }
    );
  }
}

export async function PUT(req: NextRequest) {
  return handleSaveCheckoutFields(req);
}

export async function POST(req: NextRequest) {
  return handleSaveCheckoutFields(req);
}
