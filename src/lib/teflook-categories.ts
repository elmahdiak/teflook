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
  titleFr: string;
  titleAr: string;
  descFr: string;
  descAr: string;
  imageUrl: string;
}

export const CHILD_STORE_CATEGORIES: ChildStoreCategoryConfig[] = [
  {
    value: "discipline",
    slug: "discipline-gestion-de-soi",
    subtitle: "Maîtrise",
    titleFr: "Discipline & gestion de soi",
    titleAr: "الانضباط وإدارة الذات",
    descFr: "Rituels apaisants, concentration et gestion du temps au quotidien.",
    descAr: "روتين يومي هادئ لتنمية التركيز وإدارة الوقت.",
    imageUrl: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?q=80&w=600&auto=format&fit=crop",
  },
  {
    value: "emotionalIntelligence",
    slug: "intelligence-emotionnelle",
    subtitle: "Empathie",
    titleFr: "Intelligence émotionnelle",
    titleAr: "الذكاء العاطفي",
    descFr: "Identifier, comprendre et exprimer ses émotions avec sérénité.",
    descAr: "فهم المشاعر والتعبير عنها بهدوء وتوازن.",
    imageUrl: "https://images.unsplash.com/photo-1544717305-2782549b5136?q=80&w=600&auto=format&fit=crop",
  },
  {
    value: "independence",
    slug: "autonomie-competences-de-vie",
    subtitle: "Autonomie",
    titleFr: "Autonomie & compétences de vie",
    titleAr: "الاستقلالية ومهارات الحياة",
    descFr: "Outils concrets pour prendre confiance et agir par soi-même.",
    descAr: "أدوات عملية لاكتساب الاستقلالية والاعتماد على النفس.",
    imageUrl: "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?q=80&w=600&auto=format&fit=crop",
  },
  {
    value: "confidence",
    slug: "confiance-competences-sociales",
    subtitle: "Social",
    titleFr: "Confiance & compétences sociales",
    titleAr: "الثقة والمهارات الاجتماعية",
    descFr: "Coopération, écoute et affirmation bienveillante en famille ou à l'école.",
    descAr: "تعزيز التواصل الإيجابي، التعاون والثقة بالنفس.",
    imageUrl: "https://images.unsplash.com/photo-1511895426328-dc8714191300?q=80&w=600&auto=format&fit=crop",
  },
  {
    value: "creativity",
    slug: "creativite-imagination",
    subtitle: "Imagination",
    titleFr: "Créativité & imagination",
    titleAr: "الإبداع والخيال",
    descFr: "Activités artistiques et manuelles pour créer librement sans écran.",
    descAr: "أنشطة فنية ويدوية لإطلاق العنان للخيال بعيداً عن الشاشات.",
    imageUrl: "https://images.unsplash.com/photo-1513542789411-b6a5d4f31634?q=80&w=600&auto=format&fit=crop",
  },
  {
    value: "criticalThinking",
    slug: "pensee-critique-resolution-de-problemes",
    subtitle: "Logique",
    titleFr: "Pensée critique & logique",
    titleAr: "التفكير النقدي وحل المشكلات",
    descFr: "Défis ludiques et jeux de stratégie pour stimuler la réflexion.",
    descAr: "تحديات ممتعة وألعاب استراتيجية لتنمية التفكير المنطقي.",
    imageUrl: "https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?q=80&w=600&auto=format&fit=crop",
  },
];

function normalizeCategoryToken(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[&/]+/g, " ")
    .replace(/[^a-z0-9\u0600-\u06ff]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

const CATEGORY_ALIAS_MAP: Record<string, ChildStoreCategory> = {
  // Discipline
  discipline: "discipline",
  "discipline-maitrise-de-soi": "discipline",
  "discipline-et-maitrise-de-soi": "discipline",
  "discipline-gestion-de-soi": "discipline",
  "discipline-et-gestion-de-soi": "discipline",
  // Emotional Intelligence
  emotionalintelligence: "emotionalIntelligence",
  "emotional-intelligence": "emotionalIntelligence",
  "intelligence-emotionnelle": "emotionalIntelligence",
  // Independence / Autonomy
  independence: "independence",
  autonomie: "independence",
  "autonomie-competences-de-vie": "independence",
  "autonomie-et-competences-de-vie": "independence",
  // Confidence & Social
  confidence: "confidence",
  "confiance-competences-sociales": "confidence",
  "confiance-en-soi-competences-sociales": "confidence",
  "confiance-et-competences-sociales": "confidence",
  // Creativity
  creativity: "creativity",
  creativite: "creativity",
  "creativite-imagination": "creativity",
  "creativite-et-imagination": "creativity",
  // Critical Thinking & Logic
  criticalthinking: "criticalThinking",
  "critical-thinking": "criticalThinking",
  "esprit-critique-resolution-problemes": "criticalThinking",
  "esprit-critique-et-resolution-de-problemes": "criticalThinking",
  "esprit-critique-resolution-de-problemes": "criticalThinking",
  "pensee-critique-resolution-de-problemes": "criticalThinking",
  "pensee-critique-et-logique": "criticalThinking",
  "pensee-critique-logique": "criticalThinking",
};

/**
 * Resolves any URL slug, enum key, Supabase `category_slug`, or localized name
 * into one of TefLook's 6 canonical `ChildStoreCategory` keys.
 */
export function resolveChildStoreCategory(
  raw?: string | null
): ChildStoreCategory | null {
  if (!raw || typeof raw !== "string") return null;

  const trimmed = raw.trim();
  if (!trimmed || trimmed.toLowerCase() === "all") return null;

  const normalized = normalizeCategoryToken(trimmed);
  if (CATEGORY_ALIAS_MAP[normalized]) {
    return CATEGORY_ALIAS_MAP[normalized];
  }

  for (const cat of CHILD_STORE_CATEGORIES) {
    if (
      normalizeCategoryToken(cat.value) === normalized ||
      normalizeCategoryToken(cat.slug) === normalized ||
      normalizeCategoryToken(cat.titleFr) === normalized ||
      cat.titleAr.trim() === trimmed
    ) {
      return cat.value;
    }
  }

  return null;
}

export function getCollectionSlug(category: ChildStoreCategory): string {
  return (
    CHILD_STORE_CATEGORIES.find((c) => c.value === category)?.slug ||
    category
  );
}

export function getChildStoreCategoryConfig(
  category: ChildStoreCategory
): ChildStoreCategoryConfig {
  return (
    CHILD_STORE_CATEGORIES.find((c) => c.value === category) ||
    CHILD_STORE_CATEGORIES[0]
  );
}

export function getChildStoreCategory(product: ShopifyProduct): ChildStoreCategory {
  if (product.category) {
    const resolved = resolveChildStoreCategory(product.category);
    if (resolved) return resolved;
  }

  const fromSlug = resolveChildStoreCategory(product.categorySlug);
  if (fromSlug) return fromSlug;

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
