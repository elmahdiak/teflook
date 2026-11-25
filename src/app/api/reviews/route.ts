import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { createClient } from "@supabase/supabase-js";
import type { ProductReview } from "@/lib/reviews-service";
import { ADMIN_PRODUCTS_PATH, ADMIN_REVIEWS_PATH } from "@/lib/admin-config";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL || "https://zvqcsxwwkgypvqfewbtn.supabase.co";
const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "sb_publishable_IkjoHS4mwYG9qEXkBWy8Xg_jw3TI_AF";

const supabase = createClient(supabaseUrl, supabaseAnonKey);

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const productId = searchParams.get("productId");
    const handle = searchParams.get("handle");

    let query = supabase
      .from("product_reviews")
      .select("*")
      .order("created_at", { ascending: false });

    if (productId && handle) {
      query = query.or(`product_id.eq.${productId},product_handle.eq.${handle}`);
    } else if (productId) {
      query = query.or(`product_id.eq.${productId},product_handle.eq.${productId}`);
    } else if (handle) {
      query = query.eq("product_handle", handle);
    }

    const { data, error } = await query;

    if (error) {
      console.warn("GET /api/reviews Supabase error:", error.message);
      return NextResponse.json([]);
    }

    return NextResponse.json(data || []);
  } catch (error) {
    console.error("GET /api/reviews error:", error);
    return NextResponse.json([]);
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const productId = body.productId || body.product_id;
    const productHandle = body.productHandle || body.product_handle || productId;
    const authorName = (body.authorName || body.author_name || "").trim();
    const authorRole = (body.authorRole || body.author_role || "Parent").trim();
    const comment = (body.comment || "").trim();
    const rating = Math.max(1, Math.min(5, Math.round(Number(body.rating) || 5)));
    const isVerified = body.isVerified !== undefined ? Boolean(body.isVerified) : true;

    if (!productId || !authorName || !comment) {
      return NextResponse.json(
        { error: "Le produit, le nom et le commentaire sont obligatoires." },
        { status: 400 }
      );
    }

    const payload = {
      product_id: String(productId),
      product_handle: String(productHandle),
      author_name: authorName,
      author_role: authorRole,
      rating,
      comment,
      is_verified: isVerified,
    };

    const { data, error } = await supabase
      .from("product_reviews")
      .insert([payload])
      .select()
      .single();

    if (error) {
      console.error("POST /api/reviews insert error:", error);
      return NextResponse.json(
        { error: "Erreur lors de l'enregistrement de l'avis dans la base." },
        { status: 500 }
      );
    }

    // Live cache invalidation
    try {
      revalidatePath("/product/[handle]", "page");
      if (productHandle) {
        revalidatePath(`/product/${productHandle}`);
      }
      revalidatePath(ADMIN_REVIEWS_PATH);
      revalidatePath(ADMIN_PRODUCTS_PATH);
      revalidatePath("/");
      revalidatePath("/", "layout");
    } catch (e) {
      console.warn("revalidatePath warning:", e);
    }

    return NextResponse.json({
      success: true,
      review: data,
    });
  } catch (error) {
    console.error("POST /api/reviews error:", error);
    return NextResponse.json(
      { error: "Erreur serveur lors de la publication de l'avis." },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Identifiant manquant." }, { status: 400 });
    }

    const { error } = await supabase.from("product_reviews").delete().eq("id", id);

    if (error) {
      console.error("DELETE /api/reviews error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    try {
      revalidatePath("/product/[handle]", "page");
      revalidatePath(ADMIN_REVIEWS_PATH);
      revalidatePath(ADMIN_PRODUCTS_PATH);
      revalidatePath("/");
      revalidatePath("/", "layout");
    } catch {}

    return NextResponse.json({ success: true, id });
  } catch (error) {
    console.error("DELETE /api/reviews error:", error);
    return NextResponse.json({ error: "Erreur lors de la suppression." }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, is_verified } = body;

    if (!id) {
      return NextResponse.json({ error: "Identifiant manquant." }, { status: 400 });
    }

    const { data, error } = await supabase
      .from("product_reviews")
      .update({ is_verified: Boolean(is_verified) })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    try {
      revalidatePath("/product/[handle]", "page");
      revalidatePath(ADMIN_REVIEWS_PATH);
    } catch {}

    return NextResponse.json({ success: true, review: data });
  } catch (error) {
    return NextResponse.json({ error: "Erreur serveur." }, { status: 500 });
  }
}
