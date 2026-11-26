export interface ProductReview {
  id: string;
  product_id: string;
  product_handle?: string;
  author_name: string;
  author_role?: string;
  rating: number; // 1 to 5
  comment: string;
  image_url?: string | null;
  is_verified?: boolean;
  created_at: string;
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
  let positiveCount = 0; // 4 or 5 stars

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
  imageFile?: File | null;
  imageUrl?: string;
}): Promise<{ success: boolean; review?: ProductReview; error?: string }> {
  try {
    let res: Response;

    if (payload.imageFile) {
      const formData = new FormData();
      formData.append("productId", payload.productId);
      if (payload.productHandle) formData.append("productHandle", payload.productHandle);
      formData.append("authorName", payload.authorName);
      if (payload.authorRole) formData.append("authorRole", payload.authorRole);
      formData.append("rating", String(payload.rating));
      formData.append("comment", payload.comment);
      formData.append("image", payload.imageFile);

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

    return { success: true, review: data.review };
  } catch (error) {
    console.error("submitProductReview error:", error);
    return { success: false, error: "Erreur réseau lors de l'envoi." };
  }
}
