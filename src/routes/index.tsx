import { queryOptions, useSuspenseQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, Link, type ErrorComponentProps } from "@tanstack/react-router";
import {
  ArrowDown,
  ArrowRight,
  ArrowUpRight,
  Brain,
  Check,
  ChevronDown,
  Footprints,
  Heart,
  Lightbulb,
  LoaderCircle,
  Menu,
  Minus,
  Palette,
  Plus,
  Puzzle,
  Search,
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
import { useEffect, useMemo, useState } from "react";

import teflookLogo from "@/assets/teflook-mark.png.asset.json";
import { Button } from "@/components/ui/button";
import { TefLookLanguageSwitcher } from "@/components/teflook-language-switcher";
import { WhatsAppButton } from "@/components/ui/WhatsAppButton";
import { CODCheckoutModal } from "@/components/cart/CODCheckoutModal";
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

export const Route = createFileRoute("/" as any)({
  loader: ({ context }: { context: any }) => context.queryClient.ensureQueryData(productsQueryOptions),
  errorComponent: ProductCatalogueError,
  head: () => ({
    meta: [
      { title: "TefLook — Grandir, jouer, s’épanouir ensemble" },
      {
        name: "description",
        content:
          "TefLook accompagne les familles avec une sélection pour protéger les enfants, soutenir leur développement et renforcer le lien parent-enfant.",
      },
      { property: "og:title", content: "TefLook — Grandir, jouer, s’épanouir ensemble" },
      {
        property: "og:description",
        content:
          "Une sélection pour protéger les enfants, accompagner leur développement et nourrir les liens avec leurs parents.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: TefLookStorefront,
});

const formatPrice = (price: { amount: string; currencyCode: string }, locale: "fr" | "ar" = "fr") =>
  new Intl.NumberFormat(locale === "ar" ? "ar-MA" : "fr-MA", {
    style: "currency",
    currency: price.currencyCode,
    maximumFractionDigits: 2,
  }).format(Number(price.amount));

const productsQueryOptions = queryOptions({
  queryKey: ["teflook-shopify-products"],
  queryFn: fetchProducts,
  staleTime: 0,
});

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

function TefLookStorefront() {
  const queryClient = useQueryClient();
  const { data: products } = useSuspenseQuery(productsQueryOptions);
  const { direction, locale, t } = useTefLookLanguage();
  const [activeCategory, setActiveCategory] = useState<ChildStoreCategory | "all">("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCODModalOpen, setIsCODModalOpen] = useState(false);
  const [notice, setNotice] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { items, hasHydrated, error: cartError } = useCartStore();

  useEffect(() => {
    void useCartStore.persist.rehydrate();

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

  const count = hasHydrated ? items.reduce((total, item) => total + item.quantity, 0) : 0;
  const categories = CHILD_STORE_CATEGORIES.map((category) => ({
    ...category,
    label: t(CHILD_STORE_CATEGORY_MESSAGE_KEYS[category.value]),
    subtitle: t(`${CHILD_STORE_CATEGORY_MESSAGE_KEYS[category.value]}.subtitle`) || category.subtitle,
    Icon: categoryIcons[category.value],
  }));

  return (
    <main lang={locale} dir={direction} className="min-h-screen bg-background text-foreground">
      <div
        className="overflow-hidden bg-primary py-2 text-primary-foreground"
        aria-label={t("a11y.promises")}
      >
        <div lang={locale} className="announcement-track flex gap-12 text-[11px] font-semibold uppercase tracking-[0.13em]">
          {[0, 1].map((copy) => (
            <div key={copy} aria-hidden={copy === 1} className="flex gap-12">
              <span>{t("announcement.one")}</span>
              <span>{t("announcement.two")}</span>
              <span>{t("announcement.three")}</span>
              <span>{t("announcement.four")}</span>
            </div>
          ))}
        </div>
      </div>

      <header className="sticky top-0 z-30 border-b border-border bg-background/95 backdrop-blur-md">
        <div className="store-shell flex h-[82px] items-center justify-between gap-3 sm:gap-5">
          <Link to="/" aria-label="TefLook, accueil" className="flex shrink-0 items-center gap-2.5 sm:gap-3 group select-none">
            <div className="relative shrink-0 overflow-hidden bg-white border border-[#E6E1D8]/80 shadow-xs sm:shadow-sm size-10 sm:size-11 rounded-xl sm:rounded-2xl p-1 sm:p-1.5 flex items-center justify-center transition-all duration-300 group-hover:scale-105 group-hover:shadow-sm">
              <img src="/images/Untitled Design.png" alt="TefLook" className="size-full object-contain" />
            </div>
            <span className="font-brand-logo text-[22px] sm:text-2xl font-bold tracking-tight leading-none flex items-baseline">
              <span className="text-[#2B6E73]">Tef</span>
              <span className="text-[#E06D53]">Look</span>
            </span>
          </Link>

          <nav aria-label={t("a11y.categories")} className="hidden items-center gap-7 xl:flex">
            {categories.slice(0, 4).map((category) => (
              <button
                key={category.value}
                type="button"
                onClick={() => {
                  setActiveCategory(category.value);
                  document.getElementById("boutique")?.scrollIntoView({ behavior: "smooth" });
                }}
                className={`text-[13px] font-bold tracking-tight transition-all relative py-1 cursor-pointer ${
                  activeCategory === category.value
                    ? "text-[#2B6E73] after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[2px] after:bg-[#2B6E73] after:rounded-full"
                    : "text-[#2B6E73] hover:text-[#193E3F] hover:underline underline-offset-4 decoration-[#2B6E73]/40"
                }`}
              >
                {category.label}
              </button>
            ))}
          </nav>

          <div className="flex min-w-0 flex-1 justify-center xl:max-w-[290px]">
            <label className="shop-search flex h-10 w-full max-w-[290px] items-center gap-1.5 border-b border-border px-1 text-muted-foreground sm:gap-2 sm:px-2">
              <Search size={17} aria-hidden="true" />
              <input
                aria-label={t("a11y.search")}
                type="search"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder={t("search.placeholder")}
                className="min-w-0 flex-1 bg-transparent text-[13px] text-foreground outline-none placeholder:text-muted-foreground"
              />
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => setSearchTerm("")}
                  aria-label={t("a11y.clearSearch")}
                  className="grid size-7 shrink-0 place-items-center text-muted-foreground hover:text-foreground"
                >
                  <X size={14} />
                </button>
              )}
            </label>
          </div>

          <div className="flex shrink-0 items-center gap-1 sm:gap-2">
            <TefLookLanguageSwitcher compact />
            <Button
              variant="ghost"
              size="icon"
              aria-label={t("a11y.openMenu")}
              aria-expanded={mobileMenuOpen}
              className="xl:hidden"
              onClick={() => setMobileMenuOpen((open) => !open)}
            >
              {mobileMenuOpen ? <X /> : <Menu />}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              aria-label={`${t("a11y.cart")}, ${count}`}
              onClick={() => setIsCartOpen(true)}
              className="relative"
            >
              <ShoppingBag strokeWidth={1.7} />
              {count > 0 && (
                <span className="absolute -right-0.5 -top-0.5 grid size-[17px] place-items-center rounded-full bg-brand-orange text-[10px] font-bold text-accent-foreground">
                  {count > 9 ? "9+" : count}
                </span>
              )}
            </Button>
          </div>
        </div>
        {mobileMenuOpen && (
          <nav
            aria-label={t("a11y.categories")}
            className="border-t border-border bg-background px-5 py-3 xl:hidden"
          >
            {categories.map((category) => (
              <button
                type="button"
                key={category.value}
                onClick={() => {
                  setActiveCategory(category.value);
                  setMobileMenuOpen(false);
                  document.getElementById("boutique")?.scrollIntoView({ behavior: "smooth" });
                }}
                className={`flex items-center justify-between w-full border-b border-border py-3 text-start text-sm font-bold transition-colors last:border-0 ${
                  activeCategory === category.value
                    ? "text-[#2B6E73] bg-[#2B6E73]/5 px-2.5 rounded-lg"
                    : "text-[#2B6E73] hover:text-[#193E3F]"
                }`}
              >
                <span>{category.label}</span>
                {activeCategory === category.value && (
                  <span className="w-2 h-2 rounded-full bg-[#2B6E73]" />
                )}
              </button>
            ))}
          </nav>
        )}
      </header>

      {/* 3. Hero Section - Pure Full-Width Unobstructed Visual Display */}
      <section className="relative w-full overflow-hidden bg-[#FBF9F5] border-b border-border/50" aria-label="Bannière principale">
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
                    current === category.value ? "all" : category.value,
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
                        aria-label="Effacer le filtre de catégorie"
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
                {products.length === 0
                    ? t("shop.empty")
                    : t("shop.emptyCategory")}
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

      <footer className="border-t border-border bg-primary text-primary-foreground">
        <div className="store-shell grid gap-9 py-10 sm:grid-cols-[1.5fr_1fr_1fr] sm:py-12">
          <div>
            <div className="mb-3.5 flex items-center gap-2.5 sm:gap-3 group select-none">
              <div className="relative shrink-0 overflow-hidden bg-white border border-white/30 shadow-xs shadow-black/10 size-10 sm:size-11 rounded-xl sm:rounded-2xl p-1 sm:p-1.5 flex items-center justify-center transition-all duration-300 group-hover:scale-105">
                <img src="/images/Untitled Design.png" alt="TefLook" className="size-full object-contain" />
              </div>
              <span className="font-brand-logo text-[22px] sm:text-2xl font-bold tracking-tight leading-none flex items-center">
                <span className="text-white tracking-tight">Tef</span>
                <span className="text-[#ffbf00] tracking-tight">Look</span>
              </span>
            </div>
            <p className="font-display text-xl font-semibold">{t("footer.tagline")}</p>
            <p className="mt-2 max-w-xs text-sm leading-6 text-primary-foreground/75">
              {t("footer.description")}
            </p>
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
            </div>
          </div>
        </div>
        <div className="border-t border-primary-foreground/15">
          <div className="store-shell flex flex-wrap justify-between gap-2 py-4 pr-32 sm:pr-40 text-[11px] text-primary-foreground/65">
            <span>© {new Date().getFullYear()} TefLook</span>
            <span>{t("footer.note")}</span>
          </div>
        </div>
      </footer>

      <CartSheet
        open={isCartOpen}
        onOpenChange={setIsCartOpen}
        onOpenCODCheckout={() => setIsCODModalOpen(true)}
      />
      <CODCheckoutModal open={isCODModalOpen} onOpenChange={setIsCODModalOpen} />
      <WhatsAppButton />

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

function getProductCategoryBadge(product: ShopifyProduct): string {
  const cat = getChildStoreCategory(product);
  const mapping: Record<string, string> = {
    discipline: "TEFLOOK MAÎTRISE",
    emotionalIntelligence: "TEFLOOK EMPATHIE",
    independence: "TEFLOOK AUTONOMIE",
    confidence: "TEFLOOK SOCIAL",
    creativity: "TEFLOOK CRÉATIVITÉ",
    criticalThinking: "TEFLOOK LOGIQUE",
  };
  if (cat && mapping[cat]) {
    return mapping[cat];
  }
  if (product.vendor) {
    const v = product.vendor.toUpperCase();
    return v.startsWith("TEFLOOK") ? v : `TEFLOOK ${v}`;
  }
  return "TEFLOOK SOCIAL";
}

function ProductCard({
  product,
  onAdded,
  onNotice,
}: {
  product: ShopifyProduct;
  onAdded: () => void;
  onNotice: (message: string) => void;
}) {
  const { locale, direction, t } = useTefLookLanguage();
  const [adding, setAdding] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const variant = product.variants.edges.find((edge) => edge.node.availableForSale)?.node;
  const image = product.images.edges[0]?.node;

  const localized = getLocalizedProduct(product, locale);
  const categoryLabel = localized.categoryBadge;

  // Formatting price to match exact "279,00 MAD" specification
  const priceAmount = Number(product.priceRange.minVariantPrice.amount);
  const currencyCode = product.priceRange.minVariantPrice.currencyCode || "MAD";
  const formattedPrice = `${new Intl.NumberFormat("fr-MA", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(priceAmount)} ${currencyCode}`;

  // Deterministic star rating for visual polish
  const rating = 4.8 + ((product.title.length % 3) * 0.1);
  const reviewsCount = 12 + (product.title.length % 23);

  async function handleAdd() {
    if (!variant || adding) {
      if (!variant) onNotice(t("product.unavailable"));
      return;
    }
    setAdding(true);
    await useCartStore.getState().addItem({
      product,
      variantId: variant.id,
      variantTitle: variant.title,
      price: variant.price,
      quantity: 1,
      selectedOptions: variant.selectedOptions,
    });
    const error = useCartStore.getState().error;
    setAdding(false);
    if (error) {
      onNotice(error);
    } else {
      setIsSuccess(true);
      setTimeout(() => setIsSuccess(false), 1600);
      onNotice(`${t("product.addedPrefix")}${localized.title}`);
      onAdded();
    }
  }

  return (
    <article
      dir={direction}
      className="group relative flex h-full flex-col justify-between rounded-2xl sm:rounded-3xl border border-[#E6E1D8]/80 bg-white p-2.5 sm:p-4 shadow-xs hover:shadow-xl hover:shadow-black/5 hover:border-[#4b9797]/40 hover:-translate-y-1 transition-all duration-300 select-none"
    >
      <div>
        {/* 1. Product Image Container */}
        <div className="relative aspect-square w-full overflow-hidden rounded-xl sm:rounded-2xl bg-[#F9F8F6]">
          <Link
            to="/product/$handle"
            params={{ handle: product.handle }}
            aria-label={`Voir ${localized.title}`}
            className="absolute inset-0 block z-0"
          >
            {image ? (
              <img
                src={image.url}
                alt={image.altText || localized.title}
                loading="lazy"
                className="size-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
              />
            ) : (
              <div className="grid size-full place-items-center bg-[#F9F8F6] text-[#4b9797]">
                <img
                  src="/images/Untitled Design.png"
                  alt=""
                  className="size-14 sm:size-16 rounded-xl opacity-40 object-contain"
                />
              </div>
            )}
            {/* Subtle vignette overlay on hover */}
            <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity" />
          </Link>

          {/* Top Badges */}
          {!variant ? (
            <span className="absolute top-2 left-2 sm:top-2.5 sm:left-2.5 z-10 rounded-full bg-[#1E293B]/85 backdrop-blur-xs px-2 sm:px-2.5 py-0.5 sm:py-1 text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-white shadow-xs">
              {locale === "ar" ? "نفدت الكمية" : "Épuisé"}
            </span>
          ) : (
            <span className="absolute top-2 left-2 sm:top-2.5 sm:left-2.5 z-10 rounded-full bg-[#ff3500] px-2 sm:px-2.5 py-0.5 text-[9px] sm:text-[10px] font-extrabold uppercase tracking-wide text-white shadow-xs">
              {locale === "ar" ? "الأكثر طلباً" : "Bestseller"}
            </span>
          )}
        </div>

        {/* 2. Content & Typography Hierarchy */}
        <div className="pt-2.5 sm:pt-3.5 flex flex-col">
          {/* Category Label */}
          <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-[0.14em] text-[#4b9797] truncate block mb-1">
            {categoryLabel}
          </span>

          {/* Product Title */}
          <Link
            to="/product/$handle"
            params={{ handle: product.handle }}
            className="line-clamp-2 text-[13px] sm:text-[15px] font-bold leading-snug text-[#1E293B] transition-colors group-hover:text-[#4b9797] min-h-[2.3rem] sm:min-h-[2.6rem]"
            title={localized.title}
          >
            {localized.title}
          </Link>

          {/* Subtle Star Ratings in #ffbf00 */}
          <div className="flex items-center gap-1 sm:gap-1.5 mt-1.5 mb-0.5">
            <div className="flex items-center text-[#ffbf00]">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className="size-3 fill-[#ffbf00] text-[#ffbf00]"
                />
              ))}
            </div>
            <span className="text-[10px] sm:text-[11px] font-bold text-[#1E293B]">
              {rating.toFixed(1)}
            </span>
            <span className="text-[9px] sm:text-[10px] text-muted-foreground">
              ({reviewsCount})
            </span>
          </div>
        </div>
      </div>

      {/* 3. Action & Price Area */}
      <div className="mt-2.5 sm:mt-3.5 pt-2.5 sm:pt-3 border-t border-[#F1ECE4] flex items-center justify-between gap-1.5 sm:gap-2">
        {/* Price on left in bold #ff3500 */}
        <div className="flex flex-col min-w-0">
          <p className="truncate text-[14px] sm:text-[17px] font-black tracking-tight text-[#ff3500] leading-none">
            {formattedPrice}
          </p>
        </div>

        {/* Add to Cart '+' button with rounded-xl shape, #ffbf00 hover effect */}
        <button
          type="button"
          disabled={!variant || adding}
          aria-label={`Ajouter ${product.title} au panier`}
          title={t("product.add")}
          onClick={() => void handleAdd()}
          className="size-8 sm:size-9 shrink-0 rounded-xl border border-[#E6E1D8] bg-[#F9F8F6] text-[#1E293B] shadow-xs grid place-items-center transition-all duration-200 hover:bg-[#ffbf00] hover:border-[#ffbf00] hover:text-[#1E293B] hover:scale-105 active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#ffbf00] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {adding ? (
            <LoaderCircle className="size-3.5 sm:size-4 animate-spin text-[#1E293B]" />
          ) : isSuccess ? (
            <Check className="size-3.5 sm:size-4 text-emerald-600 stroke-[3] animate-in zoom-in" />
          ) : (
            <Plus className="size-3.5 sm:size-4 stroke-[2.5]" />
          )}
        </button>
      </div>
    </article>
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

function ProductCatalogueError({ error, reset }: ErrorComponentProps) {
  const { t } = useTefLookLanguage();
  return (
    <div className="grid min-h-[70vh] place-items-center px-6 text-center">
      <div className="max-w-lg">
        <img src={teflookLogo.url} alt="" className="mx-auto size-16" />
        <p className="mt-5 text-[11px] font-bold uppercase tracking-[0.15em] text-brand-orange">
          TefLook
        </p>
        <h1 className="mt-2 font-display text-3xl font-semibold">
          {t("error.title")}
        </h1>
        <p className="mt-3 text-sm leading-6 text-muted-foreground">
          {error instanceof Error ? error.message : String(error)}
        </p>
        <Button onClick={reset} className="mt-6 rounded-[3px]">
          {t("error.retry")}
        </Button>
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
  onOpenCODCheckout: () => void;
}) {
  const { locale, t } = useTefLookLanguage();
  const { items, isLoading, isSyncing, error } = useCartStore();
  const updateQuantity = useCartStore((state) => state.updateQuantity);
  const removeItem = useCartStore((state) => state.removeItem);
  const itemCount = items.reduce((total, item) => total + item.quantity, 0);
  const total = items.reduce((sum, item) => sum + Number(item.price.amount) * item.quantity, 0);
  const currency = items[0]?.price.currencyCode || "MAD";

  function beginCheckout() {
    if (items.length === 0) return;
    onOpenChange(false);
    onOpenCODCheckout();
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="flex w-[min(100vw,440px)] flex-col gap-0 border-l border-border p-0 sm:max-w-[440px]"
      >
        <SheetHeader className="border-b border-border px-6 py-5 pr-14 text-left">
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
                    {currency && new Intl.NumberFormat(locale === "ar" ? "ar-MA" : "fr-MA", {
                      style: "currency", currency, maximumFractionDigits: 2,
                    }).format(total)}
                  </span>
                </div>
                <p className="text-xs leading-5 text-muted-foreground">
                  {t("cart.shippingFee")}
                </p>
                {error && (
                  <p role="alert" className="text-sm text-destructive">
                    {error}
                  </p>
                )}
                <Button
                  onClick={beginCheckout}
                  disabled={items.length === 0}
                  className="h-12 w-full justify-between rounded-xl bg-brand-orange px-5 text-white hover:bg-brand-orange/90 font-extrabold shadow-md shadow-brand-orange/25 cursor-pointer"
                >
                  <span>Commander • Paiement à la livraison (COD)</span>
                  <ArrowUpRight size={18} />
                </Button>
                <p className="text-center text-[11px] text-muted-foreground">
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
