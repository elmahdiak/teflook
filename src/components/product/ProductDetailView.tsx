"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  Check,
  ChevronLeft,
  ChevronRight,
  LoaderCircle,
  Minus,
  Plus,
  RotateCcw,
  Share2,
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
import { getChildStoreCategory, getCollectionSlug } from "@/lib/teflook-categories";
import { useTefLookLanguage } from "@/lib/teflook-language";
import { getLocalizedProduct } from "@/lib/product-localization";
import { ProductReviewsSection } from "@/components/product/ProductReviewsSection";
import type { ProductRatingSummary } from "@/lib/reviews-service";
import { ProductInfoTabs } from "@/components/product/ProductInfoTabs";
import { ProductCard } from "@/components/product/ProductCard";
import { FAQAccordion } from "@/components/faq/FAQAccordion";
import { cleanWhatsAppNumber, fetchSiteSettings } from "@/lib/site-settings";
import { formatAgeBracketLabel, normalizeProductAgeRanges } from "@/lib/cod-service";
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

  useEffect(() => {
    setSelectedImageIndex(0);
  }, [product.id]);

  const safeImageIndex =
    images.length > 0 ? Math.min(selectedImageIndex, images.length - 1) : 0;
  const activeImage = images[safeImageIndex];
  const [quantity, setQuantity] = useState(1);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCODModalOpen, setIsCODModalOpen] = useState(false);
  const [notice, setNotice] = useState("");
  const [adding, setAdding] = useState(false);
  const [copiedShare, setCopiedShare] = useState(false);
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

  const canonicalCategory = getChildStoreCategory(product);
  const categorySlug = getCollectionSlug(canonicalCategory);
  const localized = getLocalizedProduct(product, locale);
  const ageBrackets = normalizeProductAgeRanges(product);
  const isAvailable = Boolean(currentVariant?.availableForSale);

  async function handleShareProduct() {
    if (typeof window === "undefined") return;
    const shareUrl = window.location.href;

    if (navigator.share) {
      try {
        await navigator.share({
          title: localized.title,
          text: localized.description.slice(0, 120),
          url: shareUrl,
        });
        return;
      } catch {
        // Fallback to clipboard copy if share sheet dismissed/unavailable
      }
    }

    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopiedShare(true);
      setTimeout(() => setCopiedShare(false), 2200);
    } catch {}
  }

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
    <div lang={locale} dir={direction} className="min-h-screen bg-[#F3EFE6]/45 text-[#1A3C34] flex flex-col">
      {/* 1. Sticky Header & Expandable Search Bar */}
      <Header onOpenCart={() => setIsCartOpen(true)} defaultSearchOpen={false} />

      {/* 2. Breadcrumb */}
      <nav
        aria-label={locale === "ar" ? "مسار التنقل" : "Fil d'Ariane"}
        className="border-b border-[#4B9393]/15 bg-[#F3EFE6]/70 py-3"
      >
        <div className="store-shell flex items-center gap-2 text-xs font-sans text-[#1A3C34]/70 truncate">
          <Link href="/" className="hover:text-[#4B9393] transition-colors">
            {locale === "ar" ? "الرئيسية" : "Accueil"}
          </Link>
          <ChevronRight size={12} className={cn("shrink-0 text-[#1A3C34]/40", locale === "ar" && "rotate-180")} />
          <Link href={`/collections/${categorySlug}`} className="hover:text-[#4B9393] transition-colors">
            {localized.categoryName}
          </Link>
          <ChevronRight size={12} className={cn("shrink-0 text-[#1A3C34]/40", locale === "ar" && "rotate-180")} />
          <span className="truncate font-semibold text-[#1A3C34]">{localized.title}</span>
        </div>
      </nav>

      {/* 3. Main Product Details (Balanced High-Whitespace Two-Column Layout) */}
      <main className="flex-1 store-shell py-12 lg:py-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-start">
          {/* Left Column: Architectural Limestone Gallery Frame */}
          <div className="lg:col-span-7 flex flex-col gap-4 lg:sticky lg:top-28">
            <div className="rounded-3xl border border-[#4B9393]/15 bg-[#F3EFE6] p-3 sm:p-4 shadow-sm">
              {/* Main Preview Image */}
              <div className="relative aspect-square w-full overflow-hidden rounded-2xl bg-white group">
                <img
                  key={activeImage?.url || "fallback-product-img"}
                  src={activeImage?.url || "/images/Untitled Design.png"}
                  alt={activeImage?.altText || localized.title}
                  className="size-full object-cover animate-in fade-in duration-300 transition-transform duration-500 group-hover:scale-105"
                />
                {discountPercent && (
                  <span className="absolute top-4 start-4 rounded-full bg-[#F67D56] px-3.5 py-1.5 font-sans text-xs font-bold uppercase tracking-wider text-white shadow-sm">
                    -{discountPercent}% Promo
                  </span>
                )}

                {images.length > 1 && (
                  <>
                    <button
                      type="button"
                      onClick={() =>
                        setSelectedImageIndex(
                          (safeImageIndex - 1 + images.length) % images.length
                        )
                      }
                      aria-label={locale === "ar" ? "الصورة السابقة" : "Photo précédente"}
                      className="absolute start-3 top-1/2 -translate-y-1/2 grid size-9 sm:size-10 place-items-center rounded-full bg-white/95 text-[#1A3C34] border border-[#4B9393]/15 shadow-sm opacity-90 sm:opacity-0 sm:group-hover:opacity-100 hover:bg-[#4B9393] hover:text-white transition-all cursor-pointer"
                    >
                      <ChevronLeft
                        size={18}
                        className={cn(locale === "ar" && "rotate-180")}
                      />
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setSelectedImageIndex((safeImageIndex + 1) % images.length)
                      }
                      aria-label={locale === "ar" ? "الصورة التالية" : "Photo suivante"}
                      className="absolute end-3 top-1/2 -translate-y-1/2 grid size-9 sm:size-10 place-items-center rounded-full bg-white/95 text-[#1A3C34] border border-[#4B9393]/15 shadow-sm opacity-90 sm:opacity-0 sm:group-hover:opacity-100 hover:bg-[#4B9393] hover:text-white transition-all cursor-pointer"
                    >
                      <ChevronRight
                        size={18}
                        className={cn(locale === "ar" && "rotate-180")}
                      />
                    </button>
                    <span
                      dir="ltr"
                      className="absolute bottom-3 end-3 rounded-full bg-[#1A3C34]/75 backdrop-blur-xs px-3 py-1 font-sans text-[11px] font-semibold text-white tabular-nums"
                    >
                      {safeImageIndex + 1} / {images.length}
                    </span>
                  </>
                )}
              </div>
            </div>

            {/* Thumbnail Strip */}
            {images.length > 1 && (
              <div className="flex items-center gap-3 overflow-x-auto no-scrollbar pb-1 pt-0.5">
                {images.map((img, index) => {
                  const isActive = safeImageIndex === index;
                  return (
                    <button
                      type="button"
                      key={`${img.url}-${index}`}
                      onClick={() => setSelectedImageIndex(index)}
                      aria-label={
                        locale === "ar"
                          ? `عرض الصورة ${index + 1}`
                          : `Voir photo ${index + 1}`
                      }
                      aria-pressed={isActive}
                      className={cn(
                        "relative w-16 h-16 sm:w-20 sm:h-20 shrink-0 overflow-hidden rounded-2xl border-2 transition-all cursor-pointer bg-white",
                        isActive
                          ? "border-[#4B9393] ring-2 ring-[#4B9393]/20 opacity-100 shadow-xs"
                          : "border-[#4B9393]/15 opacity-75 hover:opacity-100 hover:border-[#4B9393]/50"
                      )}
                    >
                      <img
                        src={img.url}
                        alt={`${localized.title} - ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Right Column: Product Information & Calm Purchase Card */}
          <div className="lg:col-span-5 flex flex-col gap-7">
            {/* Editorial Title, Pillar Badge & Rating */}
            <div>
              <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                <span className="font-sans text-xs font-semibold uppercase tracking-[0.14em] text-[#4B9393]">
                  {localized.vendor}
                </span>
                <Link
                  href={`/collections/${categorySlug}`}
                  className="inline-flex items-center rounded-full bg-[#4B9393]/10 text-[#4B9393] hover:bg-[#4B9393]/15 px-3 py-1.5 font-sans text-xs font-semibold transition-colors"
                >
                  {localized.categoryBadge}
                </Link>
              </div>

              <h1
                className={cn(
                  "font-display font-bold text-2xl sm:text-3xl lg:text-4xl text-[#1A3C34] tracking-tight mb-4 leading-[1.15]",
                  locale === "ar" && "font-sans tracking-normal leading-snug"
                )}
              >
                {localized.title}
              </h1>

              {/* Star Rating Row */}
              <a
                href="#avis-clients"
                className="inline-flex items-center gap-2 font-sans text-xs font-medium text-[#1A3C34]/75 hover:text-[#4B9393] transition-colors min-h-[1.5rem]"
              >
                {isMounted && liveRatingSummary.reviewsCount > 0 ? (
                  <>
                    <div className="flex items-center gap-0.5 text-[#FCC846]">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          size={15}
                          className={cn(
                            i < Math.round(liveRatingSummary.rating)
                              ? "fill-[#FCC846] text-[#FCC846]"
                              : "text-[#1A3C34]/20 fill-none"
                          )}
                        />
                      ))}
                    </div>
                    <span className="font-bold text-[#1A3C34] tabular-nums">
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
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-[#F3EFE6] border border-[#4B9393]/15 px-3 py-1 font-sans text-xs font-medium text-[#1A3C34]/75">
                    <Star size={13} className="text-[#FCC846] fill-[#FCC846]" />
                    <span>
                      {isMounted && locale === "ar"
                        ? "منتج جديد • كن أول من يقيّم"
                        : "Nouveau produit • Soyez le premier à donner votre avis"}
                    </span>
                  </span>
                )}
              </a>
            </div>

            {/* Warm Limestone Wrapper + Elevated White Purchase Box */}
            <div className="rounded-3xl border border-[#4B9393]/15 bg-white p-6 lg:p-10 shadow-sm">
              {/* Crisp Sans-Serif Price & Stock Status */}
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-baseline gap-3" dir="ltr">
                  <span className="font-sans text-3xl sm:text-4xl font-extrabold text-[#1A3C34] tabular-nums">
                    {currentPrice} MAD
                  </span>
                  {comparePrice && (
                    <span className="font-sans text-base sm:text-lg font-medium text-[#1A3C34]/45 line-through tabular-nums">
                      {comparePrice} MAD
                    </span>
                  )}
                </div>

                <span
                  className={cn(
                    "inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 font-sans text-xs font-semibold",
                    isAvailable
                      ? "bg-[#4B9393]/10 text-[#4B9393]"
                      : "bg-slate-100 text-slate-600"
                  )}
                >
                  <span
                    aria-hidden="true"
                    className={cn(
                      "size-1.5 rounded-full",
                      isAvailable ? "bg-[#4B9393]" : "bg-slate-400"
                    )}
                  />
                  {isAvailable
                    ? locale === "ar"
                      ? "متوفر في المخزون"
                      : "En stock"
                    : locale === "ar"
                    ? "نفدت الكمية"
                    : "Épuisé"}
                </span>
              </div>

              <p className="mt-2 font-sans text-xs text-[#1A3C34]/65">
                {locale === "ar"
                  ? "شامل للضريبة · الدفع نقداً عند الاستلام في جميع أنحاء المغرب"
                  : "TVA incluse · Paiement en espèces à la livraison partout au Maroc"}
              </p>

              {/* Soft Pastel Age-Bracket & Pillar Badges */}
              {(ageBrackets.length > 0 ||
                (product.variants.edges.length > 0 && currentVariant?.selectedOptions)) && (
                <div className="mt-6 border-t border-[#4B9393]/15 pt-5">
                  <p className="font-sans text-xs font-semibold uppercase tracking-wider text-[#1A3C34]/60 mb-3">
                    {locale === "ar" ? "الفئات العمرية :" : "Tranches d'âge :"}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {ageBrackets.length > 0
                      ? ageBrackets.map((age) => (
                          <span
                            key={age}
                            className="bg-[#4B9393]/10 text-[#4B9393] px-3 py-1.5 rounded-full font-sans text-xs font-semibold"
                          >
                            {formatAgeBracketLabel(age, locale)}
                          </span>
                        ))
                      : product.variants.edges.map(({ node: v }) => (
                          <span
                            key={v.id}
                            className="bg-[#4B9393]/10 text-[#4B9393] px-3 py-1.5 rounded-full font-sans text-xs font-semibold"
                          >
                            {v.title}
                          </span>
                        ))}
                  </div>
                </div>
              )}

              {/* Minimal Secondary Controls (Quantity & Share) + High-Conversion Coral CTAs */}
              <div className="mt-7 flex flex-col gap-3.5">
                <div className="flex items-center justify-between gap-3">
                  <div className="inline-flex h-12 items-center rounded-2xl border border-[#4B9393]/20 bg-[#F3EFE6]/60 px-1.5">
                    <button
                      type="button"
                      disabled={quantity <= 1}
                      onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                      aria-label={locale === "ar" ? "تقليل الكمية" : "Diminuer la quantité"}
                      className="grid size-9 place-items-center rounded-xl text-[#1A3C34]/75 hover:bg-white hover:text-[#4B9393] transition-colors disabled:opacity-35 cursor-pointer"
                    >
                      <Minus size={15} />
                    </button>
                    <span className="w-10 text-center font-sans font-bold text-sm text-[#1A3C34] tabular-nums">
                      {quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() => setQuantity((q) => q + 1)}
                      aria-label={locale === "ar" ? "زيادة الكمية" : "Augmenter la quantité"}
                      className="grid size-9 place-items-center rounded-xl text-[#1A3C34]/75 hover:bg-white hover:text-[#4B9393] transition-colors cursor-pointer"
                    >
                      <Plus size={15} />
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() => void handleShareProduct()}
                    aria-label={locale === "ar" ? "مشاركة المنتج" : "Partager ce produit"}
                    className="inline-flex h-12 items-center gap-2 rounded-2xl border border-[#4B9393]/20 bg-[#F3EFE6]/60 px-4 font-sans text-xs font-semibold text-[#1A3C34] hover:bg-white hover:border-[#4B9393]/40 hover:text-[#4B9393] transition-all cursor-pointer"
                  >
                    {copiedShare ? (
                      <>
                        <Check size={15} className="text-[#4B9393]" />
                        <span>{locale === "ar" ? "تم النسخ" : "Lien copié"}</span>
                      </>
                    ) : (
                      <>
                        <Share2 size={15} />
                        <span>{locale === "ar" ? "مشاركة" : "Partager"}</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Primary High-Conversion Add to Cart CTA */}
                <Button
                  onClick={handleAddToCart}
                  disabled={adding || !isAvailable}
                  className="h-auto bg-[#F67D56] hover:bg-[#e06d48] text-white font-sans font-semibold text-sm sm:text-base py-4 px-8 rounded-2xl shadow-md hover:shadow-lg transition-all duration-300 w-full text-center flex items-center justify-center gap-2.5 cursor-pointer disabled:opacity-50"
                >
                  {adding ? (
                    <LoaderCircle className="animate-spin size-5" />
                  ) : (
                    <>
                      <ShoppingBag size={18} className="shrink-0" />
                      <span>
                        {locale === "ar"
                          ? `إضافة إلى السلة • ${currentPrice * quantity} درهم`
                          : `Ajouter au panier • ${currentPrice * quantity} MAD`}
                      </span>
                    </>
                  )}
                </Button>

                {/* Instant WhatsApp Order Secondary CTA */}
                <a
                  href={whatsappOrderUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2.5 w-full rounded-2xl border border-[#4B9393]/25 bg-[#F3EFE6]/70 hover:bg-[#4B9393]/10 hover:border-[#4B9393]/45 text-[#1A3C34] font-sans text-xs sm:text-sm font-semibold py-3.5 px-6 transition-all duration-300 text-center"
                >
                  <img
                    src="https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg"
                    alt=""
                    className="size-4 shrink-0"
                  />
                  <span>
                    {locale === "ar"
                      ? "طلب مباشر عبر واتساب"
                      : "Commander directement via WhatsApp"}
                  </span>
                </a>
              </div>
            </div>

            {/* Moroccan Service & Trust Guarantees inside Warm Limestone Wrapper */}
            <div className="rounded-3xl border border-[#4B9393]/15 bg-[#F3EFE6]/80 p-4 sm:p-5">
              <div className="grid grid-cols-2 gap-3">
                <div className="flex items-start gap-2.5 rounded-2xl border border-[#4B9393]/10 bg-white p-3.5 shadow-2xs">
                  <Truck size={18} className="text-[#4B9393] shrink-0 mt-0.5" />
                  <div className="font-sans text-xs leading-snug">
                    <span className="font-bold block text-[#1A3C34]">
                      {locale === "ar" ? "توصيل سريع" : "Livraison Express"}
                    </span>
                    <span className="text-[#1A3C34]/65">
                      {locale === "ar" ? "24 إلى 48 ساعة في كافة مدن المغرب" : "24 à 48h partout au Maroc"}
                    </span>
                  </div>
                </div>
                <div className="flex items-start gap-2.5 rounded-2xl border border-[#4B9393]/10 bg-white p-3.5 shadow-2xs">
                  <ShieldCheck size={18} className="text-[#4B9393] shrink-0 mt-0.5" />
                  <div className="font-sans text-xs leading-snug">
                    <span className="font-bold block text-[#1A3C34]">
                      {locale === "ar" ? "دفع آمن" : "Paiement Sécurisé"}
                    </span>
                    <span className="text-[#1A3C34]/65">
                      {locale === "ar" ? "عند استلام ومعاينة طلبيتك" : "À la réception de votre colis"}
                    </span>
                  </div>
                </div>
                <div className="flex items-start gap-2.5 rounded-2xl border border-[#4B9393]/10 bg-white p-3.5 shadow-2xs">
                  <Sparkles size={18} className="text-[#FCC846] shrink-0 mt-0.5" />
                  <div className="font-sans text-xs leading-snug">
                    <span className="font-bold block text-[#1A3C34]">
                      {locale === "ar" ? "100% غير سام" : "100% Non Toxique"}
                    </span>
                    <span className="text-[#1A3C34]/65">
                      {locale === "ar" ? "مواد آمنة ومعتمدة للأطفال" : "Matériaux certifiés sûrs"}
                    </span>
                  </div>
                </div>
                <div className="flex items-start gap-2.5 rounded-2xl border border-[#4B9393]/10 bg-white p-3.5 shadow-2xs">
                  <RotateCcw size={18} className="text-[#4B9393] shrink-0 mt-0.5" />
                  <div className="font-sans text-xs leading-snug">
                    <span className="font-bold block text-[#1A3C34]">
                      {locale === "ar" ? "ضمان تيفلوك" : "Garantie TefLook"}
                    </span>
                    <span className="text-[#1A3C34]/65">
                      {locale === "ar" ? "إرجاع واستبدال بكل سهولة" : "Échange & retour faciles"}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Two-Tab Information Section inside Clean Elevated Container */}
            <div className="rounded-3xl border border-[#4B9393]/15 bg-white p-6 lg:p-8 shadow-sm">
              <ProductInfoTabs product={product} />
            </div>
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
                <p className="text-[11px] font-bold uppercase tracking-[0.15em] text-[#F67D56]">
                  {locale === "ar" ? "أكمل تشكيلتك المختارة" : "Complétez votre sélection"}
                </p>
                <h2 className="mt-2 font-display text-2xl sm:text-3xl font-extrabold text-[#1A3C34]">
                  {locale === "ar" ? "قد يعجبك أيضاً" : "Vous aimerez aussi"}
                </h2>
              </div>
              <Link
                href="/#boutique"
                className="text-xs font-bold text-[#4B9393] hover:text-[#F67D56] transition-colors"
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
