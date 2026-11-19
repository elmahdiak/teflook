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
  Menu,
  Minus,
  Palette,
  Plus,
  Puzzle,
  Search,
  ShoppingBag,
  Sparkles,
  Trash2,
  Truck,
  UsersRound,
  X,
  type LucideIcon,
} from "lucide-react";
import { QueryClient, QueryClientProvider, useQuery } from "@tanstack/react-query";

import { Button } from "@/components/ui/button";
import { TefLookLanguageSwitcher } from "@/components/teflook-language-switcher";
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

const categoryIcons: Record<ChildStoreCategory, LucideIcon> = {
  discipline: Brain,
  emotionalIntelligence: Heart,
  independence: Footprints,
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
      staleTime: 60_000,
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
  const { data: products = [] } = useQuery({
    queryKey: ["teflook-shopify-products"],
    queryFn: fetchProducts,
  });
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
  }, []);

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
      {/* 1. Announcement Marquee Ticker */}
      <div
        className="overflow-hidden bg-primary py-2 text-primary-foreground"
        aria-label={t("a11y.promises")}
      >
        <div
          lang={locale}
          className="announcement-track flex gap-12 text-[11px] font-semibold uppercase tracking-[0.13em]"
        >
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

      {/* 2. Header & Navigation */}
      <header className="sticky top-0 z-30 border-b border-border bg-background/95 backdrop-blur-md">
        <div className="store-shell flex h-[82px] items-center justify-between gap-3 sm:gap-5">
          <Link href="/" aria-label="TefLook, accueil" className="flex shrink-0 items-center gap-2.5">
            <img src="/images/teflook-mark.png" alt="TefLook" className="size-[41px] object-contain" />
            <span className="font-display text-[21px] font-extrabold tracking-normal">
              <span className="text-brand-teal">Tef</span>
              <span className="text-brand-orange">Look</span>
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
                className="text-[13px] font-medium text-foreground/80 transition-colors hover:text-brand-teal"
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
                className="block w-full border-b border-border py-3 text-start text-sm font-medium last:border-0"
              >
                {category.label}
              </button>
            ))}
          </nav>
        )}
      </header>

      {/* 3. Hero Section with Family Photo */}
      <section className="store-shell pt-5" aria-label={t("category.heading")}>
        <div className="hero-photo relative isolate flex min-h-[420px] items-center overflow-hidden sm:min-h-[485px] lg:min-h-[520px]">
          <div className="hero-copy max-w-[590px] px-5 py-12 sm:px-12 lg:px-16">
            <p className="mb-5 inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.16em] text-brand-teal">
              <Sparkles size={14} aria-hidden="true" />
              {t("hero.eyebrow")}
            </p>
            <h1 className="font-display max-w-[540px] text-4xl font-semibold leading-[1.07] text-foreground sm:text-5xl lg:text-[58px]">
              {t("hero.title")}
            </h1>
            <p className="mt-5 max-w-[390px] text-[15px] leading-7 text-foreground/80">
              {t("hero.description")}
            </p>
            <Button
              asChild
              className="mt-8 h-12 gap-4 rounded-[3px] bg-brand-orange px-6 font-semibold text-accent-foreground hover:bg-brand-orange/90"
            >
              <a href="#boutique">
                {t("hero.explore")} <ArrowDown size={17} aria-hidden="true" />
              </a>
            </Button>
            <div className="mt-11 flex flex-wrap items-center gap-x-7 gap-y-3 text-[11px] font-semibold uppercase tracking-[0.08em] text-foreground/80">
              <span className="inline-flex items-center gap-2">
                <Heart size={16} className="text-brand-teal" /> {t("hero.family")}
              </span>
              <span className="inline-flex items-center gap-2">
                <Sparkles size={15} className="text-brand-teal" /> {t("hero.play")}
              </span>
            </div>
          </div>
          <div className="absolute bottom-5 right-5 hidden h-14 w-14 place-items-center rounded-full border border-background/70 text-xs text-background/90 sm:grid">
            <ArrowDown size={17} aria-hidden="true" />
          </div>
        </div>
      </section>

      {/* 4. Developmental Categories (The 6 Pillars) */}
      <section className="store-shell pb-10 pt-8 sm:pt-10" aria-label={t("category.heading")}>
        <div className="mb-6 flex items-end justify-between gap-4">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.15em] text-brand-orange">
              {t("category.eyebrow")}
            </p>
            <h2 className="mt-2 font-display text-[26px] font-semibold sm:text-3xl">
              {t("category.heading")}
            </h2>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6 sm:gap-4 lg:gap-5">
          {categories.map((category) => {
            const isSelected = activeCategory === category.value;
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
                className={`group flex min-h-[190px] sm:min-h-[210px] flex-col items-center justify-between rounded-2xl border p-4 sm:p-5 text-center transition-all duration-300 cursor-pointer ${
                  isSelected
                    ? "border-brand-teal bg-[#EBF4F5]/70 shadow-sm ring-2 ring-brand-teal/30 scale-[1.02]"
                    : "border-border bg-card text-card-foreground hover:border-brand-teal/50 hover:bg-[#F9F8F6] hover:shadow-md hover:-translate-y-0.5"
                }`}
              >
                {/* Circular image / avatar */}
                <div className="relative mb-3.5 size-18 sm:size-20 shrink-0">
                  <div
                    className={`size-full overflow-hidden rounded-full border-2 transition-all duration-300 ${
                      isSelected
                        ? "border-brand-teal ring-4 ring-brand-teal/20"
                        : "border-white shadow-xs ring-1 ring-border group-hover:ring-brand-teal/50 group-hover:scale-105"
                    }`}
                  >
                    <img
                      src={category.imageUrl}
                      alt={category.label}
                      className="size-full object-cover transition-transform duration-500 group-hover:scale-110"
                      loading="lazy"
                    />
                  </div>
                  {isSelected && (
                    <span className="absolute -bottom-1 -right-1 grid size-5 place-items-center rounded-full bg-brand-teal text-white shadow-xs">
                      <Check size={11} strokeWidth={3} />
                    </span>
                  )}
                </div>

                {/* Two-line text structure */}
                <div className="flex flex-1 flex-col justify-center items-center">
                  <span className="text-[13px] sm:text-[14px] font-bold text-foreground leading-[1.3] group-hover:text-brand-teal transition-colors max-w-[16ch]">
                    {category.label}
                  </span>
                  <span className="mt-1 text-[11px] sm:text-xs font-bold uppercase tracking-wider text-brand-orange">
                    {category.subtitle}
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
              className="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-4"
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

      {/* 7. Multi-column Footer */}
      <footer className="border-t border-border bg-primary text-primary-foreground">
        <div className="store-shell grid gap-9 py-10 sm:grid-cols-[1.5fr_1fr_1fr] sm:py-12">
          <div>
            <div className="mb-3 flex items-center gap-2">
              <span className="font-display text-2xl font-black tracking-normal text-white">
                <span className="text-[#4A9099]">Tef</span>
                <span className="text-[#FF6B00]">Look</span>
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

function ProductCard({
  product,
  onAdded,
  onNotice,
}: {
  product: ShopifyProduct;
  onAdded: () => void;
  onNotice: (message: string) => void;
}) {
  const { locale, t } = useTefLookLanguage();
  const [adding, setAdding] = useState(false);
  const variant = product.variants.edges.find((edge) => edge.node.availableForSale)?.node;
  const image = product.images.edges[0]?.node;

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
    if (error) onNotice(error);
    else {
      onNotice(`${t("product.addedPrefix")}${product.title}`);
      onAdded();
    }
  }

  return (
    <article className="group flex h-full flex-col justify-between overflow-hidden rounded-xl sm:rounded-2xl border border-border/80 bg-card p-2.5 sm:p-3.5 shadow-xs transition-all duration-300 hover:border-brand-teal/40 hover:shadow-md">
      <div>
        <div className="relative aspect-square w-full overflow-hidden rounded-lg sm:rounded-xl bg-secondary">
          <Link
            href={`/product/${product.handle}`}
            aria-label={`Voir ${product.title}`}
            className="absolute inset-0 block"
          >
            {image ? (
              <img
                src={image.url}
                alt={image.altText || product.title}
                loading="lazy"
                className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
            ) : (
              <div className="grid size-full place-items-center bg-brand-mist text-primary">
                <img src="/images/teflook-mark.png" alt="" className="size-14 sm:size-16 opacity-40" />
              </div>
            )}
          </Link>
          {!variant && (
            <span className="absolute bottom-1.5 left-1.5 sm:bottom-2 sm:left-2 rounded-md bg-card/95 px-1.5 sm:px-2 py-0.5 sm:py-1 text-[9px] sm:text-[10px] font-bold uppercase tracking-[0.07em] shadow-xs">
              Épuisé
            </span>
          )}
        </div>
        <div className="pt-2 sm:pt-3">
          {product.vendor && (
            <p className="mb-0.5 sm:mb-1 truncate text-[10px] sm:text-[11px] font-semibold uppercase tracking-[0.11em] text-brand-teal">
              {product.vendor}
            </p>
          )}
          <Link
            href={`/product/${product.handle}`}
            className="line-clamp-2 text-[12px] sm:text-[14px] font-semibold leading-[1.3] sm:leading-[1.4] text-foreground transition-colors hover:text-brand-teal"
            title={product.title}
          >
            {product.title}
          </Link>
        </div>
      </div>

      <div className="mt-2.5 sm:mt-3.5 flex items-center justify-between gap-1.5 sm:gap-2 border-t border-border/50 pt-2 sm:pt-3">
        <p className="truncate text-[13px] sm:text-[15px] font-bold text-brand-orange-deep">
          {new Intl.NumberFormat(locale === "ar" ? "ar-MA" : "fr-MA", {
            style: "currency",
            currency: product.priceRange.minVariantPrice.currencyCode,
            maximumFractionDigits: 2,
          }).format(Number(product.priceRange.minVariantPrice.amount))}
        </p>
        <Button
          variant="ghost"
          size="icon"
          disabled={!variant || adding}
          aria-label={`Ajouter ${product.title} au panier`}
          title={t("product.add")}
          onClick={() => void handleAdd()}
          className="size-8 sm:size-9 shrink-0 rounded-lg border border-border bg-background transition-all hover:border-brand-teal hover:bg-brand-teal/10 hover:text-brand-teal"
        >
          {adding ? <LoaderCircle className="size-3.5 sm:size-4 animate-spin" /> : <Plus className="size-3.5 sm:size-4" />}
        </Button>
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

function CartSheet({
  open,
  onOpenChange,
  onOpenCODCheckout,
}: {
  open: boolean;
  onOpenChange: (value: boolean) => void;
  onOpenCODCheckout?: () => void;
}) {
  const { locale, t } = useTefLookLanguage();
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
