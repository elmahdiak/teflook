"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
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
  stripBgClass: string;
  iconColorClass: string;
  titleFr: string;
  titleAr: string;
  descFr: string;
  descAr: string;
}

const COLLECTION_CARDS: CollectionCardConfig[] = [
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
      className="min-h-screen flex flex-col bg-[#F7FAFA] text-[#1A3C34]"
    >
      <Header onOpenCart={() => setIsCartOpen(true)} defaultSearchOpen={false} />

      <main className="flex-1 bg-[#F7FAFA]">
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

          {/* 6-Category Clean Card Grid — Pill Icon Strip + Start-Aligned Editorial Card */}
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6 max-w-6xl mx-auto px-4 sm:px-6 py-4 sm:py-6">
            {COLLECTION_CARDS.map((card) => {
              const Icon = card.icon;
              const title = isAr ? card.titleAr : card.titleFr;
              const desc = isAr ? card.descAr : card.descFr;

              return (
                <Link
                  key={card.value}
                  href={`/?category=${encodeURIComponent(card.value)}#boutique`}
                  className="bg-white border border-slate-200/80 rounded-2xl p-3.5 sm:p-6 shadow-[0_2px_12px_-4px_rgba(26,60,52,0.05)] hover:shadow-[0_14px_30px_-8px_rgba(75,147,147,0.16)] hover:border-[#4B9393]/40 hover:-translate-y-0.5 transition-all duration-300 flex flex-col items-start text-start group focus:outline-none focus-visible:ring-2 focus-visible:ring-[#4B9393]"
                >
                  {/* Full-Width Pastel Pill Strip with Centered Icon */}
                  <div
                    className={cn(
                      "w-full h-7 sm:h-8 rounded-full flex items-center justify-center mb-3 sm:mb-5 transition-transform duration-300 group-hover:scale-[1.01]",
                      card.stripBgClass
                    )}
                    aria-hidden="true"
                  >
                    <Icon
                      className={cn("size-4 sm:size-[18px] stroke-[2]", card.iconColorClass)}
                    />
                  </div>

                  {/* Start-Aligned Category Title */}
                  <h2
                    className={cn(
                      "font-display font-bold text-[13px] sm:text-lg text-[#1A3C34] leading-snug group-hover:text-[#4B9393] transition-colors mb-1.5 sm:mb-2",
                      isAr && "font-sans"
                    )}
                  >
                    {title}
                  </h2>

                  {/* Start-Aligned Description */}
                  <p
                    className={cn(
                      "text-[11px] sm:text-[13.5px] text-slate-500 leading-relaxed",
                      isAr && "font-sans leading-loose"
                    )}
                  >
                    {desc}
                  </p>
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
