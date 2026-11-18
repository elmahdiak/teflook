"use client";

import React from "react";
import Image from "next/image";
import {
  ArrowRight,
  Sparkles,
  ShieldCheck,
  Truck,
  Heart,
  Baby,
  Gift,
  Smile,
  Layers,
} from "lucide-react";

export function MarketplaceHero() {
  const quickCircles = [
    {
      name: "Bébé (0-2 ans)",
      image: "https://images.unsplash.com/photo-1555252333-9f8e92e65df9?q=80&w=400&auto=format&fit=crop",
      href: "#boutique-par-age",
      highlight: "Nouveau-né",
    },
    {
      name: "Mode Enfant",
      image: "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?q=80&w=400&auto=format&fit=crop",
      href: "#vetements-mode",
      highlight: "Bio GOTS",
    },
    {
      name: "Jouets & Éveil",
      image: "https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?q=80&w=400&auto=format&fit=crop",
      href: "#jouets-eveil",
      highlight: "Montessori",
    },
    {
      name: "Hygiène & Soin",
      image: "https://images.unsplash.com/photo-1556228720-195a672e8a03?q=80&w=400&auto=format&fit=crop",
      href: "#hygiene-soin",
      highlight: "Mustela",
    },
    {
      name: "Poussettes & Sièges",
      image: "https://images.unsplash.com/photo-1591088398332-8a7791972843?q=80&w=400&auto=format&fit=crop",
      href: "#equipement-sorties",
      highlight: "i-Size R129",
    },
    {
      name: "Chambre & Literie",
      image: "https://images.unsplash.com/photo-1516627145497-ae6968895b74?q=80&w=400&auto=format&fit=crop",
      href: "#maison-literie",
      highlight: "Sommeil",
    },
    {
      name: "Coffrets Naissance",
      image: "https://images.unsplash.com/photo-1549465220-1a8b9238cd48?q=80&w=400&auto=format&fit=crop",
      href: "#coffrets-cadeaux",
      highlight: "Cadeau",
    },
    {
      name: "Fêtes & Déco",
      image: "https://images.unsplash.com/photo-1530103862676-de8c9debad1d?q=80&w=400&auto=format&fit=crop",
      href: "#fetes-celebrations",
      highlight: "Célébrations",
    },
  ];

  return (
    <div className="w-full bg-[#F8F9FA] border-b border-[#E8E5DF]">
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-5 sm:pt-6 pb-10 sm:pb-12 space-y-8 sm:space-y-10">
        
        {/* ============================================================== */}
        {/* 1. MAIN HERO PROMOTIONAL BANNER                                */}
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
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#FF6B00] text-white text-xs font-black uppercase tracking-wider shadow-md">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Grandes Offres Famille &amp; Éveil</span>
            </div>

            {/* Headline */}
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-[1.15]">
              L&apos;Univers d&apos;Éveil, de Soin &amp; de Sécurité pour{" "}
              <span className="text-[#FF6B00]">vos Enfants</span>
            </h1>

            {/* Subtitle */}
            <p className="text-sm sm:text-base text-slate-300 leading-relaxed font-normal">
              Poussettes compactes, jouets éducatifs Montessori, soins pédiatriques doux et coffrets de naissance livrés à domicile partout au Maroc.
            </p>

            {/* Action Buttons */}
            <div className="pt-2 flex flex-wrap items-center gap-3 sm:gap-4">
              <a
                href="#selection-du-moment"
                className="inline-flex items-center justify-center gap-2.5 px-7 py-3.5 rounded-full bg-[#FF6B00] hover:bg-[#E66000] text-white font-extrabold text-sm shadow-lg shadow-[#FF6B00]/30 hover:-translate-y-0.5 transition-all group"
              >
                <span>Découvrir les Offres</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </a>

              <a
                href="#jouets-eveil"
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-full bg-white/10 hover:bg-white/20 text-white font-bold text-sm backdrop-blur-sm border border-white/20 transition-all"
              >
                <span>Jouets Montessori</span>
              </a>
            </div>

            {/* Reassurance Micro-Row */}
            <div className="pt-4 flex flex-wrap items-center gap-6 text-xs text-slate-300 border-t border-white/10">
              <div className="flex items-center gap-2">
                <Truck className="w-4 h-4 text-[#4A9099]" />
                <span>Livraison 24/48h au Maroc</span>
              </div>
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[#FF6B00]" />
                <span>Paiement à la livraison (COD)</span>
              </div>
              <div className="flex items-center gap-2">
                <Heart className="w-4 h-4 text-rose-400" />
                <span>100% Produits Certifiés</span>
              </div>
            </div>

          </div>
        </div>

        {/* ============================================================== */}
        {/* 2. CLICKABLE CATEGORY CIRCLES UNDERNEATH                       */}
        {/* ============================================================== */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xs sm:text-sm font-extrabold uppercase tracking-widest text-[#4A9099]">
              Explorer par Univers
            </h2>
            <span className="text-xs text-[#94A3B8]">Accès rapide aux rayons</span>
          </div>

          <div className="grid grid-cols-4 sm:grid-cols-4 md:grid-cols-8 gap-3 sm:gap-4 text-center">
            {quickCircles.map((cat) => (
              <a
                key={cat.name}
                href={cat.href}
                className="group flex flex-col items-center p-2.5 sm:p-3 rounded-2xl bg-white hover:bg-[#EBF4F5]/60 border border-[#E8E5DF] hover:border-[#4A9099] shadow-2xs hover:shadow-md transition-all duration-200 cursor-pointer"
              >
                {/* Circular Image Container */}
                <div className="relative w-14 h-14 sm:w-16 sm:h-16 rounded-full overflow-hidden mb-2 border-2 border-[#E8E5DF] group-hover:border-[#4A9099] group-hover:scale-105 transition-all">
                  <Image
                    src={cat.image}
                    alt={cat.name}
                    fill
                    sizes="80px"
                    className="object-cover"
                  />
                </div>

                {/* Label */}
                <span className="text-[11px] sm:text-xs font-bold text-[#1E293B] group-hover:text-[#4A9099] transition-colors line-clamp-1">
                  {cat.name}
                </span>

                {/* Sub-tag */}
                <span className="text-[10px] text-[#FF6B00] font-semibold mt-0.5">
                  {cat.highlight}
                </span>
              </a>
            ))}
          </div>
        </div>

        {/* ============================================================== */}
        {/* 3. SECONDARY PROMOTIONAL BANNERS STRIP (3 High-Impact Cards)   */}
        {/* ============================================================== */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
          
          {/* Banner 1: Maternité & Naissance */}
          <a
            href="#coffrets-cadeaux"
            className="group relative rounded-2xl overflow-hidden p-6 bg-gradient-to-br from-[#FFF2EB] to-[#FFE3D4] border border-[#FFD2BC] shadow-xs hover:shadow-md transition-all flex items-center justify-between"
          >
            <div className="space-y-1.5 z-10 max-w-[65%]">
              <span className="text-[10px] font-black uppercase tracking-wider text-[#FF6B00] bg-white px-2 py-0.5 rounded-full shadow-2xs">
                Pack Maternité
              </span>
              <h3 className="text-base sm:text-lg font-black text-[#1E293B] leading-tight">
                Trousseaux &amp; Boîtes Naissance
              </h3>
              <p className="text-xs text-[#64748B]">Jusqu&apos;à -30% sur les coffrets</p>
            </div>
            <div className="relative w-20 h-20 rounded-2xl overflow-hidden shrink-0 shadow-md group-hover:scale-105 transition-transform">
              <Image
                src="https://images.unsplash.com/photo-1549465220-1a8b9238cd48?q=80&w=300&auto=format&fit=crop"
                alt="Pack Maternité"
                fill
                className="object-cover"
              />
            </div>
          </a>

          {/* Banner 2: Sécurité & Protection */}
          <a
            href="#selection-du-moment"
            className="group relative rounded-2xl overflow-hidden p-6 bg-gradient-to-br from-[#EBF4F5] to-[#D5EAEB] border border-[#BCE1E3] shadow-xs hover:shadow-md transition-all flex items-center justify-between"
          >
            <div className="space-y-1.5 z-10 max-w-[65%]">
              <span className="text-[10px] font-black uppercase tracking-wider text-[#4A9099] bg-white px-2 py-0.5 rounded-full shadow-2xs">
                Sécurité Maison
              </span>
              <h3 className="text-base sm:text-lg font-black text-[#1E293B] leading-tight">
                Kits Protection Domestique
              </h3>
              <p className="text-xs text-[#64748B]">Normes CE &amp; Adhésifs 3M</p>
            </div>
            <div className="relative w-20 h-20 rounded-2xl overflow-hidden shrink-0 shadow-md group-hover:scale-105 transition-transform">
              <Image
                src="https://images.unsplash.com/photo-1584622650111-993a426fbf0a?q=80&w=300&auto=format&fit=crop"
                alt="Sécurité Enfant"
                fill
                className="object-cover"
              />
            </div>
          </a>

          {/* Banner 3: Jeux d'Éveil Montessori */}
          <a
            href="#jouets-eveil"
            className="group relative rounded-2xl overflow-hidden p-6 bg-gradient-to-br from-[#FEF3C7] to-[#FDE68A] border border-[#FCD34D] shadow-xs hover:shadow-md transition-all flex items-center justify-between"
          >
            <div className="space-y-1.5 z-10 max-w-[65%]">
              <span className="text-[10px] font-black uppercase tracking-wider text-amber-800 bg-white px-2 py-0.5 rounded-full shadow-2xs">
                Montessori Lab
              </span>
              <h3 className="text-base sm:text-lg font-black text-[#1E293B] leading-tight">
                Jeux d&apos;Éveil en Bois Sain
              </h3>
              <p className="text-xs text-amber-900/80">Livraison offerte dès 300 DH</p>
            </div>
            <div className="relative w-20 h-20 rounded-2xl overflow-hidden shrink-0 shadow-md group-hover:scale-105 transition-transform">
              <Image
                src="https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?q=80&w=300&auto=format&fit=crop"
                alt="Jeux Montessori"
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
