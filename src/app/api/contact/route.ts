import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getSupabaseAdmin } from "@/lib/review-server";
import { ADMIN_CONTACT_MESSAGES_PATH } from "@/lib/admin-config";
import {
  isSupabaseMissingColumnError,
  isSupabaseMissingTableError,
  type ContactMessageItem,
  type ContactMessageStatus,
} from "@/lib/community-submissions";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const NO_STORE_HEADERS = {
  "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0",
  Pragma: "no-cache",
  Expires: "0",
};

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function normalizeContactMessage(row: Record<string, any>): ContactMessageItem {
  return {
    id: String(row.id),
    name: String(row.name || ""),
    email: String(row.email || ""),
    phone: row.phone ? String(row.phone) : null,
    message: String(row.message || ""),
    status: row.status === "read" ? "read" : "unread",
    created_at: row.created_at || new Date().toISOString(),
  };
}

export async function GET() {
  try {
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from("contact_messages")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      if (isSupabaseMissingTableError(error)) {
        return NextResponse.json(
          { messages: [], needsMigration: true },
          { headers: NO_STORE_HEADERS }
        );
      }
      console.error("GET /api/contact Supabase error:", error.message);
      return NextResponse.json(
        { error: error.message, messages: [] },
        { status: 500, headers: NO_STORE_HEADERS }
      );
    }

    return NextResponse.json(
      {
        messages: (data || []).map(normalizeContactMessage),
        needsMigration: false,
      },
      { headers: NO_STORE_HEADERS }
    );
  } catch (err) {
    console.error("GET /api/contact exception:", err);
    return NextResponse.json(
      { error: "Erreur lors de la récupération des messages.", messages: [] },
      { status: 500, headers: NO_STORE_HEADERS }
    );
  }
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
    const baseRow = {
      name,
      email,
      phone: phone || null,
      message,
    };

    let { data, error } = await supabase
      .from("contact_messages")
      .insert([{ ...baseRow, status: "unread" }])
      .select("*")
      .single();

    if (error && isSupabaseMissingColumnError(error, "status")) {
      const retry = await supabase
        .from("contact_messages")
        .insert([baseRow])
        .select("*")
        .single();
      data = retry.data;
      error = retry.error;
    }

    if (error) {
      console.error("POST /api/contact Supabase error:", error.message);
      return NextResponse.json(
        {
          error: "Impossible d'enregistrer votre message pour le moment.",
          needsMigration: isSupabaseMissingTableError(error),
        },
        { status: 500, headers: NO_STORE_HEADERS }
      );
    }

    try {
      revalidatePath(ADMIN_CONTACT_MESSAGES_PATH);
    } catch {}

    return NextResponse.json(
      {
        success: true,
        contactMessage: normalizeContactMessage(data),
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

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const id = typeof body?.id === "string" ? body.id.trim() : "";
    const status = body?.status as ContactMessageStatus;

    if (!id || (status !== "read" && status !== "unread")) {
      return NextResponse.json(
        { error: "id et status ('read' ou 'unread') requis." },
        { status: 400, headers: NO_STORE_HEADERS }
      );
    }

    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from("contact_messages")
      .update({ status })
      .eq("id", id)
      .select("*")
      .single();

    if (error) {
      if (isSupabaseMissingColumnError(error, "status")) {
        return NextResponse.json(
          {
            error:
              "La colonne status manque sur contact_messages — exécutez le SQL de mise à jour.",
            needsMigration: true,
          },
          { status: 500, headers: NO_STORE_HEADERS }
        );
      }
      return NextResponse.json(
        { error: error.message },
        { status: 500, headers: NO_STORE_HEADERS }
      );
    }

    try {
      revalidatePath(ADMIN_CONTACT_MESSAGES_PATH);
    } catch {}

    return NextResponse.json(
      { success: true, message: normalizeContactMessage(data) },
      { headers: NO_STORE_HEADERS }
    );
  } catch {
    return NextResponse.json(
      { error: "Erreur lors de la mise à jour du message." },
      { status: 500, headers: NO_STORE_HEADERS }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id")?.trim();
    if (!id) {
      return NextResponse.json(
        { error: "Identifiant requis." },
        { status: 400, headers: NO_STORE_HEADERS }
      );
    }

    const supabase = getSupabaseAdmin();
    const { error } = await supabase
      .from("contact_messages")
      .delete()
      .eq("id", id);

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500, headers: NO_STORE_HEADERS }
      );
    }

    try {
      revalidatePath(ADMIN_CONTACT_MESSAGES_PATH);
    } catch {}

    return NextResponse.json({ success: true, id }, { headers: NO_STORE_HEADERS });
  } catch {
    return NextResponse.json(
      { error: "Erreur lors de la suppression." },
      { status: 500, headers: NO_STORE_HEADERS }
    );
  }
}
