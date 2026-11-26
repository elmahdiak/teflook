import crypto from "crypto";
import { createClient } from "@supabase/supabase-js";

export const REVIEW_IMAGES_BUCKET = "review-images";
export const ALLOWED_IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);
export const MAX_UPLOAD_SIZE_BYTES = 5 * 1024 * 1024;
export const MAX_REVIEW_IMAGES = 3;

export function getSupabaseAdmin() {
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

function getReviewTokenSecret(): string {
  return (
    process.env.REVIEW_EDIT_SECRET ||
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.ADMIN_SESSION_SECRET ||
    "teflook-review-ownership-hmac-key"
  );
}

export function signReviewToken(reviewId: string): string {
  const nonce = crypto.randomBytes(12).toString("hex");
  const signature = crypto
    .createHmac("sha256", getReviewTokenSecret())
    .update(`${reviewId}:${nonce}`)
    .digest("hex");
  return `${nonce}.${signature}`;
}

export function verifyReviewToken(
  reviewId: string,
  token: string | null | undefined
): boolean {
  if (!reviewId || !token || typeof token !== "string") return false;
  const parts = token.split(".");
  if (parts.length !== 2) return false;
  const [nonce, providedSig] = parts;
  if (!nonce || !providedSig) return false;

  const expectedSig = crypto
    .createHmac("sha256", getReviewTokenSecret())
    .update(`${reviewId}:${nonce}`)
    .digest("hex");

  const providedBuf = Buffer.from(providedSig, "utf8");
  const expectedBuf = Buffer.from(expectedSig, "utf8");
  if (providedBuf.length !== expectedBuf.length) return false;

  return crypto.timingSafeEqual(providedBuf, expectedBuf);
}

export function normalizeUrlList(rawUrls: unknown, singleUrl?: unknown): string[] {
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

export async function uploadReviewImage(
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
