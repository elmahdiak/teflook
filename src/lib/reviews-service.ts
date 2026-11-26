export interface ProductReview {
  id: string;
  product_id: string;
  product_handle?: string;
  author_name: string;
  author_role?: string;
  rating: number; // 1 to 5
  comment: string;
  image_url?: string | null;
  image_urls?: string[] | null;
  is_verified?: boolean;
  created_at: string;
}

const REVIEW_TOKENS_STORAGE_KEY = "teflook_review_tokens";
export const REVIEW_EDIT_WINDOW_MS = 30_000; // 30 seconds

export interface StoredReviewOwnership {
  token: string;
  createdAt: number;
}

export function getStoredReviewTokens(): Record<string, StoredReviewOwnership> {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(REVIEW_TOKENS_STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
      const normalized: Record<string, StoredReviewOwnership> = {};
      for (const [id, val] of Object.entries(parsed)) {
        if (typeof val === "string" && val) {
          normalized[id] = { token: val, createdAt: 0 };
        } else if (
          val &&
          typeof val === "object" &&
          typeof (val as StoredReviewOwnership).token === "string"
        ) {
          normalized[id] = {
            token: (val as StoredReviewOwnership).token,
            createdAt: Number((val as StoredReviewOwnership).createdAt) || 0,
          };
        }
      }
      return normalized;
    }
  } catch {}
  return {};
}

export function saveReviewToken(
  reviewId: string,
  token: string,
  createdAtMs?: number
): StoredReviewOwnership | null {
  if (typeof window === "undefined" || !reviewId || !token) return null;
  const entry: StoredReviewOwnership = {
    token,
    createdAt:
      typeof createdAtMs === "number" && Number.isFinite(createdAtMs) && createdAtMs > 0
        ? createdAtMs
        : Date.now(),
  };
  try {
    const existing = getStoredReviewTokens();
    const updated = { ...existing, [reviewId]: entry };
    window.localStorage.setItem(REVIEW_TOKENS_STORAGE_KEY, JSON.stringify(updated));
  } catch {}
  return entry;
}

export function getRemainingEditMs(
  reviewCreatedAt: string | undefined,
  storedCreatedAt: number | undefined,
  nowMs: number
): number {
  if (!nowMs || nowMs <= 0) return 0;

  const candidates: number[] = [];
  if (typeof storedCreatedAt === "number" && storedCreatedAt > 0) {
    candidates.push(REVIEW_EDIT_WINDOW_MS - (nowMs - storedCreatedAt));
  }
  if (reviewCreatedAt) {
    const serverMs = new Date(reviewCreatedAt).getTime();
    if (Number.isFinite(serverMs) && serverMs > 0) {
      candidates.push(REVIEW_EDIT_WINDOW_MS - (nowMs - serverMs));
    }
  }

  if (candidates.length === 0) return 0;
  return Math.max(0, Math.min(...candidates));
}

export function formatEditCountdown(remainingMs: number): string {
  const totalSeconds = Math.max(0, Math.ceil(remainingMs / 1000));
  const mins = String(Math.floor(totalSeconds / 60)).padStart(2, "0");
  const secs = String(totalSeconds % 60).padStart(2, "0");
  return `${mins}:${secs}`;
}

export function formatReviewDate(
  createdAt: string | undefined,
  locale: "fr" | "ar" | string
): string | null {
  if (!createdAt) return null;
  const date = new Date(createdAt);
  if (Number.isNaN(date.getTime())) return null;

  const intlLocale = locale === "ar" ? "ar-MA" : "fr-FR";
  return new Intl.DateTimeFormat(intlLocale, {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
}

export function getReviewImages(
  review: Pick<ProductReview, "image_url" | "image_urls">
): string[] {
  const collected: string[] = [];
  if (Array.isArray(review.image_urls)) {
    for (const url of review.image_urls) {
      if (typeof url === "string" && url.trim() && !collected.includes(url.trim())) {
        collected.push(url.trim());
      }
    }
  }
  if (
    typeof review.image_url === "string" &&
    review.image_url.trim() &&
    !collected.includes(review.image_url.trim())
  ) {
    collected.push(review.image_url.trim());
  }
  return collected.slice(0, 3);
}

export interface ProductRatingSummary {
  averageRating: number;
  totalReviews: number;
  starCounts: Record<1 | 2 | 3 | 4 | 5, number>;
  starPercentages: Record<1 | 2 | 3 | 4 | 5, number>;
  recommendPercentage: number;
}

export function calculateRatingSummary(reviews: ProductReview[]): ProductRatingSummary {
  const total = reviews.length;
  const starCounts: Record<1 | 2 | 3 | 4 | 5, number> = {
    1: 0,
    2: 0,
    3: 0,
    4: 0,
    5: 0,
  };

  if (total === 0) {
    return {
      averageRating: 0,
      totalReviews: 0,
      starCounts,
      starPercentages: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
      recommendPercentage: 100,
    };
  }

  let sum = 0;
  let positiveCount = 0;

  reviews.forEach((r) => {
    const star = Math.max(1, Math.min(5, Math.round(r.rating || 5))) as 1 | 2 | 3 | 4 | 5;
    starCounts[star] += 1;
    sum += star;
    if (star >= 4) {
      positiveCount += 1;
    }
  });

  const average = Number((sum / total).toFixed(1));
  const starPercentages: Record<1 | 2 | 3 | 4 | 5, number> = {
    1: Math.round((starCounts[1] / total) * 100),
    2: Math.round((starCounts[2] / total) * 100),
    3: Math.round((starCounts[3] / total) * 100),
    4: Math.round((starCounts[4] / total) * 100),
    5: Math.round((starCounts[5] / total) * 100),
  };

  const recommendPercentage = Math.round((positiveCount / total) * 100);

  return {
    averageRating: average,
    totalReviews: total,
    starCounts,
    starPercentages,
    recommendPercentage,
  };
}

export async function fetchReviewsByProduct(
  productId: string,
  handle?: string
): Promise<ProductReview[]> {
  try {
    const params = new URLSearchParams();
    if (productId) params.set("productId", productId);
    if (handle) params.set("handle", handle);

    const res = await fetch(`/api/reviews?${params.toString()}`, {
      cache: "no-store",
    });

    if (!res.ok) {
      return [];
    }

    const data = await res.json();
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.warn("fetchReviewsByProduct error:", error);
    return [];
  }
}

export async function submitProductReview(payload: {
  productId: string;
  productHandle?: string;
  authorName: string;
  authorRole?: string;
  rating: number;
  comment: string;
  imageFiles?: File[];
  imageFile?: File | null;
  imageUrls?: string[];
  imageUrl?: string;
}): Promise<{
  success: boolean;
  review?: ProductReview;
  editToken?: string;
  error?: string;
}> {
  try {
    let res: Response;
    const filesToSend =
      payload.imageFiles && payload.imageFiles.length > 0
        ? payload.imageFiles.slice(0, 3)
        : payload.imageFile
        ? [payload.imageFile]
        : [];

    if (filesToSend.length > 0) {
      const formData = new FormData();
      formData.append("productId", payload.productId);
      if (payload.productHandle) formData.append("productHandle", payload.productHandle);
      formData.append("authorName", payload.authorName);
      if (payload.authorRole) formData.append("authorRole", payload.authorRole);
      formData.append("rating", String(payload.rating));
      formData.append("comment", payload.comment);
      for (const file of filesToSend) {
        formData.append("images", file);
      }

      res = await fetch("/api/reviews", {
        method: "POST",
        body: formData,
      });
    } else {
      res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
    }

    const data = await res.json();
    if (!res.ok || !data.success) {
      return { success: false, error: data.error || "Impossible d'enregistrer l'avis." };
    }

    if (data.review?.id && typeof data.editToken === "string") {
      const parsedServerMs = data.review.created_at
        ? new Date(data.review.created_at).getTime()
        : NaN;
      saveReviewToken(
        data.review.id,
        data.editToken,
        Number.isFinite(parsedServerMs) && parsedServerMs > 0 ? parsedServerMs : Date.now()
      );
    }

    return { success: true, review: data.review, editToken: data.editToken };
  } catch (error) {
    console.error("submitProductReview error:", error);
    return { success: false, error: "Erreur réseau lors de l'envoi." };
  }
}

export async function updateProductReview(payload: {
  id: string;
  editToken: string;
  authorName: string;
  authorRole?: string;
  rating: number;
  comment: string;
  existingImageUrls?: string[];
  newImageFiles?: File[];
}): Promise<{
  success: boolean;
  review?: ProductReview;
  summary?: ProductRatingSummary;
  error?: string;
}> {
  try {
    const newFiles = (payload.newImageFiles || []).slice(0, 3);
    const existingUrls = (payload.existingImageUrls || []).slice(0, 3);
    const endpoint = `/api/reviews/${encodeURIComponent(payload.id)}`;

    let res: Response;
    if (newFiles.length > 0) {
      const formData = new FormData();
      formData.append("editToken", payload.editToken);
      formData.append("authorName", payload.authorName);
      if (payload.authorRole !== undefined) {
        formData.append("authorRole", payload.authorRole);
      }
      formData.append("rating", String(payload.rating));
      formData.append("comment", payload.comment);
      formData.append("existingImageUrls", JSON.stringify(existingUrls));
      for (const file of newFiles) {
        formData.append("images", file);
      }

      res = await fetch(endpoint, {
        method: "PATCH",
        body: formData,
      });
    } else {
      res = await fetch(endpoint, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          editToken: payload.editToken,
          authorName: payload.authorName,
          authorRole: payload.authorRole,
          rating: payload.rating,
          comment: payload.comment,
          existingImageUrls: existingUrls,
        }),
      });
    }

    const data = await res.json();
    if (!res.ok || !data.success) {
      return {
        success: false,
        error: data.error || "Impossible de modifier cet avis.",
      };
    }

    return {
      success: true,
      review: data.review,
      summary: data.summary,
    };
  } catch (error) {
    console.error("updateProductReview error:", error);
    return { success: false, error: "Erreur réseau lors de la modification." };
  }
}
