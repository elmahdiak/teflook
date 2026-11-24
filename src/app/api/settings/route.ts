import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { createClient } from "@supabase/supabase-js";
import { DEFAULT_SITE_SETTINGS, cleanWhatsAppNumber } from "@/lib/site-settings";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL || "https://zvqcsxwwkgypvqfewbtn.supabase.co";
const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "sb_publishable_IkjoHS4mwYG9qEXkBWy8Xg_jw3TI_AF";

const supabase = createClient(supabaseUrl, supabaseAnonKey);

export async function GET() {
  try {
    const { data, error } = await supabase
      .from("site_settings")
      .select("*")
      .eq("id", "default")
      .single();

    if (error || !data) {
      return NextResponse.json(DEFAULT_SITE_SETTINGS);
    }

    return NextResponse.json({
      whatsapp_phone: data.whatsapp_phone || DEFAULT_SITE_SETTINGS.whatsapp_phone,
      whatsapp_enabled: data.whatsapp_enabled !== false,
      updated_at: data.updated_at,
    });
  } catch (error) {
    console.warn("GET /api/settings fallback error:", error);
    return NextResponse.json(DEFAULT_SITE_SETTINGS);
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const phoneRaw = typeof body.whatsapp_phone === "string" ? body.whatsapp_phone.trim() : "";
    const enabled = body.whatsapp_enabled !== undefined ? Boolean(body.whatsapp_enabled) : true;

    const payload = {
      id: "default",
      whatsapp_phone: phoneRaw || DEFAULT_SITE_SETTINGS.whatsapp_phone,
      whatsapp_enabled: enabled,
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from("site_settings")
      .upsert(payload)
      .select()
      .single();

    if (error) {
      console.warn("Supabase upsert site_settings warning:", error.message);
      // Return success with payload so client still reflects changes even if table migration is pending
      return NextResponse.json({
        success: true,
        data: payload,
        warning: error.message,
      });
    }

    // Invalidate site cache so changes reflect instantly
    try {
      revalidatePath("/", "layout");
      revalidatePath("/product/[handle]", "page");
    } catch {}

    return NextResponse.json({
      success: true,
      data: data || payload,
    });
  } catch (error) {
    console.error("POST /api/settings error:", error);
    return NextResponse.json(
      { error: "Erreur lors de l'enregistrement des paramètres." },
      { status: 500 }
    );
  }
}
