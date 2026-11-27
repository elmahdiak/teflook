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
import { getCollectionSlug, type ChildStoreCategory } from "@/lib/teflook-categories";
import type { Locale } from "@/lib/teflook-language";
import { cn } from "@/lib/utils";

export interface CollectionCardConfig {
  value: ChildStoreCategory;
  icon: LucideIcon;
  stripBgClass: string;
  iconColorClass: string;
  titleFr: string;
  titleAr: string;
}

export const TEFLOOK_COLLECTION_CARDS: CollectionCardConfig[] = [
  {
    value: "discipline",
    icon: Target,
    stripBgClass: "bg-[#4B9393]/12",
    iconColorClass: "text-[#4B9393]",
    titleFr: "Discipline & gestion de soi",
    titleAr: "الانضباط وإدارة الذات",
  },
  {
    value: "emotionalIntelligence",
    icon: Heart,
    stripBgClass: "bg-[#F67D56]/12",
    iconColorClass: "text-[#F67D56]",
    titleFr: "Intelligence émotionnelle",
    titleAr: "الذكاء العاطفي",
  },
  {
    value: "independence",
    icon: Sprout,
    stripBgClass: "bg-[#FCC846]/18",
    iconColorClass: "text-[#D4920B]",
    titleFr: "Autonomie & compétences de vie",
    titleAr: "الاستقلالية ومهارات الحياة",
  },
  {
    value: "criticalThinking",
    icon: Puzzle,
    stripBgClass: "bg-[#4B9393]/12",
    iconColorClass: "text-[#4B9393]",
    titleFr: "Pensée critique & logique",
    titleAr: "التفكير النقدي وحل المشكلات",
  },
  {
    value: "confidence",
    icon: UsersRound,
    stripBgClass: "bg-[#F67D56]/12",
    iconColorClass: "text-[#F67D56]",
    titleFr: "Confiance & compétences sociales",
    titleAr: "الثقة والمهارات الاجتماعية",
  },
  {
    value: "creativity",
    icon: Palette,
    stripBgClass: "bg-[#FCC846]/18",
    iconColorClass: "text-[#D4920B]",
    titleFr: "Créativité & imagination",
    titleAr: "الإبداع والخيال",
  },
];

export interface CollectionCardsGridProps {
  locale: Locale;
  activeCategory?: ChildStoreCategory | "all";
  onSelectCategory?: (category: ChildStoreCategory) => void;
  className?: string;
}

/**
 * Shared 2x3 (mobile) / 3x2 (desktop) minimalist collection card grid used on
 * both Accueil and the dedicated /collections page.
 */
export function CollectionCardsGrid({
  locale,
  activeCategory = "all",
  onSelectCategory,
  className,
}: CollectionCardsGridProps) {
  const isAr = locale === "ar";

  return (
    <div className={cn("grid grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 lg:gap-10", className)}>
      {TEFLOOK_COLLECTION_CARDS.map((card) => {
        const Icon = card.icon;
        const isSelected = Boolean(onSelectCategory) && activeCategory === card.value;
        const title = isAr ? card.titleAr : card.titleFr;

        const cardClassName = cn(
          "relative rounded-2xl p-8 sm:p-10 transition-all duration-300 flex flex-col items-center justify-center text-center group focus:outline-none focus-visible:ring-2 focus-visible:ring-[#4B9393] cursor-pointer",
          isSelected
            ? "border-2 border-[#4B9393] bg-[#F4F9F9] shadow-md ring-2 ring-[#4B9393]/15"
            : "bg-white border border-slate-200/80 shadow-[0_2px_12px_-4px_rgba(26,60,52,0.05)] hover:shadow-[0_14px_30px_-8px_rgba(75,147,147,0.16)] hover:border-[#4B9393]/40 hover:-translate-y-0.5"
        );

        const content = (
          <>
            {/* Full-Width Pastel Pill Strip with Centered Icon */}
            <div
              className={cn(
                "relative w-full h-7 sm:h-8 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-5 transition-transform duration-300 group-hover:scale-[1.01]",
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

            {/* Centered Category Title */}
            <h3
              className={cn(
                "font-display font-bold text-[12.5px] sm:text-base lg:text-lg text-[#1A3C34] text-center mx-auto leading-snug group-hover:text-[#4B9393] transition-colors",
                isSelected && "text-[#4B9393]",
                isAr && "font-sans"
              )}
            >
              {title}
            </h3>
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
            href={`/collections/${getCollectionSlug(card.value)}`}
            className={cardClassName}
          >
            {content}
          </Link>
        );
      })}
    </div>
  );
}
