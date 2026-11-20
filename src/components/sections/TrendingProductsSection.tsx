"use client";

import React, { useState } from "react";
import Image from "next/image";
import {
  Star,
  ShoppingBag,
  Eye,
  Check,
  ShieldCheck,
  Sparkles,
  Heart,
  ArrowRight,
  Truck,
} from "lucide-react";
import { useCart } from "@/context/CartContext";
import { PRODUCTS, ProductItem } from "@/data/teflookData";

export function TrendingProductsSection() {
  const { addToCart, setActiveQuickProduct, currency } = useCart();
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [addedId, setAddedId] = useState<string | null>(null);

  // Extract the 3 flagship trending products
  const trendingProducts: ProductItem[] = PRODUCTS.filter(
    (p) =>
      p.id === "prod-trend-1" ||
      p.id === "prod-trend-2" ||
      p.id === "prod-trend-3"
  );

  const filteredProducts =
    selectedCategory === "all"
      ? trendingProducts
      : trendingProducts.filter((p) => p.categorySlug === selectedCategory);

  const handleAddToCart = (product: ProductItem) => {
    addToCart(product);
    setAddedId(product.id);
    setTimeout(() => {
      setAddedId((curr) => (curr === product.id ? null : curr));
    }, 1800);
  };

  return (
    <section id="produits-tendances" className="py-16 sm:py-24 bg-[#FAF9F7] border-b border-[#E8E5DF]">
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* ============================================================== */}
        {/* SECTION HEADER                                                 */}
        {/* ============================================================== */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 sm:mb-14 gap-6">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#C85A32]/10 text-[#C85A32] border border-[#C85A32]/25 text-xs font-extrabold uppercase tracking-wider mb-2.5">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Sélection Coup de Cœur</span>
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-[#1E293B] tracking-tight">
              Produits <span className="text-[#C85A32]">Tendances</span>
            </h2>
            <p className="mt-3 text-sm sm:text-base text-[#64748B] leading-relaxed">
              Découvrez nos indispensables plébiscités par des milliers de familles marocaines pour la sécurité, l&apos;éveil sensoriel et les moments complices partagés.
            </p>
          </div>

          {/* Quick Filter Category Tabs */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setSelectedCategory("all")}
              className={`px-4 py-2 rounded-full text-xs font-bold transition-all ${
                selectedCategory === "all"
                  ? "bg-[#1A3C34] text-white shadow-sm"
                  : "bg-white text-[#475569] hover:bg-[#EDF3F1] border border-[#E8E5DF]"
              }`}
            >
              Tous ({trendingProducts.length})
            </button>
            <button
              onClick={() => setSelectedCategory("protection-enfant")}
              className={`px-4 py-2 rounded-full text-xs font-bold transition-all ${
                selectedCategory === "protection-enfant"
                  ? "bg-[#1A3C34] text-white shadow-sm"
                  : "bg-white text-[#475569] hover:bg-[#EDF3F1] border border-[#E8E5DF]"
              }`}
            >
              Protection
            </button>
            <button
              onClick={() => setSelectedCategory("jouets-eveil")}
              className={`px-4 py-2 rounded-full text-xs font-bold transition-all ${
                selectedCategory === "jouets-eveil"
                  ? "bg-[#1A3C34] text-white shadow-sm"
                  : "bg-white text-[#475569] hover:bg-[#EDF3F1] border border-[#E8E5DF]"
              }`}
            >
              Éveil
            </button>
            <button
              onClick={() => setSelectedCategory("connexion-parents-enfants")}
              className={`px-4 py-2 rounded-full text-xs font-bold transition-all ${
                selectedCategory === "connexion-parents-enfants"
                  ? "bg-[#1A3C34] text-white shadow-sm"
                  : "bg-white text-[#475569] hover:bg-[#EDF3F1] border border-[#E8E5DF]"
              }`}
            >
              Connexion
            </button>
          </div>
        </div>

        {/* ============================================================== */}
        {/* PRODUCT CARDS GRID (3 Columns Matching Reference)             */}
        {/* ============================================================== */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {filteredProducts.map((product) => {
            const isAdded = addedId === product.id;

            return (
              <div
                key={product.id}
                className="group flex flex-col bg-white rounded-3xl overflow-hidden border border-[#E8E5DF] hover:border-[#1A3C34]/40 hover:shadow-xl hover:shadow-[#1A3C34]/10 transition-all duration-300"
              >
                {/* 1. Card Media & Image Showcase */}
                <div className="relative aspect-4/3 w-full overflow-hidden bg-slate-50 cursor-pointer">
                  <Image
                    src={product.images[0]}
                    alt={product.name}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    className="object-cover object-center group-hover:scale-106 transition-transform duration-700 ease-out"
                    onClick={() => setActiveQuickProduct(product)}
                  />

                  {/* Gradient Overlay on Hover */}
                  <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity" />

                  {/* Top Left Badge */}
                  <div className="absolute top-3.5 left-3.5 z-10 flex flex-col gap-1.5">
                    {product.badge && (
                      <span className="px-3 py-1 rounded-full text-xs font-extrabold tracking-wide uppercase bg-[#C85A32] text-white shadow-md">
                        {product.badge}
                      </span>
                    )}
                  </div>

                  {/* Top Right Quick View Action */}
                  <div className="absolute top-3.5 right-3.5 z-10 opacity-0 group-hover:opacity-100 transition-all duration-200 translate-y-1 group-hover:translate-y-0">
                    <button
                      onClick={() => setActiveQuickProduct(product)}
                      className="p-2.5 rounded-full bg-white/95 hover:bg-white text-[#1E293B] hover:text-[#1A3C34] shadow-lg transition-transform hover:scale-110 active:scale-95"
                      aria-label="Aperçu rapide"
                      title="Aperçu rapide"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Category Pill Tag at Bottom of Image */}
                  <div className="absolute bottom-3 left-3.5 z-10">
                    <span className="px-2.5 py-1 rounded-lg bg-white/90 backdrop-blur-md text-[11px] font-bold text-[#1A3C34] border border-white/40 shadow-xs">
                      {product.categoryName}
                    </span>
                  </div>
                </div>

                {/* 2. Card Content & Details */}
                <div className="flex-1 p-5 sm:p-6 flex flex-col justify-between">
                  <div>
                    {/* Star Rating & Reviews Count */}
                    <div className="flex items-center gap-1.5 mb-2.5">
                      <div className="flex items-center text-amber-400">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-4 h-4 ${
                              i < Math.floor(product.rating)
                                ? "fill-amber-400 text-amber-400"
                                : "text-slate-200 fill-slate-200"
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-xs font-extrabold text-[#1E293B]">
                        {product.rating.toFixed(1)}
                      </span>
                      <span className="text-xs text-[#94A3B8]">
                        ({product.reviewsCount} avis)
                      </span>
                    </div>

                    {/* Product Name */}
                    <h3
                      onClick={() => setActiveQuickProduct(product)}
                      className="font-bold text-lg sm:text-xl text-[#1E293B] group-hover:text-[#1A3C34] transition-colors cursor-pointer line-clamp-1"
                    >
                      {product.name}
                    </h3>

                    {/* Short Description */}
                    <p className="mt-2 text-xs sm:text-sm text-[#64748B] line-clamp-2 leading-relaxed">
                      {product.description}
                    </p>

                    {/* Key Feature Highlight Pill */}
                    {product.features && product.features[0] && (
                      <div className="mt-3.5 flex items-center gap-1.5 text-xs text-[#1A3C34] font-medium bg-[#EDF3F1] px-2.5 py-1 rounded-lg w-fit">
                        <Check className="w-3.5 h-3.5 text-[#1A3C34] stroke-[2.5]" />
                        <span className="line-clamp-1">{product.features[0]}</span>
                      </div>
                    )}
                  </div>

                  {/* 3. Card Footer: Price & Add to Cart Button */}
                  <div className="mt-6 pt-4 border-t border-[#F1EFEA] flex items-center justify-between gap-3">
                    {/* Formatted Price */}
                    <div>
                      <span className="text-[11px] font-semibold text-[#94A3B8] block uppercase">
                        Prix unitaire
                      </span>
                      <div className="flex items-baseline gap-1">
                        <span className="text-xl sm:text-2xl font-black text-[#1E293B]">
                          {currency === "MAD"
                            ? `${product.priceMad} MAD`
                            : `${product.priceEur.toFixed(2).replace(".", ",")} €`}
                        </span>
                      </div>
                    </div>

                    {/* Interactive "Ajouter au panier" Button */}
                    <button
                      onClick={() => handleAddToCart(product)}
                      disabled={isAdded}
                      className={`relative inline-flex items-center gap-2 px-5 py-3 rounded-full font-bold text-xs sm:text-sm transition-all duration-200 active:scale-95 shadow-md ${
                        isAdded
                          ? "bg-emerald-600 text-white cursor-default"
                          : "bg-[#C85A32] hover:bg-[#E66000] text-white hover:shadow-lg hover:shadow-[#C85A32]/25"
                      }`}
                      aria-label={`Ajouter ${product.name} au panier`}
                    >
                      {isAdded ? (
                        <>
                          <Check className="w-4 h-4 stroke-[3] animate-in zoom-in" />
                          <span>Ajouté !</span>
                        </>
                      ) : (
                        <>
                          <ShoppingBag className="w-4 h-4" />
                          <span>Ajouter au panier</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* ============================================================== */}
        {/* BOTTOM GUARANTEE BANNER                                        */}
        {/* ============================================================== */}
        <div className="mt-12 sm:mt-16 p-6 sm:p-8 rounded-3xl bg-white border border-[#E8E5DF] shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center md:text-left">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-[#EDF3F1] text-[#1A3C34] flex items-center justify-center shrink-0">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-bold text-[#1E293B] text-sm">Garantie Qualité &amp; Sécurité</h4>
                <p className="text-xs text-[#64748B] mt-0.5">Certifié non toxique et testé pour la petite enfance</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-[#FBF1EC] text-[#C85A32] flex items-center justify-center shrink-0">
                <Truck className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-bold text-[#1E293B] text-sm">Expédition Express 24h/48h</h4>
                <p className="text-xs text-[#64748B] mt-0.5">Livraison rapide à domicile partout au Maroc</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-[#EDF3F1] text-[#1A3C34] flex items-center justify-center shrink-0">
                <Heart className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-bold text-[#1E293B] text-sm">Service Client Dédié</h4>
                <p className="text-xs text-[#64748B] mt-0.5">Assistance conseils 7j/7 par WhatsApp et téléphone</p>
              </div>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}
