import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getReviewImages } from "@/lib/reviews-service";
import {
  getSupabaseAdmin,
  MAX_REVIEW_IMAGES,
  normalizeUrlList,
  signReviewToken,
  uploadReviewImage,
} from "@/lib/review-server";
import { ADMIN_PRODUCTS_PATH, ADMIN_REVIEWS_PATH } from "@/lib/admin-config";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(req: NextRequest) {
  try {
    const supabase = getSupabaseAdmin();
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

    const normalized = (data || []).map((row) => ({
      ...row,
      image_urls: getReviewImages(row),
    }));

    return NextResponse.json(normalized);
  } catch (error) {
    console.error("GET /api/reviews error:", error);
    return NextResponse.json([]);
  }
}

export async function POST(req: NextRequest) {
  try {
    const supabase = getSupabaseAdmin();
    const contentType = req.headers.get("content-type") || "";

    let productId = "";
    let productHandle = "";
    let authorName = "";
    let authorRole = "Parent";
    let comment = "";
    let rating = 5;
    let isVerified = true;
    let imageUrls: string[] = [];
    let imageFiles: File[] = [];

    if (contentType.includes("multipart/form-data")) {
      const formData = await req.formData();
      productId = String(formData.get("productId") || formData.get("product_id") || "").trim();
      productHandle =
        String(formData.get("productHandle") || formData.get("product_handle") || "").trim() ||
        productId;
      authorName = String(formData.get("authorName") || formData.get("author_name") || "").trim();
      authorRole =
        String(formData.get("authorRole") || formData.get("author_role") || "").trim() || "Parent";
      comment = String(formData.get("comment") || "").trim();
      rating = Math.max(1, Math.min(5, Math.round(Number(formData.get("rating")) || 5)));
      const verifiedRaw = formData.get("isVerified");
      isVerified = verifiedRaw !== null ? verifiedRaw !== "false" : true;

      const rawFiles = [...formData.getAll("images"), ...formData.getAll("image")];
      imageFiles = rawFiles.filter(
        (entry): entry is File => entry instanceof File && entry.size > 0
      );

      if (imageFiles.length > MAX_REVIEW_IMAGES) {
        return NextResponse.json(
          { error: `Maximum ${MAX_REVIEW_IMAGES} photos par avis.` },
          { status: 400 }
        );
      }

      const existingUrl = formData.get("imageUrl");
      imageUrls = normalizeUrlList(formData.getAll("imageUrls"), existingUrl);
    } else {
      const body = await req.json();
      productId = String(body.productId || body.product_id || "").trim();
      productHandle =
        String(body.productHandle || body.product_handle || "").trim() || productId;
      authorName = String(body.authorName || body.author_name || "").trim();
      authorRole = String(body.authorRole || body.author_role || "").trim() || "Parent";
      comment = String(body.comment || "").trim();
      rating = Math.max(1, Math.min(5, Math.round(Number(body.rating) || 5)));
      isVerified = body.isVerified !== undefined ? Boolean(body.isVerified) : true;
      imageUrls = normalizeUrlList(
        body.imageUrls ?? body.image_urls,
        body.imageUrl ?? body.image_url
      );
    }

    if (!productId || !authorName || !comment) {
      return NextResponse.json(
        { error: "Le produit, le nom et le commentaire sont obligatoires." },
        { status: 400 }
      );
    }

    if (imageFiles.length > 0) {
      const uploaded = await Promise.all(
        imageFiles.map((file, idx) =>
          uploadReviewImage(supabase, file, productHandle || productId, idx)
        )
      );
      const failed = uploaded.find((res) => res.error);
      if (failed?.error) {
        return NextResponse.json({ error: failed.error }, { status: 500 });
      }
      const uploadedUrls = uploaded
        .map((res) => res.url)
        .filter((u): u is string => Boolean(u));
      imageUrls = [...imageUrls, ...uploadedUrls].slice(0, MAX_REVIEW_IMAGES);
    }

    const payload: Record<string, unknown> = {
      product_id: productId,
      product_handle: productHandle,
      author_name: authorName,
      author_role: authorRole,
      rating,
      comment,
      is_verified: isVerified,
    };

    if (imageUrls.length > 0) {
      payload.image_urls = imageUrls;
      payload.image_url = imageUrls[0];
    }

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

    const editToken = signReviewToken(data.id);

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
      editToken,
      review: {
        ...data,
        image_urls: getReviewImages(data),
      },
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
    const supabase = getSupabaseAdmin();
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
    const supabase = getSupabaseAdmin();
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
  } catch {
    return NextResponse.json({ error: "Erreur serveur." }, { status: 500 });
  }
}
