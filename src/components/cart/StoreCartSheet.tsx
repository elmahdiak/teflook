"use client";

import React from "react";
import { Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useCartStore } from "@/lib/shopify-cart";
import { useTefLookLanguage } from "@/lib/teflook-language";

export interface StoreCartSheetProps {
  open: boolean;
  onOpenChange: (value: boolean) => void;
  onOpenCODCheckout: () => void;
}

export function StoreCartSheet({
  open,
  onOpenChange,
  onOpenCODCheckout,
}: StoreCartSheetProps) {
  const { locale, direction, t } = useTefLookLanguage();
  const { items, isLoading, error } = useCartStore();
  const updateQuantity = useCartStore((state) => state.updateQuantity);
  const removeItem = useCartStore((state) => state.removeItem);

  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const currency = items[0]?.price.currencyCode ?? "MAD";
  const total = items.reduce(
    (sum, item) => sum + Number(item.price.amount) * item.quantity,
    0
  );

  function formatCartPrice(price: { amount: string; currencyCode: string }) {
    return `${Number(price.amount).toFixed(2).replace(".", ",")} ${price.currencyCode || "MAD"}`;
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
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
                        <p className="mt-1.5 text-sm font-bold text-brand-orange-deep">
                          {formatCartPrice(item.price)}
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
                    {new Intl.NumberFormat(locale === "ar" ? "ar-MA" : "fr-MA", {
                      style: "currency",
                      currency,
                      maximumFractionDigits: 2,
                    }).format(total)}
                  </span>
                </div>
                {error && (
                  <p role="alert" className="text-sm text-destructive">
                    {error}
                  </p>
                )}
                <Button
                  onClick={() => {
                    onOpenChange(false);
                    onOpenCODCheckout();
                  }}
                  disabled={items.length === 0}
                  className="h-12 w-full justify-between rounded-[4px] bg-brand-orange px-5 text-white hover:bg-brand-orange/90 font-bold shadow-md cursor-pointer"
                >
                  <span>Commander • Paiement à la livraison</span>
                  <ShoppingBag size={18} />
                </Button>
              </div>
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
