import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const NO_STORE_HEADERS = {
  "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0",
  Pragma: "no-cache",
  Expires: "0",
};

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function getSupabaseAdmin() {
  const supabaseUrl =
    process.env.NEXT_PUBLIC_SUPABASE_URL || "https://zvqcsxwwkgypvqfewbtn.supabase.co";
  const supabaseKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    "sb_publishable_IkjoHS4mwYG9qEXkBWy8Xg_jw3TI_AF";

  return createClient(supabaseUrl, supabaseKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const name = typeof body.name === "string" ? body.name.trim() : "";
    const email = typeof body.email === "string" ? body.email.trim() : "";
    const phone = typeof body.phone === "string" ? body.phone.trim() : "";
    const message = typeof body.message === "string" ? body.message.trim() : "";

    if (name.length < 2 || name.length > 120) {
      return NextResponse.json(
        { error: "Veuillez entrer votre nom (minimum 2 caractères)." },
        { status: 400, headers: NO_STORE_HEADERS }
      );
    }

    if (!EMAIL_REGEX.test(email) || email.length > 200) {
      return NextResponse.json(
        { error: "Veuillez entrer une adresse e-mail valide." },
        { status: 400, headers: NO_STORE_HEADERS }
      );
    }

    if (phone.length > 40) {
      return NextResponse.json(
        { error: "Numéro de téléphone trop long." },
        { status: 400, headers: NO_STORE_HEADERS }
      );
    }

    if (message.length < 3 || message.length > 4000) {
      return NextResponse.json(
        { error: "Veuillez écrire votre message." },
        { status: 400, headers: NO_STORE_HEADERS }
      );
    }

    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from("contact_messages")
      .insert([
        {
          name,
          email,
          phone: phone || null,
          message,
        },
      ])
      .select("id, created_at")
      .single();

    if (error) {
      console.error("POST /api/contact Supabase error:", error.message);
      return NextResponse.json(
        { error: "Impossible d'enregistrer votre message pour le moment." },
        { status: 500, headers: NO_STORE_HEADERS }
      );
    }

    return NextResponse.json(
      {
        success: true,
        contactMessage: data,
      },
      { status: 201, headers: NO_STORE_HEADERS }
    );
  } catch (error) {
    console.error("POST /api/contact unexpected error:", error);
    return NextResponse.json(
      { error: "Erreur serveur lors de l'envoi du message." },
      { status: 500, headers: NO_STORE_HEADERS }
    );
  }
}
