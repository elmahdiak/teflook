"use client";

import React, { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Check, X } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { StoreCartSheet } from "@/components/cart/StoreCartSheet";
import { CODCheckoutModal } from "@/components/cart/CODCheckoutModal";
import { CollectionCardsGrid } from "@/components/collections/CollectionCardsGrid";
import { CollectionCatalogSection } from "@/components/collections/CollectionCatalogSection";
import { useCartStore } from "@/lib/shopify-cart";
import { resolveChildStoreCategory } from "@/lib/teflook-categories";
import { useTefLookLanguage } from "@/lib/teflook-language";
import { cn } from "@/lib/utils";

function CollectionsContent({
  currentLocale,
  isAr,
  onAddedToCart,
  onNotice,
}: {
  currentLocale: "fr" | "ar";
  isAr: boolean;
  onAddedToCart: () => void;
  onNotice: (message: string) => void;
}) {
  const searchParams = useSearchParams();
  const categoryParam = searchParams.get("category");
  const selectedCategory = resolveChildStoreCategory(categoryParam);

  if (selectedCategory) {
    return (
      <CollectionCatalogSection
        category={selectedCategory}
        onAddedToCart={onAddedToCart}
        onNotice={onNotice}
        useQueryLinks
      />
    );
  }

  return (
    <section
      aria-labelledby="collections-page-heading"
      className="py-16 sm:py-24"
    >
      {/* Editorial Centered Header */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center mb-10 sm:mb-12">
        <h1
          id="collections-page-heading"
          className={cn(
            "font-display text-3xl sm:text-4xl font-extrabold text-[#1A3C34] text-center mb-4",
            isAr && "font-sans"
          )}
        >
          {isAr ? "مجموعاتنا" : "Nos Collections"}
        </h1>
        <p
          className={cn(
            "text-sm sm:text-base text-[#3D524D] max-w-xl mx-auto leading-relaxed",
            isAr && "font-sans leading-loose"
          )}
        >
          {isAr
            ? "أدوات تعليمية وتطويرية خالية من الشاشات، صُممت بعناية لكل مرحلة من مراحل نمو الطفل."
            : "Des outils d'apprentissage sans écran pensés pour chaque étape de l'enfant."}
        </p>
      </div>

      {/* 6-Category Clean Card Grid — Pill Icon Strip + Centered Editorial Card */}
      <CollectionCardsGrid
        locale={currentLocale}
        className="max-w-6xl mx-auto px-4 sm:px-6 py-4 sm:py-6"
      />
    </section>
  );
}

export function CollectionsPageView() {
  const { locale, direction, t } = useTefLookLanguage();
  const [isMounted, setIsMounted] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCODModalOpen, setIsCODModalOpen] = useState(false);
  const [notice, setNotice] = useState("");
  const { error: cartError } = useCartStore();

  useEffect(() => {
    setIsMounted(true);
    void useCartStore.persist.rehydrate();
  }, []);

  const currentLocale = isMounted ? locale : "fr";
  const currentDirection = isMounted ? direction : "ltr";
  const isAr = currentLocale === "ar";

  return (
    <div
      lang={currentLocale}
      dir={currentDirection}
      className="min-h-screen flex flex-col bg-[#F7FAFA] text-[#1A3C34]"
    >
      <Header onOpenCart={() => setIsCartOpen(true)} defaultSearchOpen={false} />

      <main className="flex-1 bg-[#F7FAFA]">
        <Suspense
          fallback={
            <section
              aria-labelledby="collections-page-heading"
              className="py-16 sm:py-24"
            >
              <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center mb-10 sm:mb-12">
                <h1
                  id="collections-page-heading"
                  className={cn(
                    "font-display text-3xl sm:text-4xl font-extrabold text-[#1A3C34] text-center mb-4",
                    isAr && "font-sans"
                  )}
                >
                  {isAr ? "مجموعاتنا" : "Nos Collections"}
                </h1>
              </div>
              <CollectionCardsGrid
                locale={currentLocale}
                className="max-w-6xl mx-auto px-4 sm:px-6 py-4 sm:py-6"
              />
            </section>
          }
        >
          <CollectionsContent
            currentLocale={currentLocale}
            isAr={isAr}
            onAddedToCart={() => setIsCartOpen(true)}
            onNotice={setNotice}
          />
        </Suspense>
      </main>

      <Footer />

      <StoreCartSheet
        open={isCartOpen}
        onOpenChange={setIsCartOpen}
        onOpenCODCheckout={() => setIsCODModalOpen(true)}
      />

      <CODCheckoutModal open={isCODModalOpen} onOpenChange={setIsCODModalOpen} />

      {(notice || cartError) && (
        <div
          role={cartError ? "alert" : "status"}
          className="fixed bottom-4 left-1/2 z-50 flex max-w-[calc(100vw-2rem)] -translate-x-1/2 items-center gap-3 rounded-xl border border-border bg-card px-4 py-3 text-sm text-foreground shadow-lg"
        >
          {cartError ? (
            <X size={17} className="shrink-0 text-destructive" />
          ) : (
            <Check size={17} className="shrink-0 text-primary" />
          )}
          <span className="min-w-0">{cartError ?? notice}</span>
          <button
            type="button"
            className="grid size-7 shrink-0 place-items-center cursor-pointer"
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
    </div>
  );
}
