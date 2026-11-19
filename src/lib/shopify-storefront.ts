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
  images: {
    edges: { node: ShopifyImage }[];
  };
  variants: {
    edges: { node: ShopifyVariant }[];
  };
  priceRange: {
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
const productCustomImages: Record<string, string> = {
  "prod-disc-4": "https://images.unsplash.com/photo-1600080972464-8e5f35f63d08?q=80&w=800&auto=format&fit=crop", // Video game controller
  "prod-disc-3": "https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?q=80&w=800&auto=format&fit=crop", // Folders & daily routine organizer
  "prod-disc-2": "https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?q=80&w=800&auto=format&fit=crop", // Wooden balance & concentration toys
  "prod-auto-1": "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?q=80&w=800&auto=format&fit=crop", // Bathroom wash & autonomy scene
};

export const MOCK_SHOPIFY_PRODUCTS: ShopifyProduct[] = PRODUCTS.map((item: ProductItem) => {
  const category = slugToCategoryMap[item.categorySlug] || "discipline";
  const imageUrl = productCustomImages[item.id] || item.images[0] || "https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?q=80&w=800&auto=format&fit=crop";

  return {
    id: item.id,
    title: item.name,
    handle: item.id,
    description: item.description,
    vendor: item.brand || "TefLook",
    productType: item.categoryName,
    category,
    tags: [category, item.categorySlug, item.ageBracket, ...(item.features || [])],
    images: {
      edges: [
        {
          node: {
            url: imageUrl,
            altText: item.name,
          },
        },
      ],
    },
    variants: {
      edges: [
        {
          node: {
            id: `var-${item.id}`,
            title: "Default Title",
            availableForSale: item.inStock,
            price: {
              amount: item.priceMad.toFixed(2),
              currencyCode: "MAD",
            },
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
  };
});

export async function fetchProducts(): Promise<ShopifyProduct[]> {
  return MOCK_SHOPIFY_PRODUCTS;
}
