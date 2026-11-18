"use client";

import React, { useState } from "react";
import Image from "next/image";
import { X, Star, ShieldCheck, Check, ShoppingBag, Truck, RotateCcw } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export function QuickViewModal() {
  const { activeQuickProduct, setActiveQuickProduct, addToCart, currency } = useCart();
  const [selectedSize, setSelectedSize] = useState<number | undefined>(undefined);
  const [activeImageIdx, setActiveImageIdx] = useState(0);

  if (!activeQuickProduct) return null;

  const product = activeQuickProduct;
  const price = currency === "MAD" ? product.priceMad : product.priceEur;

  const handleAddToCart = () => {
    if (product.sizes.length > 0 && !selectedSize) {
      setSelectedSize(product.sizes[0]);
      addToCart(product, product.sizes[0]);
    } else {
      addToCart(product, selectedSize);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/70 backdrop-blur-xs transition-opacity"
        onClick={() => setActiveQuickProduct(null)}
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-3xl bg-white rounded-3xl overflow-hidden shadow-2xl border border-[#E8E5DF] z-10 animate-in fade-in zoom-in-95 duration-200">
        <button
          onClick={() => setActiveQuickProduct(null)}
          className="absolute top-4 right-4 z-20 p-2.5 rounded-full bg-white/90 text-[#1E293B] hover:bg-white border border-[#E8E5DF] shadow-xs transition-colors"
          aria-label="Fermer la vue rapide"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2">
          {/* Product Gallery */}
          <div className="relative bg-[#F9F8F6] p-6 flex flex-col justify-between border-b md:border-b-0 md:border-r border-[#E8E5DF]">
            <div className="relative aspect-square w-full rounded-2xl overflow-hidden bg-white shadow-xs border border-[#E8E5DF]">
              <Image
                src={product.images[activeImageIdx] || product.images[0]}
                alt={product.name}
                fill
                sizes="(max-width: 768px) 100vw, 400px"
                className="object-cover transition-all duration-300"
              />
              {product.badge && (
                <div className="absolute top-3 left-3">
                  <Badge variant="orange">{product.badge}</Badge>
                </div>
              )}
            </div>

            {/* Thumbnails if multiple images */}
            {product.images.length > 1 && (
              <div className="flex gap-2.5 mt-4 justify-center">
                {product.images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveImageIdx(i)}
                    className={`relative w-14 h-14 rounded-xl overflow-hidden border-2 transition-all ${
                      activeImageIdx === i ? "border-[#FF6B00] scale-105" : "border-[#E8E5DF] opacity-70"
                    }`}
                  >
                    <Image src={img} alt="Aperçu" fill sizes="56px" className="object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Details */}
          <div className="p-6 sm:p-8 flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <div className="space-y-1">
                <span className="text-xs uppercase tracking-widest font-bold text-[#4A9099]">
                  {product.categoryName} • {product.origin}
                </span>
                <h3 className="font-serif-brand text-2xl sm:text-3xl font-bold text-[#1E293B] leading-tight">
                  {product.name}
                </h3>
                {product.nameAr && (
                  <p className="font-arabic text-sm text-[#FF6B00] font-bold">{product.nameAr}</p>
                )}
              </div>

              {/* Rating */}
              <div className="flex items-center gap-2">
                <div className="flex text-[#FF6B00]">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-4 h-4 ${
                        i < Math.floor(product.rating)
                          ? "fill-[#FF6B00]"
                          : "fill-[#FF6B00]/20"
                      }`}
                    />
                  ))}
                </div>
                <span className="text-xs font-bold text-[#1E293B]">{product.rating}</span>
                <span className="text-xs text-[#64748B]">({product.reviewsCount} avis vérifiés)</span>
              </div>

              {/* Price */}
              <div className="flex items-baseline gap-3">
                <span className="text-3xl font-bold text-[#4A9099]">
                  {price} {currency}
                </span>
                <span className="text-xs text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full font-semibold border border-emerald-200">
                  En stock &amp; Expédié en 24h
                </span>
              </div>

              <p className="text-sm text-[#334155] leading-relaxed">
                {product.description}
              </p>

              {/* Leather Details */}
              <div className="p-3 bg-[#EBF4F5] rounded-xl border border-[#4A9099]/20 text-xs space-y-1.5">
                <div className="flex items-center gap-2 text-[#1E293B] font-semibold">
                  <ShieldCheck className="w-4 h-4 text-[#4A9099]" />
                  <span>{product.material}</span>
                </div>
                <div className="flex flex-wrap gap-2 pt-1 text-[#64748B]">
                  {product.features.map((feat, i) => (
                    <span key={i} className="inline-flex items-center gap-1 font-medium text-[#334155]">
                      <Check className="w-3 h-3 text-[#FF6B00]" /> {feat}
                    </span>
                  ))}
                </div>
              </div>

              {/* Size Selector */}
              {product.sizes.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-[#1E293B]">
                      Pointure marocaine / européenne :
                    </span>
                    <span className="text-[#4A9099] font-medium hover:underline cursor-pointer">
                      Guide des tailles
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {product.sizes.map((sz) => (
                      <button
                        key={sz}
                        onClick={() => setSelectedSize(sz)}
                        className={`w-10 h-10 rounded-xl text-xs font-bold border transition-all ${
                          selectedSize === sz
                            ? "bg-[#4A9099] text-white border-[#4A9099] shadow-sm"
                            : "bg-white text-[#1E293B] border-[#E8E5DF] hover:border-[#FF6B00]"
                        }`}
                      >
                        {sz}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="space-y-3 pt-2">
              <Button
                variant="orange"
                className="w-full py-3.5 text-sm gap-2"
                onClick={handleAddToCart}
              >
                <ShoppingBag className="w-4 h-4" />
                Ajouter au panier
              </Button>
              <div className="grid grid-cols-2 gap-2 text-[11px] text-[#64748B] pt-1">
                <div className="flex items-center gap-1.5">
                  <Truck className="w-3.5 h-3.5 text-[#FF6B00]" />
                  <span>Livraison partout au Maroc</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <RotateCcw className="w-3.5 h-3.5 text-[#4A9099]" />
                  <span>Échange gratuit garanti</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
