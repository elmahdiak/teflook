"use client";

import React, { useState, useRef, useEffect } from "react";
import type { ShopifyProduct } from "@/lib/shopify-storefront";
import { useTefLookLanguage } from "@/lib/teflook-language";
import { getLocalizedProduct } from "@/lib/product-localization";
import { CHILD_STORE_CATEGORIES, getChildStoreCategory } from "@/lib/teflook-categories";
import { formatAgeBracketLabel, normalizeProductAgeRanges } from "@/lib/cod-service";
import { Check, ChevronDown, ChevronUp, Sparkles, Tag, ShieldCheck, Truck } from "lucide-react";
import { cn } from "@/lib/utils";

interface ProductInfoTabsProps {
  product: ShopifyProduct;
}

// Category-based fallback skills in French & Arabic
const CATEGORY_DEFAULT_SKILLS: Record<string, { fr: string[]; ar: string[] }> = {
  discipline: {
    fr: ["Autodiscipline & Self-control", "Gestion du temps & Concentration", "Patience"],
    ar: ["الانضباط الذاتي والتحكم", "إدارة الوقت والتركيز العميق", "الصبر والمثابرة"],
  },
  emotionalIntelligence: {
    fr: ["Reconnaissance des émotions", "Empathie active & Écoute", "Apaisement & Sérénité"],
    ar: ["التعرف على المشاعر والتعبير عنها", "التعاطف النشط والاستماع", "الهدوء والتنظيم الذاتي"],
  },
  independence: {
    fr: ["Autonomie au quotidien", "Prise d'initiative", "Organisation personnelle"],
    ar: ["الاستقلالية في المهام اليومية", "روح المبادرة وتحمل المسؤولية", "التنظيم والاعتماد على النفس"],
  },
  confidence: {
    fr: ["Confiance en soi & Affirmation", "Aisance relationnelle", "Esprit de coopération"],
    ar: ["الثقة بالنفس والتعبير الإيجابي", "الذكاء الاجتماعي والتواصل", "روح الفريق والتعاون"],
  },
  creativity: {
    fr: ["Imagination fertile", "Expression créative & artistique", "Pensée divergente"],
    ar: ["الخيال الخصب والابتكار", "التعبير الفني واليدوي", "التفكير الإبداعي الحر"],
  },
  criticalThinking: {
    fr: ["Logique & Déduction", "Résolution méthodique de problèmes", "Stratégie & Analyse"],
    ar: ["التفكير المنطقي والاستنتاج", "حل المشكلات بمرونة", "التخطيط والتحليل الاستراتيجي"],
  },
};

export function ProductInfoTabs({ product }: ProductInfoTabsProps) {
  const { direction, locale, t } = useTefLookLanguage();
  const localized = getLocalizedProduct(product, locale);
  const [activeTab, setActiveTab] = useState<"description" | "details">("description");
  const [isExpanded, setIsExpanded] = useState(false);
  const [needsCollapse, setNeedsCollapse] = useState(false);
  const descriptionRef = useRef<HTMLDivElement>(null);

  // Evaluate content height on mount and changes
  useEffect(() => {
    if (descriptionRef.current) {
      // Clamping threshold around 190px
      const height = descriptionRef.current.scrollHeight;
      setNeedsCollapse(height > 190);
    }
  }, [localized.description, activeTab, product]);

  const categoryKey = getChildStoreCategory(product);
  const categoryConfig = CHILD_STORE_CATEGORIES.find((c) => c.value === categoryKey);

  // Resolve Recommended Age(s)
  const resolvedAgeRanges: string[] = (() => {
    const normalized = normalizeProductAgeRanges({
      ageRanges: product.ageRanges,
      ageBracket: product.ageBracket,
      ageRange: product.ageRange,
    });
    if (normalized.length > 0) {
      return normalized.map((age) => formatAgeBracketLabel(age, locale));
    }
    return [locale === "ar" ? "جميع الأعمار" : "Tous âges"];
  })();

  // Resolve Developed Skills
  const resolvedSkills: string[] = (() => {
    if (Array.isArray(product.skills) && product.skills.length > 0) {
      return product.skills;
    }
    const catSkills = CATEGORY_DEFAULT_SKILLS[categoryKey];
    if (catSkills) {
      return locale === "ar" ? catSkills.ar : catSkills.fr;
    }
    return locale === "ar"
      ? ["التركيز", "الصبر", "الاستقلالية"]
      : ["Concentration", "Patience", "Autonomie"];
  })();

  // Resolve Reference Code / SKU
  const resolvedReference =
    product.reference ||
    product.sku ||
    `Référence ${String(product.id).replace(/[^0-9]/g, "").slice(-5) || "67907"}`;

  // Helper to format structured description paragraphs & subheadings
  const renderFormattedDescription = (text: string) => {
    if (!text || text.trim().length === 0) {
      return (
        <p className="text-xs sm:text-sm text-foreground/80 leading-relaxed">
          {locale === "ar"
            ? "لا يوجد وصف مفصل متاح لهذا المنتج حالياً."
            : "Aucune description détaillée disponible pour le moment."}
        </p>
      );
    }

    const lines = text.split("\n");
    const elements: React.ReactNode[] = [];
    let currentBullets: string[] = [];

    const flushBullets = (keyIdx: number) => {
      if (currentBullets.length > 0) {
        elements.push(
          <ul
            key={`bullets-${keyIdx}`}
            className="my-2.5 space-y-1.5 text-xs sm:text-sm text-foreground/85"
          >
            {currentBullets.map((bullet, bIdx) => (
              <li key={bIdx} className="flex items-start gap-2.5">
                <span className="size-1.5 rounded-full bg-brand-teal mt-2 shrink-0" />
                <span className="leading-relaxed">{bullet}</span>
              </li>
            ))}
          </ul>
        );
        currentBullets = [];
      }
    };

    lines.forEach((rawLine, idx) => {
      const line = rawLine.trim();
      if (!line) {
        flushBullets(idx);
        return;
      }

      // Check if line is a bullet item
      if (line.startsWith("•") || line.startsWith("-") || line.startsWith("*")) {
        const cleaned = line.replace(/^[•\-\*]\s*/, "");
        currentBullets.push(cleaned);
        return;
      }

      flushBullets(idx);

      // Check if line is a subheading (ends with ? or :, starts with ###, or matches key pedagogical terms)
      const isHeading =
        line.startsWith("###") ||
        line.startsWith("##") ||
        line.endsWith("?") ||
        line.endsWith(":") ||
        line.toLowerCase().startsWith("c'est quoi") ||
        line.toLowerCase().startsWith("ce que votre enfant") ||
        line.toLowerCase().startsWith("pourquoi") ||
        line.toLowerCase().startsWith("comment") ||
        line.includes("ما هو") ||
        line.includes("ماذا يستفيد");

      if (isHeading) {
        const headingText = line.replace(/^[#\s]+/, "");
        elements.push(
          <h3
            key={`h-${idx}`}
            className="font-bold text-brand-teal text-xs sm:text-sm mt-3.5 mb-1.5 flex items-center gap-1.5"
          >
            <Sparkles size={13} className="text-brand-orange shrink-0" />
            <span>{headingText}</span>
          </h3>
        );
      } else {
        elements.push(
          <p key={`p-${idx}`} className="text-xs sm:text-sm text-foreground/80 leading-relaxed mb-2">
            {line}
          </p>
        );
      }
    });

    flushBullets(lines.length);
    return elements;
  };

  return (
    <div className="w-full mt-4 border-t border-border/80 pt-2" dir={direction}>
      {/* 1. Sleek Tab Header Bar */}
      <div className="flex items-center gap-6 sm:gap-8 border-b border-border/80 text-xs sm:text-sm font-semibold">
        {/* Tab 1: Description */}
        <button
          type="button"
          onClick={() => setActiveTab("description")}
          className={cn(
            "relative pb-3 pt-2 font-bold transition-all cursor-pointer",
            activeTab === "description"
              ? "text-brand-teal font-extrabold border-b-2 border-brand-teal -mb-px"
              : "text-muted-foreground hover:text-foreground border-b-2 border-transparent"
          )}
        >
          {locale === "ar" ? "الوصف" : "Description"}
        </button>

        {/* Tab 2: Détails du produit */}
        <button
          type="button"
          onClick={() => setActiveTab("details")}
          className={cn(
            "relative pb-3 pt-2 font-bold transition-all cursor-pointer",
            activeTab === "details"
              ? "text-brand-teal font-extrabold border-b-2 border-brand-teal -mb-px"
              : "text-muted-foreground hover:text-foreground border-b-2 border-transparent"
          )}
        >
          {locale === "ar" ? "تفاصيل المنتج" : "Détails du produit"}
        </button>
      </div>

      {/* Tab Content Container */}
      <div className="pt-4 pb-2">
        {/* =================================================================== */}
        {/* TAB 1: DESCRIPTION (With "Lire la suite / Lire moins" toggle)      */}
        {/* =================================================================== */}
        {activeTab === "description" && (
          <div className="space-y-3">
            <div
              ref={descriptionRef}
              className={cn(
                "transition-all duration-300 relative",
                !isExpanded && needsCollapse
                  ? "max-h-[190px] overflow-hidden"
                  : "max-h-none"
              )}
            >
              {/* Formatted Description Body */}
              <div className="text-foreground/90 space-y-1">
                {renderFormattedDescription(localized.description)}

                {/* Additional Features List if available */}
                {localized.features && localized.features.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-border/60">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">
                      {locale === "ar" ? "نقاط القوة والمميزات :" : "Points forts & Atouts :"}
                    </h4>
                    <ul className="space-y-1.5 text-xs sm:text-sm text-foreground/85">
                      {localized.features.map((feat, i) => (
                        <li key={i} className="flex items-start gap-2.5">
                          <Check size={14} className="text-brand-teal shrink-0 mt-0.5" />
                          <span className="leading-relaxed">{feat}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {/* Soft Gradient Fade-out overlay when collapsed */}
              {!isExpanded && needsCollapse && (
                <div
                  className="absolute bottom-0 inset-x-0 h-20 bg-gradient-to-t from-background via-background/85 to-transparent pointer-events-none"
                  aria-hidden="true"
                />
              )}
            </div>

            {/* Collapsible Action Pill Button ("Lire la suite ▾" / "Lire moins ▴") */}
            {needsCollapse && (
              <div className="pt-1 flex justify-center sm:justify-start">
                <button
                  type="button"
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="inline-flex items-center gap-1.5 rounded-full border border-border/80 bg-background hover:bg-secondary/70 px-4 py-1.5 text-xs font-bold text-foreground transition-all shadow-xs hover:border-brand-teal/50 cursor-pointer"
                >
                  <span>
                    {isExpanded
                      ? locale === "ar"
                        ? "اقرأ أقل ▴"
                        : "Lire moins ▴"
                      : locale === "ar"
                      ? "اقرأ المزيد ▾"
                      : "Lire la suite ▾"}
                  </span>
                </button>
              </div>
            )}
          </div>
        )}

        {/* =================================================================== */}
        {/* TAB 2: DÉTAILS DU PRODUIT (Structured Specifications Table)        */}
        {/* =================================================================== */}
        {activeTab === "details" && (
          <div className="divide-y divide-border/70 text-xs sm:text-sm">
            {/* Row 1: Âge recommandé / العمر الموصى به */}
            <div className="py-3.5 grid grid-cols-1 sm:grid-cols-2 gap-1.5 sm:gap-4 items-baseline">
              <span className="font-bold text-muted-foreground">
                {locale === "ar" ? "العمر الموصى به" : "Âge recommandé"}
              </span>
              <div className="flex flex-wrap gap-1.5">
                {resolvedAgeRanges.map((age, i) => (
                  <span
                    key={i}
                    className="inline-flex items-center rounded-lg bg-brand-mist/60 border border-brand-teal/30 px-2.5 py-1 text-xs font-bold text-brand-teal"
                  >
                    {age}
                  </span>
                ))}
              </div>
            </div>

            {/* Row 2: Compétence développée / المهارة المطورة */}
            <div className="py-3.5 grid grid-cols-1 sm:grid-cols-2 gap-1.5 sm:gap-4 items-baseline">
              <span className="font-bold text-muted-foreground">
                {locale === "ar" ? "المهارة المطورة" : "Compétence développée"}
              </span>
              <div className="flex flex-wrap gap-1.5">
                {resolvedSkills.map((skill, i) => (
                  <span
                    key={i}
                    className="inline-flex items-center rounded-lg bg-card border border-border px-2.5 py-1 text-xs font-semibold text-foreground"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            {/* Row 3: Catégorie d'éveil / الفئة */}
            <div className="py-3.5 grid grid-cols-1 sm:grid-cols-2 gap-1.5 sm:gap-4 items-baseline">
              <span className="font-bold text-muted-foreground">
                {locale === "ar" ? "الفئة" : "Catégorie d'éveil"}
              </span>
              <span className="font-semibold text-foreground">
                {localized.categoryName}
              </span>
            </div>

            {/* Row 4: Référence / المرجع */}
            <div className="py-3.5 grid grid-cols-1 sm:grid-cols-2 gap-1.5 sm:gap-4 items-baseline">
              <span className="font-bold text-muted-foreground">
                {locale === "ar" ? "المرجع" : "Référence"}
              </span>
              <span className="font-mono text-xs font-bold text-muted-foreground">
                {resolvedReference}
              </span>
            </div>

            {/* Row 5: Matières & Composition / المكونات والمواد (if present) */}
            {(localized.material || product.material) && (
              <div className="py-3.5 grid grid-cols-1 sm:grid-cols-2 gap-1.5 sm:gap-4 items-baseline">
                <span className="font-bold text-muted-foreground">
                  {locale === "ar" ? "المواد والمكونات" : "Matières & Sécurité"}
                </span>
                <span className="text-foreground/90 font-medium">
                  {localized.material || product.material}
                </span>
              </div>
            )}

            {/* Row 6: Expédition & Retours / الشحن والإرجاع */}
            <div className="py-3.5 grid grid-cols-1 sm:grid-cols-2 gap-1.5 sm:gap-4 items-baseline">
              <span className="font-bold text-muted-foreground">
                {locale === "ar" ? "التوصيل والدفع" : "Expédition & Retours"}
              </span>
              <span className="text-foreground/90 font-medium leading-relaxed">
                {locale === "ar"
                  ? "توصيل خلال 24 إلى 48 ساعة لكافة مدن المغرب • الدفع نقداً عند الاستلام بعد معاينة طلبيتك • إرجاع واستبدال بكل سهولة."
                  : "Livraison sous 24 à 48h partout au Maroc • Paiement en espèces à la livraison après vérification • Échange et retour faciles."}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
