"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  ArrowLeft,
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
import { BrandLogo } from "@/components/ui/BrandLogo";
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
import type { ShopifyProduct } from "@/lib/shopify-storefront";
import { CHILD_STORE_CATEGORIES, getChildStoreCategory } from "@/lib/teflook-categories";
import { CHILD_STORE_CATEGORY_MESSAGE_KEYS, useTefLookLanguage } from "@/lib/teflook-language";
import { getLocalizedProduct, getLocalizedCategoryBadge } from "@/lib/product-localization";
import { ProductReviewsSection } from "@/components/product/ProductReviewsSection";
import { useCookieConsent } from "@/lib/cookies";
import { cn } from "@/lib/utils";

interface ProductDetailViewProps {
  product: ShopifyProduct;
  relatedProducts: ShopifyProduct[];
}

export function ProductDetailView({ product, relatedProducts }: ProductDetailViewProps) {
  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => {
    setIsMounted(true);
    void useCartStore.persist.rehydrate();
  }, []);

  const { direction, locale, t } = useTefLookLanguage();
  const { openSettingsModal } = useCookieConsent();
  const images = product.images.edges.map((e) => e.node);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCODModalOpen, setIsCODModalOpen] = useState(false);
  const [notice, setNotice] = useState("");
  const [adding, setAdding] = useState(false);
  const [addedRelatedId, setAddedRelatedId] = useState<string | null>(null);
  const [openAccordion, setOpenAccordion] = useState<string>("description");
  const [liveRatingSummary, setLiveRatingSummary] = useState<{
    rating: number;
    reviewsCount: number;
  }>({
    rating: typeof product.rating === "number" ? product.rating : 0,
    reviewsCount: typeof product.reviewsCount === "number" ? product.reviewsCount : 0,
  });

  const { items, hasHydrated, error: cartError } = useCartStore();
  const count = isMounted && hasHydrated ? items.reduce((total, item) => total + item.quantity, 0) : 0;

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

  const whatsappOrderUrl = `https://wa.me/212600000000?text=${encodeURIComponent(
    locale === "ar"
      ? `مرحباً تيفلوك، أود طلب المنتج : ${localized.title} (${currentPrice} درهم) بالكمية ${quantity}.`
      : `Bonjour TefLook, je souhaite commander : ${localized.title} (${currentPrice} MAD) en quantité ${quantity}.`
  )}`;

  return (
    <div lang={locale} dir={direction} className="min-h-screen bg-background text-foreground flex flex-col">
      {/* 1. Header Navigation */}
      <header className="sticky top-0 z-30 border-b border-border bg-background/95 backdrop-blur-md">
        <div className="store-shell flex h-[76px] items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="inline-flex items-center gap-2 rounded-lg border border-border px-3 py-1.5 text-xs font-semibold text-muted-foreground transition-colors hover:border-brand-teal hover:text-foreground"
            >
              <ArrowLeft size={15} className={cn(locale === "ar" && "rotate-180")} />
              <span className="hidden sm:inline">
                {locale === "ar" ? "العودة إلى المتجر" : "Retour à la boutique"}
              </span>
            </Link>
            <BrandLogo size="md" />
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <TefLookLanguageSwitcher compact />
            <Button
              variant="ghost"
              size="icon"
              aria-label={`${t("a11y.cart")}, ${count}`}
              onClick={() => setIsCartOpen(true)}
              className="relative"
            >
              <ShoppingBag strokeWidth={1.8} size={20} />
              {count > 0 && (
                <span className="absolute -right-0.5 -top-0.5 grid size-[17px] place-items-center rounded-full bg-brand-orange text-[10px] font-bold text-white">
                  {count > 9 ? "9+" : count}
                </span>
              )}
            </Button>
          </div>
        </div>
      </header>

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
              <span className="absolute bottom-4 left-4 inline-flex items-center gap-1.5 rounded-full bg-card/90 backdrop-blur-xs px-3 py-1 text-xs font-semibold text-brand-teal shadow-xs border border-border/50">
                <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
                {locale === "ar" ? "متوفر في المخزون · شحن خلال 24 ساعة" : "En stock · Expédié sous 24h"}
              </span>
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

            {/* Accordion / Details Section */}
            <div className="divide-y divide-border/80 border-y border-border/80">
              {/* 1. Description */}
              <div className="py-3.5">
                <button
                  type="button"
                  onClick={() =>
                    setOpenAccordion((cur) => (cur === "description" ? "" : "description"))
                  }
                  className="flex w-full items-center justify-between text-left text-sm font-bold text-foreground"
                >
                  <span>{locale === "ar" ? "وصف المنتج" : "Description du produit"}</span>
                  <ChevronDown
                    size={16}
                    className={`transition-transform duration-200 ${
                      openAccordion === "description" ? "rotate-180" : ""
                    }`}
                  />
                </button>
                {openAccordion === "description" && (
                  <div
                    dir={direction}
                    className={cn(
                      "pt-3 text-xs sm:text-sm text-foreground/80 leading-relaxed",
                      locale === "ar" ? "text-right font-sans" : "text-left"
                    )}
                  >
                    <p>{localized.description}</p>
                    {localized.features && localized.features.length > 0 && (
                      <ul
                        className={cn(
                          "mt-3 space-y-1.5 list-disc list-inside text-foreground/85",
                          locale === "ar" && "font-sans"
                        )}
                      >
                        {localized.features.map((feat, i) => (
                          <li key={i}>{feat}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                )}
              </div>

              {/* 2. Materials & Origin */}
              <div className="py-3.5">
                <button
                  type="button"
                  onClick={() =>
                    setOpenAccordion((cur) => (cur === "materials" ? "" : "materials"))
                  }
                  className="flex w-full items-center justify-between text-left text-sm font-bold text-foreground"
                >
                  <span>{locale === "ar" ? "المواد والمصدر" : "Matériaux & Origine"}</span>
                  <ChevronDown
                    size={16}
                    className={`transition-transform duration-200 ${
                      openAccordion === "materials" ? "rotate-180" : ""
                    }`}
                  />
                </button>
                {openAccordion === "materials" && (
                  <div
                    dir={direction}
                    className={cn(
                      "pt-3 text-xs sm:text-sm text-foreground/80 space-y-2",
                      locale === "ar" ? "text-right font-sans" : "text-left"
                    )}
                  >
                    <p>
                      <strong>{locale === "ar" ? "المكونات :" : "Composition :"}</strong>{" "}
                      {localized.material ||
                        (locale === "ar"
                          ? "خشب طبيعي معتمد ودهانات غير سامة"
                          : "Bois naturel certifié FSC et pigments non toxiques")}
                    </p>
                    <p>
                      <strong>{locale === "ar" ? "التصنيع :" : "Conception :"}</strong>{" "}
                      {localized.origin ||
                        (locale === "ar"
                          ? "صُنع بعناية فائقة وفق معايير الأمان الدولية"
                          : "Fabriqué avec passion selon les normes de sécurité internationales")}
                    </p>
                  </div>
                )}
              </div>

              {/* 3. Delivery & Returns */}
              <div className="py-3.5">
                <button
                  type="button"
                  onClick={() =>
                    setOpenAccordion((cur) => (cur === "shipping" ? "" : "shipping"))
                  }
                  className="flex w-full items-center justify-between text-left text-sm font-bold text-foreground"
                >
                  <span>{locale === "ar" ? "التوصيل والدفع" : "Livraison & Modalités"}</span>
                  <ChevronDown
                    size={16}
                    className={`transition-transform duration-200 ${
                      openAccordion === "shipping" ? "rotate-180" : ""
                    }`}
                  />
                </button>
                {openAccordion === "shipping" && (
                  <div
                    dir={direction}
                    className={cn(
                      "pt-3 text-xs sm:text-sm text-foreground/80 space-y-1.5 leading-relaxed",
                      locale === "ar" ? "text-right font-sans" : "text-left"
                    )}
                  >
                    {locale === "ar" ? (
                      <>
                        <p>• الشحن خلال 24 ساعة من مستودعاتنا في المغرب.</p>
                        <p>• توصيل سريع إلى باب المنزل : الدار البيضاء (24 ساعة)، الرباط، مراكش، طنجة، فاس وكافة المدن (48 ساعة).</p>
                        <p>• الدفع نقداً عند الاستلام بعد معاينة طلبيتك.</p>
                      </>
                    ) : (
                      <>
                        <p>• Expédition sous 24h ouvrées depuis nos entrepôts au Maroc.</p>
                        <p>• Livraison à domicile : Casablanca (24h), Rabat, Marrakech, Tanger, Fès et toutes villes (48h).</p>
                        <p>• Règlement en espèces lors de la réception du colis.</p>
                      </>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* 4. Customer & Parent Reviews Section */}
        <ProductReviewsSection
          productId={product.id}
          productHandle={product.handle}
          productTitle={localized.title}
          onSummaryCalculated={(s) => {
            setLiveRatingSummary({
              rating: s.averageRating,
              reviewsCount: s.totalReviews,
            });
          }}
        />

        {/* 5. Related Products Section ("Vous aimerez aussi") */}
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

            <div className="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-4">
              {relatedProducts.map((rel) => {
                const img = rel.images.edges[0]?.node?.url;
                const price = Number(rel.priceRange.minVariantPrice.amount);
                const isItemAdded = addedRelatedId === rel.id;
                const relLocalized = getLocalizedProduct(rel, locale);

                // Real rating and reviews count from Supabase
                const relRating = typeof rel.rating === "number" ? rel.rating : 0;
                const relReviewsCount = typeof rel.reviewsCount === "number" ? rel.reviewsCount : 0;

                return (
                  <article
                    key={rel.id}
                    dir={direction}
                    className="group relative flex h-full flex-col justify-between rounded-2xl sm:rounded-3xl border border-[#E6E1D8]/80 bg-white p-2.5 sm:p-4 shadow-xs hover:shadow-xl hover:shadow-black/5 hover:border-[#4b9797]/40 hover:-translate-y-1 transition-all duration-300 select-none"
                  >
                    <div>
                      {/* Image Container */}
                      <div className="relative aspect-square w-full overflow-hidden rounded-xl sm:rounded-2xl bg-[#F9F8F6]">
                        <Link
                          href={`/product/${rel.handle}`}
                          aria-label={`Voir ${relLocalized.title}`}
                          className="absolute inset-0 block z-0"
                        >
                          {img ? (
                            <img
                              src={img}
                              alt={relLocalized.title}
                              className="size-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                              loading="lazy"
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
                          <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </Link>
                      </div>

                      {/* Content & Typography */}
                      <div className="pt-2.5 sm:pt-3.5 flex flex-col">
                        {/* Category Label */}
                        <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-[0.14em] text-[#4b9797] truncate block mb-1">
                          {relLocalized.categoryBadge}
                        </span>

                        {/* Product Title */}
                        <Link
                          href={`/product/${rel.handle}`}
                          className="line-clamp-2 text-[13px] sm:text-[15px] font-bold leading-snug text-[#1E293B] transition-colors group-hover:text-[#4b9797] min-h-[2.3rem] sm:min-h-[2.6rem]"
                          title={relLocalized.title}
                        >
                          {relLocalized.title}
                        </Link>

                        {/* Real Star Ratings in #ffbf00 */}
                        <div className="flex items-center gap-1 sm:gap-1.5 mt-1.5 mb-0.5 min-h-[1.25rem]">
                          {isMounted && relReviewsCount > 0 ? (
                            <>
                              <div className="flex items-center text-[#ffbf00]">
                                {[...Array(5)].map((_, i) => (
                                  <Star
                                    key={i}
                                    className={cn(
                                      "size-3",
                                      i < Math.round(relRating)
                                        ? "fill-[#ffbf00] text-[#ffbf00]"
                                        : "text-muted-foreground/30 fill-none"
                                    )}
                                  />
                                ))}
                              </div>
                              <span className="text-[10px] sm:text-[11px] font-bold text-[#1E293B]">
                                {relRating.toFixed(1)}
                              </span>
                              <span className="text-[9px] sm:text-[10px] text-muted-foreground">
                                ({relReviewsCount})
                              </span>
                            </>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[10px] sm:text-[11px] font-medium text-muted-foreground/75">
                              <Star className="size-3 text-muted-foreground/35 fill-none" />
                              <span>{isMounted && locale === "ar" ? "جديد • لا توجد تقييمات" : "Nouveau • Aucun avis"}</span>
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Action & Price Area */}
                    <div className="mt-2.5 sm:mt-3.5 pt-2.5 sm:pt-3 border-t border-[#F1ECE4] flex items-center justify-between gap-1.5 sm:gap-2">
                      {/* Price on left in bold #ff3500 */}
                      <div className="flex flex-col min-w-0">
                        <p className="truncate text-[14px] sm:text-[17px] font-black tracking-tight text-[#ff3500] leading-none">
                          {Math.round(price)} MAD
                        </p>
                      </div>

                      {/* Add to Cart button: Clean rounded-xl shape, soft hover background in #ffbf00 */}
                      <button
                        type="button"
                        onClick={async () => {
                          const v = rel.variants.edges[0]?.node;
                          if (v) {
                            setAddedRelatedId(rel.id);
                            await useCartStore.getState().addItem({
                              product: rel,
                              variantId: v.id,
                              variantTitle: v.title,
                              price: v.price,
                              quantity: 1,
                              selectedOptions: v.selectedOptions,
                            });
                            setIsCartOpen(true);
                            setTimeout(() => setAddedRelatedId(null), 1600);
                          }
                        }}
                        aria-label={`Ajouter ${rel.title} au panier`}
                        title="Ajouter au panier"
                        className="size-8 sm:size-9 shrink-0 rounded-xl border border-[#E6E1D8] bg-[#F9F8F6] text-[#1E293B] shadow-xs grid place-items-center transition-all duration-200 hover:bg-[#ffbf00] hover:border-[#ffbf00] hover:text-[#1E293B] hover:scale-105 active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#ffbf00] cursor-pointer"
                      >
                        {isItemAdded ? (
                          <Check className="size-3.5 sm:size-4 text-emerald-600 stroke-[3] animate-in zoom-in" />
                        ) : (
                          <Plus className="size-3.5 sm:size-4 stroke-[2.5]" />
                        )}
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
          </section>
        )}
      </main>

      {/* 5. Footer */}
      <footer className="mt-16 border-t border-border bg-primary text-primary-foreground">
        <div className="store-shell grid gap-8 py-10 sm:grid-cols-[1.5fr_1fr_1fr]">
          <div>
            <div className="mb-3.5">
              <BrandLogo size="md" variant="dark" />
            </div>
            <p className="font-display text-xl font-semibold">Grandir, ensemble.</p>
            <p className="mt-2 max-w-xs text-sm leading-6 text-primary-foreground/75">
              Des idées choisies pour les enfants qui grandissent et les familles qui les accompagnent.
            </p>
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.12em]">La Boutique</p>
            <div className="mt-4 flex flex-col gap-2.5 text-sm text-primary-foreground/75">
              <Link href="/#boutique" className="hover:text-white transition-colors">
                Tous les produits
              </Link>
              <Link href="/#univers" className="hover:text-white transition-colors">
                Nos engagements
              </Link>
            </div>
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.12em]">Contact & Support</p>
            <div className="mt-4 flex flex-col gap-2.5 text-sm text-primary-foreground/75">
              <span>Service client Maroc</span>
              <span>contact@teflook.com</span>
              <a
                href="https://wa.me/212600000000"
                target="_blank"
                rel="noopener noreferrer"
                className="text-emerald-400 hover:underline"
              >
                Assistance WhatsApp
              </a>
              <button
                type="button"
                onClick={openSettingsModal}
                className="text-left text-primary-foreground/75 hover:text-white transition-colors cursor-pointer"
              >
                {t("cookies.manageLink")}
              </button>
            </div>
          </div>
        </div>
        <div className="border-t border-primary-foreground/15">
          <div className="store-shell flex flex-wrap justify-between gap-2 py-4 pr-32 sm:pr-40 text-[11px] text-primary-foreground/65">
            <div className="flex items-center gap-3 sm:gap-4 flex-wrap">
              <span>© {isMounted ? new Date().getFullYear() : 2026} TefLook. Tous droits réservés.</span>
              <span>•</span>
              <button
                type="button"
                onClick={openSettingsModal}
                className="hover:text-white underline underline-offset-2 transition-colors cursor-pointer"
              >
                {t("cookies.manageLink")}
              </button>
            </div>
            <span>Accompagner chaque petit pas.</span>
          </div>
        </div>
      </footer>

      {/* 6. Cart Slide-over Sheet */}
      <CartSheet
        open={isCartOpen}
        onOpenChange={setIsCartOpen}
        onOpenCODCheckout={() => setIsCODModalOpen(true)}
      />

      {/* Cash on Delivery Modal */}
      <CODCheckoutModal open={isCODModalOpen} onOpenChange={setIsCODModalOpen} />

      {/* 7. Floating WhatsApp Button */}
      <WhatsAppButton />

      {/* 8. Notification Toast */}
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
  const { locale, t } = useTefLookLanguage();
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
