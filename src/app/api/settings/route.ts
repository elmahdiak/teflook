import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { createClient } from "@supabase/supabase-js";
import {
  DEFAULT_INSTAGRAM_URL,
  DEFAULT_SITE_SETTINGS,
  normalizeInstagramUrl,
  type WhatsAppPosition,
} from "@/lib/site-settings";
import { ADMIN_BASE_PATH, ADMIN_SETTINGS_PATH } from "@/lib/admin-config";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const NO_STORE_HEADERS = {
  "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0",
  Pragma: "no-cache",
  Expires: "0",
};

function getSupabaseAdmin() {
  const supabaseUrl =
    process.env.NEXT_PUBLIC_SUPABASE_URL || "https://zvqcsxwwkgypvqfewbtn.supabase.co";
  // Prefer Service Role Key on the server so RLS never blocks admin writes
  const supabaseKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    "sb_publishable_IkjoHS4mwYG9qEXkBWy8Xg_jw3TI_AF";

  return createClient(supabaseUrl, supabaseKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

function normalizePosition(pos: unknown): WhatsAppPosition {
  return pos === "left" ? "left" : "right";
}

export async function GET() {
  try {
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from("site_settings")
      .select("*")
      .eq("id", "default")
      .maybeSingle();

    if (error) {
      console.error("GET /api/settings Supabase error:", error.message);
      return NextResponse.json(
        { error: error.message },
        { status: 500, headers: NO_STORE_HEADERS }
      );
    }

    if (!data) {
      return NextResponse.json(DEFAULT_SITE_SETTINGS, { headers: NO_STORE_HEADERS });
    }

    return NextResponse.json(
      {
        whatsapp_phone:
          typeof data.whatsapp_phone === "string" && data.whatsapp_phone.trim().length > 0
            ? data.whatsapp_phone.trim()
            : DEFAULT_SITE_SETTINGS.whatsapp_phone,
        whatsapp_enabled: data.whatsapp_enabled !== false,
        whatsapp_position: normalizePosition(data.whatsapp_position),
        instagram_url:
          typeof data.instagram_url === "string"
            ? data.instagram_url.trim()
            : DEFAULT_INSTAGRAM_URL,
        updated_at: data.updated_at,
      },
      { headers: NO_STORE_HEADERS }
    );
  } catch (error) {
    console.error("GET /api/settings unexpected error:", error);
    return NextResponse.json(
      { error: "Erreur lors de la lecture des paramètres." },
      { status: 500, headers: NO_STORE_HEADERS }
    );
  }
}

async function handleUpsertSettings(req: NextRequest) {
  try {
    const body = await req.json();
    const phoneRaw =
      typeof body.whatsapp_phone === "string" ? body.whatsapp_phone.trim() : "";
    const enabled =
      body.whatsapp_enabled !== undefined ? Boolean(body.whatsapp_enabled) : true;
    const position: WhatsAppPosition = normalizePosition(body.whatsapp_position);
    const instagramRaw =
      typeof body.instagram_url === "string" ? body.instagram_url.trim() : "";
    const normalizedInstagram = instagramRaw ? normalizeInstagramUrl(instagramRaw) : "";

    if (!phoneRaw) {
      return NextResponse.json(
        { error: "Le numéro WhatsApp est obligatoire." },
        { status: 400, headers: NO_STORE_HEADERS }
      );
    }

    const payload = {
      id: "default",
      whatsapp_phone: phoneRaw,
      whatsapp_enabled: enabled,
      whatsapp_position: position,
      instagram_url: normalizedInstagram,
      updated_at: new Date().toISOString(),
    };

    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from("site_settings")
      .upsert(payload, { onConflict: "id" })
      .select("*")
      .single();

    if (error) {
      console.error("Supabase upsert site_settings error:", error.message);
      return NextResponse.json(
        {
          error: `Échec de la sauvegarde dans Supabase : ${error.message}`,
        },
        { status: 500, headers: NO_STORE_HEADERS }
      );
    }

    try {
      revalidatePath("/", "layout");
      revalidatePath("/product/[handle]", "page");
      revalidatePath(ADMIN_BASE_PATH);
      revalidatePath(ADMIN_SETTINGS_PATH);
    } catch {}

    return NextResponse.json(
      {
        success: true,
        data: {
          whatsapp_phone: data?.whatsapp_phone || payload.whatsapp_phone,
          whatsapp_enabled: data?.whatsapp_enabled !== false,
          whatsapp_position: normalizePosition(data?.whatsapp_position ?? payload.whatsapp_position),
          instagram_url:
            typeof data?.instagram_url === "string"
              ? data.instagram_url.trim()
              : payload.instagram_url,
          updated_at: data?.updated_at || payload.updated_at,
        },
      },
      { headers: NO_STORE_HEADERS }
    );
  } catch (error) {
    console.error("POST/PUT /api/settings error:", error);
    return NextResponse.json(
      { error: "Erreur serveur lors de l'enregistrement des paramètres." },
      { status: 500, headers: NO_STORE_HEADERS }
    );
  }
}

export async function POST(req: NextRequest) {
  return handleUpsertSettings(req);
}

export async function PUT(req: NextRequest) {
  return handleUpsertSettings(req);
}
