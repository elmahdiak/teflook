import { PRODUCTS, type ProductItem } from "@/data/teflookData";
import { normalizeProductAgeRanges, normalizeProductImages } from "./cod-service";
import { resolveChildStoreCategory, type ChildStoreCategory } from "./teflook-categories";
import { PRODUCT_TRANSLATIONS_AR } from "./product-localization";

export interface ShopifyImage {
  url: string;
  altText?: string | null;
}

export interface ShopifyPrice {
  amount: string;
  currencyCode: string;
}

export interface ShopifySelectedOption {
  name: string;
  value: string;
}

export interface ShopifyVariant {
  id: string;
  title: string;
  availableForSale: boolean;
  price: ShopifyPrice;
  compareAtPrice?: ShopifyPrice;
  selectedOptions?: ShopifySelectedOption[];
}

export interface ShopifyProduct {
  id: string;
  title: string;
  title_fr?: string;
  title_ar?: string;
  handle: string;
  description: string;
  description_fr?: string;
  description_ar?: string;
  vendor: string;
  vendor_ar?: string;
  productType: string;
  productType_ar?: string;
  categoryNameAr?: string;
  tags?: string[];
  category?: ChildStoreCategory;
  categorySlug?: string;
  ageBracket?: string;
  ageRanges?: string[];
  ageRange?: string;
  skills?: string[];
  sku?: string;
  reference?: string;
  material?: string;
  material_ar?: string;
  origin?: string;
  origin_ar?: string;
  rating?: number;
  reviewsCount?: number;
  createdAt?: string;
  badge?: string;
  features?: string[];
  features_ar?: string[];
  images: {
    edges: { node: ShopifyImage }[];
  };
  variants: {
    edges: { node: ShopifyVariant }[];
  };
  priceRange: {
    minVariantPrice: ShopifyPrice;
  };
  compareAtPriceRange?: {
    minVariantPrice: ShopifyPrice;
  };
}

export function mapItemToShopifyProduct(item: any): ShopifyProduct {
  const category =
    resolveChildStoreCategory(item.categorySlug) ||
    resolveChildStoreCategory(item.category) ||
    resolveChildStoreCategory(item.categoryName) ||
    "discipline";

  const rawImages = normalizeProductImages(item);

  const finalImages: string[] =
    rawImages.length > 0 ? rawImages : ["/images/Untitled Design.png"];

  const compareAtAmount = item.oldPriceMad ? Number(item.oldPriceMad).toFixed(2) : undefined;
  const trAr = PRODUCT_TRANSLATIONS_AR[item.id];
  const priceMadNum = Number(item.priceMad || 0);
  const priceFormatted = priceMadNum.toFixed(2);

  const title = item.title || item.name || "Produit TefLook";
  const description = item.description || "";
  const normalizedAgeRanges = normalizeProductAgeRanges(item);
  const ageRanges =
    normalizedAgeRanges.length > 0 ? normalizedAgeRanges : ["Tous âges"];
  const ageBracket = ageRanges[0] || "Tous âges";
  const ageRange = item.ageRange || item.age_range || ageRanges.join(", ");
  const skills = Array.isArray(item.skills)
    ? item.skills
    : typeof item.skills === "string" && item.skills.trim().length > 0
    ? item.skills.split(",").map((s: string) => s.trim()).filter(Boolean)
    : undefined;
  const sku = item.sku || item.reference || item.id;
  const reference =
    item.reference || item.sku || `Référence ${String(item.id).replace(/[^0-9]/g, "").slice(-5) || "67907"}`;

  return {
    id: item.id,
    title,
    title_fr: item.title_fr || title,
    title_ar: item.title_ar || trAr?.title || title,
    handle: item.handle || item.id,
    description,
    description_fr: item.description_fr || description,
    description_ar: item.description_ar || trAr?.description || description,
    vendor: item.brand || item.vendor || "TefLook",
    vendor_ar: item.vendor_ar || "تيفلوك",
    productType: item.categoryName || item.productType || "Éveil & Développement",
    productType_ar: item.categoryName_ar || trAr?.categoryName || item.categoryName || "النمو والتطوير",
    categoryNameAr: item.categoryName_ar || trAr?.categoryName || item.categoryName || "النمو والتطوير",
    category,
    categorySlug: item.categorySlug || item.category_slug || undefined,
    ageBracket,
    ageRanges,
    ageRange,
    skills,
    sku,
    reference,
    material: item.material,
    material_ar: item.material_ar || trAr?.material || item.material,
    origin: item.origin,
    origin_ar: item.origin_ar || trAr?.origin || item.origin,
    rating: item.rating != null ? Number(item.rating) : 0,
    reviewsCount: item.reviewsCount != null ? Number(item.reviewsCount) : 0,
    createdAt: item.createdAt || item.created_at,
    badge: typeof item.badge === "string" && item.badge.trim() ? item.badge.trim() : undefined,
    features: item.features || [],
    features_ar: item.features_ar || trAr?.features || item.features || [],
    tags: [category, item.categorySlug, ...ageRanges, ...(item.features || [])],
    images: {
      edges: finalImages.map((url: string) => ({
        node: {
          url,
          altText: title,
        },
      })),
    },
    variants: {
      edges: [
        {
          node: {
            id: `var-${item.id}`,
            title: ageRanges.join(" • ") || "Standard",
            availableForSale: item.inStock !== false,
            price: {
              amount: priceFormatted,
              currencyCode: "MAD",
            },
            compareAtPrice: compareAtAmount
              ? {
                  amount: compareAtAmount,
                  currencyCode: "MAD",
                }
              : undefined,
            selectedOptions: [
              {
                name: "Tranches d'âge",
                value: ageRanges.join(", "),
              },
            ],
          },
        },
      ],
    },
    priceRange: {
      minVariantPrice: {
        amount: priceFormatted,
        currencyCode: "MAD",
      },
    },
    compareAtPriceRange: compareAtAmount
      ? {
          minVariantPrice: {
            amount: compareAtAmount,
            currencyCode: "MAD",
          },
        }
      : undefined,
  };
}

export const MOCK_SHOPIFY_PRODUCTS: ShopifyProduct[] = PRODUCTS.map((item: ProductItem) =>
  mapItemToShopifyProduct(item)
);

export async function fetchProducts(): Promise<ShopifyProduct[]> {
  // 1. Client-Side (Browser): Fetch live products from /api/products
  if (typeof window !== "undefined") {
    try {
      const res = await fetch("/api/products", { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) {
          // Sync localStorage cache strictly with server data (even if [])
          try {
            localStorage.setItem("teflook_admin_products_v2", JSON.stringify(data));
          } catch {}
          return data.map(mapItemToShopifyProduct);
        }
      }
    } catch (e) {
      console.warn("Client fetch /api/products failed, trying localStorage:", e);
    }

    // Fallback to localStorage if API unreachable
    try {
      const local = localStorage.getItem("teflook_admin_products_v2");
      if (local) {
        const parsed = JSON.parse(local);
        if (Array.isArray(parsed)) {
          return parsed.map(mapItemToShopifyProduct);
        }
      }
    } catch {}

    return [];
  } else {
    // 2. Server-Side (Node.js runtime / SSR / SSG): Read directly from Supabase
    try {
      const supabaseUrl =
        process.env.NEXT_PUBLIC_SUPABASE_URL || "https://zvqcsxwwkgypvqfewbtn.supabase.co";
      const supabaseAnonKey =
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "sb_publishable_IkjoHS4mwYG9qEXkBWy8Xg_jw3TI_AF";
      const { createClient } = await import("@supabase/supabase-js");
      const supabase = createClient(supabaseUrl, supabaseAnonKey);
      const [productsRes, reviewsRes] = await Promise.all([
        supabase
          .from("products")
          .select("*")
          .order("created_at", { ascending: false }),
        supabase
          .from("product_reviews")
          .select("product_id, product_handle, rating"),
      ]);

      if (!productsRes.error && productsRes.data) {
        const allReviews: any[] = (!reviewsRes.error && Array.isArray(reviewsRes.data)) ? reviewsRes.data : [];
        const reviewStatsMap = new Map<string, { count: number; sum: number }>();

        for (const r of allReviews) {
          const ratingVal = Number(r.rating) || 5;
          if (r.product_id) {
            const key = String(r.product_id).trim().toLowerCase();
            const curr = reviewStatsMap.get(key) || { count: 0, sum: 0 };
            reviewStatsMap.set(key, { count: curr.count + 1, sum: curr.sum + ratingVal });
          }
          if (r.product_handle) {
            const key = String(r.product_handle).trim().toLowerCase();
            if (key !== String(r.product_id || "").trim().toLowerCase()) {
              const curr = reviewStatsMap.get(key) || { count: 0, sum: 0 };
              reviewStatsMap.set(key, { count: curr.count + 1, sum: curr.sum + ratingVal });
            }
          }
        }

        return productsRes.data.map((row: any) => {
          const rowId = String(row.id);
          const rowHandle = row.handle || rowId;
          const stats =
            reviewStatsMap.get(rowId.trim().toLowerCase()) ||
            (rowHandle ? reviewStatsMap.get(rowHandle.trim().toLowerCase()) : undefined);

          const realCount = stats ? stats.count : 0;
          const realRating = stats && stats.count > 0 ? Number((stats.sum / stats.count).toFixed(1)) : 0;

          return mapItemToShopifyProduct({
            id: rowId,
            title: row.title || row.name || "Produit TefLook",
            handle: rowHandle,
            categorySlug: row.category_slug || row.category || "discipline-maitrise-de-soi",
            categoryName: row.category_name || row.category || "Discipline & Gestion de soi",
            priceMad: Number(row.price_mad ?? row.price ?? 0),
            oldPriceMad:
              row.old_price_mad != null
                ? Number(row.old_price_mad)
                : row.old_price != null
                ? Number(row.old_price)
                : undefined,
            inStock: row.in_stock ?? true,
            ageBracket: row.age_bracket || "7 - 10 ans",
            ageRanges: normalizeProductAgeRanges(row),
            age_ranges: row.age_ranges,
            ageRange: row.age_range || row.ageRange || row.age_bracket || "7 - 10 ans",
            skills: Array.isArray(row.skills) ? row.skills : typeof row.skills === "string" ? row.skills.split(",").map((s: string) => s.trim()).filter(Boolean) : undefined,
            sku: row.sku || row.reference || rowId,
            reference: row.reference || row.sku,
            images: normalizeProductImages(row),
            description: row.description || "",
            material: row.material,
            origin: row.origin,
            features: Array.isArray(row.features) ? row.features : [],
            rating: realRating,
            reviewsCount: realCount,
            createdAt: row.created_at || row.createdAt,
          });
        });
      }
    } catch (e) {
      console.warn("Server Supabase fetch failed:", e);
    }
  }

  return [];
}

export async function fetchProductByHandle(handle: string): Promise<ShopifyProduct | null> {
  const normalized = handle.trim().toLowerCase();
  const products = await fetchProducts();
  const product = products.find(
    (p) => p.handle.toLowerCase() === normalized || p.id.toLowerCase() === normalized
  );
  return product || null;
}

export async function fetchRelatedProducts(
  category?: ChildStoreCategory,
  currentId?: string,
  limit = 4
): Promise<ShopifyProduct[]> {
  const products = await fetchProducts();
  const pool = products.filter((p) => p.id !== currentId);
  const sameCategory = pool.filter((p) => p.category === category);
  if (sameCategory.length >= limit) {
    return sameCategory.slice(0, limit);
  }
  const remaining = pool.filter((p) => p.category !== category);
  return [...sameCategory, ...remaining].slice(0, limit);
}
