"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Heart,
  Palette,
  Puzzle,
  Sprout,
  Target,
  UsersRound,
  type LucideIcon,
} from "lucide-react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { StoreCartSheet } from "@/components/cart/StoreCartSheet";
import { CODCheckoutModal } from "@/components/cart/CODCheckoutModal";
import { useCartStore } from "@/lib/shopify-cart";
import type { ChildStoreCategory } from "@/lib/teflook-categories";
import { useTefLookLanguage } from "@/lib/teflook-language";
import { cn } from "@/lib/utils";

interface CollectionCardConfig {
  value: ChildStoreCategory;
  icon: LucideIcon;
  iconColorClass: string;
  iconInnerBgClass: string;
  pillClass: string;
  tagFr: string;
  tagAr: string;
  titleFr: string;
  titleAr: string;
  descFr: string;
  descAr: string;
}

const COLLECTION_CARDS: CollectionCardConfig[] = [
  {
    value: "discipline",
    icon: Target,
    iconColorClass: "text-[#4b9797]",
    iconInnerBgClass: "bg-[#4b9797]/10",
    pillClass: "bg-[#4b9797]/10 text-[#4b9797]",
    tagFr: "MAÎTRISE",
    tagAr: "الانضباط",
    titleFr: "Discipline & gestion de soi",
    titleAr: "الانضباط وإدارة الذات",
    descFr: "Rituels apaisants, concentration et gestion du temps au quotidien.",
    descAr: "روتين يومي هادئ لتنمية التركيز وإدارة الوقت.",
  },
  {
    value: "emotionalIntelligence",
    icon: Heart,
    iconColorClass: "text-[#ff3500]",
    iconInnerBgClass: "bg-[#ff3500]/10",
    pillClass: "bg-[#ff3500]/10 text-[#ff3500]",
    tagFr: "EMPATHIE",
    tagAr: "التعاطف",
    titleFr: "Intelligence émotionnelle",
    titleAr: "الذكاء العاطفي",
    descFr: "Identifier, comprendre et exprimer ses émotions avec sérénité.",
    descAr: "فهم المشاعر والتعبير عنها بهدوء وتوازن.",
  },
  {
    value: "independence",
    icon: Sprout,
    iconColorClass: "text-[#1A3C34]",
    iconInnerBgClass: "bg-[#4b9797]/12",
    pillClass: "bg-[#1A3C34]/10 text-[#1A3C34]",
    tagFr: "AUTONOMIE",
    tagAr: "الاستقلالية",
    titleFr: "Autonomie & compétences de vie",
    titleAr: "الاستقلالية ومهارات الحياة",
    descFr: "Outils concrets pour prendre confiance et agir par soi-même.",
    descAr: "أدوات عملية لاكتساب الاستقلالية والاعتماد على النفس.",
  },
  {
    value: "confidence",
    icon: UsersRound,
    iconColorClass: "text-[#ff3500]",
    iconInnerBgClass: "bg-[#ff3500]/10",
    pillClass: "bg-[#ff3500]/10 text-[#ff3500]",
    tagFr: "SOCIAL",
    tagAr: "التواصل",
    titleFr: "Confiance & compétences sociales",
    titleAr: "الثقة والمهارات الاجتماعية",
    descFr: "Coopération, écoute et affirmation bienveillante en famille ou à l'école.",
    descAr: "تعزيز التواصل الإيجابي، التعاون والثقة بالنفس.",
  },
  {
    value: "creativity",
    icon: Palette,
    iconColorClass: "text-[#d99000]",
    iconInnerBgClass: "bg-[#ffbf00]/15",
    pillClass: "bg-[#ffbf00]/15 text-[#b47b00]",
    tagFr: "IMAGINATION",
    tagAr: "الإبداع",
    titleFr: "Créativité & imagination",
    titleAr: "الإبداع والخيال",
    descFr: "Activités artistiques et manuelles pour créer librement sans écran.",
    descAr: "أنشطة فنية ويدوية لإطلاق العنان للخيال بعيداً عن الشاشات.",
  },
  {
    value: "criticalThinking",
    icon: Puzzle,
    iconColorClass: "text-[#4b9797]",
    iconInnerBgClass: "bg-[#4b9797]/10",
    pillClass: "bg-[#4b9797]/10 text-[#4b9797]",
    tagFr: "LOGIQUE",
    tagAr: "المنطق",
    titleFr: "Pensée critique & résolution de problèmes",
    titleAr: "التفكير النقدي وحل المشكلات",
    descFr: "Défis ludiques et jeux de stratégie pour stimuler la réflexion.",
    descAr: "تحديات ممتعة وألعاب استراتيجية لتنمية التفكير المنطقي.",
  },
];

export function CollectionsPageView() {
  const { locale, direction } = useTefLookLanguage();
  const [isMounted, setIsMounted] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCODModalOpen, setIsCODModalOpen] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    void useCartStore.persist.rehydrate();
  }, []);

  const currentLocale = isMounted ? locale : "fr";
  const currentDirection = isMounted ? direction : "ltr";
  const isAr = currentLocale === "ar";

  return (
    <div
      lang={currentLocale}
      dir={currentDirection}
      className="min-h-screen flex flex-col bg-white text-[#3D524D]"
    >
      <Header onOpenCart={() => setIsCartOpen(true)} defaultSearchOpen={false} />

      <main className="flex-1 bg-white">
        <section
          aria-labelledby="collections-page-heading"
          className="pt-12 sm:pt-16 pb-16 sm:pb-20"
        >
          {/* Editorial Centered Header */}
          <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center mb-6 sm:mb-8">
            <h1
              id="collections-page-heading"
              className={cn(
                "font-display text-3xl sm:text-4xl font-extrabold text-[#1A3C34] text-center mb-4",
                isAr && "font-sans"
              )}
            >
              {isAr ? "مجموعاتنا" : "Nos Collections"}
            </h1>
            <p
              className={cn(
                "text-sm sm:text-base text-[#3D524D] max-w-xl mx-auto leading-relaxed",
                isAr && "font-sans leading-loose"
              )}
            >
              {isAr
                ? "أدوات تعليمية وتطويرية خالية من الشاشات، صُممت بعناية لكل مرحلة من مراحل نمو الطفل."
                : "Des outils d'apprentissage sans écran pensés pour chaque étape de l'enfant."}
            </p>
          </div>

          {/* 6-Category Modern Card Grid — 2 cols on mobile, 2 on sm, 3 on lg */}
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6 max-w-6xl mx-auto px-4 sm:px-6 py-8">
            {COLLECTION_CARDS.map((card) => {
              const Icon = card.icon;
              const tag = isAr ? card.tagAr : card.tagFr;
              const title = isAr ? card.titleAr : card.titleFr;
              const desc = isAr ? card.descAr : card.descFr;

              return (
                <Link
                  key={card.value}
                  href={`/?category=${encodeURIComponent(card.value)}#boutique`}
                  className="bg-white border border-slate-100 rounded-3xl p-3.5 sm:p-6 lg:p-8 shadow-[0_10px_30px_-6px_rgba(26,60,52,0.06)] hover:shadow-[0_20px_40px_-10px_rgba(75,151,151,0.15)] hover:border-[#4b9797]/30 transition-all duration-300 flex flex-col items-center text-center group focus:outline-none focus-visible:ring-2 focus-visible:ring-[#4b9797]"
                >
                  {/* Sleek Rounded Visual Box — smaller on mobile */}
                  <div className="w-14 h-14 sm:w-20 sm:h-20 lg:w-24 lg:h-24 rounded-xl sm:rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center mb-4 sm:mb-6 group-hover:scale-105 transition-transform duration-300">
                    <div
                      className={cn(
                        "size-8 sm:size-12 lg:size-14 rounded-lg sm:rounded-xl flex items-center justify-center transition-transform duration-300",
                        card.iconInnerBgClass
                      )}
                    >
                      <Icon
                        className={cn("size-4 sm:size-6 lg:size-7 stroke-[2.1]", card.iconColorClass)}
                        aria-hidden="true"
                      />
                    </div>
                  </div>

                  {/* Category Tag Pill — tighter on mobile */}
                  <span
                    className={cn(
                      "px-2 py-0.5 sm:px-3 sm:py-1 rounded-full text-[10px] sm:text-xs font-display font-bold mb-2 sm:mb-3",
                      isAr ? "font-sans tracking-normal" : "uppercase tracking-wider",
                      card.pillClass
                    )}
                  >
                    {tag}
                  </span>

                  {/* Category Title — xs on mobile, scales up */}
                  <h2
                    className={cn(
                      "font-display font-bold text-xs sm:text-lg lg:text-xl text-[#1A3C34] leading-snug group-hover:text-[#4b9797] transition-colors",
                      isAr && "font-sans"
                    )}
                  >
                    {title}
                  </h2>

                  {/* Concise Subtitle — hidden on mobile to keep 2-col cards compact */}
                  <p
                    className={cn(
                      "mt-1.5 sm:mt-2.5 hidden sm:block text-xs sm:text-sm text-slate-500 leading-relaxed max-w-xs",
                      isAr && "font-sans leading-loose"
                    )}
                  >
                    {desc}
                  </p>

                  {/* Action Indicator — hidden on mobile, visible sm+ */}
                  <span
                    className={cn(
                      "mt-auto pt-3 sm:pt-5 hidden sm:inline-flex items-center gap-1.5 text-xs font-bold text-[#4b9797] group-hover:text-[#ff3500] transition-colors",
                      isAr && "font-sans"
                    )}
                  >
                    <span>
                      {isAr ? "استكشف المجموعة" : "Explorer la collection"}
                    </span>
                    <ArrowRight
                      size={14}
                      className={cn(
                        "transition-transform duration-200 group-hover:translate-x-0.5",
                        isAr && "rotate-180 group-hover:-translate-x-0.5"
                      )}
                      aria-hidden="true"
                    />
                  </span>
                </Link>
              );
            })}
          </div>
        </section>
      </main>

      <Footer />

      <StoreCartSheet
        open={isCartOpen}
        onOpenChange={setIsCartOpen}
        onOpenCODCheckout={() => setIsCODModalOpen(true)}
      />

      <CODCheckoutModal open={isCODModalOpen} onOpenChange={setIsCODModalOpen} />
    </div>
  );
}
