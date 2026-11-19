import type { ShopifyProduct } from "./shopify-storefront";

export type ChildStoreCategory =
  | "discipline"
  | "emotionalIntelligence"
  | "independence"
  | "confidence"
  | "creativity"
  | "criticalThinking";

export interface ChildStoreCategoryConfig {
  value: ChildStoreCategory;
  slug: string;
  subtitle: string;
  imageUrl: string;
}

export const CHILD_STORE_CATEGORIES: ChildStoreCategoryConfig[] = [
  {
    value: "discipline",
    slug: "discipline-gestion-de-soi",
    subtitle: "Maîtrise",
    imageUrl: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?q=80&w=600&auto=format&fit=crop",
  },
  {
    value: "emotionalIntelligence",
    slug: "intelligence-emotionnelle",
    subtitle: "Empathie",
    imageUrl: "https://images.unsplash.com/photo-1544717305-2782549b5136?q=80&w=600&auto=format&fit=crop",
  },
  {
    value: "independence",
    slug: "autonomie-competences-de-vie",
    subtitle: "Autonomie",
    imageUrl: "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?q=80&w=600&auto=format&fit=crop",
  },
  {
    value: "confidence",
    slug: "confiance-competences-sociales",
    subtitle: "Social",
    imageUrl: "https://images.unsplash.com/photo-1511895426328-dc8714191300?q=80&w=600&auto=format&fit=crop",
  },
  {
    value: "creativity",
    slug: "creativite-imagination",
    subtitle: "Imagination",
    imageUrl: "https://images.unsplash.com/photo-1513542789411-b6a5d4f31634?q=80&w=600&auto=format&fit=crop",
  },
  {
    value: "criticalThinking",
    slug: "pensee-critique-resolution-de-problemes",
    subtitle: "Logique",
    imageUrl: "https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?q=80&w=600&auto=format&fit=crop",
  },
];

export function getChildStoreCategory(product: ShopifyProduct): ChildStoreCategory {
  if (product.category) return product.category;

  const content = `${product.title} ${product.description} ${product.productType} ${product.tags?.join(" ") || ""}`.toLowerCase();

  if (content.includes("emotion") || content.includes("coeur") || content.includes("empathie") || content.includes("sentiment")) {
    return "emotionalIntelligence";
  }
  if (content.includes("autonomie") || content.includes("cuisine") || content.includes("responsabilit") || content.includes("routine")) {
    return "independence";
  }
  if (content.includes("confiance") || content.includes("social") || content.includes("coopérat") || content.includes("éloquence")) {
    return "confidence";
  }
  if (content.includes("créativit") || content.includes("art") || content.includes("imagination") || content.includes("dessin") || content.includes("histoire")) {
    return "creativity";
  }
  if (content.includes("critique") || content.includes("logique") || content.includes("énigme") || content.includes("casse-tête") || content.includes("problème") || content.includes("stratégie")) {
    return "criticalThinking";
  }

  return "discipline";
}
