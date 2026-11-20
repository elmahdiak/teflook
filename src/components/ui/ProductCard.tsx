"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Star, ShoppingBag, Eye, Check } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { ProductItem } from "@/data/teflookData";

interface ProductCardProps {
  product: ProductItem;
  className?: string;
}

export function ProductCard({ product, className = "" }: ProductCardProps) {
  const { addToCart, setActiveQuickProduct, currency } = useCart();
  const [isAdded, setIsAdded] = useState(false);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    addToCart(product);
    setIsAdded(true);
    setTimeout(() => {
      setIsAdded(false);
    }, 1800);
  };

  const handleCardClick = () => {
    setActiveQuickProduct(product);
  };

  const currentPrice =
    currency === "MAD"
      ? `${product.priceMad} MAD`
      : `${product.priceEur.toFixed(2).replace(".", ",")} €`;

  const oldPrice =
    product.oldPriceMad && product.oldPriceEur
      ? currency === "MAD"
        ? `${product.oldPriceMad} MAD`
        : `${product.oldPriceEur.toFixed(2).replace(".", ",")} €`
      : null;

  return (
    <div
      onClick={handleCardClick}
      className={`group flex flex-col bg-card rounded-2xl overflow-hidden border border-border hover:border-[#4C9A9C]/40 hover:shadow-xl hover:shadow-[#4C9A9C]/10 transition-all duration-300 cursor-pointer select-none ${className}`}
    >
      {/* 1. Media & Image Container */}
      <div className="relative aspect-square w-full overflow-hidden bg-brand-cream">
        <Image
          src={product.images[0]}
          alt={product.name}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          className="object-cover object-center group-hover:scale-105 transition-transform duration-500 ease-out"
        />

        {/* Hover vignette */}
        <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity" />

        {/* Top Left Badges: Discount & Promo */}
        <div className="absolute top-2.5 left-2.5 z-10 flex flex-col gap-1">
          {product.discountPercentage && (
            <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-[#FE7C58] text-white shadow-xs">
              -{product.discountPercentage}%
            </span>
          )}
          {product.badge && (
            <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-[#4C9A9C] text-white shadow-xs">
              {product.badge}
            </span>
          )}
        </div>

        {/* Top Right: Quick View Button */}
        <div className="absolute top-2.5 right-2.5 z-10 opacity-0 group-hover:opacity-100 transition-all duration-200 translate-y-1 group-hover:translate-y-0">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setActiveQuickProduct(product);
            }}
            className="p-2 rounded-full bg-white/95 hover:bg-white text-foreground hover:text-brand-teal shadow-md transition-transform hover:scale-110 active:scale-95"
            aria-label="Aperçu rapide"
            title="Aperçu rapide"
          >
            <Eye className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Bottom Floating: Category Pill */}
        <div className="absolute bottom-2.5 left-2.5 right-2.5 z-10 flex items-center justify-between gap-1 pointer-events-none">
          <span className="px-2.5 py-1 rounded-lg bg-white/90 backdrop-blur-md text-[10px] font-extrabold text-[#4C9A9C] border border-white/60 shadow-xs truncate max-w-[70%]">
            {product.categoryName}
          </span>
          <span className="px-2 py-1 rounded-lg bg-[#FE7C58] text-white text-[10px] font-black shadow-xs shrink-0">
            {product.ageBracket}
          </span>
        </div>
      </div>

      {/* 2. Content Details */}
      <div className="flex-1 p-3.5 sm:p-4 flex flex-col justify-between">
        <div>
          {/* Star Rating & Reviews */}
          <div className="flex items-center gap-1.5 mb-1.5">
            <div className="flex items-center text-[#FEC748]">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`w-3 h-3 ${
                    i < Math.floor(product.rating)
                      ? "fill-[#FEC748] text-[#FEC748]"
                      : "text-slate-200 fill-slate-200"
                  }`}
                />
              ))}
            </div>
            <span className="text-[11px] font-bold text-foreground">
              {product.rating.toFixed(1)}
            </span>
            <span className="text-[10px] text-muted-foreground">
              ({product.reviewsCount} avis)
            </span>
          </div>

          {/* Product Title */}
          <h3 className="font-bold text-xs sm:text-sm text-foreground group-hover:text-brand-teal transition-colors line-clamp-2 leading-snug min-h-[2.5rem]">
            {product.name}
          </h3>

          {/* Key pedagogical benefit / feature */}
          {product.features && product.features[0] && (
            <p className="mt-1 text-[11px] text-[#4C9A9C] line-clamp-1 font-medium">
              ✓ {product.features[0]}
            </p>
          )}
        </div>

        {/* 3. Footer: Pricing & Add to Cart Button */}
        <div className="mt-3 pt-3 border-t border-border flex items-center justify-between gap-2">
          {/* Pricing */}
          <div className="flex flex-col">
            {oldPrice && (
              <span className="text-[11px] text-muted-foreground line-through font-semibold leading-none">
                {oldPrice}
              </span>
            )}
            <span className="text-sm sm:text-base font-black text-foreground leading-tight">
              {currentPrice}
            </span>
          </div>

          {/* Interactive "Ajouter au panier" Button */}
          <button
            onClick={handleAddToCart}
            disabled={isAdded}
            className={`relative inline-flex items-center gap-1.5 px-3 py-2 rounded-xl font-bold text-xs transition-all duration-200 active:scale-95 shadow-xs ${
              isAdded
                ? "bg-emerald-600 text-white cursor-default"
                : "bg-[#FE7C58] hover:bg-[#E96843] text-white hover:shadow-md cursor-pointer"
            }`}
            aria-label={`Ajouter ${product.name} au panier`}
          >
            {isAdded ? (
              <>
                <Check className="w-3.5 h-3.5 stroke-[3] animate-in zoom-in" />
                <span className="hidden sm:inline">Ajouté !</span>
              </>
            ) : (
              <>
                <ShoppingBag className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Ajouter</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
