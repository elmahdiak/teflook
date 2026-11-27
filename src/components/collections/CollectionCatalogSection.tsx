"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowLeft, ChevronRight, ShoppingBag } from "lucide-react";
import { TEFLOOK_COLLECTION_CARDS } from "@/components/collections/CollectionCardsGrid";
import { ProductCard } from "@/components/product/ProductCard";
import {
  DEFAULT_PRODUCT_FILTER_STATE,
  ProductFilterSortBar,
  applyProductFilterAndSort,
  type ProductFilterState,
} from "@/components/product/ProductFilterSortBar";
import {
  PRODUCT_AGE_BRACKETS,
  formatAgeBracketLabel,
  matchesProductAgeFilter,
} from "@/lib/cod-service";
import { fetchProducts, type ShopifyProduct } from "@/lib/shopify-storefront";
import {
  getChildStoreCategory,
  getChildStoreCategoryConfig,
  getCollectionSlug,
  type ChildStoreCategory,
} from "@/lib/teflook-categories";
import { useTefLookLanguage } from "@/lib/teflook-language";
import { cn } from "@/lib/utils";

export interface CollectionCatalogSectionProps {
  category: ChildStoreCategory;
  initialProducts?: ShopifyProduct[];
  onAddedToCart?: () => void;
  onNotice?: (message: string) => void;
  useQueryLinks?: boolean;
}

export function CollectionCatalogSection({
  category,
  initialProducts,
  onAddedToCart,
  onNotice,
  useQueryLinks = false,
}: CollectionCatalogSectionProps) {
  const { locale, direction, t } = useTefLookLanguage();
  const [isMounted, setIsMounted] = useState(false);
  const [products, setProducts] = useState<ShopifyProduct[]>(initialProducts ?? []);
  const [isLoading, setIsLoading] = useState(!initialProducts);
  const [activeAge, setActiveAge] = useState<string>("all");
  const [filterState, setFilterState] = useState<ProductFilterState>(
    DEFAULT_PRODUCT_FILTER_STATE
  );

  useEffect(() => {
    setIsMounted(true);

    let isCancelled = false;
    const loadLatest = async () => {
      try {
        const fetched = await fetchProducts();
        if (!isCancelled) {
          setProducts(fetched);
        }
      } finally {
        if (!isCancelled) {
          setIsLoading(false);
        }
      }
    };

    void loadLatest();

    const handleSync = () => {
      void loadLatest();
    };

    window.addEventListener("teflook:products-updated", handleSync);
    window.addEventListener("storage", handleSync);

    const channel =
      typeof BroadcastChannel !== "undefined"
        ? new BroadcastChannel("teflook_sync")
        : null;
    if (channel) {
      channel.onmessage = handleSync;
    }

    return () => {
      isCancelled = true;
      window.removeEventListener("teflook:products-updated", handleSync);
      window.removeEventListener("storage", handleSync);
      channel?.close();
    };
  }, []);

  useEffect(() => {
    setActiveAge("all");
    setFilterState(DEFAULT_PRODUCT_FILTER_STATE);
  }, [category]);

  const currentLocale = isMounted ? locale : "fr";
  const currentDirection = isMounted ? direction : "ltr";
  const isAr = currentLocale === "ar";

  const categoryConfig = getChildStoreCategoryConfig(category);
  const cardTheme =
    TEFLOOK_COLLECTION_CARDS.find((c) => c.value === category) ||
    TEFLOOK_COLLECTION_CARDS[0];
  const Icon = cardTheme.icon;

  const categoryProducts = useMemo(
    () => products.filter((p) => getChildStoreCategory(p) === category),
    [products, category]
  );

  const ageFilteredProducts = useMemo(
    () => categoryProducts.filter((p) => matchesProductAgeFilter(p, activeAge)),
    [categoryProducts, activeAge]
  );

  const filteredProducts = useMemo(
    () => applyProductFilterAndSort(ageFilteredProducts, filterState),
    [ageFilteredProducts, filterState]
  );

  const hasLocalFilters =
    activeAge !== "all" ||
    filterState.availability.length > 0 ||
    filterState.minPrice.trim() !== "" ||
    filterState.maxPrice.trim() !== "";

  const title = isAr ? categoryConfig.titleAr : categoryConfig.titleFr;
  const description = isAr ? categoryConfig.descAr : categoryConfig.descFr;

  function buildCollectionHref(cat: ChildStoreCategory): string {
    const slug = getCollectionSlug(cat);
    return useQueryLinks ? `/collections?category=${slug}` : `/collections/${slug}`;
  }

  return (
    <div dir={currentDirection} className="w-full">
      {/* Breadcrumb Bar */}
      <nav
        aria-label={isAr ? "مسار التنقل" : "Fil d'Ariane"}
        className="border-b border-[#4B9393]/15 bg-white/70 py-2.5"
      >
        <div className="store-shell flex items-center gap-2 text-xs text-slate-500 truncate">
          <Link href="/" className="hover:text-[#4B9393] transition-colors">
            {isAr ? "الرئيسية" : "Accueil"}
          </Link>
          <ChevronRight
            size={12}
            className={cn("shrink-0 text-slate-400", isAr && "rotate-180")}
          />
          <Link href="/collections" className="hover:text-[#4B9393] transition-colors">
            {isAr ? "المجموعات" : "Collections"}
          </Link>
          <ChevronRight
            size={12}
            className={cn("shrink-0 text-slate-400", isAr && "rotate-180")}
          />
          <span className="truncate font-semibold text-[#1A3C34]">{title}</span>
        </div>
      </nav>

      <section className="store-shell py-8 sm:py-12">
        {/* Back Link + Collection Header Card */}
        <div className="mb-8">
          <Link
            href="/collections"
            className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-[#4B9393] hover:text-[#F67D56] transition-colors mb-5"
          >
            <ArrowLeft
              size={15}
              className={cn("shrink-0", isAr && "rotate-180")}
              aria-hidden="true"
            />
            <span>{isAr ? "جميع المجموعات" : "Toutes les collections"}</span>
          </Link>

          <div className="bg-white border border-slate-200/80 rounded-2xl p-6 sm:p-8 shadow-[0_2px_12px_-4px_rgba(26,60,52,0.05)]">
            <div
              className={cn(
                "w-full h-8 rounded-full flex items-center justify-center mb-5",
                cardTheme.stripBgClass
              )}
              aria-hidden="true"
            >
              <Icon className={cn("size-[18px] stroke-[2]", cardTheme.iconColorClass)} />
            </div>

            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
              <div>
                <h1
                  className={cn(
                    "font-display text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#1A3C34] leading-tight",
                    isAr && "font-sans"
                  )}
                >
                  {title}
                </h1>
                <p
                  className={cn(
                    "mt-2 text-sm sm:text-base text-slate-500 max-w-2xl leading-relaxed",
                    isAr && "font-sans leading-loose"
                  )}
                >
                  {description}
                </p>
              </div>

              <span className="self-start sm:self-auto shrink-0 inline-flex items-center rounded-full bg-[#4B9393]/10 px-3.5 py-1.5 text-xs font-bold text-[#4B9393] tabular-nums">
                {isLoading && categoryProducts.length === 0
                  ? isAr
                    ? "جاري التحميل..."
                    : "Chargement..."
                  : `${filteredProducts.length} ${
                      filteredProducts.length > 1
                        ? t("shop.products")
                        : t("shop.product")
                    }`}
              </span>
            </div>
          </div>
        </div>

        {/* Collection Switcher Pills */}
        <div
          className="mb-4 flex items-center gap-2 overflow-x-auto no-scrollbar pb-1 -mx-4 px-4 sm:mx-0 sm:px-0 sm:flex-wrap"
          aria-label={isAr ? "تبديل المجموعة" : "Changer de collection"}
        >
          {TEFLOOK_COLLECTION_CARDS.map((col) => {
            const isCurrent = col.value === category;
            const colTitle = isAr ? col.titleAr : col.titleFr;
            return (
              <Link
                key={col.value}
                href={buildCollectionHref(col.value)}
                aria-current={isCurrent ? "page" : undefined}
                className={cn(
                  "whitespace-nowrap shrink-0 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all border",
                  isCurrent
                    ? "bg-[#4B9393] text-white border-[#4B9393] shadow-xs"
                    : "bg-white text-[#1A3C34] border-slate-200/90 hover:border-[#4B9393] hover:text-[#4B9393]"
                )}
              >
                {colTitle}
              </Link>
            );
          })}
        </div>

        {/* Age Bracket Filter Pills */}
        <div
          className="mb-3 flex items-center gap-2 overflow-x-auto no-scrollbar pb-1 -mx-4 px-4 sm:mx-0 sm:px-0 sm:flex-wrap"
          role="group"
          aria-label={isAr ? "تصفية حسب الفئة العمرية" : "Filtrer par tranche d'âge"}
        >
          <button
            type="button"
            onClick={() => setActiveAge("all")}
            aria-pressed={activeAge === "all"}
            className={cn(
              "whitespace-nowrap shrink-0 px-3.5 py-1.5 rounded-full text-xs font-display font-semibold transition-all cursor-pointer border",
              activeAge === "all"
                ? "bg-[#1A3C34] text-white border-[#1A3C34]"
                : "bg-white text-[#1A3C34] border-slate-200/90 hover:border-[#4B9393] hover:text-[#4B9393]",
              isAr && "font-sans"
            )}
          >
            {isAr ? "جميع الأعمار" : "Tous les âges"}
          </button>
          {PRODUCT_AGE_BRACKETS.filter((b) => b !== "Tous âges").map((bracket) => {
            const isSelected = activeAge === bracket;
            return (
              <button
                key={bracket}
                type="button"
                onClick={() =>
                  setActiveAge((cur) => (cur === bracket ? "all" : bracket))
                }
                aria-pressed={isSelected}
                className={cn(
                  "whitespace-nowrap shrink-0 px-3.5 py-1.5 rounded-full text-xs font-display font-semibold transition-all cursor-pointer border",
                  isSelected
                    ? "bg-[#1A3C34] text-white border-[#1A3C34]"
                    : "bg-white text-[#1A3C34] border-slate-200/90 hover:border-[#4B9393] hover:text-[#4B9393]",
                  isAr && "font-sans"
                )}
              >
                {formatAgeBracketLabel(bracket, currentLocale)}
              </button>
            );
          })}
        </div>

        {/* Filter & Sort Bar */}
        <ProductFilterSortBar
          products={ageFilteredProducts}
          filteredCount={filteredProducts.length}
          filterState={filterState}
          onFilterChange={setFilterState}
          hasExternalFilters={activeAge !== "all"}
          onClearAll={() => {
            setActiveAge("all");
            setFilterState(DEFAULT_PRODUCT_FILTER_STATE);
          }}
        />

        {/* Products Grid or Loading / Empty State */}
        {isLoading && filteredProducts.length === 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-3 gap-y-6 sm:gap-x-6 sm:gap-y-8 pt-4">
            {Array.from({ length: 4 }).map((_, idx) => (
              <div
                key={idx}
                className="rounded-2xl border border-slate-200/70 bg-white p-4 animate-pulse"
              >
                <div className="aspect-square w-full rounded-xl bg-slate-100 mb-4" />
                <div className="h-4 w-3/4 rounded bg-slate-100 mx-auto mb-2" />
                <div className="h-4 w-1/2 rounded bg-slate-100 mx-auto mb-4" />
                <div className="h-10 w-full rounded-full bg-slate-100" />
              </div>
            ))}
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="rounded-2xl border border-slate-200/80 bg-white px-6 py-14 sm:py-16 text-center shadow-[0_2px_12px_-4px_rgba(26,60,52,0.05)]">
            <div className="mx-auto grid size-14 place-items-center rounded-2xl bg-[#4B9393]/10 text-[#4B9393]">
              <ShoppingBag size={26} aria-hidden="true" />
            </div>
            <h2
              className={cn(
                "mt-4 font-display text-xl sm:text-2xl font-bold text-[#1A3C34]",
                isAr && "font-sans"
              )}
            >
              {isAr
                ? "لا توجد منتجات في هذه المجموعة حاليا"
                : "Aucun produit dans cette collection pour le moment"}
            </h2>
            <p
              className={cn(
                "mt-2 text-sm text-slate-500 max-w-md mx-auto",
                isAr && "font-sans"
              )}
            >
              {hasLocalFilters
                ? isAr
                  ? "حاول إعادة ضبط الفلاتر لعرض جميع منتجات هذه المجموعة."
                  : "Essayez de réinitialiser vos filtres ou explorez tous nos produits disponibles."
                : isAr
                ? "نضيف منتجات تعليمية جديدة باستمرار. تصفح جميع منتجاتنا الحالية."
                : "De nouveaux outils arrivent bientôt dans cette collection. Découvrez l'ensemble de notre catalogue."}
            </p>

            <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
              {hasLocalFilters && (
                <button
                  type="button"
                  onClick={() => {
                    setActiveAge("all");
                    setFilterState(DEFAULT_PRODUCT_FILTER_STATE);
                  }}
                  className="px-5 py-2.5 rounded-full border border-[#4B9393] text-xs sm:text-sm font-bold text-[#4B9393] hover:bg-[#4B9393] hover:text-white transition-colors cursor-pointer"
                >
                  {t("shop.reset")}
                </button>
              )}
              <Link
                href="/#boutique"
                className="px-6 py-2.5 rounded-full bg-[#F67D56] hover:bg-[#E06740] text-white text-xs sm:text-sm font-bold shadow-[0_6px_16px_-4px_rgba(246,125,86,0.38)] transition-all"
              >
                {isAr ? "عرض جميع المنتجات" : "Voir tous les produits"}
              </Link>
              <Link
                href="/collections"
                className="px-5 py-2.5 rounded-full border border-slate-200 bg-white hover:border-[#4B9393] text-[#1A3C34] hover:text-[#4B9393] text-xs sm:text-sm font-semibold transition-colors"
              >
                {isAr ? "كل المجموعات" : "Toutes les collections"}
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-3 gap-y-6 sm:gap-x-6 sm:gap-y-8 pt-4">
            {filteredProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onAdded={onAddedToCart}
                onNotice={onNotice}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
