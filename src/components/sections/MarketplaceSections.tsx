"use client";

import React, { useState, useMemo } from "react";
import Image from "next/image";
import {
  Sparkles,
  ArrowRight,
  Filter,
  Check,
  RotateCcw,
  SlidersHorizontal,
  Compass,
  Brain,
  Search,
} from "lucide-react";
import { ProductCard } from "@/components/ui/ProductCard";
import {
  CATEGORIES,
  AGE_BRACKETS,
  AgeBracket,
  PRODUCTS,
  ProductItem,
} from "@/data/teflookData";

interface MarketplaceSectionsProps {
  initialAge?: string | null;
}

export function MarketplaceSections({
  initialAge = null,
}: MarketplaceSectionsProps) {
  // Dynamic filter states
  const [selectedAges, setSelectedAges] = useState<string[]>(
    initialAge ? [initialAge] : []
  );
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchFilter, setSearchFilter] = useState<string>("");

  // Toggle age bracket selection (multi-select supported)
  const toggleAgeBracket = (bracket: string) => {
    setSelectedAges((prev) => {
      if (prev.includes(bracket)) {
        return prev.filter((a) => a !== bracket);
      } else {
        return [...prev, bracket];
      }
    });
  };

  const clearAllFilters = () => {
    setSelectedAges([]);
    setSelectedCategory("all");
    setSearchFilter("");
  };

  // Filter products based on selected category, age brackets, and search text
  const filteredProducts = useMemo(() => {
    return PRODUCTS.filter((item) => {
      // Category filter
      const matchesCategory =
        selectedCategory === "all" || item.categorySlug === selectedCategory;

      // Age filter: if none selected, all ages match; otherwise must match one of selected ages
      const matchesAge =
        selectedAges.length === 0 || selectedAges.includes(item.ageBracket);

      // Search keyword filter
      const query = searchFilter.trim().toLowerCase();
      const matchesQuery =
        !query ||
        item.name.toLowerCase().includes(query) ||
        item.description.toLowerCase().includes(query) ||
        item.categoryName.toLowerCase().includes(query) ||
        (item.brand && item.brand.toLowerCase().includes(query));

      return matchesCategory && matchesAge && matchesQuery;
    });
  }, [selectedCategory, selectedAges, searchFilter]);

  return (
    <div className="w-full bg-[#F8F9FA] space-y-16 sm:space-y-24 py-10 sm:py-14">
      {/* ============================================================== */}
      {/* 1. DYNAMIC CATALOGUE WITH AGE & CATEGORY FILTERING             */}
      {/* ============================================================== */}
      <section
        id="catalogue-interactif"
        className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 scroll-mt-28"
      >
        <div className="bg-white rounded-3xl p-6 sm:p-8 lg:p-10 border border-[#E8E5DF] shadow-sm">
          {/* Section Header */}
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 pb-6 border-b border-[#F1EFEA] gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-[#4C9A9C]/10 text-[#4C9A9C] border border-[#4C9A9C]/25 mb-2.5">
                <SlidersHorizontal className="w-3.5 h-3.5 text-[#FE7C58]" />
                <span>Système de Filtrage Dynamique</span>
              </div>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-[#1E293B] tracking-tight">
                Catalogue <span className="text-[#FE7C58]">Pédagogique</span>
              </h2>
              <p className="mt-1.5 text-xs sm:text-sm text-[#64748B] max-w-2xl leading-relaxed">
                Filtrez instantanément par <strong>tranche d&apos;âge</strong>{" "}
                et parmi les <strong>6 piliers de développement</strong> pour
                trouver l&apos;outil idéal.
              </p>
            </div>

            {/* Quick Text Filter input */}
            <div className="relative w-full md:w-72">
              <input
                type="text"
                placeholder="Filtrer par mot-clé..."
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                className="w-full h-10 pl-9 pr-3 text-xs rounded-xl bg-[#FAF9F7] border border-[#E8E5DF] focus:border-[#4C9A9C] text-[#1E293B] placeholder:text-[#94A3B8] focus:outline-none transition-all"
              />
              <Search className="w-4 h-4 text-[#94A3B8] absolute left-3 top-1/2 -translate-y-1/2" />
              {searchFilter && (
                <button
                  onClick={() => setSearchFilter("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-[#94A3B8] hover:text-[#1E293B]"
                >
                  ✕
                </button>
              )}
            </div>
          </div>

          {/* ============================================================ */}
          {/* FILTER CONTROLS: AGE (PRIMARY) & CATEGORY PILLS              */}
          {/* ============================================================ */}
          <div className="space-y-5 mb-8">
            {/* Age Filter Row: Exactly the 4 specified age brackets */}
            <div>
              <div className="flex items-center justify-between mb-2.5">
                <span className="text-xs font-extrabold uppercase tracking-wider text-[#1E293B] flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#FE7C58]" />
                  <span>Filtrer par âge (Sélection multiple possible) :</span>
                </span>
                {selectedAges.length > 0 && (
                  <span className="text-[11px] font-bold text-[#FE7C58]">
                    {selectedAges.length} tranche
                    {selectedAges.length > 1 ? "s" : ""} sélectionnée
                    {selectedAges.length > 1 ? "s" : ""}
                  </span>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={() => setSelectedAges([])}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                    selectedAges.length === 0
                      ? "bg-[#1E293B] text-white shadow-xs"
                      : "bg-[#FAF9F7] text-[#334155] hover:bg-[#EBF5F5] border border-[#E8E5DF]"
                  }`}
                >
                  Tous les âges (5 - 15 ans)
                </button>

                {AGE_BRACKETS.map((bracket) => {
                  const isSelected = selectedAges.includes(bracket);
                  return (
                    <button
                      key={bracket}
                      onClick={() => toggleAgeBracket(bracket)}
                      className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-black transition-all ${
                        isSelected
                          ? "bg-[#FE7C58] text-white shadow-md scale-102"
                          : "bg-[#FAF9F7] text-[#334155] hover:bg-[#FDF2EE] hover:text-[#FE7C58] border border-[#E8E5DF]"
                      }`}
                    >
                      {isSelected && (
                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                      )}
                      <span>{bracket}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Category Filter Row: Exactly the 6 official categories */}
            <div>
              <div className="flex items-center justify-between mb-2.5">
                <span className="text-xs font-extrabold uppercase tracking-wider text-[#1E293B] flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#4C9A9C]" />
                  <span>Filtrer par pilier de développement :</span>
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={() => setSelectedCategory("all")}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    selectedCategory === "all"
                      ? "bg-[#4C9A9C] text-white shadow-xs"
                      : "bg-[#FAF9F7] text-[#334155] hover:bg-[#EBF5F5] border border-[#E8E5DF]"
                  }`}
                >
                  Tous les 6 piliers ({PRODUCTS.length})
                </button>

                {CATEGORIES.map((cat, idx) => {
                  const isSelected = selectedCategory === cat.slug;
                  const isOrangeAccent = idx % 2 === 1;

                  return (
                    <button
                      key={cat.id}
                      onClick={() => setSelectedCategory(cat.slug)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                        isSelected
                          ? isOrangeAccent
                            ? "bg-[#FE7C58] text-white shadow-sm"
                            : "bg-[#4C9A9C] text-white shadow-sm"
                          : isOrangeAccent
                          ? "bg-[#FAF9F7] text-[#334155] hover:bg-[#FE7C58]/10 hover:text-[#FE7C58] border border-[#E8E5DF]"
                          : "bg-[#FAF9F7] text-[#334155] hover:bg-[#4C9A9C]/10 hover:text-[#4C9A9C] border border-[#E8E5DF]"
                      }`}
                    >
                      {cat.name}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Active Filters Summary Bar */}
          <div className="p-3.5 rounded-2xl bg-[#FAF9F7] border border-[#E8E5DF] flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex flex-wrap items-center gap-2 text-[#64748B]">
              <span className="font-bold text-[#1E293B]">
                {filteredProducts.length} outil
                {filteredProducts.length > 1 ? "s" : ""} trouvé
                {filteredProducts.length > 1 ? "s" : ""}
              </span>

              {selectedCategory !== "all" && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-[#4C9A9C]/15 text-[#4C9A9C] font-bold text-[11px]">
                  Catégorie :{" "}
                  {
                    CATEGORIES.find((c) => c.slug === selectedCategory)?.name
                  }
                  <button
                    onClick={() => setSelectedCategory("all")}
                    className="hover:text-black font-black ml-1"
                  >
                    ×
                  </button>
                </span>
              )}

              {selectedAges.map((age) => (
                <span
                  key={age}
                  className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-[#FE7C58]/15 text-[#FE7C58] font-bold text-[11px]"
                >
                  Âge : {age}
                  <button
                    onClick={() => toggleAgeBracket(age)}
                    className="hover:text-black font-black ml-1"
                  >
                    ×
                  </button>
                </span>
              ))}

              {searchFilter && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-slate-200 text-[#1E293B] font-bold text-[11px]">
                  Mot-clé : &quot;{searchFilter}&quot;
                  <button
                    onClick={() => setSearchFilter("")}
                    className="hover:text-black font-black ml-1"
                  >
                    ×
                  </button>
                </span>
              )}
            </div>

            {(selectedAges.length > 0 ||
              selectedCategory !== "all" ||
              searchFilter) && (
              <button
                onClick={clearAllFilters}
                className="inline-flex items-center gap-1 text-[11px] font-bold text-[#FE7C58] hover:underline"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Réinitialiser tous les filtres</span>
              </button>
            )}
          </div>

          {/* Filtered Products Grid */}
          <div className="mt-8">
            {filteredProducts.length === 0 ? (
              <div className="text-center py-16 space-y-3 bg-[#FAF9F7] rounded-3xl border border-[#E8E5DF]">
                <Brain className="w-10 h-10 mx-auto text-[#94A3B8]" />
                <h3 className="font-bold text-base text-[#1E293B]">
                  Aucun outil ne correspond à cette combinaison
                </h3>
                <p className="text-xs text-[#64748B] max-w-md mx-auto">
                  Essayez d&apos;élargir les tranches d&apos;âge ou de choisir
                  un autre pilier éducatif.
                </p>
                <button
                  onClick={clearAllFilters}
                  className="mt-2 px-5 py-2.5 rounded-full bg-[#4C9A9C] text-white text-xs font-bold shadow-xs hover:bg-[#3E8688] transition-colors"
                >
                  Voir tous les outils
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6">
                {filteredProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ============================================================== */}
      {/* 2. THE 6 DEDICATED SPOTLIGHT CATEGORY SECTIONS                 */}
      {/* ============================================================== */}
      {CATEGORIES.map((cat, idx) => {
        const isOrangeTheme = idx % 2 === 1;
        const categoryProducts = PRODUCTS.filter(
          (p) => p.categorySlug === cat.slug
        );

        return (
          <section
            key={cat.id}
            id={cat.slug}
            className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 scroll-mt-28"
          >
            {/* Category Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 sm:mb-10 gap-4">
              <div className="max-w-3xl">
                {/* Category Pill Tag */}
                <div
                  className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider border mb-2.5 ${
                    isOrangeTheme
                      ? "bg-[#FE7C58]/10 text-[#FE7C58] border-[#FE7C58]/25"
                      : "bg-[#4C9A9C]/10 text-[#4C9A9C] border-[#4C9A9C]/25"
                  }`}
                >
                  <Sparkles
                    className={`w-3.5 h-3.5 ${
                      isOrangeTheme ? "text-[#FE7C58]" : "text-[#4C9A9C]"
                    }`}
                  />
                  <span>Pilier 0{idx + 1} • {cat.highlight}</span>
                </div>

                {/* Title */}
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-[#1E293B] tracking-tight">
                  {cat.name}
                </h2>

                {/* Subtitle & Description */}
                <p className="mt-2 text-xs sm:text-sm text-[#64748B] leading-relaxed">
                  {cat.description}
                </p>
              </div>

              {/* Quick Filter Jump for this category */}
              <button
                onClick={() => {
                  setSelectedCategory(cat.slug);
                  const el = document.getElementById("catalogue-interactif");
                  if (el) el.scrollIntoView({ behavior: "smooth" });
                }}
                className={`group inline-flex items-center gap-1.5 text-xs sm:text-sm font-extrabold transition-colors shrink-0 ${
                  isOrangeTheme
                    ? "text-[#FE7C58] hover:text-[#E66000]"
                    : "text-[#4C9A9C] hover:text-[#3E8688]"
                }`}
              >
                <span>Filtrer ce pilier par tranche d&apos;âge</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>

            {/* Product Cards for this Category */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6">
              {categoryProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}
