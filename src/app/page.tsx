"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowDown,
  ArrowRight,
  ArrowUpRight,
  Brain,
  Check,
  Footprints,
  Heart,
  LoaderCircle,
  Minus,
  Palette,
  Plus,
  Puzzle,
  ShoppingBag,
  Sparkles,
  Sprout,
  Star,
  Target,
  Trash2,
  Truck,
  UsersRound,
  X,
  type LucideIcon,
} from "lucide-react";
import { QueryClient, QueryClientProvider, useQuery, useQueryClient } from "@tanstack/react-query";

import { Button } from "@/components/ui/button";
import { BrandLogo } from "@/components/ui/BrandLogo";
import { Header } from "@/components/layout/Header";
import { ProductCard } from "@/components/product/ProductCard";
import { CODCheckoutModal } from "@/components/cart/CODCheckoutModal";
import { FAQAccordion } from "@/components/faq/FAQAccordion";
import { FooterSocialLinks } from "@/components/footer/FooterSocialLinks";
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
  type ChildStoreCategory,
} from "@/lib/teflook-categories";
import { CHILD_STORE_CATEGORY_MESSAGE_KEYS, useTefLookLanguage } from "@/lib/teflook-language";
import { getLocalizedProduct } from "@/lib/product-localization";
import { cn } from "@/lib/utils";
import { useCookieConsent } from "@/lib/cookies";

interface CategoryPillarTheme {
  icon: LucideIcon;
  bgTint: string;
  iconColor: string;
  badgeBg: string;
  badgeText: string;
}

const CATEGORY_THEMES: Record<ChildStoreCategory, CategoryPillarTheme> = {
  discipline: {
    icon: Target,
    bgTint: "bg-[#4b9797]/10 group-hover:bg-[#4b9797]/20",
    iconColor: "text-[#4b9797]",
    badgeBg: "bg-[#4b9797]/10",
    badgeText: "text-[#4b9797]",
  },
  emotionalIntelligence: {
    icon: Heart,
    bgTint: "bg-[#ff3500]/10 group-hover:bg-[#ff3500]/20",
    iconColor: "text-[#ff3500]",
    badgeBg: "bg-[#ff3500]/10",
    badgeText: "text-[#ff3500]",
  },
  independence: {
    icon: Sprout,
    bgTint: "bg-[#2B6E73]/10 group-hover:bg-[#2B6E73]/20",
    iconColor: "text-[#2B6E73]",
    badgeBg: "bg-[#2B6E73]/10",
    badgeText: "text-[#2B6E73]",
  },
  confidence: {
    icon: UsersRound,
    bgTint: "bg-[#ff3500]/10 group-hover:bg-[#ff3500]/20",
    iconColor: "text-[#ff3500]",
    badgeBg: "bg-[#ff3500]/10",
    badgeText: "text-[#ff3500]",
  },
  creativity: {
    icon: Palette,
    bgTint: "bg-[#ffbf00]/15 group-hover:bg-[#ffbf00]/25",
    iconColor: "text-[#d99000]",
    badgeBg: "bg-[#ffbf00]/15",
    badgeText: "text-[#b47b00]",
  },
  criticalThinking: {
    icon: Puzzle,
    bgTint: "bg-[#4b9797]/10 group-hover:bg-[#4b9797]/20",
    iconColor: "text-[#4b9797]",
    badgeBg: "bg-[#4b9797]/10",
    badgeText: "text-[#4b9797]",
  },
};

const categoryIcons: Record<ChildStoreCategory, LucideIcon> = {
  discipline: Target,
  emotionalIntelligence: Heart,
  independence: Sprout,
  confidence: UsersRound,
  creativity: Palette,
  criticalThinking: Puzzle,
};

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
  const { openSettingsModal } = useCookieConsent();
  const [activeCategory, setActiveCategory] = useState<ChildStoreCategory | "all">("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCODModalOpen, setIsCODModalOpen] = useState(false);
  const [notice, setNotice] = useState("");
  const [isMounted, setIsMounted] = useState(false);
  const { error: cartError } = useCartStore();

  useEffect(() => {
    setIsMounted(true);
    void useCartStore.persist.rehydrate();

    // Support URL search/category params when navigating from product pages
    try {
      const params = new URLSearchParams(window.location.search);
      const qParam = params.get("q");
      const catParam = params.get("category") as ChildStoreCategory | null;
      if (qParam) setSearchTerm(qParam);
      if (
        catParam &&
        CHILD_STORE_CATEGORIES.some((c) => c.value === catParam)
      ) {
        setActiveCategory(catParam);
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

  const filteredProducts = useMemo(() => {
    const normalizedQuery = searchTerm.trim().toLocaleLowerCase("fr");
    return products.filter((product) => {
      const matchesCategory =
        activeCategory === "all" || getChildStoreCategory(product) === activeCategory;
      const matchesQuery =
        !normalizedQuery ||
        `${product.title} ${product.description} ${product.productType} ${product.vendor}`
          .toLocaleLowerCase("fr")
          .includes(normalizedQuery);
      return matchesCategory && matchesQuery;
    });
  }, [products, activeCategory, searchTerm]);

  const categories = CHILD_STORE_CATEGORIES.map((category) => ({
    ...category,
    label: t(CHILD_STORE_CATEGORY_MESSAGE_KEYS[category.value]),
    subtitle: t(`${CHILD_STORE_CATEGORY_MESSAGE_KEYS[category.value]}.subtitle`) || category.subtitle,
    Icon: categoryIcons[category.value],
  }));

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
              className="flex shrink-0 min-w-full items-center justify-around gap-8 sm:gap-12 px-4 sm:px-6 whitespace-nowrap"
            >
              <span>{t("announcement.one")}</span>
              <span aria-hidden="true" className="opacity-50">•</span>
              <span>{t("announcement.two")}</span>
              <span aria-hidden="true" className="opacity-50">•</span>
              <span>{t("announcement.three")}</span>
              <span aria-hidden="true" className="opacity-50">•</span>
              <span>{t("announcement.four")}</span>
              <span aria-hidden="true" className="opacity-50">•</span>
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
        defaultSearchOpen={true}
      />

      {/* 3. Hero Section - Pure Full-Width Unobstructed Visual Display */}
      <section className="relative w-full overflow-hidden bg-[#FBF9F5]" aria-label="Bannière principale">
        <div className="relative w-full h-[420px] sm:h-[520px] md:h-[620px] lg:h-[680px] overflow-hidden">
          <img
            src="/Gemini_Generated_Gif_frnpcwfrnpcwfrnp.gif"
            alt="TefLook - Grandir, jouer et s'épanouir ensemble"
            className="h-full w-full object-cover object-center opacity-100"
            loading="eager"
          />
        </div>
      </section>

      {/* 4. Developmental Categories (The 6 Pillars) */}
      <section className="store-shell pb-12 pt-10 sm:pt-14" aria-label={t("category.heading")}>
        <div className="mb-8 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <p className="text-[12px] font-bold uppercase tracking-[0.18em] text-[#ff3500]">
              {t("category.eyebrow")}
            </p>
            <h2 className="mt-2 font-display text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#1A2D2A] tracking-tight">
              {t("category.heading")}
            </h2>
          </div>
          {activeCategory !== "all" && (
            <button
              type="button"
              onClick={() => setActiveCategory("all")}
              className="self-start sm:self-auto text-xs font-bold text-[#4b9797] hover:text-[#ff3500] transition-colors underline cursor-pointer"
            >
              Afficher tous les univers
            </button>
          )}
        </div>

        <div className="grid grid-cols-3 gap-2 sm:gap-4 lg:grid-cols-6 lg:gap-5">
          {categories.map((category) => {
            const isSelected = activeCategory === category.value;
            const theme = CATEGORY_THEMES[category.value];
            const Icon = theme.icon;

            return (
              <button
                type="button"
                key={category.value}
                aria-pressed={isSelected}
                onClick={() => {
                  setActiveCategory((current) =>
                    current === category.value ? "all" : category.value
                  );
                  document.getElementById("boutique")?.scrollIntoView({ behavior: "smooth" });
                }}
                className={`group relative flex min-h-[140px] sm:min-h-[225px] flex-col items-center justify-between rounded-2xl sm:rounded-3xl p-2 sm:p-5 text-center transition-all duration-300 cursor-pointer ${
                  isSelected
                    ? "border-2 border-[#4b9797] bg-[#F4F9F9] shadow-md ring-2 sm:ring-4 ring-[#4b9797]/15 scale-[1.02]"
                    : "border border-[#EAE7DF] bg-white text-card-foreground shadow-xs hover:border-[#4b9797]/50 hover:bg-[#FAF9F6] hover:shadow-md hover:-translate-y-1"
                }`}
              >
                {/* 2D Vector Graphic Icon in Soft Rounded Container */}
                <div className="relative mb-1.5 sm:mb-3 flex items-center justify-center">
                  <div
                    className={`size-10 sm:size-16 rounded-xl sm:rounded-2xl flex items-center justify-center transition-all duration-300 ${theme.bgTint} ${
                      isSelected ? "scale-105 shadow-xs" : "group-hover:scale-110"
                    }`}
                  >
                    <Icon className={`size-5 sm:size-8 ${theme.iconColor} stroke-[2.2] transition-transform duration-300`} />
                  </div>
                  {isSelected && (
                    <span className="absolute -top-1 -right-1 grid size-4 sm:size-5 place-items-center rounded-full bg-[#4b9797] text-white shadow-xs">
                      <Check size={9} strokeWidth={3} className="sm:hidden" />
                      <Check size={11} strokeWidth={3} className="hidden sm:block" />
                    </span>
                  )}
                </div>

                {/* Typography Hierarchy: Subtitle Badge + Bold Title */}
                <div className="flex flex-1 flex-col justify-center items-center gap-1 sm:gap-1.5 w-full">
                  <span
                    className={`inline-flex items-center px-1.5 sm:px-2.5 py-0.5 rounded-full text-[9px] sm:text-[11px] font-extrabold uppercase tracking-wider ${theme.badgeBg} ${theme.badgeText}`}
                  >
                    {category.subtitle}
                  </span>
                  <span className="text-[11px] sm:text-[14px] font-bold text-[#1E293B] group-hover:text-[#4b9797] transition-colors leading-[1.25] sm:leading-snug line-clamp-2 max-w-[17ch]">
                    {category.label}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* 5. Shop Catalogue Section */}
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
                        className="ml-1 text-sm font-bold leading-none hover:text-brand-orange"
                        aria-label="Effacer le filtre"
                        title="Effacer le filtre"
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
                <button
                  type="button"
                  onClick={() => setActiveCategory("all")}
                  className="text-xs font-medium text-brand-teal underline hover:text-brand-orange transition-colors"
                >
                  {t("shop.reset")}
                </button>
              )}
              <button
                type="button"
                className="inline-flex items-center gap-2 text-[13px] font-semibold text-primary hover:text-brand-orange"
                onClick={() =>
                  document.getElementById("product-grid")?.scrollIntoView({ behavior: "smooth" })
                }
              >
                {t("shop.discover")} <ArrowDown size={15} />
              </button>
            </div>
          </div>

          {filteredProducts.length === 0 ? (
            <div className="border-y border-border py-14 text-center" id="product-grid">
              <ShoppingBag size={30} className="mx-auto text-primary" aria-hidden="true" />
              <p className="mt-4 font-display text-2xl font-semibold">{t("shop.noProducts")}</p>
              <p className="mt-2 text-sm text-muted-foreground">
                {products.length === 0 ? t("shop.empty") : t("shop.emptyCategory")}
              </p>
              {(searchTerm || activeCategory !== "all") && (
                <Button
                  type="button"
                  variant="outline"
                  className="mt-5 rounded-[3px]"
                  onClick={() => {
                    setSearchTerm("");
                    setActiveCategory("all");
                  }}
                >
                  {t("shop.reset")}
                </Button>
              )}
            </div>
          ) : (
            <div
              id="product-grid"
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-y-8 gap-x-6 pt-4"
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

      {/* 8. Multi-column Footer */}
      <footer className="border-t border-border bg-primary text-primary-foreground">
        <div className="store-shell grid gap-9 py-10 sm:grid-cols-[1.5fr_1fr_1fr] sm:py-12">
          <div>
            <div className="mb-3.5">
              <BrandLogo size="md" variant="dark" />
            </div>
            <p className="font-display text-xl font-semibold">{t("footer.tagline")}</p>
            <p className="mt-2 max-w-xs text-sm leading-6 text-primary-foreground/75">
              {t("footer.description")}
            </p>
            <FooterSocialLinks />
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.12em]">{t("footer.shop")}</p>
            <div className="mt-4 flex flex-col gap-3 text-sm text-primary-foreground/75">
              <a href="#boutique" className="transition-colors hover:text-primary-foreground">
                {t("footer.allProducts")}
              </a>
              <a href="#univers" className="transition-colors hover:text-primary-foreground">
                {t("footer.values")}
              </a>
            </div>
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.12em]">{t("footer.brand")}</p>
            <div className="mt-4 flex flex-col gap-3 text-sm text-primary-foreground/75">
              <span>{t("footer.children")}</span>
              <span>{t("footer.families")}</span>
              <span>{t("footer.help")}</span>
              <button
                type="button"
                onClick={openSettingsModal}
                className="text-start text-primary-foreground/75 hover:text-white transition-colors cursor-pointer"
              >
                {t("cookies.manageLink")}
              </button>
            </div>
          </div>
        </div>
        <div className="border-t border-primary-foreground/15">
          <div className="store-shell flex flex-wrap justify-between gap-2 py-4 pr-32 sm:pr-40 text-[11px] text-primary-foreground/65">
            <div className="flex items-center gap-3 sm:gap-4 flex-wrap">
              <span>© {isMounted ? new Date().getFullYear() : 2026} TefLook</span>
              <span>•</span>
              <button
                type="button"
                onClick={openSettingsModal}
                className="hover:text-white underline underline-offset-2 transition-colors cursor-pointer"
              >
                {t("cookies.manageLink")}
              </button>
            </div>
            <span>{t("footer.note")}</span>
          </div>
        </div>
      </footer>

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
