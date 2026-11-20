"use client";

import React, { useState } from "react";
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
import { CHILD_STORE_CATEGORIES } from "@/lib/teflook-categories";
import { CHILD_STORE_CATEGORY_MESSAGE_KEYS, useTefLookLanguage } from "@/lib/teflook-language";

interface ProductDetailViewProps {
  product: ShopifyProduct;
  relatedProducts: ShopifyProduct[];
}

export function ProductDetailView({ product, relatedProducts }: ProductDetailViewProps) {
  const { direction, locale, t } = useTefLookLanguage();
  const images = product.images.edges.map((e) => e.node);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCODModalOpen, setIsCODModalOpen] = useState(false);
  const [notice, setNotice] = useState("");
  const [adding, setAdding] = useState(false);
  const [openAccordion, setOpenAccordion] = useState<string>("description");

  const { items, hasHydrated, error: cartError } = useCartStore();
  const count = hasHydrated ? items.reduce((total, item) => total + item.quantity, 0) : 0;

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
  const categoryLabel = product.category
    ? t(CHILD_STORE_CATEGORY_MESSAGE_KEYS[product.category])
    : product.productType;

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
      setNotice(`${t("product.addedPrefix")}${product.title}`);
      setIsCartOpen(true);
    }
  }

  const whatsappOrderUrl = `https://wa.me/212600000000?text=${encodeURIComponent(
    `Bonjour TefLook, je souhaite commander : ${product.title} (${currentPrice} MAD) en quantité ${quantity}.`
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
              <ArrowLeft size={15} />
              <span className="hidden sm:inline">Retour à la boutique</span>
            </Link>
            <Link href="/" aria-label="TefLook accueil" className="flex items-center gap-2.5">
              <img src="/images/Untitled Design.png" alt="TefLook" className="size-9 rounded-xl object-contain shadow-xs" />
              <span className="font-display text-xl font-extrabold tracking-normal">
                <span className="text-[#4C9A9C]">Tef</span>
                <span className="text-[#FE7C58]">Look</span>
              </span>
            </Link>
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
      <nav aria-label="Fil d'Ariane" className="border-b border-border/60 bg-card/40 py-2.5">
        <div className="store-shell flex items-center gap-2 text-xs text-muted-foreground truncate">
          <Link href="/" className="hover:text-brand-teal transition-colors">
            Accueil
          </Link>
          <ChevronRight size={12} className="shrink-0 text-muted-foreground/60" />
          <Link href="/#boutique" className="hover:text-brand-teal transition-colors">
            {categoryLabel}
          </Link>
          <ChevronRight size={12} className="shrink-0 text-muted-foreground/60" />
          <span className="truncate font-medium text-foreground">{product.title}</span>
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
                alt={images[selectedImageIndex]?.altText || product.title}
                className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              {discountPercent && (
                <span className="absolute top-4 left-4 rounded-full bg-brand-orange px-3 py-1 text-xs font-black uppercase tracking-wider text-white shadow-sm">
                  -{discountPercent}% Promo
                </span>
              )}
              <span className="absolute bottom-4 left-4 inline-flex items-center gap-1.5 rounded-full bg-card/90 backdrop-blur-xs px-3 py-1 text-xs font-semibold text-brand-teal shadow-xs border border-border/50">
                <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
                En stock · Expédié sous 24h
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
                  {product.vendor || "TefLook Collection"}
                </span>
                <span className="inline-flex items-center gap-1 rounded-full bg-brand-mist px-2.5 py-0.5 text-xs font-bold text-brand-teal">
                  {categoryConfig?.subtitle || "Éveil"}
                </span>
              </div>
              <h1 className="font-display text-2xl sm:text-3xl lg:text-4xl font-extrabold text-foreground leading-[1.15]">
                {product.title}
              </h1>

              {/* Star rating */}
              <div className="mt-3 flex items-center gap-2 text-xs font-medium text-muted-foreground">
                <div className="flex items-center text-amber-500">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={15} fill="currentColor" />
                  ))}
                </div>
                <span className="font-bold text-foreground">{product.rating}</span>
                <span>({product.reviewsCount} avis certifiés)</span>
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
                TVA incluse · Paiement en espèces à la livraison partout au Maroc
              </p>

              {/* Variant Selector */}
              {product.variants.edges.length > 0 && currentVariant?.selectedOptions && (
                <div className="mt-5 border-t border-border/60 pt-4">
                  <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2.5">
                    Tranche d'âge & Niveau :
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
                      aria-label="Diminuer la quantité"
                      className="grid size-10 place-items-center rounded-lg text-muted-foreground hover:bg-secondary hover:text-foreground disabled:opacity-40"
                    >
                      <Minus size={15} />
                    </button>
                    <span className="w-10 text-center font-bold text-sm">{quantity}</span>
                    <button
                      type="button"
                      onClick={() => setQuantity((q) => q + 1)}
                      aria-label="Augmenter la quantité"
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
                        <ShoppingBag size={18} className="mr-2" />
                        Ajouter au panier • {currentPrice * quantity} MAD
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
                  Commander directement via WhatsApp
                </a>
              </div>
            </div>

            {/* Moroccan Service & Trust Guarantees */}
            <div className="grid grid-cols-2 gap-3">
              <div className="flex items-start gap-2.5 rounded-xl border border-border/60 bg-card/60 p-3">
                <Truck size={18} className="text-brand-teal shrink-0 mt-0.5" />
                <div className="text-xs leading-snug">
                  <span className="font-bold block text-foreground">Livraison Express</span>
                  <span className="text-muted-foreground">24 à 48h partout au Maroc</span>
                </div>
              </div>
              <div className="flex items-start gap-2.5 rounded-xl border border-border/60 bg-card/60 p-3">
                <ShieldCheck size={18} className="text-brand-teal shrink-0 mt-0.5" />
                <div className="text-xs leading-snug">
                  <span className="font-bold block text-foreground">Paiement Sécurisé</span>
                  <span className="text-muted-foreground">À la réception de votre colis</span>
                </div>
              </div>
              <div className="flex items-start gap-2.5 rounded-xl border border-border/60 bg-card/60 p-3">
                <Sparkles size={18} className="text-brand-orange shrink-0 mt-0.5" />
                <div className="text-xs leading-snug">
                  <span className="font-bold block text-foreground">100% Non Toxique</span>
                  <span className="text-muted-foreground">Matériaux certifiés sûrs</span>
                </div>
              </div>
              <div className="flex items-start gap-2.5 rounded-xl border border-border/60 bg-card/60 p-3">
                <RotateCcw size={18} className="text-brand-teal shrink-0 mt-0.5" />
                <div className="text-xs leading-snug">
                  <span className="font-bold block text-foreground">Garantie TefLook</span>
                  <span className="text-muted-foreground">Échange & retour faciles</span>
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
                  <span>Description du produit</span>
                  <ChevronDown
                    size={16}
                    className={`transition-transform duration-200 ${
                      openAccordion === "description" ? "rotate-180" : ""
                    }`}
                  />
                </button>
                {openAccordion === "description" && (
                  <div className="pt-3 text-xs sm:text-sm text-foreground/80 leading-relaxed">
                    <p>{product.description}</p>
                    {product.features && product.features.length > 0 && (
                      <ul className="mt-3 space-y-1.5 list-disc list-inside text-foreground/85">
                        {product.features.map((feat, i) => (
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
                  <span>Matériaux & Origine</span>
                  <ChevronDown
                    size={16}
                    className={`transition-transform duration-200 ${
                      openAccordion === "materials" ? "rotate-180" : ""
                    }`}
                  />
                </button>
                {openAccordion === "materials" && (
                  <div className="pt-3 text-xs sm:text-sm text-foreground/80 space-y-2">
                    <p>
                      <strong>Composition :</strong>{" "}
                      {product.material || "Bois naturel certifié FSC et pigments non toxiques"}
                    </p>
                    <p>
                      <strong>Conception :</strong>{" "}
                      {product.origin || "Fabriqué avec passion selon les normes de sécurité internationales"}
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
                  <span>Livraison & Modalités</span>
                  <ChevronDown
                    size={16}
                    className={`transition-transform duration-200 ${
                      openAccordion === "shipping" ? "rotate-180" : ""
                    }`}
                  />
                </button>
                {openAccordion === "shipping" && (
                  <div className="pt-3 text-xs sm:text-sm text-foreground/80 space-y-1.5 leading-relaxed">
                    <p>• Expédition sous 24h ouvrées depuis nos entrepôts au Maroc.</p>
                    <p>• Livraison à domicile : Casablanca (24h), Rabat, Marrakech, Tanger, Fès et toutes villes (48h).</p>
                    <p>• Règlement en espèces lors de la réception du colis.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* 4. Related Products Section ("Vous aimerez aussi") */}
        {relatedProducts.length > 0 && (
          <section className="mt-16 sm:mt-24 border-t border-border pt-12 sm:pt-16">
            <div className="mb-8 flex items-end justify-between">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.15em] text-brand-orange">
                  Complétez votre sélection
                </p>
                <h2 className="mt-2 font-display text-2xl sm:text-3xl font-extrabold text-foreground">
                  Vous aimerez aussi
                </h2>
              </div>
              <Link
                href="/#boutique"
                className="text-xs font-bold text-brand-teal hover:text-brand-orange transition-colors"
              >
                Explorer toute la boutique →
              </Link>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-4">
              {relatedProducts.map((rel) => {
                const img = rel.images.edges[0]?.node?.url;
                const price = Number(rel.priceRange.minVariantPrice.amount);
                return (
                  <article
                    key={rel.id}
                    className="group flex h-full flex-col justify-between overflow-hidden rounded-xl sm:rounded-2xl border border-border/80 bg-card p-2.5 sm:p-3.5 shadow-xs transition-all duration-300 hover:border-brand-teal/40 hover:shadow-md"
                  >
                    <div>
                      <Link
                        href={`/product/${rel.handle}`}
                        className="relative block aspect-square w-full overflow-hidden rounded-lg sm:rounded-xl bg-secondary"
                      >
                        <img
                          src={img}
                          alt={rel.title}
                          className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
                          loading="lazy"
                        />
                      </Link>
                      <div className="pt-2 sm:pt-3">
                        <p className="mb-0.5 truncate text-[10px] sm:text-[11px] font-semibold uppercase tracking-[0.11em] text-brand-teal">
                          {rel.vendor}
                        </p>
                        <Link
                          href={`/product/${rel.handle}`}
                          className="line-clamp-2 text-[12px] sm:text-[14px] font-semibold leading-[1.3] sm:leading-[1.4] text-foreground transition-colors hover:text-brand-teal"
                        >
                          {rel.title}
                        </Link>
                      </div>
                    </div>

                    <div className="mt-2.5 sm:mt-3.5 flex items-center justify-between gap-1.5 border-t border-border/50 pt-2 sm:pt-3">
                      <p className="truncate text-[13px] sm:text-[15px] font-bold text-brand-orange-deep">
                        {price} MAD
                      </p>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={async () => {
                          const v = rel.variants.edges[0]?.node;
                          if (v) {
                            await useCartStore.getState().addItem({
                              product: rel,
                              variantId: v.id,
                              variantTitle: v.title,
                              price: v.price,
                              quantity: 1,
                              selectedOptions: v.selectedOptions,
                            });
                            setIsCartOpen(true);
                          }
                        }}
                        className="size-8 sm:size-9 shrink-0 rounded-lg border border-border bg-background transition-all hover:border-brand-teal hover:bg-brand-teal/10 hover:text-brand-teal cursor-pointer"
                        title="Ajouter au panier"
                      >
                        <Plus size={16} />
                      </Button>
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
            <div className="mb-3 flex items-center gap-2.5">
              <img src="/images/Untitled design (1).png" alt="TefLook" className="size-9 rounded-xl object-contain shadow-xs" />
              <span className="font-display text-2xl font-black tracking-normal text-white">
                <span className="text-white">Tef</span>
                <span className="text-[#FEC748]">Look</span>
              </span>
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
            </div>
          </div>
        </div>
        <div className="border-t border-primary-foreground/15">
          <div className="store-shell flex flex-wrap justify-between gap-2 py-4 pr-32 sm:pr-40 text-[11px] text-primary-foreground/65">
            <span>© {new Date().getFullYear()} TefLook. Tous droits réservés.</span>
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
