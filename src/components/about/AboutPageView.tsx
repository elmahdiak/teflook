"use client";

import React, { useEffect, useState } from "react";
import { Check } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { StoreCartSheet } from "@/components/cart/StoreCartSheet";
import { CODCheckoutModal } from "@/components/cart/CODCheckoutModal";
import { useCartStore } from "@/lib/shopify-cart";
import { useTefLookLanguage } from "@/lib/teflook-language";
import { cn } from "@/lib/utils";

const ABOUT_COPY = {
  fr: {
    title: "À propos de TefLook",
    introOne:
      "Chez TefLook, nous sommes convaincus que chaque enfant de 5 à 15 ans mérite des outils pensés pour cultiver la discipline, l'intelligence émotionnelle, l'autonomie, la confiance en soi et la créativité — loin des écrans.",
    introTwo:
      "Notre mission est simple : « Grandir, ensemble. » Donner aux enfants les moyens de s'épanouir tout en accompagnant les parents avec bienveillance à chaque étape de leur développement.",
    pedagogyHeading: "La pédagogie au cœur de chaque création",
    pedagogyIntro:
      "Chaque coffret et outil TefLook remplace le temps d'écran passif par une expérience d'apprentissage concrète, ludique et structurée, conçue pour :",
    pedagogyChecks: [
      "Développer la concentration et la motricité fine",
      "Renforcer la confiance en soi et la gestion des émotions",
      "Créer des moments complices entre parents et enfants",
    ],
    stagesHeading: "Des outils pensés pour chaque étape (5 à 15 ans)",
    stagesIntro:
      "Parce qu'un enfant de 5 ans n'a pas les mêmes repères qu'un adolescent de 14 ans, chaque création TefLook répond aux besoins précis de quatre tranches d'âge clés (5–6 ans, 7–10 ans, 11–12 ans et 13–15 ans) pour :",
    stagesBullets: [
      {
        lead: "Discipliner",
        rest: "avec bienveillance et autonomie",
      },
      {
        lead: "Comprendre",
        rest: "et exprimer ses émotions",
      },
      {
        lead: "Créer",
        rest: "et imaginer loin des écrans",
      },
      {
        lead: "Grandir",
        rest: "avec assurance et esprit critique",
      },
    ],
    qualityHeading: "Qualité, sécurité et engagement",
    qualityChecks: [
      "Conçu pour les enfants de 5 à 15 ans",
      "Matériaux sûrs, durables et adaptés à chaque âge",
      "100 % sans écran et orienté compétences de vie",
      "Paiement à la livraison et service client 7j/7 au Maroc",
    ],
    promiseHeading: "Plus qu'une boutique, une promesse",
    promiseBody:
      "TefLook, c'est bien plus qu'une boutique de jeux éducatifs. C'est une philosophie de confiance, de partage et d'évolution, pour accompagner chaque enfant et chaque famille au quotidien. À vos côtés, à chaque étape.",
  },
  ar: {
    title: "حول تيفلوك (TefLook)",
    introOne:
      "في تيفلوك، نؤمن بأن كل طفل ويافع من عمر 5 إلى 15 سنة يستحق أدوات تعليمية وتطويرية تنمي لديه الانضباط، والذكاء العاطفي، والاستقلالية، والثقة بالنفس، والإبداع — بعيداً عن الشاشات.",
    introTwo:
      "مهمتنا واضحة وبسيطة: «نكبر، معاً.» تمكين الأطفال من اكتشاف قدراتهم ومرافقة الآباء والأمهات برفق ووعي في كل مرحلة من مراحل نموهم.",
    pedagogyHeading: "التربية والمنهج التعليمي في صلب كل إبداع",
    pedagogyIntro:
      "تم تصميم كل مجموعة وأداة من تيفلوك لتعويض الوقت السلبي أمام الشاشات بتجربة تعلم ملموسة، ممتعة ومنظمة تهدف إلى:",
    pedagogyChecks: [
      "تنمية التركيز والمهارات الحركية الدقيقة",
      "تعزيز الثقة بالنفس وإدارة المشاعر بوعي",
      "خلق لحظات تواصل دافئة ومثمرة بين الآباء والأبناء",
    ],
    stagesHeading: "أدوات مصممة بعناية لكل مرحلة عمرية (من 5 إلى 15 سنة)",
    stagesIntro:
      "لأن احتياجات طفل في الخامسة تختلف عن احتياجات يافع في الرابعة عشرة، يراعي كل منتج من تيفلوك المعالم النمائية لأربع مراحل عمرية أساسية (5–6 سنوات، 7–10 سنوات، 11–12 سنة، و13–15 سنة) من أجل:",
    stagesBullets: [
      {
        lead: "تعزيز الانضباط الإيجابي",
        rest: "وبناء الاستقلالية برفق",
      },
      {
        lead: "فهم المشاعر",
        rest: "والتعبير عنها بثقة وتوازن",
      },
      {
        lead: "الإبداع والخيال",
        rest: "بعيداً عن الشاشات الرقمية",
      },
      {
        lead: "النمو بثقة",
        rest: "وتنمية التفكير النقدي وحل المشكلات",
      },
    ],
    qualityHeading: "الجودة والأمان والالتزام تجاه عائلتكم",
    qualityChecks: [
      "مصمم خصيصاً للأطفال واليافعين من 5 إلى 15 سنة",
      "مواد آمنة ومتينة وملائمة لكل فئة عمرية",
      "خالية 100% من الشاشات وموجهة لاكتساب مهارات الحياة",
      "الدفع عند الاستلام وخدمة عملاء متوفرة طيلة أيام الأسبوع في المغرب",
    ],
    promiseHeading: "أكثر من مجرد متجر، إنه التزام ووعد",
    promiseBody:
      "تيفلوك ليست مجرد متجر للألعاب التعليمية، بل هي فلسفة تقوم على الثقة والمشاركة والتطور المستمر لمرافقة كل طفل وكل أسرة في حياتهم اليومية. بجانبكم، في كل خطوة.",
  },
} as const;

function CheckListItem({ text, isAr }: { text: string; isAr: boolean }) {
  return (
    <li className="flex items-start gap-3">
      <span
        aria-hidden="true"
        className="mt-0.5 inline-flex size-5 shrink-0 items-center justify-center rounded-md bg-[#4b9797]/12 text-[#4b9797]"
      >
        <Check className="size-3.5" strokeWidth={2.75} />
      </span>
      <span className={cn("font-semibold text-[#1A3C34]", isAr && "font-sans")}>
        {text}
      </span>
    </li>
  );
}

export function AboutPageView() {
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
  const copy = ABOUT_COPY[currentLocale];

  return (
    <div
      lang={currentLocale}
      dir={currentDirection}
      className="min-h-screen flex flex-col bg-white text-[#3D524D]"
    >
      <Header onOpenCart={() => setIsCartOpen(true)} defaultSearchOpen={false} />

      <main className="flex-1 bg-white">
        <article
          aria-labelledby="about-page-heading"
          className={cn(
            "max-w-2xl mx-auto px-5 sm:px-6 pt-12 sm:pt-16 pb-20 text-[#3D524D] text-[15px] sm:text-base leading-relaxed",
            isAr && "font-sans"
          )}
        >
          {/* Main Centered Title */}
          <h1
            id="about-page-heading"
            className={cn(
              "font-display text-3xl sm:text-4xl font-extrabold text-[#1A3C34] text-center mb-10",
              isAr && "font-sans"
            )}
          >
            {copy.title}
          </h1>

          {/* Introductory Brand Story Paragraphs */}
          <div className="space-y-5">
            <p>{copy.introOne}</p>
            <p className="font-medium text-[#1A3C34]">{copy.introTwo}</p>
          </div>

          {/* Section 1: Pedagogy */}
          <section className="mt-10">
            <h2
              className={cn(
                "font-display text-lg sm:text-xl font-bold text-[#1A3C34] mb-3.5",
                isAr && "font-sans"
              )}
            >
              {copy.pedagogyHeading}
            </h2>
            <p>{copy.pedagogyIntro}</p>
            <ul className="mt-4 space-y-2.5">
              {copy.pedagogyChecks.map((item) => (
                <CheckListItem key={item} text={item} isAr={isAr} />
              ))}
            </ul>
          </section>

          {/* Section 2: Developmental Stages (5 to 15 years) */}
          <section className="mt-10">
            <h2
              className={cn(
                "font-display text-lg sm:text-xl font-bold text-[#1A3C34] mb-3.5",
                isAr && "font-sans"
              )}
            >
              {copy.stagesHeading}
            </h2>
            <p>{copy.stagesIntro}</p>
            <ul className="mt-4 space-y-2.5 ps-1">
              {copy.stagesBullets.map((item) => (
                <li key={item.lead} className="flex items-start gap-2.5">
                  <span
                    aria-hidden="true"
                    className="mt-2 size-1.5 rounded-full bg-[#ff3500] shrink-0"
                  />
                  <span>
                    <strong className="font-bold text-[#1A3C34]">{item.lead}</strong>{" "}
                    {item.rest}
                  </span>
                </li>
              ))}
            </ul>
          </section>

          {/* Section 3: Quality, Safety & Commitment */}
          <section className="mt-10">
            <h2
              className={cn(
                "font-display text-lg sm:text-xl font-bold text-[#1A3C34] mb-4",
                isAr && "font-sans"
              )}
            >
              {copy.qualityHeading}
            </h2>
            <ul className="space-y-2.5">
              {copy.qualityChecks.map((item) => (
                <CheckListItem key={item} text={item} isAr={isAr} />
              ))}
            </ul>
          </section>

          {/* Section 4: Promise */}
          <section className="mt-10 pt-6 border-t border-slate-100">
            <h2
              className={cn(
                "font-display text-lg sm:text-xl font-bold text-[#1A3C34] mb-3.5",
                isAr && "font-sans"
              )}
            >
              {copy.promiseHeading}
            </h2>
            <p className="font-semibold text-[#1A3C34] leading-relaxed">
              {copy.promiseBody}
            </p>
          </section>
        </article>
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
