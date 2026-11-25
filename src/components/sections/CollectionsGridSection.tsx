"use client";

import React, { useState } from "react";
import Image from "next/image";
import { ArrowRight, ShoppingBag, Eye, Star, Sparkles } from "lucide-react";
import { CATEGORIES, PRODUCTS } from "@/data/teflookData";
import { useCart } from "@/context/CartContext";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export function CollectionsGridSection() {
  const { addToCart, setActiveQuickProduct, currency } = useCart();
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  const filteredProducts =
    selectedCategory === "all"
      ? PRODUCTS
      : PRODUCTS.filter((p) => p.categorySlug === selectedCategory);

  return (
    <section id="collections" className="py-16 sm:py-24 bg-[#FBF9F5] border-b border-[#E8E5DF]">
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-14 space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-[#EBF5F5] border border-[#4C9A9C]/30 text-xs font-semibold text-[#4C9A9C]">
            <Sparkles className="w-3.5 h-3.5 text-[#FE7C58]" />
            <span>Collections Officielles TefLook</span>
          </div>
          <h2 className="font-serif-brand text-3xl sm:text-4xl md:text-5xl font-bold text-[#1E293B] tracking-tight">
            Nos Collections Emblématiques
          </h2>
          <p className="font-arabic text-lg text-[#FE7C58] font-semibold">
            مجموعاتنا الراقية من البلغة، الصنادل والجلد المغربي الفاخر
          </p>
          <p className="text-sm sm:text-base text-[#334155] leading-relaxed">
            Six univers d&apos;artisanat d&apos;exception. Du raffinement des babouches d&apos;apparat aux sabots en bois de cèdre sculpté, chaque création TefLook célèbre l&apos;élégance marocaine.
          </p>
        </div>

        {/* 6 Category Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 mb-16">
          {CATEGORIES.map((cat) => (
            <div
              key={cat.id}
              onClick={() => setSelectedCategory(cat.slug)}
              className={`group relative rounded-3xl overflow-hidden bg-white border border-[#E8E5DF] shadow-xs hover:shadow-xl transition-all duration-300 cursor-pointer ${
                selectedCategory === cat.slug ? "ring-2 ring-[#FE7C58] shadow-md" : ""
              }`}
            >
              {/* Image & Overlay */}
              <div className="relative aspect-4/3 w-full overflow-hidden bg-[#FBF9F5]">
                <Image
                  src={cat.imageUrl}
                  alt={cat.name}
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  className="object-cover group-hover:scale-108 transition-transform duration-500 ease-out"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#1E293B]/85 via-[#1E293B]/25 to-transparent opacity-80 group-hover:opacity-95 transition-opacity" />
                
                {/* Category Badge */}
                <div className="absolute top-4 left-4">
                  <Badge variant="orange">{cat.highlight}</Badge>
                </div>

                {/* Item Count */}
                <div className="absolute top-4 right-4 bg-white/95 backdrop-blur-xs text-[#1E293B] text-xs font-semibold px-2.5 py-1 rounded-full shadow-xs">
                  {cat.itemCount} modèles
                </div>

                {/* Text inside banner bottom */}
                <div className="absolute bottom-4 left-4 right-4 text-white">
                  <p className="font-arabic text-sm text-[#FE7C58] font-bold leading-none mb-1">
                    {cat.nameAr}
                  </p>
                  <h3 className="font-serif-brand text-2xl font-bold tracking-tight leading-tight group-hover:text-[#FE7C58] transition-colors">
                    {cat.name}
                  </h3>
                  <p className="text-xs text-[#CBD5E1] mt-1 line-clamp-1">
                    {cat.subtitle}
                  </p>
                </div>
              </div>

              {/* Card Bottom Meta */}
              <div className="p-5 flex items-center justify-between bg-white">
                <p className="text-xs text-[#64748B] line-clamp-2 pr-2">
                  {cat.description}
                </p>
                <div className="w-9 h-9 rounded-full bg-[#EBF5F5] border border-[#4C9A9C]/30 flex items-center justify-center text-[#4C9A9C] group-hover:bg-[#FE7C58] group-hover:text-white transition-all shrink-0">
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Category Navigation Pills */}
        <div id="sabots-babouches" className="pt-8">
          <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
            <div>
              <h3 className="font-serif-brand text-2xl sm:text-3xl font-bold text-[#1E293B]">
                Pièces Disponibles à la Commande
              </h3>
              <p className="text-xs sm:text-sm text-[#64748B]">
                {selectedCategory === "all"
                  ? "Toutes nos créations en cuir véritable confectionnées à la main"
                  : `Filtré par : ${
                      CATEGORIES.find((c) => c.slug === selectedCategory)?.name
                    }`}
              </p>
            </div>

            {/* Filter buttons */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
              <button
                onClick={() => setSelectedCategory("all")}
                className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                  selectedCategory === "all"
                    ? "bg-[#4C9A9C] text-white shadow-xs"
                    : "bg-white text-[#334155] border border-[#E8E5DF] hover:bg-[#EBF5F5] hover:text-[#4C9A9C]"
                }`}
              >
                Tous ({PRODUCTS.length})
              </button>
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.slug)}
                  className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                    selectedCategory === cat.slug
                      ? "bg-[#4C9A9C] text-white shadow-xs"
                      : "bg-white text-[#334155] border border-[#E8E5DF] hover:bg-[#EBF5F5] hover:text-[#4C9A9C]"
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </div>

          {/* Product Items Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-3 gap-y-6 sm:gap-x-6 sm:gap-y-8 pt-4">
            {filteredProducts.map((product) => {
              const price = currency === "MAD" ? product.priceMad : product.priceEur;
              return (
                <div
                  key={product.id}
                  className="group rounded-2xl sm:rounded-3xl bg-white border border-[#E8E5DF] shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col justify-between overflow-hidden"
                >
                  {/* Image Container */}
                  <div className="relative aspect-square w-full overflow-hidden bg-[#FBF9F5]">
                    <Image
                      src={product.images[0]}
                      alt={product.name}
                      fill
                      sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                      className="object-cover group-hover:scale-108 transition-transform duration-500"
                    />

                    {/* Badge */}
                    {product.badge && (
                      <div className="absolute top-2 left-2 sm:top-3 sm:left-3">
                        <Badge variant="orange" className="text-[10px] sm:text-xs px-2 sm:px-2.5 py-0.5">{product.badge}</Badge>
                      </div>
                    )}

                    {/* Quick View Button on Hover */}
                    <div className="absolute inset-0 bg-[#1E293B]/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => setActiveQuickProduct(product)}
                        className="bg-white/95 text-[#1E293B] text-xs gap-1.5 shadow-lg hover:text-[#4C9A9C]"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        Aperçu
                      </Button>
                      <Button
                        size="sm"
                        variant="orange"
                        onClick={() => addToCart(product, product.sizes[0])}
                        className="text-xs gap-1.5 shadow-lg"
                      >
                        <ShoppingBag className="w-3.5 h-3.5" />
                        Ajouter
                      </Button>
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="p-2.5 sm:p-5 flex-1 flex flex-col justify-between space-y-2 sm:space-y-3">
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-[10px] sm:text-[11px] text-[#4C9A9C] font-bold uppercase tracking-wider gap-1">
                        <span className="truncate">{product.categoryName}</span>
                        <div className="flex items-center gap-0.5 sm:gap-1 text-[#FE7C58] shrink-0">
                          <Star className="w-3 h-3 fill-[#FE7C58]" />
                          <span className="text-[#1E293B] font-semibold">{product.rating}</span>
                        </div>
                      </div>
                      <h4
                        onClick={() => setActiveQuickProduct(product)}
                        className="font-serif-brand font-bold text-xs sm:text-base text-[#1E293B] group-hover:text-[#4C9A9C] transition-colors cursor-pointer line-clamp-2 sm:line-clamp-1 min-h-[2.4em] sm:min-h-0"
                      >
                        {product.name}
                      </h4>
                      <p className="hidden sm:block text-xs text-[#64748B] line-clamp-2">
                        {product.description}
                      </p>
                    </div>

                    <div className="pt-2 border-t border-[#F1F5F9] flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div>
                        <span className="text-[10px] text-[#64748B] block">Prix atelier</span>
                        <span className="font-bold text-sm sm:text-lg text-[#4C9A9C] whitespace-nowrap">
                          {price} {currency}
                        </span>
                      </div>
                      <Button
                        variant="orange"
                        size="sm"
                        onClick={() => addToCart(product, product.sizes[0])}
                        className="w-full sm:w-auto text-xs shadow-xs whitespace-nowrap"
                      >
                        Commander
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
