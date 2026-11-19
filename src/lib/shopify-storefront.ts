import { PRODUCTS, type ProductItem } from "@/data/teflookData";
import type { ChildStoreCategory } from "./teflook-categories";

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
  handle: string;
  description: string;
  vendor: string;
  productType: string;
  tags?: string[];
  category?: ChildStoreCategory;
  material?: string;
  origin?: string;
  rating?: number;
  reviewsCount?: number;
  features?: string[];
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

const slugToCategoryMap: Record<string, ChildStoreCategory> = {
  "discipline-maitrise-de-soi": "discipline",
  "intelligence-emotionnelle": "emotionalIntelligence",
  "autonomie-competences-de-vie": "independence",
  "confiance-en-soi-competences-sociales": "confidence",
  "creativite-imagination": "creativity",
  "esprit-critique-resolution-problemes": "criticalThinking",
};

// Custom image overrides for exact aesthetic consistency
const productCustomImages: Record<string, string[]> = {
  "prod-disc-4": [
    "https://images.unsplash.com/photo-1600080972464-8e5f35f63d08?q=80&w=800&auto=format&fit=crop", // Video game controller
    "https://images.unsplash.com/photo-1592840496694-26d035b52b48?q=80&w=800&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?q=80&w=800&auto=format&fit=crop",
  ],
  "prod-disc-3": [
    "https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?q=80&w=800&auto=format&fit=crop", // Folders & daily routine organizer
    "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?q=80&w=800&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?q=80&w=800&auto=format&fit=crop",
  ],
  "prod-disc-2": [
    "https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?q=80&w=800&auto=format&fit=crop", // Wooden balance & concentration toys
    "https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?q=80&w=800&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1587654780291-39c9404d746b?q=80&w=800&auto=format&fit=crop",
  ],
  "prod-auto-1": [
    "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?q=80&w=800&auto=format&fit=crop", // Bathroom wash & autonomy scene
    "https://images.unsplash.com/photo-1502086223501-7ea6ecd79368?q=80&w=800&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1511895426328-dc8714191300?q=80&w=800&auto=format&fit=crop",
  ],
};

export const MOCK_SHOPIFY_PRODUCTS: ShopifyProduct[] = PRODUCTS.map((item: ProductItem) => {
  const category = slugToCategoryMap[item.categorySlug] || "discipline";
  const overrideImages = productCustomImages[item.id];
  const rawImages = overrideImages && overrideImages.length > 0
    ? overrideImages
    : (item.images && item.images.length > 0 ? item.images : ["https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?q=80&w=800&auto=format&fit=crop"]);

  // Ensure at least 2 gallery images for rich PDP preview
  const finalImages = rawImages.length === 1
    ? [rawImages[0], "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?q=80&w=800&auto=format&fit=crop"]
    : rawImages;

  const compareAtAmount = item.oldPriceMad ? item.oldPriceMad.toFixed(2) : undefined;

  return {
    id: item.id,
    title: item.name,
    handle: item.id,
    description: item.description,
    vendor: item.brand || "TefLook",
    productType: item.categoryName,
    category,
    material: item.material,
    origin: item.origin,
    rating: item.rating || 4.9,
    reviewsCount: item.reviewsCount || 48,
    features: item.features || [],
    tags: [category, item.categorySlug, item.ageBracket, ...(item.features || [])],
    images: {
      edges: finalImages.map((url) => ({
        node: {
          url,
          altText: item.name,
        },
      })),
    },
    variants: {
      edges: [
        {
          node: {
            id: `var-${item.id}`,
            title: item.ageBracket || "Standard",
            availableForSale: item.inStock,
            price: {
              amount: item.priceMad.toFixed(2),
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
                name: "Tranche d'âge",
                value: item.ageBracket || "Tous âges",
              },
            ],
          },
        },
      ],
    },
    priceRange: {
      minVariantPrice: {
        amount: item.priceMad.toFixed(2),
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
});

export async function fetchProducts(): Promise<ShopifyProduct[]> {
  return MOCK_SHOPIFY_PRODUCTS;
}

export async function fetchProductByHandle(handle: string): Promise<ShopifyProduct | null> {
  const normalized = handle.trim().toLowerCase();
  const product = MOCK_SHOPIFY_PRODUCTS.find(
    (p) => p.handle.toLowerCase() === normalized || p.id.toLowerCase() === normalized
  );
  return product || null;
}

export async function fetchRelatedProducts(
  category?: ChildStoreCategory,
  currentId?: string,
  limit = 4
): Promise<ShopifyProduct[]> {
  const pool = MOCK_SHOPIFY_PRODUCTS.filter((p) => p.id !== currentId);
  const sameCategory = pool.filter((p) => p.category === category);
  if (sameCategory.length >= limit) {
    return sameCategory.slice(0, limit);
  }
  const remaining = pool.filter((p) => p.category !== category);
  return [...sameCategory, ...remaining].slice(0, limit);
}
