import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { createClient } from "@supabase/supabase-js";
import { getReviewImages } from "@/lib/reviews-service";
import { ADMIN_PRODUCTS_PATH, ADMIN_REVIEWS_PATH } from "@/lib/admin-config";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const REVIEW_IMAGES_BUCKET = "review-images";
const ALLOWED_IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);
const MAX_UPLOAD_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB safety limit per compressed file
const MAX_REVIEW_IMAGES = 3;

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

async function uploadReviewImage(
  supabase: ReturnType<typeof getSupabaseAdmin>,
  file: File,
  productHandle: string,
  index: number
): Promise<{ url?: string; error?: string }> {
  if (!ALLOWED_IMAGE_TYPES.has(file.type)) {
    return { error: "Format d'image non supporté (JPG, PNG ou WebP uniquement)." };
  }

  if (file.size > MAX_UPLOAD_SIZE_BYTES) {
    return { error: "Une image compressée dépasse la limite autorisée (5 Mo)." };
  }

  const ext = file.type === "image/webp" ? "webp" : file.type === "image/png" ? "png" : "jpg";
  const safeHandle = productHandle.replace(/[^a-zA-Z0-9_-]/g, "_").slice(0, 40) || "product";
  const storagePath = `${safeHandle}/${Date.now()}-${index}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
  const buffer = Buffer.from(await file.arrayBuffer());

  let uploadResult = await supabase.storage
    .from(REVIEW_IMAGES_BUCKET)
    .upload(storagePath, buffer, {
      contentType: file.type,
      cacheControl: "31536000",
      upsert: false,
    });

  if (
    uploadResult.error &&
    /bucket/i.test(uploadResult.error.message) &&
    process.env.SUPABASE_SERVICE_ROLE_KEY
  ) {
    await supabase.storage.createBucket(REVIEW_IMAGES_BUCKET, {
      public: true,
      fileSizeLimit: MAX_UPLOAD_SIZE_BYTES,
      allowedMimeTypes: ["image/jpeg", "image/png", "image/webp"],
    });

    uploadResult = await supabase.storage
      .from(REVIEW_IMAGES_BUCKET)
      .upload(storagePath, buffer, {
        contentType: file.type,
        cacheControl: "31536000",
        upsert: false,
      });
  }

  if (uploadResult.error) {
    console.error("Review image upload error:", uploadResult.error.message);
    return { error: "Impossible de téléverser la photo de l'avis dans Supabase Storage." };
  }

  const { data: publicUrlData } = supabase.storage
    .from(REVIEW_IMAGES_BUCKET)
    .getPublicUrl(storagePath);

  return { url: publicUrlData.publicUrl };
}

function normalizeUrlList(rawUrls: unknown, singleUrl?: unknown): string[] {
  const result: string[] = [];
  if (Array.isArray(rawUrls)) {
    for (const item of rawUrls) {
      if (typeof item === "string" && item.trim() && !result.includes(item.trim())) {
        result.push(item.trim());
      }
    }
  }
  if (typeof singleUrl === "string" && singleUrl.trim() && !result.includes(singleUrl.trim())) {
    result.push(singleUrl.trim());
  }
  return result.slice(0, MAX_REVIEW_IMAGES);
}

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
