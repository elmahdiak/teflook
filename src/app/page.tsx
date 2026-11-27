"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowDown,
  Check,
  Heart,
  Minus,
  Plus,
  ShoppingBag,
  Sparkles,
  Trash2,
  Truck,
  X,
} from "lucide-react";
import { QueryClient, QueryClientProvider, useQuery, useQueryClient } from "@tanstack/react-query";

import { Button } from "@/components/ui/button";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { ProductCard } from "@/components/product/ProductCard";
import {
  DEFAULT_PRODUCT_FILTER_STATE,
  ProductFilterSortBar,
  applyProductFilterAndSort,
  type ProductFilterState,
} from "@/components/product/ProductFilterSortBar";
import { CODCheckoutModal } from "@/components/cart/CODCheckoutModal";
import { FAQAccordion } from "@/components/faq/FAQAccordion";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useCartStore } from "@/lib/shopify-cart";
import { fetchProducts, type ShopifyProduct } from "@/lib/shopify-storefront";
import {
  CHILD_STORE_CATEGORIES,
  getChildStoreCategory,
  getCollectionSlug,
  resolveChildStoreCategory,
  type ChildStoreCategory,
} from "@/lib/teflook-categories";
import {
  PRODUCT_AGE_BRACKETS,
  formatAgeBracketLabel,
  matchesProductAgeFilter,
} from "@/lib/cod-service";
import { CHILD_STORE_CATEGORY_MESSAGE_KEYS, useTefLookLanguage } from "@/lib/teflook-language";
import { getLocalizedProduct } from "@/lib/product-localization";
import { cn } from "@/lib/utils";

const formatPrice = (
  price: { amount: string; currencyCode: string },
  locale: "fr" | "ar" = "fr"
) =>
  new Intl.NumberFormat(locale === "ar" ? "ar-MA" : "fr-MA", {
    style: "currency",
    currency: price.currencyCode,
    maximumFractionDigits: 2,
  }).format(Number(price.amount));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 0,
      refetchOnWindowFocus: true,
    },
  },
});

export default function Page() {
  return (
    <QueryClientProvider client={queryClient}>
      <TefLookStorefront />
    </QueryClientProvider>
  );
}

function TefLookStorefront() {
  const queryClient = useQueryClient();
  const { data: products = [] } = useQuery({
    queryKey: ["teflook-shopify-products"],
    queryFn: fetchProducts,
  });
  const { direction, locale, t } = useTefLookLanguage();
  const [activeCategory, setActiveCategory] = useState<ChildStoreCategory | "all">("all");
  const [activeAge, setActiveAge] = useState<string>("all");
  const [filterState, setFilterState] = useState<ProductFilterState>(
    DEFAULT_PRODUCT_FILTER_STATE
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCODModalOpen, setIsCODModalOpen] = useState(false);
  const [notice, setNotice] = useState("");
  const [isMounted, setIsMounted] = useState(false);
  const { error: cartError } = useCartStore();

  useEffect(() => {
    setIsMounted(true);
    void useCartStore.persist.rehydrate();

    // Support URL search/category/age params when navigating from product pages
    try {
      const params = new URLSearchParams(window.location.search);
      const qParam = params.get("q");
      const catParam = params.get("category");
      const ageParam = params.get("age");
      if (qParam) setSearchTerm(qParam);
      const resolvedCat = resolveChildStoreCategory(catParam);
      if (resolvedCat) {
        setActiveCategory(resolvedCat);
      }
      if (
        ageParam &&
        PRODUCT_AGE_BRACKETS.some(
          (b) => b.toLowerCase() === ageParam.trim().toLowerCase()
        )
      ) {
        setActiveAge(ageParam.trim());
      }
    } catch {}

    // Instant real-time synchronization with admin CRUD actions
    const handleSync = () => {
      queryClient.invalidateQueries({ queryKey: ["teflook-shopify-products"] });
      queryClient.refetchQueries({ queryKey: ["teflook-shopify-products"] });
    };

    window.addEventListener("teflook:products-updated", handleSync);
    window.addEventListener("storage", handleSync);

    const channel = typeof BroadcastChannel !== "undefined" ? new BroadcastChannel("teflook_sync") : null;
    if (channel) {
      channel.onmessage = handleSync;
    }

    return () => {
      window.removeEventListener("teflook:products-updated", handleSync);
      window.removeEventListener("storage", handleSync);
      channel?.close();
    };
  }, [queryClient]);

  const baseCategoryAgeProducts = useMemo(() => {
    const normalizedQuery = searchTerm.trim().toLocaleLowerCase("fr");
    return products.filter((product) => {
      const matchesCategory =
        activeCategory === "all" || getChildStoreCategory(product) === activeCategory;
      const matchesAge = matchesProductAgeFilter(product, activeAge);
      const matchesQuery =
        !normalizedQuery ||
        `${product.title} ${product.description} ${product.productType} ${product.vendor}`
          .toLocaleLowerCase("fr")
          .includes(normalizedQuery);
      return matchesCategory && matchesAge && matchesQuery;
    });
  }, [products, activeCategory, activeAge, searchTerm]);

  const filteredProducts = useMemo(
    () => applyProductFilterAndSort(baseCategoryAgeProducts, filterState),
    [baseCategoryAgeProducts, filterState]
  );

  return (
    <main lang={locale} dir={direction} className="min-h-screen bg-background text-foreground">
      {/* 1. Announcement Marquee Ticker */}
      <div
        dir={direction}
        className="overflow-hidden bg-primary py-2 text-primary-foreground"
        aria-label={t("a11y.promises")}
      >
        <div
          lang={locale}
          dir={direction}
          className={cn(
            "announcement-track flex font-semibold",
            locale === "ar"
              ? "text-xs tracking-normal font-sans"
              : "text-[11px] uppercase tracking-[0.13em]"
          )}
        >
          {[0, 1].map((copy) => (
            <div
              key={copy}
              aria-hidden={copy === 1}
              className="flex shrink-0 items-center gap-6 sm:gap-10 pe-6 sm:pe-10 whitespace-nowrap"
            >
              <span>{t("announcement.one")}</span>
              <span>{t("announcement.two")}</span>
              <span>{t("announcement.three")}</span>
              <span>{t("announcement.four")}</span>
            </div>
          ))}
        </div>
      </div>

      {/* 2. Sticky Header & Expandable Search Bar */}
      <Header
        activeCategory={activeCategory}
        onSelectCategory={setActiveCategory}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        onOpenCart={() => setIsCartOpen(true)}
        defaultSearchOpen={false}
      />

      {/* 3. Hero Section - Full-Width Display with Architectural Inset Frame & Scroll Cue */}
      <section
        className="relative w-full overflow-hidden bg-[#F7FAFA]"
        aria-label={locale === "ar" ? "الواجهة الرئيسية" : "Bannière principale"}
      >
        <div className="relative w-full h-[70dvh] sm:h-[520px] md:h-[620px] lg:h-[680px] overflow-hidden pb-16 sm:pb-20 lg:pb-24">
          <img
            src="/Gemini_Generated_Gif_frnpcwfrnpcwfrnp.gif"
            alt="TefLook - Grandir, jouer et s'épanouir ensemble"
            className="absolute inset-0 h-full w-full object-cover object-center opacity-100"
            loading="eager"
          />

          {/* Subtle Bottom Scrim for Contrast */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/40 via-black/5 to-transparent"
          />

          {/* Responsive Architectural Inset Keyline Frame */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-3 sm:inset-5 lg:inset-8 rounded-xl sm:rounded-2xl lg:rounded-3xl border border-white/25 z-10"
          />

          {/* Bottom-Center EXPLORER Scroll Cue */}
          <a
            href="#boutique"
            onClick={(e) => {
              e.preventDefault();
              document.getElementById("boutique")?.scrollIntoView({ behavior: "smooth" });
            }}
            aria-label={
              locale === "ar"
                ? "اكتشف المتجر"
                : "Explorer la boutique ci-dessous"
            }
            className="absolute bottom-5 sm:bottom-8 lg:bottom-11 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-1.5 sm:gap-2 group cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-white/80 rounded-md px-2 py-0.5"
          >
            <span
              className={cn(
                "text-[9px] sm:text-[10px] lg:text-[11px] font-semibold uppercase text-white/80 group-hover:text-white transition-colors",
                locale === "ar"
                  ? "font-sans tracking-normal text-[11px] sm:text-xs"
                  : "tracking-[0.25em] sm:tracking-[0.35em]"
              )}
            >
              {locale === "ar" ? "اكتشف" : "EXPLORER"}
            </span>
            <span
              aria-hidden="true"
              className="w-[1px] h-5 sm:h-7 lg:h-9 bg-gradient-to-b from-white/80 to-transparent group-hover:h-7 sm:group-hover:h-9 lg:group-hover:h-11 transition-all duration-300"
            />
          </a>
        </div>
      </section>

      {/* 4. Shop Catalogue Section */}
      <section
        id="boutique"
        className="scroll-mt-24 border-y border-border bg-card"
        aria-labelledby="shop-title"
      >
        <div className="store-shell py-12 sm:py-16">
          <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.15em] text-brand-orange">
                {t("shop.eyebrow")}
              </p>
              <h2 id="shop-title" className="mt-2 font-display text-3xl font-semibold">
                {searchTerm ? `${t("shop.searchResults")} « ${searchTerm} »` : t("shop.heading")}
              </h2>
              {products.length > 0 && (
                <div className="mt-2 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                  <span>
                    {filteredProducts.length}{" "}
                    {filteredProducts.length > 1 ? t("shop.products") : t("shop.product")}
                  </span>
                  {activeCategory !== "all" && (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-teal/10 px-3 py-0.5 text-xs font-semibold text-brand-teal">
                      <span>{t(CHILD_STORE_CATEGORY_MESSAGE_KEYS[activeCategory])}</span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveCategory("all");
                        }}
                        className="ml-1 text-sm font-bold leading-none hover:text-brand-orange cursor-pointer"
                        aria-label="Effacer le filtre"
                        title="Effacer le filtre"
                      >
                        ×
                      </button>
                    </span>
                  )}
                  {activeAge !== "all" && (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-[#4B9393]/10 px-3 py-0.5 text-xs font-semibold text-[#4B9393]">
                      <span>{formatAgeBracketLabel(activeAge, locale)}</span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveAge("all");
                        }}
                        className="ml-1 text-sm font-bold leading-none hover:text-brand-orange cursor-pointer"
                        aria-label={locale === "ar" ? "إزالة فلتر العمر" : "Effacer le filtre d'âge"}
                      >
                        ×
                      </button>
                    </span>
                  )}
                </div>
              )}
            </div>
            <div className="flex items-center gap-3">
              {activeCategory !== "all" && (
                <Link
                  href={`/collections/${getCollectionSlug(activeCategory)}`}
                  className="text-xs font-semibold text-[#4B9393] hover:text-[#F67D56] transition-colors"
                >
                  {locale === "ar" ? "عرض صفحة المجموعة ←" : "Ouvrir la collection →"}
                </Link>
              )}
              {(activeCategory !== "all" || activeAge !== "all") && (
                <button
                  type="button"
                  onClick={() => {
                    setActiveCategory("all");
                    setActiveAge("all");
                  }}
                  className="text-xs font-medium text-brand-teal underline hover:text-brand-orange transition-colors cursor-pointer"
                >
                  {t("shop.reset")}
                </button>
              )}
              <button
                type="button"
                className="inline-flex items-center gap-2 text-[13px] font-semibold text-primary hover:text-brand-orange cursor-pointer"
                onClick={() =>
                  document.getElementById("product-grid")?.scrollIntoView({ behavior: "smooth" })
                }
              >
                {t("shop.discover")} <ArrowDown size={15} />
              </button>
            </div>
          </div>

          {/* Age Bracket Filter Pills */}
          <div
            className="mb-3 flex items-center gap-2 overflow-x-auto no-scrollbar pb-1 -mx-4 px-4 sm:mx-0 sm:px-0 sm:flex-wrap sm:justify-center"
            role="group"
            aria-label={locale === "ar" ? "تصفية حسب الفئة العمرية" : "Filtrer par tranche d'âge"}
          >
            <button
              type="button"
              onClick={() => setActiveAge("all")}
              aria-pressed={activeAge === "all"}
              className={cn(
                "whitespace-nowrap shrink-0 px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-full text-xs sm:text-sm font-display font-semibold transition-all cursor-pointer border",
                activeAge === "all"
                  ? "bg-[#4B9393] text-white shadow-[0_4px_12px_-2px_rgba(75,147,147,0.4)] border-[#4B9393]"
                  : "bg-white text-[#1A3C34] border-slate-200/90 hover:border-[#4B9393] hover:text-[#4B9393]",
                locale === "ar" && "font-sans"
              )}
            >
              {locale === "ar" ? "جميع الأعمار" : "Tous les âges"}
            </button>
            {PRODUCT_AGE_BRACKETS.filter((b) => b !== "Tous âges").map((bracket) => {
              const isSelected = activeAge === bracket;
              return (
                <button
                  key={bracket}
                  type="button"
                  onClick={() => setActiveAge((cur) => (cur === bracket ? "all" : bracket))}
                  aria-pressed={isSelected}
                  className={cn(
                    "whitespace-nowrap shrink-0 px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-full text-xs sm:text-sm font-display font-semibold transition-all cursor-pointer border",
                    isSelected
                      ? "bg-[#4B9393] text-white shadow-[0_4px_12px_-2px_rgba(75,147,147,0.4)] border-[#4B9393]"
                      : "bg-white text-[#1A3C34] border-slate-200/90 hover:border-[#4B9393] hover:text-[#4B9393]",
                    locale === "ar" && "font-sans"
                  )}
                >
                  {formatAgeBracketLabel(bracket, locale)}
                </button>
              );
            })}
          </div>

          {/* Minimalist Availability, Price & Sort Toolbar */}
          <ProductFilterSortBar
            products={baseCategoryAgeProducts}
            filteredCount={filteredProducts.length}
            filterState={filterState}
            onFilterChange={setFilterState}
            hasExternalFilters={
              activeCategory !== "all" || activeAge !== "all" || searchTerm.trim() !== ""
            }
            onClearAll={() => {
              setSearchTerm("");
              setActiveCategory("all");
              setActiveAge("all");
            }}
          />

          {filteredProducts.length === 0 ? (
            <div className="border-y border-border py-14 text-center" id="product-grid">
              <ShoppingBag size={30} className="mx-auto text-primary" aria-hidden="true" />
              <p className="mt-4 font-display text-2xl font-semibold">
                {activeCategory !== "all"
                  ? locale === "ar"
                    ? "لا توجد منتجات في هذه المجموعة حاليا"
                    : "Aucun produit dans cette collection pour le moment"
                  : t("shop.noProducts")}
              </p>
              <p className="mt-2 text-sm text-muted-foreground">
                {products.length === 0 ? t("shop.empty") : t("shop.emptyCategory")}
              </p>
              {(searchTerm ||
                activeCategory !== "all" ||
                activeAge !== "all" ||
                filterState.availability.length > 0 ||
                filterState.minPrice.trim() !== "" ||
                filterState.maxPrice.trim() !== "") && (
                <Button
                  type="button"
                  variant="outline"
                  className="mt-5 rounded-full border-[#4B9393] text-[#4B9393] hover:bg-[#4B9393] hover:text-white cursor-pointer"
                  onClick={() => {
                    setSearchTerm("");
                    setActiveCategory("all");
                    setActiveAge("all");
                    setFilterState(DEFAULT_PRODUCT_FILTER_STATE);
                  }}
                >
                  {activeCategory !== "all"
                    ? locale === "ar"
                      ? "عرض جميع المنتجات"
                      : "Voir tous les produits"
                    : t("shop.reset")}
                </Button>
              )}
            </div>
          ) : (
            <div
              id="product-grid"
              className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-3 gap-y-6 sm:gap-x-6 sm:gap-y-8 pt-4"
            >
              {filteredProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onAdded={() => setIsCartOpen(true)}
                  onNotice={setNotice}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* 6. Values Section */}
      <section id="univers" className="store-shell scroll-mt-24 py-14 sm:py-20">
        <div className="grid gap-8 border-y border-border py-10 sm:grid-cols-3 sm:py-12">
          <ValuePoint
            icon={<Sparkles size={19} />}
            title={t("values.safety")}
            detail={t("values.safetyText")}
          />
          <ValuePoint
            icon={<Heart size={19} />}
            title={t("values.growth")}
            detail={t("values.growthText")}
          />
          <ValuePoint
            icon={<Truck size={20} />}
            title={t("values.connection")}
            detail={t("values.connectionText")}
          />
        </div>
      </section>

      {/* 7. Collapsible Storefront FAQ Section */}
      <FAQAccordion />

      {/* 8. Multi-column Slanted Teal Footer */}
      <Footer />

      {/* Cart Sheet Drawer */}
      <CartSheet
        open={isCartOpen}
        onOpenChange={setIsCartOpen}
        onOpenCODCheckout={() => setIsCODModalOpen(true)}
      />

      {/* Cash on Delivery Modal */}
      <CODCheckoutModal open={isCODModalOpen} onOpenChange={setIsCODModalOpen} />

      {/* Toast Notification */}
      {(notice || cartError) && (
        <div
          role={cartError ? "alert" : "status"}
          className="fixed bottom-4 left-1/2 z-50 flex max-w-[calc(100vw-2rem)] -translate-x-1/2 items-center gap-3 border border-border bg-card px-4 py-3 text-sm text-foreground shadow-lg"
        >
          {cartError ? (
            <X size={17} className="shrink-0 text-destructive" />
          ) : (
            <Check size={17} className="shrink-0 text-primary" />
          )}
          <span className="min-w-0">{cartError ?? notice}</span>
          <button
            type="button"
            className="grid size-7 shrink-0 place-items-center"
            aria-label={t("notice.close")}
            onClick={() => {
              setNotice("");
              useCartStore.setState({ error: null });
            }}
          >
            <X size={15} />
          </button>
        </div>
      )}
    </main>
  );
}

function ValuePoint({
  icon,
  title,
  detail,
}: {
  icon: React.ReactNode;
  title: string;
  detail: string;
}) {
  return (
    <div className="flex gap-4">
      <div className="grid size-10 shrink-0 place-items-center border border-border text-brand-orange">
        {icon}
      </div>
      <div>
        <h3 className="text-sm font-semibold">{title}</h3>
        <p className="mt-1.5 text-[13px] leading-5 text-muted-foreground">{detail}</p>
      </div>
    </div>
  );
}

function CartSheet({
  open,
  onOpenChange,
  onOpenCODCheckout,
}: {
  open: boolean;
  onOpenChange: (value: boolean) => void;
  onOpenCODCheckout?: () => void;
}) {
  const { locale, direction, t } = useTefLookLanguage();
  const { items, isLoading, isSyncing, error } = useCartStore();
  const updateQuantity = useCartStore((state) => state.updateQuantity);
  const removeItem = useCartStore((state) => state.removeItem);
  const syncCart = useCartStore((state) => state.syncCart);
  const itemCount = items.reduce((total, item) => total + item.quantity, 0);
  const total = items.reduce((sum, item) => sum + Number(item.price.amount) * item.quantity, 0);
  const currency = items[0]?.price.currencyCode || "MAD";

  useEffect(() => {
    if (open && items.length > 0) void syncCart();
  }, [open, items.length, syncCart]);

  function handleCheckout() {
    onOpenChange(false);
    if (onOpenCODCheckout) {
      onOpenCODCheckout();
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side={direction === "rtl" ? "left" : "right"}
        dir={direction}
        className="flex w-[min(100vw,440px)] flex-col gap-0 border-s border-border p-0 sm:max-w-[440px]"
      >
        <SheetHeader className="border-b border-border px-6 py-5 pe-14 text-start">
          <div className="flex items-center gap-2">
            <ShoppingBag size={19} className="text-primary" />
            <SheetTitle className="font-display text-xl">{t("cart.title")}</SheetTitle>
          </div>
          <SheetDescription>
            {itemCount
              ? `${itemCount} ${itemCount === 1 ? t("cart.countItem") : t("cart.countItems")}${t("cart.countPrefix")}`
              : t("cart.emptyText")}
          </SheetDescription>
        </SheetHeader>
        <div className="flex flex-1 flex-col overflow-hidden px-6">
          {items.length === 0 ? (
            <div className="flex flex-1 flex-col items-center justify-center text-center">
              <div className="grid size-14 place-items-center border border-border text-primary">
                <ShoppingBag size={23} />
              </div>
              <p className="mt-5 font-display text-lg font-semibold">{t("cart.empty")}</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Une jolie trouvaille vous attend dans la boutique.
              </p>
              <Button onClick={() => onOpenChange(false)} className="mt-5 rounded-[3px] px-5">
                {t("cart.keepShopping")}
              </Button>
            </div>
          ) : (
            <>
              <div className="flex-1 divide-y divide-border overflow-y-auto">
                {items.map((item) => {
                  const image = item.product.images.edges[0]?.node;
                  return (
                    <article key={item.variantId} className="flex gap-3 py-4">
                      <div className="size-[76px] shrink-0 overflow-hidden bg-secondary">
                        {image && (
                          <img
                            src={image.url}
                            alt={image.altText || item.product.title}
                            className="size-full object-cover"
                          />
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="line-clamp-2 text-[13px] font-semibold leading-5">
                          {item.product.title}
                        </p>
                        {item.variantTitle !== "Default Title" && (
                          <p className="mt-1 text-xs text-muted-foreground">{item.variantTitle}</p>
                        )}
                        <p className="mt-1.5 text-sm font-bold text-brand-orange-deep">
                          {formatPrice(item.price)}
                        </p>
                        <div className="mt-2 flex items-center gap-3">
                          <div className="flex h-8 items-center border border-border">
                            <button
                              type="button"
                              disabled={isLoading || item.quantity <= 1}
                              aria-label={`Diminuer ${item.product.title}`}
                              onClick={() => void updateQuantity(item.variantId, item.quantity - 1)}
                              className="grid size-8 place-items-center text-muted-foreground hover:text-foreground disabled:opacity-40"
                            >
                              <Minus size={13} />
                            </button>
                            <span className="w-7 text-center text-xs font-semibold">
                              {item.quantity}
                            </span>
                            <button
                              type="button"
                              disabled={isLoading}
                              aria-label={`Augmenter ${item.product.title}`}
                              onClick={() => void updateQuantity(item.variantId, item.quantity + 1)}
                              className="grid size-8 place-items-center text-muted-foreground hover:text-foreground disabled:opacity-40"
                            >
                              <Plus size={13} />
                            </button>
                          </div>
                          <button
                            type="button"
                            disabled={isLoading}
                            aria-label={`Retirer ${item.product.title}`}
                            onClick={() => void removeItem(item.variantId)}
                            className="grid size-8 place-items-center text-muted-foreground hover:text-destructive disabled:opacity-40"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
              <div className="space-y-4 border-t border-border py-5">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">{t("cart.subtotal")}</span>
                  <span className="font-display text-xl font-semibold">
                    {currency &&
                      new Intl.NumberFormat(locale === "ar" ? "ar-MA" : "fr-MA", {
                        style: "currency",
                        currency,
                        maximumFractionDigits: 2,
                      }).format(total)}
                  </span>
                </div>
                <p className="text-xs leading-5 text-muted-foreground">{t("cart.shippingFee")}</p>
                {error && (
                  <p role="alert" className="text-sm text-destructive">
                    {error}
                  </p>
                )}
                <Button
                  onClick={handleCheckout}
                  disabled={items.length === 0}
                  className="h-12 w-full justify-between rounded-[4px] bg-brand-orange px-5 text-white hover:bg-brand-orange/90 font-bold shadow-md cursor-pointer"
                >
                  <span>Commander • Paiement à la livraison</span>
                  <ShoppingBag size={18} />
                </Button>
                <p className="text-center text-[11px] text-muted-foreground font-medium">
                  💵 Règlement en espèces à la livraison partout au Maroc
                </p>
              </div>
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
