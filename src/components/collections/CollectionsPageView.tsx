"use client";

import React, { useEffect, useState } from "react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { StoreCartSheet } from "@/components/cart/StoreCartSheet";
import { CODCheckoutModal } from "@/components/cart/CODCheckoutModal";
import { CollectionCardsGrid } from "@/components/collections/CollectionCardsGrid";
import { useCartStore } from "@/lib/shopify-cart";
import { useTefLookLanguage } from "@/lib/teflook-language";
import { cn } from "@/lib/utils";

export function CollectionsPageView() {
  const { locale, direction } = useTefLookLanguage();
  const [isMounted, setIsMounted] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCODModalOpen, setIsCODModalOpen] = useState(false);

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
        <section
          aria-labelledby="collections-page-heading"
          className="pt-12 sm:pt-16 pb-16 sm:pb-20"
        >
          {/* Editorial Centered Header */}
          <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center mb-6 sm:mb-8">
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

          {/* 6-Category Clean Card Grid — Pill Icon Strip + Start-Aligned Editorial Card */}
          <CollectionCardsGrid
            locale={currentLocale}
            className="max-w-6xl mx-auto px-4 sm:px-6 py-4 sm:py-6"
          />
        </section>
      </main>

      <Footer />

      <StoreCartSheet
        open={isCartOpen}
        onOpenChange={setIsCartOpen}
        onOpenCODCheckout={() => setIsCODModalOpen(true)}
      />

      <CODCheckoutModal open={isCODModalOpen} onOpenChange={setIsCODModalOpen} />
    </div>
  );
}
