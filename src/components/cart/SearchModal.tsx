"use client";

import React, { useState, useMemo } from "react";
import Image from "next/image";
import { Search, X, ArrowRight, Tag } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { ALL_PRODUCTS, CATEGORIES } from "@/data/teflookData";

export function SearchModal() {
  const { isSearchOpen, setIsSearchOpen, setActiveQuickProduct, currency } = useCart();
  const [query, setQuery] = useState("");
  const [selectedCat, setSelectedCat] = useState<string>("all");

  const results = useMemo(() => {
    return ALL_PRODUCTS.filter((item) => {
      const matchCat = selectedCat === "all" || item.categorySlug === selectedCat;
      const q = query.trim().toLowerCase();
      if (!q) return matchCat;
      const matchText =
        item.name.toLowerCase().includes(q) ||
        item.description.toLowerCase().includes(q) ||
        item.material.toLowerCase().includes(q) ||
        item.categoryName.toLowerCase().includes(q) ||
        (item.brand && item.brand.toLowerCase().includes(q));
      return matchCat && matchText;
    });
  }, [query, selectedCat]);

  if (!isSearchOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
        onClick={() => setIsSearchOpen(false)}
      />

      {/* Search Container */}
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-[#E8E5DF] z-10 overflow-hidden animate-in fade-in slide-in-from-top-4 duration-200">
        {/* Search Input Bar */}
        <div className="relative flex items-center px-6 py-4 border-b border-[#E8E5DF] bg-[#F9F8F6]">
          <Search className="w-5 h-5 text-[#1A3C34] shrink-0" />
          <input
            type="text"
            placeholder="Rechercher un produit, une marque, un univers (poussette, jouet, biberon)..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
            className="w-full bg-transparent px-4 text-sm sm:text-base text-[#1E293B] placeholder:text-[#94A3B8] focus:outline-none"
          />
          {query && (
            <button
              onClick={() => setQuery("")}
              className="text-[#94A3B8] hover:text-[#1E293B] p-1 mr-2"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={() => setIsSearchOpen(false)}
            className="p-1.5 rounded-full hover:bg-[#E8E5DF] text-[#64748B]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Categories Quick Filter Tags */}
        <div className="flex items-center gap-2 px-6 py-3 border-b border-[#E8E5DF] overflow-x-auto bg-white text-xs scrollbar-none">
          <span className="text-[#64748B] shrink-0 flex items-center gap-1 font-medium">
            <Tag className="w-3 h-3 text-[#C85A32]" /> Filtrer :
          </span>
          <button
            onClick={() => setSelectedCat("all")}
            className={`px-3 py-1 rounded-full whitespace-nowrap transition-colors ${
              selectedCat === "all"
                ? "bg-[#1A3C34] text-white font-semibold"
                : "bg-[#F9F8F6] text-[#334155] hover:bg-[#EDF3F1]"
            }`}
          >
            Tous les outils
          </button>
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCat(cat.slug)}
              className={`px-3 py-1 rounded-full whitespace-nowrap transition-colors ${
                selectedCat === cat.slug
                  ? "bg-[#1A3C34] text-white font-semibold"
                  : "bg-[#F9F8F6] text-[#334155] hover:bg-[#EDF3F1]"
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* Results List */}
        <div className="max-h-[60vh] overflow-y-auto p-4 sm:p-6 space-y-3">
          {results.length === 0 ? (
            <div className="text-center py-10 space-y-2">
              <p className="font-serif-brand text-lg text-[#1E293B]">
                Aucun outil ne correspond à votre recherche
              </p>
              <p className="text-xs text-[#64748B]">
                Essayez d&apos;autres termes comme &quot;autonomie&quot;, &quot;émotions&quot;, ou &quot;logique&quot;.
              </p>
            </div>
          ) : (
            results.map((item) => {
              const price = currency === "MAD" ? item.priceMad : item.priceEur;
              return (
                <div
                  key={item.id}
                  onClick={() => {
                    setActiveQuickProduct(item);
                    setIsSearchOpen(false);
                  }}
                  className="flex items-center justify-between p-3 rounded-2xl hover:bg-[#F9F8F6] border border-transparent hover:border-[#E8E5DF] transition-all cursor-pointer group"
                >
                  <div className="flex items-center gap-3.5">
                    <div className="relative w-14 h-14 rounded-xl overflow-hidden bg-[#F9F8F6] shrink-0 border border-[#E8E5DF]">
                      <Image
                        src={item.images[0]}
                        alt={item.name}
                        fill
                        sizes="56px"
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                    <div>
                      <span className="text-[10px] font-bold tracking-wider uppercase text-[#1A3C34]">
                        {item.categoryName}
                      </span>
                      <h4 className="font-serif-brand font-medium text-sm text-[#1E293B] group-hover:text-[#C85A32] transition-colors">
                        {item.name}
                      </h4>
                      <p className="text-xs text-[#64748B] line-clamp-1">{item.material}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="font-bold text-sm text-[#C85A32]">
                      {price} {currency}
                    </span>
                    <div className="p-1.5 rounded-full bg-[#EDF3F1] text-[#1A3C34] group-hover:bg-[#C85A32] group-hover:text-white transition-colors">
                      <ArrowRight className="w-3.5 h-3.5" />
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
