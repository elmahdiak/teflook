"use client";

import React from "react";
import Image from "next/image";
import {
  ArrowRight,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  Tag,
  Star,
  Heart,
  Baby,
  Gift,
  Smile,
  Compass,
} from "lucide-react";
import { ProductCard } from "@/components/ui/ProductCard";
import {
  MOMENT_SELECTION_PRODUCTS,
  AGE_PROFILES,
  CLOTHING_PRODUCTS,
  TOYS_PRODUCTS,
  HYGIENE_CARE_PRODUCTS,
  GEAR_PRODUCTS,
  GIFT_SETS_PRODUCTS,
  PARTY_PRODUCTS,
  HOME_NURSERY_PRODUCTS,
  PARTNER_BRANDS,
} from "@/data/teflookData";

interface SectionHeaderProps {
  tag: string;
  title: string;
  titleHighlight?: string;
  subtitle: string;
  viewAllHref?: string;
  tagColor?: string;
}

function SectionHeader({
  tag,
  title,
  titleHighlight,
  subtitle,
  viewAllHref = "#",
  tagColor = "bg-[#4A9099]/10 text-[#4A9099] border-[#4A9099]/25",
}: SectionHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 sm:mb-10 gap-4">
      <div className="max-w-2xl">
        <div
          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider border mb-2 ${tagColor}`}
        >
          <Sparkles className="w-3 h-3 text-[#FF6B00]" />
          <span>{tag}</span>
        </div>
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-[#1E293B] tracking-tight">
          {title}{" "}
          {titleHighlight && (
            <span className="text-[#FF6B00]">{titleHighlight}</span>
          )}
        </h2>
        <p className="mt-1.5 text-xs sm:text-sm text-[#64748B] leading-relaxed">
          {subtitle}
        </p>
      </div>

      <a
        href={viewAllHref}
        className="group inline-flex items-center gap-1.5 text-xs sm:text-sm font-extrabold text-[#FF6B00] hover:text-[#E66000] transition-colors shrink-0"
      >
        <span>Voir tout le rayon</span>
        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
      </a>
    </div>
  );
}

export function MarketplaceSections() {
  return (
    <div className="w-full bg-[#F8F9FA] space-y-16 sm:space-y-24 py-12 sm:py-16">
      
      {/* ============================================================== */}
      {/* 1. SÉLECTION DU MOMENT / PRODUITS VEDETTES                     */}
      {/* ============================================================== */}
      <section id="selection-du-moment" className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeader
          tag="Sélection du Moment"
          title="Produits"
          titleHighlight="Vedettes"
          subtitle="Les articles indispensables les plus plébiscités avec réductions immédiates et garanties."
          tagColor="bg-[#E63946]/10 text-[#E63946] border-[#E63946]/25"
          viewAllHref="#selection-du-moment"
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {MOMENT_SELECTION_PRODUCTS.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      {/* ============================================================== */}
      {/* 2. BOUTIQUE PAR ÂGE / PROFILS                                  */}
      {/* ============================================================== */}
      <section id="boutique-par-age" className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeader
          tag="Guide Développement"
          title="Boutique par"
          titleHighlight="Âge & Profils"
          subtitle="Chaque étape a ses besoins spécifiques. Sélectionnez la tranche d'âge de votre enfant."
          tagColor="bg-[#4A9099]/10 text-[#4A9099] border-[#4A9099]/25"
          viewAllHref="#boutique-par-age"
        />

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 sm:gap-6 text-center">
          {AGE_PROFILES.map((profile) => (
            <a
              key={profile.id}
              href={profile.href}
              className="group flex flex-col items-center p-4 rounded-3xl bg-white hover:bg-[#EBF4F5]/60 border border-[#E8E5DF] hover:border-[#4A9099] shadow-2xs hover:shadow-lg transition-all duration-300 cursor-pointer"
            >
              <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-full overflow-hidden mb-3 border-4 border-[#FAF9F7] group-hover:border-[#4A9099] group-hover:scale-105 transition-all shadow-sm">
                <Image
                  src={profile.imageUrl}
                  alt={profile.title}
                  fill
                  sizes="120px"
                  className="object-cover"
                />
              </div>

              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-[#FF6B00] text-white shadow-2xs mb-1.5">
                {profile.age}
              </span>

              <h3 className="text-xs sm:text-sm font-extrabold text-[#1E293B] group-hover:text-[#4A9099] transition-colors line-clamp-1">
                {profile.title}
              </h3>

              <p className="text-[11px] text-[#94A3B8] mt-0.5 line-clamp-1">
                {profile.subtitle}
              </p>
            </a>
          ))}
        </div>
      </section>

      {/* ============================================================== */}
      {/* 3. VÊTEMENTS & MODE                                            */}
      {/* ============================================================== */}
      <section id="vetements-mode" className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeader
          tag="Coton Biologique GOTS"
          title="Vêtements &"
          titleHighlight="Mode Enfants"
          subtitle="Des matières saines et respirantes, conçues pour préserver la peau sensible de bébé."
          tagColor="bg-[#FF6B00]/10 text-[#FF6B00] border-[#FF6B00]/25"
          viewAllHref="#vetements-mode"
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {CLOTHING_PRODUCTS.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      {/* ============================================================== */}
      {/* 4. JOUETS & ÉVEIL                                              */}
      {/* ============================================================== */}
      <section id="jouets-eveil" className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeader
          tag="Méthode Montessori"
          title="Jouets &"
          titleHighlight="Éveil Sensoriel"
          subtitle="Formes en bois de hêtre poli, textures tactiles et jeux libres pour apprendre en s'amusant."
          tagColor="bg-amber-100 text-amber-800 border-amber-300"
          viewAllHref="#jouets-eveil"
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {TOYS_PRODUCTS.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      {/* ============================================================== */}
      {/* 5. HYGIÈNE, SOIN & BEAUTÉ                                      */}
      {/* ============================================================== */}
      <section id="hygiene-soin" className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeader
          tag="Parapharmacie Bébé"
          title="Hygiène, Soin &"
          titleHighlight="Beauté"
          subtitle="Formules hypoallergéniques testées sous contrôle pédiatrique et dermatologique."
          tagColor="bg-emerald-50 text-emerald-700 border-emerald-200"
          viewAllHref="#hygiene-soin"
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {HYGIENE_CARE_PRODUCTS.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      {/* ============================================================== */}
      {/* 6. ÉQUIPEMENT & SORTIES (POUSSETTES & SIÈGES AUTO)             */}
      {/* ============================================================== */}
      <section id="equipement-sorties" className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeader
          tag="Sécurité R129 i-Size"
          title="Équipement &"
          titleHighlight="Sorties"
          subtitle="Poussettes homologuées cabine avion, sièges auto pivotants 360° et porte-bébés ergonomiques."
          tagColor="bg-blue-50 text-blue-700 border-blue-200"
          viewAllHref="#equipement-sorties"
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {GEAR_PRODUCTS.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      {/* ============================================================== */}
      {/* 7. COFFRETS CADEAUX & BOÎTES SURPRISES                         */}
      {/* ============================================================== */}
      <section id="coffrets-cadeaux" className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeader
          tag="Prêt à Offrir"
          title="Coffrets Cadeaux &"
          titleHighlight="Boîtes Surprises"
          subtitle="Le cadeau de naissance parfait : trousseaux raffinés présentés dans de superbes boîtes ruban."
          tagColor="bg-rose-50 text-rose-700 border-rose-200"
          viewAllHref="#coffrets-cadeaux"
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {GIFT_SETS_PRODUCTS.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      {/* ============================================================== */}
      {/* 8. FÊTES & CÉLÉBRATIONS                                        */}
      {/* ============================================================== */}
      <section id="fetes-celebrations" className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeader
          tag="Aqiqah, Baptême & Anniversaire"
          title="Fêtes &"
          titleHighlight="Célébrations"
          subtitle="Décorations thématiques, costumes confortables et boîtes souvenirs pour marquer les moments précieux."
          tagColor="bg-purple-50 text-purple-700 border-purple-200"
          viewAllHref="#fetes-celebrations"
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {PARTY_PRODUCTS.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      {/* ============================================================== */}
      {/* 9. ESSENTIELS DE LA MAISON & LITERIE                           */}
      {/* ============================================================== */}
      <section id="maison-literie" className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeader
          tag="Sommeil & Sérénité"
          title="Essentiels Maison &"
          titleHighlight="Literie"
          subtitle="Gigoteuses respirantes, coussins d'allaitement et tapis d'éveil grand format pour un cocon douillet."
          tagColor="bg-teal-50 text-teal-700 border-teal-200"
          viewAllHref="#maison-literie"
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {HOME_NURSERY_PRODUCTS.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      {/* ============================================================== */}
      {/* 10. NOS MARQUES PARTENAIRES / EXPLORER PAR MARQUE              */}
      {/* ============================================================== */}
      <section id="marques-partenaires" className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeader
          tag="Marques Officielles"
          title="Nos Marques"
          titleHighlight="Partenaires"
          subtitle="Nous distribuons exclusivement les marques de référence conformes aux normes sanitaires et pédiatriques."
          tagColor="bg-[#4A9099]/10 text-[#4A9099] border-[#4A9099]/25"
          viewAllHref="#marques-partenaires"
        />

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-4 sm:gap-5 text-center">
          {PARTNER_BRANDS.map((brand) => (
            <div
              key={brand.name}
              className="group p-5 rounded-2xl bg-white hover:bg-[#EBF4F5]/60 border border-[#E8E5DF] hover:border-[#4A9099] shadow-2xs hover:shadow-md transition-all duration-200 flex flex-col items-center justify-center min-h-[120px]"
            >
              <span
                className="text-lg font-black tracking-tight group-hover:scale-105 transition-transform"
                style={{ color: brand.color }}
              >
                {brand.logoText}
              </span>
              <span className="text-[11px] font-bold text-[#1E293B] mt-2 line-clamp-1">
                {brand.name}
              </span>
              <span className="text-[9px] text-[#94A3B8] line-clamp-1 mt-0.5">
                {brand.tagline}
              </span>
            </div>
          ))}
        </div>
      </section>

    </div>
  );
}
