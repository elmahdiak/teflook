"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { Check, ChevronDown, X } from "lucide-react";
import type { ShopifyProduct } from "@/lib/shopify-storefront";
import { useTefLookLanguage } from "@/lib/teflook-language";
import { cn } from "@/lib/utils";

export type ProductAvailabilityOption = "in_stock" | "out_of_stock";

export type ProductSortOption =
  | "featured"
  | "best_selling"
  | "price_asc"
  | "price_desc"
  | "newest";

export interface ProductFilterState {
  availability: ProductAvailabilityOption[];
  minPrice: string;
  maxPrice: string;
  sortBy: ProductSortOption;
}

export const DEFAULT_PRODUCT_FILTER_STATE: ProductFilterState = {
  availability: [],
  minPrice: "",
  maxPrice: "",
  sortBy: "featured",
};

export function getProductNumericPrice(product: ShopifyProduct): number {
  const variantAmount = product.variants?.edges?.[0]?.node?.price?.amount;
  const rangeAmount = product.priceRange?.minVariantPrice?.amount;
  const parsed = Number(variantAmount ?? rangeAmount ?? 0);
  return Number.isFinite(parsed) ? parsed : 0;
}

export function isProductAvailable(product: ShopifyProduct): boolean {
  const edges = product.variants?.edges || [];
  if (edges.length === 0) return true;
  return edges.some((edge) => edge.node.availableForSale);
}

export function applyProductFilterAndSort(
  products: ShopifyProduct[],
  filterState: ProductFilterState
): ShopifyProduct[] {
  const minVal =
    filterState.minPrice.trim() !== "" ? Number(filterState.minPrice) : null;
  const maxVal =
    filterState.maxPrice.trim() !== "" ? Number(filterState.maxPrice) : null;
  const hasMin = minVal !== null && Number.isFinite(minVal);
  const hasMax = maxVal !== null && Number.isFinite(maxVal);

  const filtered = products.filter((product) => {
    if (filterState.availability.length > 0) {
      const available = isProductAvailable(product);
      const matchesInStock =
        filterState.availability.includes("in_stock") && available;
      const matchesOutOfStock =
        filterState.availability.includes("out_of_stock") && !available;
      if (!matchesInStock && !matchesOutOfStock) {
        return false;
      }
    }

    if (hasMin || hasMax) {
      const price = getProductNumericPrice(product);
      if (hasMin && price < (minVal as number)) return false;
      if (hasMax && price > (maxVal as number)) return false;
    }

    return true;
  });

  if (filterState.sortBy === "featured") {
    return filtered;
  }

  const withIndex = filtered.map((product, index) => ({ product, index }));

  withIndex.sort((a, b) => {
    switch (filterState.sortBy) {
      case "price_asc": {
        const diff =
          getProductNumericPrice(a.product) - getProductNumericPrice(b.product);
        return diff !== 0 ? diff : a.index - b.index;
      }
      case "price_desc": {
        const diff =
          getProductNumericPrice(b.product) - getProductNumericPrice(a.product);
        return diff !== 0 ? diff : a.index - b.index;
      }
      case "best_selling": {
        const countDiff =
          (b.product.reviewsCount ?? 0) - (a.product.reviewsCount ?? 0);
        if (countDiff !== 0) return countDiff;
        const ratingDiff = (b.product.rating ?? 0) - (a.product.rating ?? 0);
        if (ratingDiff !== 0) return ratingDiff;
        const aBadge = (a.product.badge || "").toLowerCase();
        const bBadge = (b.product.badge || "").toLowerCase();
        const aScore = aBadge.includes("best") || aBadge.includes("top") ? 1 : 0;
        const bScore = bBadge.includes("best") || bBadge.includes("top") ? 1 : 0;
        if (bScore !== aScore) return bScore - aScore;
        return a.index - b.index;
      }
      case "newest": {
        const aTime = a.product.createdAt ? Date.parse(a.product.createdAt) : NaN;
        const bTime = b.product.createdAt ? Date.parse(b.product.createdAt) : NaN;
        const aValid = Number.isFinite(aTime);
        const bValid = Number.isFinite(bTime);
        if (aValid && bValid && bTime !== aTime) {
          return bTime - aTime;
        }
        if (bValid !== aValid) {
          return bValid ? 1 : -1;
        }
        return a.index - b.index;
      }
      default:
        return a.index - b.index;
    }
  });

  return withIndex.map((entry) => entry.product);
}

export interface ProductFilterSortBarProps {
  products: ShopifyProduct[];
  filteredCount: number;
  filterState: ProductFilterState;
  onFilterChange: (next: ProductFilterState) => void;
  onClearAll?: () => void;
  hasExternalFilters?: boolean;
  className?: string;
}

type OpenPopover = "availability" | "price" | "sort" | null;

export function ProductFilterSortBar({
  products,
  filteredCount,
  filterState,
  onFilterChange,
  onClearAll,
  hasExternalFilters = false,
  className,
}: ProductFilterSortBarProps) {
  const { locale, direction } = useTefLookLanguage();
  const [isMounted, setIsMounted] = useState(false);
  const [openPopover, setOpenPopover] = useState<OpenPopover>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!openPopover) return;

    const handlePointerDown = (event: MouseEvent | TouchEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setOpenPopover(null);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpenPopover(null);
      }
    };

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("touchstart", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("touchstart", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [openPopover]);

  const currentLocale = isMounted ? locale : "fr";
  const currentDirection = isMounted ? direction : "ltr";
  const isAr = currentLocale === "ar";

  const { inStockCount, outOfStockCount, highestPrice } = useMemo(() => {
    let inStock = 0;
    let outOfStock = 0;
    let maxPrice = 0;

    for (const p of products) {
      if (isProductAvailable(p)) {
        inStock += 1;
      } else {
        outOfStock += 1;
      }
      const price = getProductNumericPrice(p);
      if (price > maxPrice) maxPrice = price;
    }

    return {
      inStockCount: inStock,
      outOfStockCount: outOfStock,
      highestPrice: Math.ceil(maxPrice),
    };
  }, [products]);

  const sortOptions: { value: ProductSortOption; labelFr: string; labelAr: string }[] = [
    { value: "featured", labelFr: "En vedette", labelAr: "المميزة" },
    { value: "best_selling", labelFr: "Meilleures ventes", labelAr: "الأكثر مبيعاً" },
    {
      value: "price_asc",
      labelFr: "Prix : faible à élevé",
      labelAr: "السعر: من الأقل إلى الأعلى",
    },
    {
      value: "price_desc",
      labelFr: "Prix : élevé à faible",
      labelAr: "السعر: من الأعلى إلى الأقل",
    },
    { value: "newest", labelFr: "Nouveautés", labelAr: "الأحدث" },
  ];

  const activeSortOption =
    sortOptions.find((opt) => opt.value === filterState.sortBy) || sortOptions[0];

  const toggleAvailability = (opt: ProductAvailabilityOption) => {
    const exists = filterState.availability.includes(opt);
    const next = exists
      ? filterState.availability.filter((v) => v !== opt)
      : [...filterState.availability, opt];
    onFilterChange({ ...filterState, availability: next });
  };

  const hasAvailabilityFilter = filterState.availability.length > 0;
  const hasPriceFilter =
    filterState.minPrice.trim() !== "" || filterState.maxPrice.trim() !== "";
  const hasAnyLocalFilter = hasAvailabilityFilter || hasPriceFilter;

  return (
    <div ref={containerRef} dir={currentDirection} className={cn("relative", className)}>
      {/* Main Minimalist Horizontal Filter & Sort Bar */}
      <div className="flex flex-nowrap items-center justify-between gap-2 py-3 sm:py-4 mb-5 border-b border-slate-100 text-[11px] sm:text-sm text-[#1A3C34] whitespace-nowrap">
        {/* Left Side: Filtre : Disponibilité v  Prix v */}
        <div className="relative sm:static flex items-center gap-2.5 sm:gap-5 min-w-0">
          <span className="hidden sm:inline text-slate-500 font-normal">
            {isAr ? "تصفية :" : "Filtre :"}
          </span>

          {/* Availability Popover Trigger */}
          <div className="sm:relative">
            <button
              type="button"
              aria-expanded={openPopover === "availability"}
              onClick={() =>
                setOpenPopover((cur) =>
                  cur === "availability" ? null : "availability"
                )
              }
              className={cn(
                "inline-flex items-center gap-1 sm:gap-1.5 py-1 font-medium transition-colors cursor-pointer hover:text-[#4B9393]",
                (openPopover === "availability" || hasAvailabilityFilter) &&
                  "text-[#4B9393] font-semibold"
              )}
            >
              <span>{isAr ? "التوفر" : "Disponibilité"}</span>
              {hasAvailabilityFilter && (
                <span className="inline-flex size-4 items-center justify-center rounded-full bg-[#4B9393] text-[10px] font-bold text-white tabular-nums">
                  {filterState.availability.length}
                </span>
              )}
              <ChevronDown
                size={14}
                className={cn(
                  "text-slate-400 transition-transform duration-200 shrink-0",
                  openPopover === "availability" && "rotate-180 text-[#4B9393]"
                )}
              />
            </button>

            {openPopover === "availability" && (
              <div className="absolute start-0 top-full mt-2 min-w-[230px] max-w-[calc(100vw-2rem)] whitespace-normal rounded-2xl border border-slate-200/90 bg-white p-4 shadow-[0_12px_30px_-8px_rgba(26,60,52,0.12)] z-30 animate-in fade-in zoom-in-95 duration-150">
                <div className="flex items-center justify-between gap-3 pb-3 mb-3 border-b border-slate-100 text-xs">
                  <span className="text-slate-500 font-medium tabular-nums">
                    {isAr
                      ? `${filterState.availability.length} محدد`
                      : `${filterState.availability.length} sélectionné${
                          filterState.availability.length > 1 ? "s" : ""
                        }`}
                  </span>
                  <button
                    type="button"
                    disabled={!hasAvailabilityFilter}
                    onClick={() =>
                      onFilterChange({ ...filterState, availability: [] })
                    }
                    className="font-semibold text-[#4B9393] hover:text-[#F67D56] underline underline-offset-2 disabled:opacity-40 disabled:no-underline cursor-pointer disabled:cursor-default"
                  >
                    {isAr ? "إعادة ضبط" : "Réinitialiser"}
                  </button>
                </div>

                <div className="space-y-2.5">
                  <button
                    type="button"
                    role="checkbox"
                    aria-checked={filterState.availability.includes("in_stock")}
                    onClick={() => toggleAvailability("in_stock")}
                    className="w-full flex items-center justify-between gap-3 cursor-pointer group text-start"
                  >
                    <span className="flex items-center gap-2.5">
                      <span
                        aria-hidden="true"
                        className={cn(
                          "grid size-4 place-items-center rounded border transition-colors",
                          filterState.availability.includes("in_stock")
                            ? "bg-[#4B9393] border-[#4B9393] text-white"
                            : "bg-white border-slate-300 group-hover:border-[#4B9393]"
                        )}
                      >
                        {filterState.availability.includes("in_stock") && (
                          <Check size={11} strokeWidth={3} />
                        )}
                      </span>
                      <span className="text-[13px] font-medium text-[#1A3C34] group-hover:text-[#4B9393]">
                        {isAr ? "متوفر" : "En stock"}
                      </span>
                    </span>
                    <span className="text-xs text-slate-400 tabular-nums">
                      ({inStockCount})
                    </span>
                  </button>

                  <button
                    type="button"
                    role="checkbox"
                    aria-checked={filterState.availability.includes("out_of_stock")}
                    onClick={() => toggleAvailability("out_of_stock")}
                    className="w-full flex items-center justify-between gap-3 cursor-pointer group text-start"
                  >
                    <span className="flex items-center gap-2.5">
                      <span
                        aria-hidden="true"
                        className={cn(
                          "grid size-4 place-items-center rounded border transition-colors",
                          filterState.availability.includes("out_of_stock")
                            ? "bg-[#4B9393] border-[#4B9393] text-white"
                            : "bg-white border-slate-300 group-hover:border-[#4B9393]"
                        )}
                      >
                        {filterState.availability.includes("out_of_stock") && (
                          <Check size={11} strokeWidth={3} />
                        )}
                      </span>
                      <span className="text-[13px] font-medium text-[#1A3C34] group-hover:text-[#4B9393]">
                        {isAr ? "نفذت الكمية" : "Épuisé"}
                      </span>
                    </span>
                    <span className="text-xs text-slate-400 tabular-nums">
                      ({outOfStockCount})
                    </span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Price Popover Trigger */}
          <div className="sm:relative">
            <button
              type="button"
              aria-expanded={openPopover === "price"}
              onClick={() =>
                setOpenPopover((cur) => (cur === "price" ? null : "price"))
              }
              className={cn(
                "inline-flex items-center gap-1 sm:gap-1.5 py-1 font-medium transition-colors cursor-pointer hover:text-[#4B9393]",
                (openPopover === "price" || hasPriceFilter) &&
                  "text-[#4B9393] font-semibold"
              )}
            >
              <span>{isAr ? "السعر" : "Prix"}</span>
              {hasPriceFilter && (
                <span className="size-1.5 rounded-full bg-[#F67D56]" />
              )}
              <ChevronDown
                size={14}
                className={cn(
                  "text-slate-400 transition-transform duration-200 shrink-0",
                  openPopover === "price" && "rotate-180 text-[#4B9393]"
                )}
              />
            </button>

            {openPopover === "price" && (
              <div className="absolute start-0 top-full mt-2 min-w-[260px] max-w-[calc(100vw-2rem)] whitespace-normal rounded-2xl border border-slate-200/90 bg-white p-4 shadow-[0_12px_30px_-8px_rgba(26,60,52,0.12)] z-30 animate-in fade-in zoom-in-95 duration-150">
                <div className="flex items-start justify-between gap-3 pb-3 mb-3 border-b border-slate-100 text-xs">
                  <span className="text-slate-500 leading-snug">
                    {isAr
                      ? `أعلى سعر هو ${highestPrice} درهم`
                      : `Le prix le plus élevé est de ${highestPrice} DH`}
                  </span>
                  <button
                    type="button"
                    disabled={!hasPriceFilter}
                    onClick={() =>
                      onFilterChange({
                        ...filterState,
                        minPrice: "",
                        maxPrice: "",
                      })
                    }
                    className="shrink-0 font-semibold text-[#4B9393] hover:text-[#F67D56] underline underline-offset-2 disabled:opacity-40 disabled:no-underline cursor-pointer disabled:cursor-default"
                  >
                    {isAr ? "إعادة ضبط" : "Réinitialiser"}
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                      {isAr ? "من" : "De"}
                    </label>
                    <div className="relative flex items-center">
                      <input
                        type="number"
                        min={0}
                        inputMode="numeric"
                        value={filterState.minPrice}
                        onChange={(e) =>
                          onFilterChange({
                            ...filterState,
                            minPrice: e.target.value,
                          })
                        }
                        placeholder="0"
                        className="w-full h-9 rounded-xl border border-slate-200 bg-slate-50/60 ps-3 pe-8 text-xs font-medium text-[#1A3C34] outline-none focus:border-[#4B9393] focus:bg-white tabular-nums"
                      />
                      <span className="pointer-events-none absolute end-2.5 text-[10px] font-bold text-slate-400">
                        {isAr ? "د.م" : "DH"}
                      </span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                      {isAr ? "إلى" : "À"}
                    </label>
                    <div className="relative flex items-center">
                      <input
                        type="number"
                        min={0}
                        inputMode="numeric"
                        value={filterState.maxPrice}
                        onChange={(e) =>
                          onFilterChange({
                            ...filterState,
                            maxPrice: e.target.value,
                          })
                        }
                        placeholder={String(highestPrice || 500)}
                        className="w-full h-9 rounded-xl border border-slate-200 bg-slate-50/60 ps-3 pe-8 text-xs font-medium text-[#1A3C34] outline-none focus:border-[#4B9393] focus:bg-white tabular-nums"
                      />
                      <span className="pointer-events-none absolute end-2.5 text-[10px] font-bold text-slate-400">
                        {isAr ? "د.م" : "DH"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Side: Trier par : En vedette v | X prod. */}
        <div className="relative sm:static flex items-center gap-2 sm:gap-3 ms-auto min-w-0">
          <span className="hidden sm:inline text-slate-500 font-normal">
            {isAr ? "ترتيب حسب :" : "Trier par :"}
          </span>

          <div className="sm:relative min-w-0">
            <button
              type="button"
              aria-expanded={openPopover === "sort"}
              onClick={() =>
                setOpenPopover((cur) => (cur === "sort" ? null : "sort"))
              }
              className={cn(
                "inline-flex items-center gap-1 sm:gap-1.5 py-1 font-medium text-[#1A3C34] hover:text-[#4B9393] transition-colors cursor-pointer max-w-full",
                openPopover === "sort" && "text-[#4B9393]"
              )}
            >
              <span className="truncate max-w-[105px] sm:max-w-none">
                {isAr ? activeSortOption.labelAr : activeSortOption.labelFr}
              </span>
              <ChevronDown
                size={14}
                className={cn(
                  "text-slate-400 transition-transform duration-200 shrink-0",
                  openPopover === "sort" && "rotate-180 text-[#4B9393]"
                )}
              />
            </button>

            {openPopover === "sort" && (
              <div
                role="listbox"
                aria-label={isAr ? "خيارات الترتيب" : "Options de tri"}
                className="absolute end-0 top-full mt-2 min-w-[225px] max-w-[calc(100vw-2rem)] whitespace-normal rounded-2xl border border-slate-200/90 bg-white p-1.5 shadow-[0_12px_30px_-8px_rgba(26,60,52,0.12)] z-30 animate-in fade-in zoom-in-95 duration-150"
              >
                {sortOptions.map((opt) => {
                  const isSelected = filterState.sortBy === opt.value;
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      role="option"
                      aria-selected={isSelected}
                      onClick={() => {
                        onFilterChange({ ...filterState, sortBy: opt.value });
                        setOpenPopover(null);
                      }}
                      className={cn(
                        "w-full flex items-center justify-between gap-2 rounded-xl px-3 py-2 text-start text-xs font-medium transition-colors cursor-pointer",
                        isSelected
                          ? "bg-[#4B9393]/10 text-[#4B9393] font-bold"
                          : "text-[#1A3C34] hover:bg-slate-50"
                      )}
                    >
                      <span>{isAr ? opt.labelAr : opt.labelFr}</span>
                      {isSelected && <Check size={14} className="shrink-0" />}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          <span className="inline-block text-[11px] sm:text-xs text-slate-400 tabular-nums border-s border-slate-200 ps-2 sm:ps-2.5 whitespace-nowrap shrink-0">
            {isAr ? (
              `${filteredCount} منتج`
            ) : (
              <>
                <span className="sm:hidden">{filteredCount} prod.</span>
                <span className="hidden sm:inline">
                  {filteredCount} produit{filteredCount > 1 ? "s" : ""}
                </span>
              </>
            )}
          </span>
        </div>
      </div>

      {/* Active Filter Chips Row (when availability or price filters are active) */}
      {(hasAnyLocalFilter || (hasExternalFilters && onClearAll)) && (
        <div className="mb-5 flex flex-wrap items-center gap-2 text-xs">
          {filterState.availability.includes("in_stock") && (
            <button
              type="button"
              onClick={() => toggleAvailability("in_stock")}
              className="inline-flex items-center gap-1.5 rounded-full border border-[#4B9393]/30 bg-[#4B9393]/10 px-3 py-1 font-semibold text-[#4B9393] hover:bg-[#4B9393]/20 transition-colors cursor-pointer"
            >
              <span>{isAr ? "متوفر" : "En stock"}</span>
              <X size={12} />
            </button>
          )}

          {filterState.availability.includes("out_of_stock") && (
            <button
              type="button"
              onClick={() => toggleAvailability("out_of_stock")}
              className="inline-flex items-center gap-1.5 rounded-full border border-[#4B9393]/30 bg-[#4B9393]/10 px-3 py-1 font-semibold text-[#4B9393] hover:bg-[#4B9393]/20 transition-colors cursor-pointer"
            >
              <span>{isAr ? "نفذت الكمية" : "Épuisé"}</span>
              <X size={12} />
            </button>
          )}

          {hasPriceFilter && (
            <button
              type="button"
              onClick={() =>
                onFilterChange({ ...filterState, minPrice: "", maxPrice: "" })
              }
              className="inline-flex items-center gap-1.5 rounded-full border border-[#4B9393]/30 bg-[#4B9393]/10 px-3 py-1 font-semibold text-[#4B9393] hover:bg-[#4B9393]/20 transition-colors cursor-pointer tabular-nums"
            >
              <span>
                {isAr ? "السعر :" : "Prix :"}{" "}
                {filterState.minPrice.trim() || "0"} –{" "}
                {filterState.maxPrice.trim() || highestPrice}{" "}
                {isAr ? "د.م" : "DH"}
              </span>
              <X size={12} />
            </button>
          )}

          {(hasAnyLocalFilter || hasExternalFilters) && (
            <button
              type="button"
              onClick={() => {
                onFilterChange({
                  ...filterState,
                  availability: [],
                  minPrice: "",
                  maxPrice: "",
                });
                if (onClearAll) onClearAll();
              }}
              className="font-semibold text-[#F67D56] hover:underline underline-offset-2 px-1.5 py-1 cursor-pointer"
            >
              {isAr ? "مسح الكل" : "Tout effacer"}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
