import { PRODUCTS, CATEGORIES, REVIEWS } from "@/data/teflookData";
import { supabase } from "@/lib/supabase";

export interface CODOrderItem {
  productId: string;
  title: string;
  variantTitle?: string;
  price: number;
  quantity: number;
  imageUrl?: string;
}

export type OrderStatus = "pending" | "confirmed" | "shipped" | "delivered" | "cancelled";

export interface CODOrderCustomFieldEntry {
  key: string;
  labelFr: string;
  labelAr: string;
  value: string;
}

export interface CODOrder {
  id: string;
  createdAt: string;
  customerName: string;
  customerPhone: string;
  customerCity: string;
  customerAddress: string;
  notes?: string;
  customFields?: Record<string, string | boolean>;
  customFieldsSummary?: CODOrderCustomFieldEntry[];
  items: CODOrderItem[];
  totalMad: number;
  status: OrderStatus;
  paymentMethod: "COD";
}

export const MAX_PRODUCT_IMAGES = 6;

export const PRODUCT_AGE_BRACKETS = [
  "5 - 6 ans",
  "7 - 10 ans",
  "11 - 12 ans",
  "13 - 15 ans",
  "Tous âges",
] as const;

export type ProductAgeBracketOption = (typeof PRODUCT_AGE_BRACKETS)[number];

/**
 * Normalizes product age range fields (`age_ranges`, `ageRanges`, `age_bracket`,
 * `ageBracket`, `age_range`, `ageRange`, `ageGroup`) into a clean deduplicated array.
 */
export function normalizeProductAgeRanges(
  input:
    | {
        age_ranges?: unknown;
        ageRanges?: unknown;
        age_bracket?: unknown;
        ageBracket?: unknown;
        age_range?: unknown;
        ageRange?: unknown;
        age_group?: unknown;
        ageGroup?: unknown;
      }
    | null
    | undefined
): string[] {
  if (!input || typeof input !== "object") return [];

  const collected: string[] = [];
  const pushAge = (raw: unknown) => {
    if (typeof raw !== "string") return;
    for (const part of raw.split(/[•,]/)) {
      const trimmed = part.trim();
      if (!trimmed || collected.includes(trimmed)) continue;
      collected.push(trimmed);
    }
  };

  const rawArray = input.age_ranges ?? input.ageRanges;
  if (Array.isArray(rawArray)) {
    for (const entry of rawArray) {
      pushAge(entry);
    }
  } else if (typeof rawArray === "string") {
    const rawStr = rawArray.trim();
    if (rawStr.startsWith("[")) {
      try {
        const parsed = JSON.parse(rawStr);
        if (Array.isArray(parsed)) {
          for (const entry of parsed) pushAge(entry);
        }
      } catch {
        pushAge(rawStr);
      }
    } else {
      pushAge(rawStr);
    }
  }

  if (collected.length === 0) {
    pushAge(input.age_bracket ?? input.ageBracket);
    pushAge(input.age_group ?? input.ageGroup);
    if (collected.length === 0) {
      pushAge(input.age_range ?? input.ageRange);
    }
  }

  return collected;
}

export function formatAgeBracketLabel(
  bracket: string,
  locale: "fr" | "ar" | string
): string {
  const trimmed = bracket.trim();
  if (locale !== "ar") return trimmed;

  const arMap: Record<string, string> = {
    "5 - 6 ans": "5 - 6 سنوات",
    "7 - 10 ans": "7 - 10 سنوات",
    "11 - 12 ans": "11 - 12 سنة",
    "13 - 15 ans": "13 - 15 سنة",
    "Tous âges": "جميع الأعمار",
    "Tous ages": "جميع الأعمار",
  };
  return arMap[trimmed] || trimmed;
}

export function matchesProductAgeFilter(
  product:
    | {
        age_ranges?: unknown;
        ageRanges?: unknown;
        age_bracket?: unknown;
        ageBracket?: unknown;
        age_range?: unknown;
        ageRange?: unknown;
        age_group?: unknown;
        ageGroup?: unknown;
      }
    | null
    | undefined,
  selectedAge: string
): boolean {
  if (!selectedAge || selectedAge === "all") return true;
  const ranges = normalizeProductAgeRanges(product);
  if (ranges.length === 0) return false;

  const normalizedSelected = selectedAge.trim().toLowerCase();
  return ranges.some((r) => {
    const lower = r.trim().toLowerCase();
    return (
      lower === normalizedSelected ||
      lower === "tous âges" ||
      lower === "tous ages"
    );
  });
}

/**
 * Normalizes product image fields (`images` array, `image_url`, `imageUrl`, `image`)
 * into a clean, deduplicated array of image URLs capped at `maxCount`.
 */
export function normalizeProductImages(
  input:
    | {
        images?: unknown;
        image_url?: unknown;
        imageUrl?: unknown;
        image?: unknown;
      }
    | null
    | undefined,
  maxCount = MAX_PRODUCT_IMAGES
): string[] {
  if (!input || typeof input !== "object") return [];

  const collected: string[] = [];
  const pushUrl = (raw: unknown) => {
    if (typeof raw !== "string") return;
    const trimmed = raw.trim();
    if (!trimmed || collected.includes(trimmed)) return;
    collected.push(trimmed);
  };

  if (Array.isArray(input.images)) {
    for (const entry of input.images) {
      if (typeof entry === "string") {
        pushUrl(entry);
      } else if (entry && typeof entry === "object") {
        const maybeObj = entry as { url?: unknown; node?: { url?: unknown } };
        pushUrl(maybeObj.url ?? maybeObj.node?.url);
      }
    }
  } else if (typeof input.images === "string") {
    const rawStr = input.images.trim();
    if (rawStr.startsWith("[")) {
      try {
        const parsed = JSON.parse(rawStr);
        if (Array.isArray(parsed)) {
          for (const entry of parsed) pushUrl(entry);
        }
      } catch {
        pushUrl(rawStr);
      }
    } else {
      pushUrl(rawStr);
    }
  }

  pushUrl(input.image_url);
  pushUrl(input.imageUrl);
  pushUrl(input.image);

  return collected.slice(0, maxCount);
}

export interface AdminProduct {
  id: string;
  title: string;
  handle: string;
  categorySlug: string;
  categoryName: string;
  priceMad: number;
  oldPriceMad?: number;
  inStock: boolean;
  ageBracket: string;
  ageRanges?: string[];
  age_ranges?: string[];
  ageRange?: string;
  ageGroup?: string;
  createdAt?: string;
  skills?: string[];
  sku?: string;
  reference?: string;
  images: string[];
  image?: string;
  image_url?: string;
  description: string;
  material?: string;
  origin?: string;
  rating?: number;
  reviewsCount?: number;
  features?: string[];
  title_ar?: string;
  description_ar?: string;
  categoryName_ar?: string;
}

export interface AdminCategory {
  id: string;
  slug: string;
  name: string;
  subtitle: string;
  imageUrl: string;
  itemCount: number;
}

export interface AdminReview {
  id: string;
  authorName: string;
  city: string;
  rating: number;
  comment: string;
  productName: string;
  productImage: string;
  date: string;
  isVerifiedBuyer: boolean;
  status: "approved" | "pending";
}

// Storage Keys
const PRODUCTS_STORAGE_KEY = "teflook_admin_products_v2";
const CATEGORIES_STORAGE_KEY = "teflook_admin_categories_v2";
const REVIEWS_STORAGE_KEY = "teflook_admin_reviews_v2";

/* ========================================================================= */
/* CLOUD COD ORDERS (SUPABASE `orders` TABLE)                                */
/* ========================================================================= */

export function isMissingOrderColumnError(
  err: { code?: string; message?: string } | null | undefined
): boolean {
  if (!err) return false;
  const code = (err.code || "").toUpperCase();
  const msg = (err.message || "").toLowerCase();
  return (
    code === "PGRST204" ||
    code === "42703" ||
    (msg.includes("custom_fields") &&
      (msg.includes("column") || msg.includes("schema cache")))
  );
}

export function mapRowToCODOrder(row: Record<string, any>): CODOrder {
  return {
    id: String(row.id),
    createdAt: row.created_at || row.createdAt || new Date().toISOString(),
    customerName: row.customer_name || row.customerName || "",
    customerPhone: row.customer_phone || row.customerPhone || "",
    customerCity: row.customer_city || row.customerCity || "",
    customerAddress: row.customer_address || row.customerAddress || "",
    notes: row.notes || undefined,
    customFields:
      row.custom_fields && typeof row.custom_fields === "object"
        ? row.custom_fields
        : undefined,
    customFieldsSummary: Array.isArray(row.custom_fields_summary)
      ? row.custom_fields_summary
      : undefined,
    items: Array.isArray(row.items) ? row.items : [],
    totalMad: Number(row.total_mad ?? row.total_price ?? row.totalMad ?? 0) || 0,
    status: (row.status || "pending") as OrderStatus,
    paymentMethod: "COD",
  };
}

export async function fetchSyncedCODOrders(): Promise<CODOrder[]> {
  if (typeof window !== "undefined") {
    try {
      const res = await fetch("/api/orders", { cache: "no-store" });
      if (res.ok) {
        const serverOrders = await res.json();
        if (Array.isArray(serverOrders)) {
          return serverOrders.sort(
            (a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt)
          );
        }
      }
    } catch {}
  }

  const { data, error } = await supabase
    .from("orders")
    .select("*")
    .order("created_at", { ascending: false });

  if (error || !Array.isArray(data)) {
    return [];
  }

  return data.map(mapRowToCODOrder);
}

export async function updateCODOrderStatus(
  orderId: string,
  newStatus: OrderStatus
): Promise<boolean> {
  if (typeof window !== "undefined") {
    try {
      const res = await fetch("/api/orders", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: orderId, status: newStatus }),
      });
      if (res.ok) return true;
    } catch {}
  }

  const { error } = await supabase
    .from("orders")
    .update({ status: newStatus })
    .eq("id", orderId);

  return !error;
}

export async function deleteCODOrder(orderId: string): Promise<boolean> {
  if (typeof window !== "undefined") {
    try {
      const res = await fetch(`/api/orders?id=${encodeURIComponent(orderId)}`, {
        method: "DELETE",
      });
      if (res.ok) return true;
    } catch {}
  }

  const { error } = await supabase.from("orders").delete().eq("id", orderId);
  return !error;
}

/* ========================================================================= */
/* PRODUCTS MANAGEMENT                                                       */
/* ========================================================================= */

const SEEDED_PRODUCTS: AdminProduct[] = PRODUCTS.map((p) => ({
  id: p.id,
  title: p.name,
  handle: p.id,
  categorySlug: p.categorySlug,
  categoryName: p.categoryName,
  priceMad: p.priceMad,
  oldPriceMad: p.oldPriceMad,
  inStock: p.inStock,
  ageBracket: p.ageBracket,
  ageRanges: [p.ageBracket],
  images: p.images,
  description: p.description,
  material: p.material,
  origin: p.origin,
}));

export function getAdminProducts(): AdminProduct[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(PRODUCTS_STORAGE_KEY);
    if (!raw) {
      return [];
    }
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.map((item) => {
      const normalizedAgeRanges = normalizeProductAgeRanges(item);
      const ageRanges =
        normalizedAgeRanges.length > 0
          ? normalizedAgeRanges
          : [item.ageBracket || "7 - 10 ans"];
      return {
        ...item,
        images: normalizeProductImages(item),
        ageRanges,
        ageBracket: ageRanges[0] || item.ageBracket || "7 - 10 ans",
      };
    });
  } catch {
    return [];
  }
}

function notifyProductSync() {
  if (typeof window !== "undefined") {
    try {
      window.dispatchEvent(new CustomEvent("teflook:products-updated"));
      if (typeof BroadcastChannel !== "undefined") {
        const channel = new BroadcastChannel("teflook_sync");
        channel.postMessage({ type: "products_updated", timestamp: Date.now() });
        channel.close();
      }
    } catch (e) {
      console.warn("notifyProductSync error:", e);
    }
  }
}

export function saveAdminProduct(product: Omit<AdminProduct, "id" | "handle"> & { id?: string }): AdminProduct {
  const current = getAdminProducts();
  const id = product.id || `prod-custom-${Date.now()}`;
  const handle = id;
  const normalizedImages = normalizeProductImages(product);
  const primaryImage = normalizedImages[0] || "";
  const normalizedAges = normalizeProductAgeRanges(product);
  const ageRanges = normalizedAges.length > 0 ? normalizedAges : ["7 - 10 ans"];
  const primaryAge = ageRanges[0] || "7 - 10 ans";

  const newProduct: AdminProduct = {
    ...product,
    id,
    handle,
    ageRanges,
    age_ranges: ageRanges,
    ageBracket: primaryAge,
    ageGroup: primaryAge,
    ageRange: product.ageRange || ageRanges.join(", "),
    images: normalizedImages,
    image: primaryImage || undefined,
    image_url: primaryImage || undefined,
  };

  const existingIndex = current.findIndex((p) => p.id === id);
  let updated: AdminProduct[];
  if (existingIndex >= 0) {
    current[existingIndex] = newProduct;
    updated = [...current];
  } else {
    updated = [newProduct, ...current];
  }

  if (typeof window !== "undefined") {
    localStorage.setItem(PRODUCTS_STORAGE_KEY, JSON.stringify(updated));
    // Asynchronously sync with Next.js backend store
    fetch("/api/products", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newProduct),
    }).catch((err) => console.warn("API product sync failed:", err));

    notifyProductSync();
  }
  return newProduct;
}

export function deleteAdminProduct(productId: string): boolean {
  const current = getAdminProducts();
  const filtered = current.filter((p) => p.id !== productId);

  if (typeof window !== "undefined") {
    localStorage.setItem(PRODUCTS_STORAGE_KEY, JSON.stringify(filtered));
    fetch(`/api/products?id=${encodeURIComponent(productId)}`, {
      method: "DELETE",
    }).catch((err) => console.warn("API product delete sync failed:", err));

    notifyProductSync();
  }
  return true;
}

export function clearAllAdminProducts(): boolean {
  if (typeof window !== "undefined") {
    localStorage.setItem(PRODUCTS_STORAGE_KEY, JSON.stringify([]));
    fetch("/api/products?all=true", {
      method: "DELETE",
    }).catch((err) => console.warn("API clear all sync failed:", err));

    notifyProductSync();
  }
  return true;
}

export function resetAllAdminProducts(): AdminProduct[] {
  if (typeof window !== "undefined") {
    localStorage.setItem(PRODUCTS_STORAGE_KEY, JSON.stringify(SEEDED_PRODUCTS));
    fetch("/api/products?reset=true", {
      method: "DELETE",
    }).catch((err) => console.warn("API reset sync failed:", err));

    notifyProductSync();
  }
  return SEEDED_PRODUCTS;
}

/* ========================================================================= */
/* CATEGORIES MANAGEMENT                                                     */
/* ========================================================================= */

const SEEDED_CATEGORIES: AdminCategory[] = CATEGORIES.map((c) => ({
  id: c.id,
  slug: c.slug,
  name: c.name,
  subtitle: c.subtitle,
  imageUrl: c.imageUrl,
  itemCount: c.itemCount,
}));

export function getAdminCategories(): AdminCategory[] {
  if (typeof window === "undefined") return SEEDED_CATEGORIES;
  try {
    const raw = localStorage.getItem(CATEGORIES_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(CATEGORIES_STORAGE_KEY, JSON.stringify(SEEDED_CATEGORIES));
      return SEEDED_CATEGORIES;
    }
    return JSON.parse(raw);
  } catch {
    return SEEDED_CATEGORIES;
  }
}

export function saveAdminCategory(cat: Omit<AdminCategory, "id"> & { id?: string }): AdminCategory {
  const current = getAdminCategories();
  const id = cat.id || `cat-${Date.now()}`;
  const newCat: AdminCategory = { ...cat, id };

  const existingIndex = current.findIndex((c) => c.id === id);
  let updated: AdminCategory[];
  if (existingIndex >= 0) {
    current[existingIndex] = newCat;
    updated = [...current];
  } else {
    updated = [...current, newCat];
  }

  if (typeof window !== "undefined") {
    localStorage.setItem(CATEGORIES_STORAGE_KEY, JSON.stringify(updated));
  }
  return newCat;
}

export function deleteAdminCategory(categoryId: string): boolean {
  const current = getAdminCategories();
  const filtered = current.filter((c) => c.id !== categoryId);
  if (filtered.length === current.length) return false;

  if (typeof window !== "undefined") {
    localStorage.setItem(CATEGORIES_STORAGE_KEY, JSON.stringify(filtered));
  }
  return true;
}

/* ========================================================================= */
/* REVIEWS & VERIFIED BUYER WATERMARK MANAGEMENT                             */
/* ========================================================================= */

const SEEDED_REVIEWS: AdminReview[] = REVIEWS.map((r) => ({
  id: r.id,
  authorName: r.authorName,
  city: r.city,
  rating: r.rating,
  comment: r.comment,
  productName: r.productName,
  productImage: r.productImage,
  date: r.date,
  isVerifiedBuyer: r.verified ?? true,
  status: "approved",
}));

export function getAdminReviews(): AdminReview[] {
  if (typeof window === "undefined") return SEEDED_REVIEWS;
  try {
    const raw = localStorage.getItem(REVIEWS_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(REVIEWS_STORAGE_KEY, JSON.stringify(SEEDED_REVIEWS));
      return SEEDED_REVIEWS;
    }
    return JSON.parse(raw);
  } catch {
    return SEEDED_REVIEWS;
  }
}

export function toggleReviewApproval(reviewId: string): AdminReview | null {
  const current = getAdminReviews();
  const index = current.findIndex((r) => r.id === reviewId);
  if (index === -1) return null;

  const currentStatus = current[index].status;
  const updated = {
    ...current[index],
    status: currentStatus === "approved" ? "pending" : "approved",
  } as AdminReview;
  current[index] = updated;

  if (typeof window !== "undefined") {
    localStorage.setItem(REVIEWS_STORAGE_KEY, JSON.stringify(current));
  }
  return updated;
}

export function toggleReviewVerified(reviewId: string): AdminReview | null {
  const current = getAdminReviews();
  const index = current.findIndex((r) => r.id === reviewId);
  if (index === -1) return null;

  const updated = {
    ...current[index],
    isVerifiedBuyer: !current[index].isVerifiedBuyer,
  };
  current[index] = updated;

  if (typeof window !== "undefined") {
    localStorage.setItem(REVIEWS_STORAGE_KEY, JSON.stringify(current));
  }
  return updated;
}

export function deleteReview(reviewId: string): boolean {
  const current = getAdminReviews();
  const filtered = current.filter((r) => r.id !== reviewId);
  if (filtered.length === current.length) return false;

  if (typeof window !== "undefined") {
    localStorage.setItem(REVIEWS_STORAGE_KEY, JSON.stringify(filtered));
  }
  return true;
}

/* ========================================================================= */
/* ANALYTICS & STATS                                                         */
/* ========================================================================= */

const DELIVERED_PAID_STATUSES = new Set([
  "delivered",
  "livree",
  "livrée",
  "payee",
  "payée",
]);

const EXCLUDED_REVENUE_STATUSES = new Set([
  "pending",
  "confirmed",
  "shipped",
  "en_cours",
  "cancelled",
  "annulee",
  "annulée",
  "returned",
  "retournee",
  "retournée",
]);

/** Returns true strictly for delivered and paid COD order statuses. */
export function isDeliveredPaidOrder(status: unknown): boolean {
  const normalized = String(status ?? "").trim().toLowerCase();
  return !EXCLUDED_REVENUE_STATUSES.has(normalized) && DELIVERED_PAID_STATUSES.has(normalized);
}

export function getDashboardStats(
  orders: CODOrder[] = [],
  productsCountOverride?: number,
  reviewsCountOverride?: number
) {
  const products = getAdminProducts();
  const reviews = getAdminReviews();

  const totalRevenue = orders
    .filter((o) => isDeliveredPaidOrder(o.status))
    .reduce((sum, o) => sum + o.totalMad, 0);

  const pendingOrders = orders.filter((o) => o.status === "pending").length;
  const confirmedOrders = orders.filter((o) => o.status === "confirmed").length;
  const shippedOrders = orders.filter((o) => o.status === "shipped").length;
  const deliveredOrders = orders.filter((o) => isDeliveredPaidOrder(o.status)).length;

  const confirmationRate =
    orders.length > 0
      ? Math.round(((confirmedOrders + shippedOrders + deliveredOrders) / orders.length) * 100)
      : 100;

  return {
    totalRevenue,
    totalOrdersCount: orders.length,
    pendingOrders,
    confirmedOrders,
    shippedOrders,
    deliveredOrders,
    confirmationRate,
    productsCount: productsCountOverride ?? products.length,
    reviewsCount: reviewsCountOverride ?? reviews.length,
    recentOrders: orders.slice(0, 5),
  };
}
