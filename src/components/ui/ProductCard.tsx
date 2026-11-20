"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Star, Eye, Check, Plus, LoaderCircle } from "lucide-react";
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
    }, 1600);
  };

  const handleCardClick = () => {
    setActiveQuickProduct(product);
  };

  const currentPrice =
    currency === "MAD"
      ? `${product.priceMad.toFixed(2).replace(".", ",")} MAD`
      : `${product.priceEur.toFixed(2).replace(".", ",")} €`;

  const oldPrice =
    product.oldPriceMad && product.oldPriceEur
      ? currency === "MAD"
        ? `${product.oldPriceMad.toFixed(2).replace(".", ",")} MAD`
        : `${product.oldPriceEur.toFixed(2).replace(".", ",")} €`
      : null;

  const categoryLabel = `TEFLOOK ${product.categoryName.toUpperCase()}`;

  return (
    <div
      onClick={handleCardClick}
      className={`group relative flex h-full flex-col justify-between rounded-2xl sm:rounded-3xl border border-[#E6E1D8]/80 bg-white p-2.5 sm:p-4 shadow-xs hover:shadow-xl hover:shadow-black/5 hover:border-[#4b9797]/40 hover:-translate-y-1 transition-all duration-300 cursor-pointer select-none ${className}`}
    >
      <div>
        {/* 1. Media & Image Container */}
        <div className="relative aspect-square w-full overflow-hidden rounded-xl sm:rounded-2xl bg-[#F9F8F6]">
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
          <div className="absolute top-2 left-2 sm:top-2.5 sm:left-2.5 z-10 flex flex-col gap-1">
            {product.discountPercentage ? (
              <span className="px-2 sm:px-2.5 py-0.5 rounded-full text-[9px] sm:text-[10px] font-extrabold uppercase bg-[#ff3500] text-white shadow-xs">
                -{product.discountPercentage}%
              </span>
            ) : product.badge ? (
              <span className="px-2 sm:px-2.5 py-0.5 rounded-full text-[9px] sm:text-[10px] font-extrabold uppercase bg-[#ff3500] text-white shadow-xs">
                {product.badge}
              </span>
            ) : (
              <span className="px-2 sm:px-2.5 py-0.5 rounded-full text-[9px] sm:text-[10px] font-extrabold uppercase bg-[#ff3500] text-white shadow-xs">
                Bestseller
              </span>
            )}
          </div>

          {/* Top Right: Quick View Button */}
          <div className="absolute top-2 right-2 sm:top-2.5 sm:right-2.5 z-10 opacity-0 group-hover:opacity-100 transition-all duration-200 translate-y-1 group-hover:translate-y-0">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setActiveQuickProduct(product);
              }}
              className="p-1.5 sm:p-2 rounded-full bg-white/95 hover:bg-white text-[#1E293B] hover:text-[#4b9797] shadow-md transition-transform hover:scale-110 active:scale-95 cursor-pointer"
              aria-label="Aperçu rapide"
              title="Aperçu rapide"
            >
              <Eye className="size-3.5 sm:size-4" />
            </button>
          </div>
        </div>

        {/* 2. Content Details & Typography Hierarchy */}
        <div className="pt-2.5 sm:pt-3.5 flex flex-col">
          {/* Category label: Uppercase, small, tracked out, colored in #4b9797 */}
          <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-[0.14em] text-[#4b9797] truncate block mb-1">
            {categoryLabel}
          </span>

          {/* Product Title: Bold, clean sans-serif font, dark charcoal text color */}
          <h3 className="line-clamp-2 text-[13px] sm:text-[15px] font-bold leading-snug text-[#1E293B] group-hover:text-[#4b9797] transition-colors min-h-[2.3rem] sm:min-h-[2.6rem]">
            {product.name}
          </h3>

          {/* Star Rating & Reviews in Golden Yellow / Amber (#ffbf00) */}
          <div className="flex items-center gap-1 sm:gap-1.5 mt-1.5 mb-0.5">
            <div className="flex items-center text-[#ffbf00]">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`size-3 ${
                    i < Math.floor(product.rating)
                      ? "fill-[#ffbf00] text-[#ffbf00]"
                      : "text-slate-200 fill-slate-200"
                  }`}
                />
              ))}
            </div>
            <span className="text-[10px] sm:text-[11px] font-bold text-[#1E293B]">
              {product.rating.toFixed(1)}
            </span>
            <span className="text-[9px] sm:text-[10px] text-muted-foreground">
              ({product.reviewsCount})
            </span>
          </div>
        </div>
      </div>

      {/* 3. Action & Price Area */}
      <div className="mt-2.5 sm:mt-3.5 pt-2.5 sm:pt-3 border-t border-[#F1ECE4] flex items-center justify-between gap-1.5 sm:gap-2">
        {/* Pricing clearly on left in bold #ff3500 */}
        <div className="flex flex-col min-w-0">
          {oldPrice && (
            <span className="text-[10px] sm:text-[11px] text-muted-foreground line-through font-semibold leading-none mb-0.5">
              {oldPrice}
            </span>
          )}
          <span className="truncate text-[14px] sm:text-[17px] font-black tracking-tight text-[#ff3500] leading-none">
            {currentPrice}
          </span>
        </div>

        {/* Add to Cart button: Clean rounded-xl shape, soft hover background in #ffbf00 */}
        <button
          onClick={handleAddToCart}
          disabled={isAdded}
          className="size-8 sm:size-9 shrink-0 rounded-xl border border-[#E6E1D8] bg-[#F9F8F6] text-[#1E293B] shadow-xs grid place-items-center transition-all duration-200 hover:bg-[#ffbf00] hover:border-[#ffbf00] hover:text-[#1E293B] hover:scale-105 active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#ffbf00] cursor-pointer"
          aria-label={`Ajouter ${product.name} au panier`}
          title="Ajouter au panier"
        >
          {isAdded ? (
            <Check className="size-3.5 sm:size-4 text-emerald-600 stroke-[3] animate-in zoom-in" />
          ) : (
            <Plus className="size-3.5 sm:size-4 stroke-[2.5]" />
          )}
        </button>
      </div>
    </div>
  );
}
