import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getSupabaseAdmin } from "@/lib/review-server";
import { ADMIN_NEWSLETTER_PATH } from "@/lib/admin-config";
import {
  isSupabaseMissingTableError,
  type NewsletterStatus,
  type NewsletterSubscriber,
} from "@/lib/community-submissions";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const NO_STORE_HEADERS = {
  "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0",
  Pragma: "no-cache",
  Expires: "0",
};

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function normalizeSubscriber(row: Record<string, any>): NewsletterSubscriber {
  return {
    id: String(row.id || row.email),
    email: String(row.email || "").trim().toLowerCase(),
    status: row.status === "unsubscribed" ? "unsubscribed" : "active",
    created_at: row.created_at || new Date().toISOString(),
  };
}

export async function GET() {
  try {
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from("newsletter_subscribers")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      if (isSupabaseMissingTableError(error)) {
        return NextResponse.json(
          { subscribers: [], needsMigration: true },
          { headers: NO_STORE_HEADERS }
        );
      }
      console.error("GET /api/newsletter Supabase error:", error.message);
      return NextResponse.json(
        { error: error.message, subscribers: [] },
        { status: 500, headers: NO_STORE_HEADERS }
      );
    }

    return NextResponse.json(
      {
        subscribers: (data || []).map(normalizeSubscriber),
        needsMigration: false,
      },
      { headers: NO_STORE_HEADERS }
    );
  } catch (err) {
    console.error("GET /api/newsletter exception:", err);
    return NextResponse.json(
      { error: "Erreur lors de la récupération des inscrits.", subscribers: [] },
      { status: 500, headers: NO_STORE_HEADERS }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const rawEmail = typeof body?.email === "string" ? body.email.trim().toLowerCase() : "";

    if (!EMAIL_REGEX.test(rawEmail) || rawEmail.length > 200) {
      return NextResponse.json(
        { error: "Veuillez entrer une adresse e-mail valide." },
        { status: 400, headers: NO_STORE_HEADERS }
      );
    }

    const supabase = getSupabaseAdmin();

    // Check existing subscriber first for clean duplicate handling
    const { data: existing, error: lookupError } = await supabase
      .from("newsletter_subscribers")
      .select("id, email, status, created_at")
      .eq("email", rawEmail)
      .maybeSingle();

    if (lookupError && isSupabaseMissingTableError(lookupError)) {
      return NextResponse.json(
        {
          error:
            "Table newsletter_subscribers non initialisée dans Supabase.",
          needsMigration: true,
        },
        { status: 500, headers: NO_STORE_HEADERS }
      );
    }

    if (existing) {
      if (existing.status === "unsubscribed") {
        // Reactivate unsubscribed email cleanly
        const { data: reactivated, error: reactivateErr } = await supabase
          .from("newsletter_subscribers")
          .update({ status: "active" })
          .eq("id", existing.id)
          .select("*")
          .single();

        if (reactivateErr) {
          return NextResponse.json(
            { error: "Impossible de réactiver votre inscription." },
            { status: 500, headers: NO_STORE_HEADERS }
          );
        }

        try {
          revalidatePath(ADMIN_NEWSLETTER_PATH);
        } catch {}

        return NextResponse.json(
          {
            success: true,
            reactivated: true,
            subscriber: normalizeSubscriber(reactivated),
          },
          { status: 201, headers: NO_STORE_HEADERS }
        );
      }

      return NextResponse.json(
        {
          code: "DUPLICATE_EMAIL",
          alreadySubscribed: true,
          error: "Cette adresse e-mail est déjà inscrite à notre newsletter.",
        },
        { status: 409, headers: NO_STORE_HEADERS }
      );
    }

    const { data, error } = await supabase
      .from("newsletter_subscribers")
      .insert([{ email: rawEmail, status: "active" }])
      .select("*")
      .single();

    if (error) {
      if (error.code === "23505") {
        return NextResponse.json(
          {
            code: "DUPLICATE_EMAIL",
            alreadySubscribed: true,
            error: "Cette adresse e-mail est déjà inscrite à notre newsletter.",
          },
          { status: 409, headers: NO_STORE_HEADERS }
        );
      }
      if (isSupabaseMissingTableError(error)) {
        return NextResponse.json(
          {
            error:
              "Table newsletter_subscribers non initialisée dans Supabase.",
            needsMigration: true,
          },
          { status: 500, headers: NO_STORE_HEADERS }
        );
      }
      console.error("POST /api/newsletter Supabase error:", error.message);
      return NextResponse.json(
        { error: "Impossible d'enregistrer votre inscription pour le moment." },
        { status: 500, headers: NO_STORE_HEADERS }
      );
    }

    try {
      revalidatePath(ADMIN_NEWSLETTER_PATH);
    } catch {}

    return NextResponse.json(
      {
        success: true,
        subscriber: normalizeSubscriber(data),
      },
      { status: 201, headers: NO_STORE_HEADERS }
    );
  } catch (err) {
    console.error("POST /api/newsletter unexpected error:", err);
    return NextResponse.json(
      { error: "Erreur serveur lors de l'inscription." },
      { status: 500, headers: NO_STORE_HEADERS }
    );
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const id = typeof body?.id === "string" ? body.id.trim() : "";
    const status = body?.status as NewsletterStatus;

    if (!id || (status !== "active" && status !== "unsubscribed")) {
      return NextResponse.json(
        { error: "id et status valide requis." },
        { status: 400, headers: NO_STORE_HEADERS }
      );
    }

    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from("newsletter_subscribers")
      .update({ status })
      .eq("id", id)
      .select("*")
      .single();

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500, headers: NO_STORE_HEADERS }
      );
    }

    try {
      revalidatePath(ADMIN_NEWSLETTER_PATH);
    } catch {}

    return NextResponse.json(
      { success: true, subscriber: normalizeSubscriber(data) },
      { headers: NO_STORE_HEADERS }
    );
  } catch {
    return NextResponse.json(
      { error: "Erreur lors de la mise à jour du statut." },
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
      .from("newsletter_subscribers")
      .delete()
      .eq("id", id);

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500, headers: NO_STORE_HEADERS }
      );
    }

    try {
      revalidatePath(ADMIN_NEWSLETTER_PATH);
    } catch {}

    return NextResponse.json({ success: true, id }, { headers: NO_STORE_HEADERS });
  } catch {
    return NextResponse.json(
      { error: "Erreur lors de la suppression." },
      { status: 500, headers: NO_STORE_HEADERS }
    );
  }
}
