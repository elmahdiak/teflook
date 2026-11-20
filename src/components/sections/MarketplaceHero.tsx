"use client";

import React from "react";
import Image from "next/image";
import {
  ArrowRight,
  Sparkles,
  ShieldCheck,
  Truck,
  Heart,
  Brain,
  Compass,
  Smile,
  Target,
  Palette,
  Lightbulb,
} from "lucide-react";
import { CATEGORIES, AGE_BRACKETS } from "@/data/teflookData";

interface MarketplaceHeroProps {
  selectedAge?: string | null;
  onSelectAge?: (age: string) => void;
}

export function MarketplaceHero({
  selectedAge,
  onSelectAge,
}: MarketplaceHeroProps) {
  const categoryCircles = [
    {
      name: "Discipline & Maîtrise",
      slug: "discipline-maitrise-de-soi",
      image:
        "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?q=80&w=400&auto=format&fit=crop",
      highlight: "Focus",
      color: "#1A3C34",
    },
    {
      name: "Émotions & Empathie",
      slug: "intelligence-emotionnelle",
      image:
        "https://images.unsplash.com/photo-1544717305-2782549b5136?q=80&w=400&auto=format&fit=crop",
      highlight: "Sérénité",
      color: "#C85A32",
    },
    {
      name: "Autonomie & Vie",
      slug: "autonomie-competences-de-vie",
      image:
        "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?q=80&w=400&auto=format&fit=crop",
      highlight: "Pratique",
      color: "#1A3C34",
    },
    {
      name: "Confiance & Social",
      slug: "confiance-en-soi-competences-sociales",
      image:
        "https://images.unsplash.com/photo-1511895426328-dc8714191300?q=80&w=400&auto=format&fit=crop",
      highlight: "Éloquence",
      color: "#C85A32",
    },
    {
      name: "Créativité & Art",
      slug: "creativite-imagination",
      image:
        "https://images.unsplash.com/photo-1513542789411-b6a5d4f31634?q=80&w=400&auto=format&fit=crop",
      highlight: "Inventivité",
      color: "#1A3C34",
    },
    {
      name: "Esprit Critique & Logique",
      slug: "esprit-critique-resolution-problemes",
      image:
        "https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?q=80&w=400&auto=format&fit=crop",
      highlight: "Stratégie",
      color: "#C85A32",
    },
  ];

  return (
    <div className="w-full bg-[#F8F9FA] border-b border-[#E8E5DF]">
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-5 sm:pt-6 pb-10 sm:pb-12 space-y-8 sm:space-y-10">
        {/* ============================================================== */}
        {/* 1. MAIN HERO BANNER (EDUCATIONAL DEVELOPMENT)                  */}
        {/* ============================================================== */}
        <div className="relative w-full rounded-3xl overflow-hidden shadow-xl border border-[#E8E5DF] bg-gradient-to-r from-[#1E293B] via-[#0F172A] to-[#1E293B]">
          {/* Background Photography with Gradient Blend */}
          <div className="absolute inset-0 z-0">
            <Image
              src="https://images.unsplash.com/photo-1609234656388-0ff363383899?q=80&w=2200&auto=format&fit=crop"
              alt="Maison TefLook - Éveil et Famille"
              fill
              priority
              sizes="100vw"
              className="object-cover object-right md:object-center opacity-40 mix-blend-overlay"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-[#0F172A] via-[#0F172A]/85 to-transparent md:to-[#0F172A]/40" />
          </div>

          {/* Banner Text & CTAs */}
          <div className="relative z-10 px-6 sm:px-10 lg:px-14 py-12 sm:py-16 lg:py-20 max-w-2xl text-white space-y-5 sm:space-y-6">
            {/* Promo Tag */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#C85A32] text-white text-xs font-black uppercase tracking-wider shadow-md">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Les 6 Piliers du Développement</span>
            </div>

            {/* Headline */}
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-[1.15]">
              L&apos;Épanouissement Éducatif &amp; le Développement de{" "}
              <span className="text-[#C85A32]">vos Enfants</span>
            </h1>

            {/* Subtitle */}
            <p className="text-sm sm:text-base text-slate-300 leading-relaxed font-normal">
              Outils pédagogiques scientifiquement éprouvés pour cultiver la
              discipline, l&apos;intelligence émotionnelle, l&apos;autonomie, les
              compétences sociales, la créativité et l&apos;esprit critique de 5
              à 15 ans.
            </p>

            {/* Action Buttons */}
            <div className="pt-2 flex flex-wrap items-center gap-3 sm:gap-4">
              <a
                href="#catalogue-interactif"
                className="inline-flex items-center justify-center gap-2.5 px-7 py-3.5 rounded-full bg-[#C85A32] hover:bg-[#E66000] text-white font-extrabold text-sm shadow-lg shadow-[#C85A32]/30 hover:-translate-y-0.5 transition-all group"
              >
                <span>Filtrer par Âge &amp; Catégorie</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </a>

              <a
                href="#discipline-maitrise-de-soi"
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-full bg-white/10 hover:bg-white/20 text-white font-bold text-sm backdrop-blur-sm border border-white/20 transition-all"
              >
                <span>Découvrir les 6 Piliers</span>
              </a>
            </div>

            {/* Reassurance Micro-Row */}
            <div className="pt-4 flex flex-wrap items-center gap-6 text-xs text-slate-300 border-t border-white/10">
              <div className="flex items-center gap-2">
                <Truck className="w-4 h-4 text-[#1A3C34]" />
                <span>Livraison 24/48h au Maroc</span>
              </div>
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[#C85A32]" />
                <span>Paiement à la livraison (COD)</span>
              </div>
              <div className="flex items-center gap-2">
                <Heart className="w-4 h-4 text-rose-400" />
                <span>Outils Validés par Pédopsychologues</span>
              </div>
            </div>
          </div>
        </div>

        {/* ============================================================== */}
        {/* 2. CIRCULAR CATEGORY SHOWCASE (THE 6 OFFICIAL CATEGORIES)      */}
        {/* ============================================================== */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xs sm:text-sm font-extrabold uppercase tracking-widest text-[#1A3C34] flex items-center gap-2">
              <Brain className="w-4 h-4 text-[#C85A32]" />
              <span>Les 6 Piliers Fondamentaux</span>
            </h2>
            <span className="text-xs text-[#94A3B8]">
              Cliquez pour naviguer directement
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4 text-center">
            {categoryCircles.map((cat, idx) => (
              <a
                key={cat.slug}
                href={`#${cat.slug}`}
                className="group flex flex-col items-center p-3 rounded-2xl bg-white hover:bg-[#EDF3F1]/60 border border-[#E8E5DF] hover:border-[#1A3C34] shadow-2xs hover:shadow-md transition-all duration-200 cursor-pointer"
              >
                {/* Circular Image Container */}
                <div
                  className={`relative w-16 h-16 sm:w-18 sm:h-18 rounded-full overflow-hidden mb-2.5 border-2 transition-all group-hover:scale-105 ${
                    idx % 2 === 1
                      ? "border-[#C85A32]/40 group-hover:border-[#C85A32]"
                      : "border-[#1A3C34]/40 group-hover:border-[#1A3C34]"
                  }`}
                >
                  <Image
                    src={cat.image}
                    alt={cat.name}
                    fill
                    sizes="100px"
                    className="object-cover"
                  />
                </div>

                {/* Label */}
                <span className="text-xs font-black text-[#1E293B] group-hover:text-[#1A3C34] transition-colors line-clamp-1">
                  {cat.name}
                </span>

                {/* Sub-tag */}
                <span
                  className="text-[10px] font-extrabold mt-0.5"
                  style={{ color: cat.color }}
                >
                  {cat.highlight}
                </span>
              </a>
            ))}
          </div>
        </div>

        {/* ============================================================== */}
        {/* 3. INTERACTIVE AGE FILTER BAR (QUICK BRACKET SELECTOR)         */}
        {/* ============================================================== */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white border border-[#E8E5DF] shadow-xs">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-[#EDF3F1] text-[#1A3C34] flex items-center justify-center shrink-0">
                <Target className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-extrabold text-sm text-[#1E293B]">
                  Filtrer par Âge
                </h3>
                <p className="text-xs text-[#64748B]">
                  Sélectionnez la tranche d&apos;âge de votre enfant pour voir
                  les outils adaptés :
                </p>
              </div>
            </div>

            {/* The 4 Exact Age Brackets Buttons */}
            <div className="flex flex-wrap items-center gap-2">
              {AGE_BRACKETS.map((bracket) => {
                const isSelected = selectedAge === bracket;
                return (
                  <a
                    key={bracket}
                    href="#catalogue-interactif"
                    onClick={() => onSelectAge && onSelectAge(bracket)}
                    className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer shadow-2xs ${
                      isSelected
                        ? "bg-[#C85A32] text-white shadow-md scale-105"
                        : "bg-[#FAF9F7] text-[#334155] hover:bg-[#EDF3F1] hover:text-[#1A3C34] border border-[#E8E5DF]"
                    }`}
                  >
                    <span>{bracket}</span>
                  </a>
                );
              })}
              {selectedAge && (
                <button
                  onClick={() => onSelectAge && onSelectAge("")}
                  className="text-xs font-bold text-[#94A3B8] hover:text-[#C85A32] px-2 py-1 underline transition-colors"
                >
                  Réinitialiser
                </button>
              )}
            </div>
          </div>
        </div>

        {/* ============================================================== */}
        {/* 4. SECONDARY STRIPS (FOCUSING ON THE CORE BENEFIT AREAS)       */}
        {/* ============================================================== */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
          {/* Banner 1: Intelligence Émotionnelle */}
          <a
            href="#intelligence-emotionnelle"
            className="group relative rounded-2xl overflow-hidden p-6 bg-gradient-to-br from-[#FBF1EC] to-[#FFE3D4] border border-[#FFD2BC] shadow-xs hover:shadow-md transition-all flex items-center justify-between"
          >
            <div className="space-y-1.5 z-10 max-w-[65%]">
              <span className="text-[10px] font-black uppercase tracking-wider text-[#C85A32] bg-white px-2 py-0.5 rounded-full shadow-2xs">
                Intelligence Émotionnelle
              </span>
              <h3 className="text-base sm:text-lg font-black text-[#1E293B] leading-tight">
                Gérer les Émotions &amp; Apaiser le Stress
              </h3>
              <p className="text-xs text-[#64748B]">
                Jeux d&apos;empathie et rituels calmes
              </p>
            </div>
            <div className="relative w-20 h-20 rounded-2xl overflow-hidden shrink-0 shadow-md group-hover:scale-105 transition-transform">
              <Image
                src="https://images.unsplash.com/photo-1544717305-2782549b5136?q=80&w=300&auto=format&fit=crop"
                alt="Intelligence Émotionnelle"
                fill
                className="object-cover"
              />
            </div>
          </a>

          {/* Banner 2: Autonomie & Vie */}
          <a
            href="#autonomie-competences-de-vie"
            className="group relative rounded-2xl overflow-hidden p-6 bg-gradient-to-br from-[#EDF3F1] to-[#D5EAEB] border border-[#BCE1E3] shadow-xs hover:shadow-md transition-all flex items-center justify-between"
          >
            <div className="space-y-1.5 z-10 max-w-[65%]">
              <span className="text-[10px] font-black uppercase tracking-wider text-[#1A3C34] bg-white px-2 py-0.5 rounded-full shadow-2xs">
                Compétences de Vie
              </span>
              <h3 className="text-base sm:text-lg font-black text-[#1E293B] leading-tight">
                Apprendre à Faire Seul avec Fierté
              </h3>
              <p className="text-xs text-[#64748B]">
                Cuisine sûre, routines &amp; responsabilité
              </p>
            </div>
            <div className="relative w-20 h-20 rounded-2xl overflow-hidden shrink-0 shadow-md group-hover:scale-105 transition-transform">
              <Image
                src="https://images.unsplash.com/photo-1584622650111-993a426fbf0a?q=80&w=300&auto=format&fit=crop"
                alt="Autonomie et Compétences"
                fill
                className="object-cover"
              />
            </div>
          </a>

          {/* Banner 3: Esprit Critique */}
          <a
            href="#esprit-critique-resolution-problemes"
            className="group relative rounded-2xl overflow-hidden p-6 bg-gradient-to-br from-[#FEF3C7] to-[#FDE68A] border border-[#FCD34D] shadow-xs hover:shadow-md transition-all flex items-center justify-between"
          >
            <div className="space-y-1.5 z-10 max-w-[65%]">
              <span className="text-[10px] font-black uppercase tracking-wider text-amber-800 bg-white px-2 py-0.5 rounded-full shadow-2xs">
                Esprit Critique
              </span>
              <h3 className="text-base sm:text-lg font-black text-[#1E293B] leading-tight">
                Logique, Énigmes &amp; Déduction
              </h3>
              <p className="text-xs text-amber-900/80">
                Escape games et casse-têtes en bois
              </p>
            </div>
            <div className="relative w-20 h-20 rounded-2xl overflow-hidden shrink-0 shadow-md group-hover:scale-105 transition-transform">
              <Image
                src="https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?q=80&w=300&auto=format&fit=crop"
                alt="Logique et Esprit Critique"
                fill
                className="object-cover"
              />
            </div>
          </a>
        </div>
      </div>
    </div>
  );
}
