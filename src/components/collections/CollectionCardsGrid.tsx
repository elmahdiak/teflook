"use client";

import React from "react";
import Link from "next/link";
import {
  Check,
  Heart,
  Palette,
  Puzzle,
  Sprout,
  Target,
  UsersRound,
  type LucideIcon,
} from "lucide-react";
import type { ChildStoreCategory } from "@/lib/teflook-categories";
import type { Locale } from "@/lib/teflook-language";
import { cn } from "@/lib/utils";

export interface CollectionCardConfig {
  value: ChildStoreCategory;
  icon: LucideIcon;
  stripBgClass: string;
  iconColorClass: string;
  titleFr: string;
  titleAr: string;
  descFr: string;
  descAr: string;
}

export const TEFLOOK_COLLECTION_CARDS: CollectionCardConfig[] = [
  {
    value: "discipline",
    icon: Target,
    stripBgClass: "bg-[#4B9393]/12",
    iconColorClass: "text-[#4B9393]",
    titleFr: "Discipline & gestion de soi",
    titleAr: "الانضباط وإدارة الذات",
    descFr: "Rituels apaisants, concentration et gestion du temps au quotidien.",
    descAr: "روتين يومي هادئ لتنمية التركيز وإدارة الوقت.",
  },
  {
    value: "emotionalIntelligence",
    icon: Heart,
    stripBgClass: "bg-[#F67D56]/12",
    iconColorClass: "text-[#F67D56]",
    titleFr: "Intelligence émotionnelle",
    titleAr: "الذكاء العاطفي",
    descFr: "Identifier, comprendre et exprimer ses émotions avec sérénité.",
    descAr: "فهم المشاعر والتعبير عنها بهدوء وتوازن.",
  },
  {
    value: "independence",
    icon: Sprout,
    stripBgClass: "bg-[#FCC846]/18",
    iconColorClass: "text-[#D4920B]",
    titleFr: "Autonomie & compétences de vie",
    titleAr: "الاستقلالية ومهارات الحياة",
    descFr: "Outils concrets pour prendre confiance et agir par soi-même.",
    descAr: "أدوات عملية لاكتساب الاستقلالية والاعتماد على النفس.",
  },
  {
    value: "criticalThinking",
    icon: Puzzle,
    stripBgClass: "bg-[#4B9393]/12",
    iconColorClass: "text-[#4B9393]",
    titleFr: "Pensée critique & logique",
    titleAr: "التفكير النقدي وحل المشكلات",
    descFr: "Défis ludiques et jeux de stratégie pour stimuler la réflexion.",
    descAr: "تحديات ممتعة وألعاب استراتيجية لتنمية التفكير المنطقي.",
  },
  {
    value: "confidence",
    icon: UsersRound,
    stripBgClass: "bg-[#F67D56]/12",
    iconColorClass: "text-[#F67D56]",
    titleFr: "Confiance & compétences sociales",
    titleAr: "الثقة والمهارات الاجتماعية",
    descFr: "Coopération, écoute et affirmation bienveillante en famille ou à l'école.",
    descAr: "تعزيز التواصل الإيجابي، التعاون والثقة بالنفس.",
  },
  {
    value: "creativity",
    icon: Palette,
    stripBgClass: "bg-[#FCC846]/18",
    iconColorClass: "text-[#D4920B]",
    titleFr: "Créativité & imagination",
    titleAr: "الإبداع والخيال",
    descFr: "Activités artistiques et manuelles pour créer librement sans écran.",
    descAr: "أنشطة فنية ويدوية لإطلاق العنان للخيال بعيداً عن الشاشات.",
  },
];

export interface CollectionCardsGridProps {
  locale: Locale;
  activeCategory?: ChildStoreCategory | "all";
  onSelectCategory?: (category: ChildStoreCategory) => void;
  className?: string;
}

/**
 * Shared 2x3 (mobile) / 3x2 (desktop) collection card grid used on both
 * Accueil and the dedicated /collections page.
 */
export function CollectionCardsGrid({
  locale,
  activeCategory = "all",
  onSelectCategory,
  className,
}: CollectionCardsGridProps) {
  const isAr = locale === "ar";

  return (
    <div className={cn("grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6", className)}>
      {TEFLOOK_COLLECTION_CARDS.map((card) => {
        const Icon = card.icon;
        const isSelected = Boolean(onSelectCategory) && activeCategory === card.value;
        const title = isAr ? card.titleAr : card.titleFr;
        const desc = isAr ? card.descAr : card.descFr;

        const cardClassName = cn(
          "relative rounded-2xl p-3.5 sm:p-6 transition-all duration-300 flex flex-col items-start text-start group focus:outline-none focus-visible:ring-2 focus-visible:ring-[#4B9393] cursor-pointer",
          isSelected
            ? "border-2 border-[#4B9393] bg-[#F4F9F9] shadow-md ring-2 ring-[#4B9393]/15"
            : "bg-white border border-slate-200/80 shadow-[0_2px_12px_-4px_rgba(26,60,52,0.05)] hover:shadow-[0_14px_30px_-8px_rgba(75,147,147,0.16)] hover:border-[#4B9393]/40 hover:-translate-y-0.5"
        );

        const content = (
          <>
            {/* Full-Width Pastel Pill Strip with Centered Icon */}
            <div
              className={cn(
                "relative w-full h-7 sm:h-8 rounded-full flex items-center justify-center mb-3 sm:mb-5 transition-transform duration-300 group-hover:scale-[1.01]",
                card.stripBgClass
              )}
              aria-hidden="true"
            >
              <Icon
                className={cn("size-4 sm:size-[18px] stroke-[2]", card.iconColorClass)}
              />
              {isSelected && (
                <span className="absolute end-1.5 grid size-4 sm:size-5 place-items-center rounded-full bg-[#4B9393] text-white shadow-xs">
                  <Check size={10} strokeWidth={3} />
                </span>
              )}
            </div>

            {/* Start-Aligned Category Title */}
            <h3
              className={cn(
                "font-display font-bold text-[13px] sm:text-lg text-[#1A3C34] leading-snug group-hover:text-[#4B9393] transition-colors mb-1.5 sm:mb-2",
                isSelected && "text-[#4B9393]",
                isAr && "font-sans"
              )}
            >
              {title}
            </h3>

            {/* Start-Aligned Description */}
            <p
              className={cn(
                "text-[11px] sm:text-[13.5px] text-slate-500 leading-relaxed",
                isAr && "font-sans leading-loose"
              )}
            >
              {desc}
            </p>
          </>
        );

        if (onSelectCategory) {
          return (
            <button
              key={card.value}
              type="button"
              aria-pressed={isSelected}
              onClick={() => onSelectCategory(card.value)}
              className={cardClassName}
            >
              {content}
            </button>
          );
        }

        return (
          <Link
            key={card.value}
            href={`/?category=${encodeURIComponent(card.value)}#boutique`}
            className={cardClassName}
          >
            {content}
          </Link>
        );
      })}
    </div>
  );
}
