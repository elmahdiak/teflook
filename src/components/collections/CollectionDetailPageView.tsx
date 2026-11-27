"use client";

import React, { useEffect, useState } from "react";
import { Check, X } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { StoreCartSheet } from "@/components/cart/StoreCartSheet";
import { CODCheckoutModal } from "@/components/cart/CODCheckoutModal";
import { CollectionCatalogSection } from "@/components/collections/CollectionCatalogSection";
import { useCartStore } from "@/lib/shopify-cart";
import type { ShopifyProduct } from "@/lib/shopify-storefront";
import type { ChildStoreCategory } from "@/lib/teflook-categories";
import { useTefLookLanguage } from "@/lib/teflook-language";

export interface CollectionDetailPageViewProps {
  category: ChildStoreCategory;
  initialProducts: ShopifyProduct[];
}

export function CollectionDetailPageView({
  category,
  initialProducts,
}: CollectionDetailPageViewProps) {
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

  return (
    <div
      lang={currentLocale}
      dir={currentDirection}
      className="min-h-screen flex flex-col bg-[#F7FAFA] text-[#1A3C34]"
    >
      <Header onOpenCart={() => setIsCartOpen(true)} defaultSearchOpen={false} />

      <main className="flex-1 bg-[#F7FAFA]">
        <CollectionCatalogSection
          category={category}
          initialProducts={initialProducts}
          onAddedToCart={() => setIsCartOpen(true)}
          onNotice={setNotice}
        />
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
