"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  Check,
  ChevronDown,
  ChevronRight,
  Heart,
  LoaderCircle,
  Minus,
  Package,
  Plus,
  RotateCcw,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Star,
  Truck,
  X,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { CODCheckoutModal } from "@/components/cart/CODCheckoutModal";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useCartStore } from "@/lib/shopify-cart";
import type { ShopifyProduct } from "@/lib/shopify-storefront";
import { CHILD_STORE_CATEGORIES, getChildStoreCategory } from "@/lib/teflook-categories";
import { CHILD_STORE_CATEGORY_MESSAGE_KEYS, useTefLookLanguage } from "@/lib/teflook-language";
import { getLocalizedProduct } from "@/lib/product-localization";
import { ProductReviewsSection } from "@/components/product/ProductReviewsSection";
import type { ProductRatingSummary } from "@/lib/reviews-service";
import { ProductInfoTabs } from "@/components/product/ProductInfoTabs";
import { ProductCard } from "@/components/product/ProductCard";
import { FAQAccordion } from "@/components/faq/FAQAccordion";
import { cleanWhatsAppNumber, fetchSiteSettings } from "@/lib/site-settings";
import { cn } from "@/lib/utils";

interface ProductDetailViewProps {
  product: ShopifyProduct;
  relatedProducts: ShopifyProduct[];
}

export function ProductDetailView({ product, relatedProducts }: ProductDetailViewProps) {
  const [isMounted, setIsMounted] = useState(false);
  const [whatsappPhone, setWhatsappPhone] = useState("212600000000");

  useEffect(() => {
    setIsMounted(true);
    void useCartStore.persist.rehydrate();
    fetchSiteSettings().then((s) => {
      if (s?.whatsapp_phone) {
        setWhatsappPhone(cleanWhatsAppNumber(s.whatsapp_phone));
      }
    });
  }, []);

  const { direction, locale, t } = useTefLookLanguage();
  const images = product.images.edges.map((e) => e.node);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCODModalOpen, setIsCODModalOpen] = useState(false);
  const [notice, setNotice] = useState("");
  const [adding, setAdding] = useState(false);
  const [liveRatingSummary, setLiveRatingSummary] = useState<{
    rating: number;
    reviewsCount: number;
  }>({
    rating: typeof product.rating === "number" ? product.rating : 0,
    reviewsCount: typeof product.reviewsCount === "number" ? product.reviewsCount : 0,
  });

  const handleSummaryCalculated = useCallback((s: ProductRatingSummary) => {
    setLiveRatingSummary((prev) => {
      if (prev.rating === s.averageRating && prev.reviewsCount === s.totalReviews) {
        return prev;
      }
      return {
        rating: s.averageRating,
        reviewsCount: s.totalReviews,
      };
    });
  }, []);

  const { error: cartError } = useCartStore();

  const currentVariant =
    product.variants.edges.find((e) => e.node.availableForSale)?.node ||
    product.variants.edges[0]?.node;

  const currentPrice = currentVariant
    ? Number(currentVariant.price.amount)
    : Number(product.priceRange.minVariantPrice.amount);

  const comparePrice = currentVariant?.compareAtPrice
    ? Number(currentVariant.compareAtPrice.amount)
    : product.compareAtPriceRange?.minVariantPrice
    ? Number(product.compareAtPriceRange.minVariantPrice.amount)
    : null;

  const discountPercent =
    comparePrice && comparePrice > currentPrice
      ? Math.round(((comparePrice - currentPrice) / comparePrice) * 100)
      : null;

  const categoryConfig = CHILD_STORE_CATEGORIES.find((c) => c.value === product.category);
  const localized = getLocalizedProduct(product, locale);
  const categoryLabel = localized.categoryName;

  async function handleAddToCart() {
    if (!currentVariant || adding) return;
    setAdding(true);
    await useCartStore.getState().addItem({
      product,
      variantId: currentVariant.id,
      variantTitle: currentVariant.title,
      price: currentVariant.price,
      quantity,
      selectedOptions: currentVariant.selectedOptions,
    });
    setAdding(false);
    const error = useCartStore.getState().error;
    if (error) {
      setNotice(error);
    } else {
      setNotice(`${t("product.addedPrefix")}${localized.title}`);
      setIsCartOpen(true);
    }
  }

  const whatsappOrderUrl = `https://wa.me/${whatsappPhone}?text=${encodeURIComponent(
    locale === "ar"
      ? `مرحباً تيفلوك، أود طلب المنتج : ${localized.title} (${currentPrice} درهم) بالكمية ${quantity}.`
      : `Bonjour TefLook, je souhaite commander : ${localized.title} (${currentPrice} MAD) en quantité ${quantity}.`
  )}`;

  return (
    <div lang={locale} dir={direction} className="min-h-screen bg-background text-foreground flex flex-col">
      {/* 1. Sticky Header & Expandable Search Bar */}
      <Header onOpenCart={() => setIsCartOpen(true)} defaultSearchOpen={false} />

      {/* 2. Breadcrumb */}
      <nav
        aria-label={locale === "ar" ? "مسار التنقل" : "Fil d'Ariane"}
        className="border-b border-border/60 bg-card/40 py-2.5"
      >
        <div className="store-shell flex items-center gap-2 text-xs text-muted-foreground truncate">
          <Link href="/" className="hover:text-brand-teal transition-colors">
            {locale === "ar" ? "الرئيسية" : "Accueil"}
          </Link>
          <ChevronRight size={12} className={cn("shrink-0 text-muted-foreground/60", locale === "ar" && "rotate-180")} />
          <Link href="/#boutique" className="hover:text-brand-teal transition-colors">
            {localized.categoryName}
          </Link>
          <ChevronRight size={12} className={cn("shrink-0 text-muted-foreground/60", locale === "ar" && "rotate-180")} />
          <span className="truncate font-medium text-foreground">{localized.title}</span>
        </div>
      </nav>

      {/* 3. Main Product Details (Two-Column Layout) */}
      <main className="flex-1 store-shell py-8 sm:py-12">
        <div className="grid gap-8 lg:grid-cols-12 lg:gap-12">
          {/* Left Column: Product Media Gallery */}
          <div className="lg:col-span-7 flex flex-col gap-4">
            {/* Main Featured Image */}
            <div className="relative aspect-square w-full overflow-hidden rounded-2xl border border-border/80 bg-white shadow-xs group">
              <img
                src={images[selectedImageIndex]?.url || "/images/Untitled Design.png"}
                alt={images[selectedImageIndex]?.altText || localized.title}
                className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              {discountPercent && (
                <span className="absolute top-4 left-4 rounded-full bg-brand-orange px-3 py-1 text-xs font-black uppercase tracking-wider text-white shadow-sm">
                  -{discountPercent}% Promo
                </span>
              )}
            </div>

            {/* Thumbnail Row */}
            {images.length > 1 && (
              <div className="flex items-center gap-3 overflow-x-auto pb-2">
                {images.map((img, index) => (
                  <button
                    type="button"
                    key={index}
                    onClick={() => setSelectedImageIndex(index)}
                    aria-label={`Voir photo ${index + 1}`}
                    className={`relative aspect-square size-18 sm:size-20 shrink-0 overflow-hidden rounded-xl border-2 transition-all duration-200 cursor-pointer ${
                      selectedImageIndex === index
                        ? "border-brand-teal ring-2 ring-brand-teal/30 scale-105"
                        : "border-border/80 hover:border-brand-teal/60 opacity-70 hover:opacity-100"
                    }`}
                  >
                    <img src={img.url} alt="" className="size-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right Column: Product Information & Purchase Box */}
          <div className="lg:col-span-5 flex flex-col gap-6">
            {/* Vendor & Rating */}
            <div>
              <div className="flex items-center justify-between gap-2 mb-2">
                <span className="text-xs font-bold uppercase tracking-widest text-brand-teal">
                  {localized.vendor}
                </span>
                <span className="inline-flex items-center gap-1 rounded-full bg-brand-mist px-2.5 py-0.5 text-xs font-bold text-brand-teal">
                  {localized.categoryBadge}
                </span>
              </div>
              <h1 className={cn("font-display text-2xl sm:text-3xl lg:text-4xl font-extrabold text-foreground leading-[1.15]", locale === "ar" && "font-sans leading-snug")}>
                {localized.title}
              </h1>

              {/* Star rating */}
              <div className="mt-3 flex items-center gap-2 text-xs font-medium text-muted-foreground min-h-[1.5rem]">
                {isMounted && liveRatingSummary.reviewsCount > 0 ? (
                  <>
                    <div className="flex items-center text-amber-500">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          size={15}
                          className={cn(
                            i < Math.round(liveRatingSummary.rating)
                              ? "fill-amber-500 text-amber-500"
                              : "text-muted-foreground/30 fill-none"
                          )}
                        />
                      ))}
                    </div>
                    <span className="font-bold text-foreground">
                      {liveRatingSummary.rating.toFixed(1)}
                    </span>
                    <span>
                      ({liveRatingSummary.reviewsCount}{" "}
                      {locale === "ar"
                        ? "تقييم معتمد"
                        : liveRatingSummary.reviewsCount > 1
                        ? "avis certifiés"
                        : "avis certifié"}
                      )
                    </span>
                  </>
                ) : (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-muted/60 px-2.5 py-0.5 text-xs text-muted-foreground">
                    <Star size={13} className="text-muted-foreground/50 fill-none" />
                    <span>
                      {isMounted && locale === "ar"
                        ? "منتج جديد • كن أول من يقيّم"
                        : "Nouveau produit • Soyez le premier à donner votre avis"}
                    </span>
                  </span>
                )}
              </div>
            </div>

            {/* Price Box */}
            <div className="rounded-xl border border-border/80 bg-card p-4 sm:p-5 shadow-xs">
              <div className="flex items-baseline gap-3">
                <span className="font-display text-3xl sm:text-4xl font-extrabold text-brand-orange-deep">
                  {currentPrice} MAD
                </span>
                {comparePrice && (
                  <span className="text-base sm:text-lg text-muted-foreground line-through">
                    {comparePrice} MAD
                  </span>
                )}
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                {locale === "ar"
                  ? "شامل للضريبة · الدفع نقداً عند الاستلام في جميع أنحاء المغرب"
                  : "TVA incluse · Paiement en espèces à la livraison partout au Maroc"}
              </p>

              {/* Variant Selector */}
              {product.variants.edges.length > 0 && currentVariant?.selectedOptions && (
                <div className="mt-5 border-t border-border/60 pt-4">
                  <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2.5">
                    {locale === "ar" ? "المرحلة العمرية والمستوى :" : "Tranche d'âge & Niveau :"}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {product.variants.edges.map(({ node: v }) => (
                      <span
                        key={v.id}
                        className="rounded-lg border border-brand-teal/40 bg-brand-mist/50 px-3.5 py-1.5 text-xs font-bold text-brand-teal"
                      >
                        {v.title}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Quantity Selector & Add to Cart */}
              <div className="mt-6 flex flex-col gap-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 items-center rounded-xl border border-border bg-background px-1">
                    <button
                      type="button"
                      disabled={quantity <= 1}
                      onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                      aria-label={locale === "ar" ? "تقليل الكمية" : "Diminuer la quantité"}
                      className="grid size-10 place-items-center rounded-lg text-muted-foreground hover:bg-secondary hover:text-foreground disabled:opacity-40"
                    >
                      <Minus size={15} />
                    </button>
                    <span className="w-10 text-center font-bold text-sm">{quantity}</span>
                    <button
                      type="button"
                      onClick={() => setQuantity((q) => q + 1)}
                      aria-label={locale === "ar" ? "زيادة الكمية" : "Augmenter la quantité"}
                      className="grid size-10 place-items-center rounded-lg text-muted-foreground hover:bg-secondary hover:text-foreground"
                    >
                      <Plus size={15} />
                    </button>
                  </div>

                  {/* Add to Cart CTA */}
                  <Button
                    onClick={handleAddToCart}
                    disabled={adding || !currentVariant?.availableForSale}
                    className="h-12 flex-1 rounded-xl bg-brand-orange text-white font-extrabold text-sm sm:text-base hover:bg-brand-orange/90 shadow-md shadow-brand-orange/20 transition-all cursor-pointer"
                  >
                    {adding ? (
                      <LoaderCircle className="animate-spin size-5" />
                    ) : (
                      <>
                        <ShoppingBag size={18} className={cn(locale === "ar" ? "ml-2" : "mr-2")} />
                        {locale === "ar"
                          ? `إضافة إلى السلة • ${currentPrice * quantity} درهم`
                          : `Ajouter au panier • ${currentPrice * quantity} MAD`}
                      </>
                    )}
                  </Button>
                </div>

                {/* Instant WhatsApp Order CTA */}
                <a
                  href={whatsappOrderUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-emerald-500/40 bg-emerald-50 text-emerald-800 text-xs sm:text-sm font-bold hover:bg-emerald-100 transition-colors"
                >
                  <img
                    src="https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg"
                    alt=""
                    className="size-4"
                  />
                  {locale === "ar" ? "طلب مباشر عبر واتساب" : "Commander directement via WhatsApp"}
                </a>
              </div>
            </div>

            {/* Moroccan Service & Trust Guarantees */}
            <div className="grid grid-cols-2 gap-3">
              <div className="flex items-start gap-2.5 rounded-xl border border-border/60 bg-card/60 p-3">
                <Truck size={18} className="text-brand-teal shrink-0 mt-0.5" />
                <div className="text-xs leading-snug">
                  <span className="font-bold block text-foreground">
                    {locale === "ar" ? "توصيل سريع" : "Livraison Express"}
                  </span>
                  <span className="text-muted-foreground">
                    {locale === "ar" ? "24 إلى 48 ساعة في كافة مدن المغرب" : "24 à 48h partout au Maroc"}
                  </span>
                </div>
              </div>
              <div className="flex items-start gap-2.5 rounded-xl border border-border/60 bg-card/60 p-3">
                <ShieldCheck size={18} className="text-brand-teal shrink-0 mt-0.5" />
                <div className="text-xs leading-snug">
                  <span className="font-bold block text-foreground">
                    {locale === "ar" ? "دفع آمن" : "Paiement Sécurisé"}
                  </span>
                  <span className="text-muted-foreground">
                    {locale === "ar" ? "عند استلام ومعاينة طلبيتك" : "À la réception de votre colis"}
                  </span>
                </div>
              </div>
              <div className="flex items-start gap-2.5 rounded-xl border border-border/60 bg-card/60 p-3">
                <Sparkles size={18} className="text-brand-orange shrink-0 mt-0.5" />
                <div className="text-xs leading-snug">
                  <span className="font-bold block text-foreground">
                    {locale === "ar" ? "100% غير سام" : "100% Non Toxique"}
                  </span>
                  <span className="text-muted-foreground">
                    {locale === "ar" ? "مواد آمنة ومعتمدة للأطفال" : "Matériaux certifiés sûrs"}
                  </span>
                </div>
              </div>
              <div className="flex items-start gap-2.5 rounded-xl border border-border/60 bg-card/60 p-3">
                <RotateCcw size={18} className="text-brand-teal shrink-0 mt-0.5" />
                <div className="text-xs leading-snug">
                  <span className="font-bold block text-foreground">
                    {locale === "ar" ? "ضمان تيفلوك" : "Garantie TefLook"}
                  </span>
                  <span className="text-muted-foreground">
                    {locale === "ar" ? "إرجاع واستبدال بكل سهولة" : "Échange & retour faciles"}
                  </span>
                </div>
              </div>
            </div>

            {/* Two-Tab Information Section: Description & Détails du produit */}
            <ProductInfoTabs product={product} />
          </div>
        </div>

        {/* 4. Customer & Parent Reviews Section */}
        <ProductReviewsSection
          productId={product.id}
          productHandle={product.handle}
          productTitle={localized.title}
          onSummaryCalculated={handleSummaryCalculated}
        />

        {/* 5. Collapsible FAQ Section */}
        <FAQAccordion product={product} />

        {/* 6. Related Products Section ("Vous aimerez aussi") */}
        {relatedProducts.length > 0 && (
          <section className="mt-16 sm:mt-24 border-t border-border pt-12 sm:pt-16">
            <div className="mb-8 flex items-end justify-between">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.15em] text-[#ff3500]">
                  {locale === "ar" ? "أكمل تشكيلتك المختارة" : "Complétez votre sélection"}
                </p>
                <h2 className="mt-2 font-display text-2xl sm:text-3xl font-extrabold text-[#1E293B]">
                  {locale === "ar" ? "قد يعجبك أيضاً" : "Vous aimerez aussi"}
                </h2>
              </div>
              <Link
                href="/#boutique"
                className="text-xs font-bold text-[#4b9797] hover:text-[#ff3500] transition-colors"
              >
                {locale === "ar" ? "استكشف كامل المتجر ←" : "Explorer toute la boutique →"}
              </Link>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-3 gap-y-6 sm:gap-x-6 sm:gap-y-8 pt-4">
              {relatedProducts.map((rel) => (
                <ProductCard
                  key={rel.id}
                  product={rel}
                  onAdded={() => setIsCartOpen(true)}
                  onNotice={setNotice}
                />
              ))}
            </div>
          </section>
        )}
      </main>

      {/* 5. Footer */}
      <Footer />

      {/* 6. Cart Slide-over Sheet */}
      <CartSheet
        open={isCartOpen}
        onOpenChange={setIsCartOpen}
        onOpenCODCheckout={() => setIsCODModalOpen(true)}
      />

      {/* Cash on Delivery Modal */}
      <CODCheckoutModal open={isCODModalOpen} onOpenChange={setIsCODModalOpen} />

      {/* 7. Notification Toast */}
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
            aria-label="Fermer"
            onClick={() => {
              setNotice("");
              useCartStore.setState({ error: null });
            }}
          >
            <X size={15} />
          </button>
        </div>
      )}
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

  React.useEffect(() => {
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
                      <div className="size-[76px] shrink-0 overflow-hidden bg-secondary rounded-lg">
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
                          {Number(item.price.amount)} {item.price.currencyCode}
                        </p>
                        <div className="mt-2 flex items-center gap-3">
                          <div className="flex h-8 items-center border border-border rounded-md">
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
                            <Minus size={15} />
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
                    {total} {currency}
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
