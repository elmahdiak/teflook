import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { calculateRatingSummary, getReviewImages } from "@/lib/reviews-service";
import {
  getSupabaseAdmin,
  MAX_REVIEW_IMAGES,
  normalizeUrlList,
  uploadReviewImage,
  verifyReviewToken,
} from "@/lib/review-server";
import { ADMIN_PRODUCTS_PATH, ADMIN_REVIEWS_PATH } from "@/lib/admin-config";

export const dynamic = "force-dynamic";
export const revalidate = 0;

async function handleUpdateReview(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    if (!id) {
      return NextResponse.json({ error: "Identifiant d'avis manquant." }, { status: 400 });
    }

    const supabase = getSupabaseAdmin();
    const contentType = req.headers.get("content-type") || "";
    const headerToken = req.headers.get("x-review-token");

    let editToken = headerToken || "";
    let authorName = "";
    let authorRole = "";
    let comment = "";
    let rating = 5;
    let existingImageUrls: string[] = [];
    let newImageFiles: File[] = [];

    if (contentType.includes("multipart/form-data")) {
      const formData = await req.formData();
      editToken = String(formData.get("editToken") || headerToken || "").trim();
      authorName = String(formData.get("authorName") || formData.get("author_name") || "").trim();
      authorRole = String(formData.get("authorRole") || formData.get("author_role") || "").trim();
      comment = String(formData.get("comment") || "").trim();
      rating = Math.max(1, Math.min(5, Math.round(Number(formData.get("rating")) || 5)));

      const existingRaw = formData.get("existingImageUrls");
      if (typeof existingRaw === "string" && existingRaw.trim()) {
        try {
          existingImageUrls = normalizeUrlList(JSON.parse(existingRaw));
        } catch {
          existingImageUrls = normalizeUrlList(formData.getAll("existingImageUrls"));
        }
      } else {
        existingImageUrls = normalizeUrlList(formData.getAll("existingImageUrls"));
      }

      const rawFiles = [...formData.getAll("images"), ...formData.getAll("image")];
      newImageFiles = rawFiles.filter(
        (entry): entry is File => entry instanceof File && entry.size > 0
      );
    } else {
      const body = await req.json();
      editToken = String(body.editToken || headerToken || "").trim();
      authorName = String(body.authorName || body.author_name || "").trim();
      authorRole = String(body.authorRole || body.author_role || "").trim();
      comment = String(body.comment || "").trim();
      rating = Math.max(1, Math.min(5, Math.round(Number(body.rating) || 5)));
      existingImageUrls = normalizeUrlList(
        body.existingImageUrls ?? body.imageUrls ?? body.image_urls,
        body.imageUrl ?? body.image_url
      );
    }

    if (!verifyReviewToken(id, editToken)) {
      return NextResponse.json(
        { error: "Vous n'êtes pas autorisé à modifier cet avis." },
        { status: 403 }
      );
    }

    if (!authorName || !comment) {
      return NextResponse.json(
        { error: "Le nom et le commentaire sont obligatoires." },
        { status: 400 }
      );
    }

    if (existingImageUrls.length + newImageFiles.length > MAX_REVIEW_IMAGES) {
      return NextResponse.json(
        { error: `Maximum ${MAX_REVIEW_IMAGES} photos par avis.` },
        { status: 400 }
      );
    }

    const { data: existingReview, error: fetchError } = await supabase
      .from("product_reviews")
      .select("id, product_id, product_handle, author_role")
      .eq("id", id)
      .maybeSingle();

    if (fetchError || !existingReview) {
      return NextResponse.json({ error: "Avis introuvable." }, { status: 404 });
    }

    let uploadedUrls: string[] = [];
    if (newImageFiles.length > 0) {
      const uploaded = await Promise.all(
        newImageFiles.map((file, idx) =>
          uploadReviewImage(
            supabase,
            file,
            existingReview.product_handle || existingReview.product_id || "product",
            idx
          )
        )
      );
      const failed = uploaded.find((res) => res.error);
      if (failed?.error) {
        return NextResponse.json({ error: failed.error }, { status: 500 });
      }
      uploadedUrls = uploaded.map((res) => res.url).filter((u): u is string => Boolean(u));
    }

    const mergedUrls = [...existingImageUrls, ...uploadedUrls].slice(0, MAX_REVIEW_IMAGES);

    const updatePayload: Record<string, unknown> = {
      author_name: authorName,
      author_role: authorRole || existingReview.author_role || "Parent",
      rating,
      comment,
      image_urls: mergedUrls,
      image_url: mergedUrls[0] ?? null,
    };

    const { data: updatedReview, error: updateError } = await supabase
      .from("product_reviews")
      .update(updatePayload)
      .eq("id", id)
      .select()
      .single();

    if (updateError || !updatedReview) {
      console.error("PATCH /api/reviews/[id] update error:", updateError?.message);
      return NextResponse.json(
        { error: "Erreur lors de la mise à jour de l'avis." },
        { status: 500 }
      );
    }

    // Recalculate updated product average rating & summary
    let summaryQuery = supabase.from("product_reviews").select("*");
    if (existingReview.product_id && existingReview.product_handle) {
      summaryQuery = summaryQuery.or(
        `product_id.eq.${existingReview.product_id},product_handle.eq.${existingReview.product_handle}`
      );
    } else if (existingReview.product_id) {
      summaryQuery = summaryQuery.eq("product_id", existingReview.product_id);
    } else if (existingReview.product_handle) {
      summaryQuery = summaryQuery.eq("product_handle", existingReview.product_handle);
    }

    const { data: allProductReviews } = await summaryQuery;
    const summary = calculateRatingSummary(Array.isArray(allProductReviews) ? allProductReviews : []);

    try {
      revalidatePath("/product/[handle]", "page");
      if (existingReview.product_handle) {
        revalidatePath(`/product/${existingReview.product_handle}`);
      }
      revalidatePath(ADMIN_REVIEWS_PATH);
      revalidatePath(ADMIN_PRODUCTS_PATH);
      revalidatePath("/");
      revalidatePath("/", "layout");
    } catch {}

    return NextResponse.json({
      success: true,
      review: {
        ...updatedReview,
        image_urls: getReviewImages(updatedReview),
      },
      summary,
    });
  } catch (error) {
    console.error("PATCH /api/reviews/[id] error:", error);
    return NextResponse.json(
      { error: "Erreur serveur lors de la modification de l'avis." },
      { status: 500 }
    );
  }
}

export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  return handleUpdateReview(req, context);
}

export async function PUT(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  return handleUpdateReview(req, context);
}
