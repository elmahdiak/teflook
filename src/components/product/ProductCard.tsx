"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Check, LoaderCircle, ShoppingBag, Star, Tag } from "lucide-react";
import { useCartStore } from "@/lib/shopify-cart";
import type { ShopifyProduct } from "@/lib/shopify-storefront";
import { useTefLookLanguage } from "@/lib/teflook-language";
import { getLocalizedProduct } from "@/lib/product-localization";
import { cn } from "@/lib/utils";

export interface ProductCardProps {
  product: ShopifyProduct;
  onAdded?: () => void;
  onNotice?: (message: string) => void;
}

export function ProductCard({ product, onAdded, onNotice }: ProductCardProps) {
  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => {
    setIsMounted(true);
  }, []);

  const { locale, direction, t } = useTefLookLanguage();
  const [adding, setAdding] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const currentLocale = isMounted ? locale : "fr";
  const currentDirection = isMounted ? direction : "ltr";
  const isAr = currentLocale === "ar";

  const availableVariant = product.variants.edges.find(
    (edge) => edge.node.availableForSale
  )?.node;
  const displayVariant = availableVariant || product.variants.edges[0]?.node;
  const isAvailable = Boolean(availableVariant);

  const image = product.images.edges[0]?.node;
  const localized = getLocalizedProduct(product, currentLocale);

  // Pricing & Discount Calculation
  const currentPrice = displayVariant
    ? Number(displayVariant.price.amount)
    : Number(product.priceRange.minVariantPrice.amount);

  const compareAtPrice = displayVariant?.compareAtPrice
    ? Number(displayVariant.compareAtPrice.amount)
    : product.compareAtPriceRange?.minVariantPrice
    ? Number(product.compareAtPriceRange.minVariantPrice.amount)
    : null;

  const hasDiscount = Boolean(compareAtPrice && compareAtPrice > currentPrice);
  const discountPercent =
    hasDiscount && compareAtPrice
      ? Math.round(((compareAtPrice - currentPrice) / compareAtPrice) * 100)
      : 0;

  const currencyCode =
    displayVariant?.price.currencyCode ||
    product.priceRange.minVariantPrice.currencyCode ||
    "MAD";

  const formattedPrice = `${currentPrice.toFixed(2).replace(".", ",")} ${currencyCode}`;
  const formattedComparePrice =
    hasDiscount && compareAtPrice
      ? `${compareAtPrice.toFixed(2).replace(".", ",")} ${currencyCode}`
      : null;

  // Real rating and reviews count from Supabase
  const rating = typeof product.rating === "number" ? product.rating : 0;
  const reviewsCount = typeof product.reviewsCount === "number" ? product.reviewsCount : 0;

  // Determine Top-Center Overlapping Badge
  const topBadge = (() => {
    if (!isAvailable) {
      return {
        text: isAr ? "نفدت الكمية" : "ÉPUISÉ",
        bgClass: "bg-slate-700",
        showTagIcon: false,
      };
    }

    if (hasDiscount && discountPercent > 0) {
      return {
        text: isAr ? `وفّر ${discountPercent}%` : `ÉCONOMISEZ ${discountPercent}%`,
        bgClass: "bg-[#ff3500]",
        showTagIcon: true,
      };
    }

    if (product.badge) {
      const upper = product.badge.toUpperCase();
      const isBestseller = upper.includes("BEST") || upper.includes("TOP");
      return {
        text: isAr && isBestseller ? "الأكثر طلباً" : upper,
        bgClass: isBestseller ? "bg-[#ff3500]" : "bg-[#4b9797]",
        showTagIcon: false,
      };
    }

    if (reviewsCount > 0) {
      return {
        text: isAr ? "الأكثر طلباً" : "BESTSELLER",
        bgClass: "bg-[#ff3500]",
        showTagIcon: false,
      };
    }

    return {
      text: isAr ? "جديد" : "NOUVEAU",
      bgClass: "bg-[#4b9797]",
      showTagIcon: false,
    };
  })();

  async function handleAdd(e: React.MouseEvent<HTMLButtonElement>) {
    e.stopPropagation();
    if (!availableVariant || adding) {
      if (!availableVariant && onNotice) onNotice(t("product.unavailable"));
      return;
    }

    setAdding(true);
    await useCartStore.getState().addItem({
      product,
      variantId: availableVariant.id,
      variantTitle: availableVariant.title,
      price: availableVariant.price,
      quantity: 1,
      selectedOptions: availableVariant.selectedOptions,
    });
    const error = useCartStore.getState().error;
    setAdding(false);

    if (error) {
      if (onNotice) onNotice(error);
    } else {
      setIsSuccess(true);
      setTimeout(() => setIsSuccess(false), 1600);
      if (onNotice) onNotice(`${t("product.addedPrefix")}${localized.title}`);
      if (onAdded) onAdded();
    }
  }

  return (
    <article
      dir={currentDirection}
      className="group relative pt-4 pb-4 px-2.5 sm:pt-5 sm:pb-6 sm:px-5 rounded-2xl bg-white border border-slate-100 shadow-[0_6px_24px_-6px_rgba(26,60,52,0.08)] hover:shadow-[0_12px_32px_-8px_rgba(26,60,52,0.14)] hover:-translate-y-0.5 transition-all duration-300 flex flex-col items-center text-center select-none h-full"
    >
      {/* 1. Top-Center Overlapping Badge */}
      <span
        className={cn(
          "absolute -top-2.5 sm:-top-3.5 left-1/2 -translate-x-1/2 z-10 inline-flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3.5 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-bold uppercase text-white shadow-sm whitespace-nowrap max-w-[calc(100%-0.75rem)]",
          isAr ? "tracking-normal font-sans" : "tracking-wide sm:tracking-wider",
          topBadge.bgClass
        )}
      >
        {topBadge.showTagIcon && (
          <Tag className="size-2.5 sm:size-3 shrink-0" aria-hidden="true" />
        )}
        <span className="truncate">{topBadge.text}</span>
      </span>

      {/* 2. Clean Unobstructed Product Image Container */}
      <Link
        href={`/product/${product.handle}`}
        aria-label={localized.title}
        className="w-full aspect-square flex items-center justify-center overflow-hidden rounded-xl mb-2.5 sm:mb-4 bg-[#F9F8F6]"
      >
        {image ? (
          <img
            src={image.url}
            alt={image.altText || localized.title}
            loading="lazy"
            className="size-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="grid size-full place-items-center bg-[#F9F8F6] text-[#4b9797]">
            <img
              src="/images/teflook-logo.png"
              alt={localized.title}
              className="size-12 sm:size-16 rounded-xl opacity-50 object-contain"
            />
          </div>
        )}
      </Link>

      {/* 3. Centered Product Title */}
      <Link
        href={`/product/${product.handle}`}
        title={localized.title}
        className={cn(
          "block w-full font-display font-bold text-xs sm:text-base md:text-[17px] text-[#1A3C34] hover:text-[#4b9797] line-clamp-2 leading-[1.2] sm:leading-snug mb-1 sm:mb-1.5 min-h-[2.4em] transition-colors",
          isAr && "font-sans"
        )}
      >
        {localized.title}
      </Link>

      {/* 4. Centered Real Supabase Rating Row */}
      <div className="flex items-center justify-center gap-1 sm:gap-1.5 text-[11px] sm:text-xs mb-2 sm:mb-2.5 min-h-[1.25rem]">
        {isMounted && reviewsCount > 0 ? (
          <>
            <Star
              className="size-3 sm:size-3.5 fill-[#ffbf00] text-[#ffbf00] shrink-0"
              aria-hidden="true"
            />
            <span className="font-bold text-[#1A3C34] tabular-nums">
              {rating.toFixed(1)}
            </span>
            <span className="text-slate-500 tabular-nums">({reviewsCount})</span>
          </>
        ) : (
          <>
            <Star
              className="size-3 sm:size-3.5 text-slate-300 fill-none shrink-0"
              aria-hidden="true"
            />
            <span className="font-medium text-slate-500 truncate">
              {isAr ? "جديد • لا توجد تقييمات" : "Nouveau • Aucun avis"}
            </span>
          </>
        )}
      </div>

      {/* 5. Centered Pricing (Sale Price + Crossed-Out Compare-At Price) */}
      <div className="flex items-baseline justify-center gap-1.5 sm:gap-2.5 mb-3 sm:mb-4 flex-wrap" dir="ltr">
        <span className="text-sm sm:text-lg md:text-xl font-extrabold text-[#ff3500] tabular-nums whitespace-nowrap">
          {formattedPrice}
        </span>
        {formattedComparePrice && (
          <span className="text-[11px] sm:text-sm font-semibold text-slate-400 line-through tabular-nums whitespace-nowrap">
            {formattedComparePrice}
          </span>
        )}
      </div>

      {/* 6. Full-Width Pill "Ajouter au panier" CTA Button */}
      <button
        type="button"
        disabled={!isAvailable || adding}
        aria-label={`${isAr ? "أضف إلى السلة" : "Ajouter au panier"} : ${localized.title}`}
        onClick={(e) => void handleAdd(e)}
        className="mt-auto w-full py-2 px-2.5 sm:py-3 sm:px-5 rounded-full bg-[#ff3500] hover:bg-[#e02e00] active:scale-[0.98] text-white font-display font-bold text-xs sm:text-sm tracking-wide shadow-[0_6px_16px_-4px_rgba(255,53,0,0.4)] transition-all duration-200 flex items-center justify-center gap-1 sm:gap-2 whitespace-nowrap cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {adding ? (
          <LoaderCircle className="size-3.5 sm:size-4 animate-spin shrink-0" />
        ) : isSuccess ? (
          <>
            <Check strokeWidth={3} className="size-3.5 sm:size-4 shrink-0" />
            <span className={cn(isAr && "font-sans tracking-normal")}>
              {isAr ? "تمت الإضافة" : "Ajouté !"}
            </span>
          </>
        ) : !isAvailable ? (
          <span className={cn(isAr && "font-sans tracking-normal")}>
            {isAr ? "نفدت الكمية" : "Épuisé"}
          </span>
        ) : (
          <>
            <ShoppingBag className="size-3.5 sm:size-4 shrink-0" aria-hidden="true" />
            <span className={cn(isAr && "font-sans tracking-normal")}>
              {isAr ? "أضف إلى السلة" : "Ajouter au panier"}
            </span>
          </>
        )}
      </button>
    </article>
  );
}

