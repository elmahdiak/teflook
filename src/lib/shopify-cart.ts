import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { ShopifyProduct, ShopifyPrice, ShopifySelectedOption } from "./shopify-storefront";

export interface CartLineItem {
  product: ShopifyProduct;
  variantId: string;
  variantTitle: string;
  price: ShopifyPrice;
  quantity: number;
  selectedOptions?: ShopifySelectedOption[];
}

interface CartStoreState {
  items: CartLineItem[];
  hasHydrated: boolean;
  isLoading: boolean;
  isSyncing: boolean;
  checkoutUrl: string;
  error: string | null;

  addItem: (item: CartLineItem) => Promise<void>;
  updateQuantity: (variantId: string, quantity: number) => Promise<void>;
  removeItem: (variantId: string) => Promise<void>;
  syncCart: () => Promise<void>;
  clearCart: () => void;
  setHasHydrated: (val: boolean) => void;
}

export const useCartStore = create<CartStoreState>()(
  persist(
    (set, get) => ({
      items: [],
      hasHydrated: false,
      isLoading: false,
      isSyncing: false,
      checkoutUrl: "https://wa.me/212600000000?text=Bonjour%20TefLook,%20je%20souhaite%20finaliser%20ma%20commande.",
      error: null,

      setHasHydrated: (val) => set({ hasHydrated: val }),

      addItem: async (newItem) => {
        set({ isLoading: true, error: null });
        try {
          const currentItems = get().items;
          const existingIndex = currentItems.findIndex(
            (item) => item.variantId === newItem.variantId
          );

          let updated: CartLineItem[];
          if (existingIndex > -1) {
            updated = [...currentItems];
            updated[existingIndex] = {
              ...updated[existingIndex],
              quantity: updated[existingIndex].quantity + newItem.quantity,
            };
          } else {
            updated = [...currentItems, newItem];
          }

          // Build pre-filled WhatsApp checkout URL
          const summary = updated
            .map((i) => `- ${i.product.title} (x${i.quantity}) : ${Number(i.price.amount) * i.quantity} ${i.price.currencyCode}`)
            .join("%0A");
          const total = updated.reduce(
            (sum, i) => sum + Number(i.price.amount) * i.quantity,
            0
          );
          const checkoutUrl = `https://wa.me/212600000000?text=${encodeURIComponent(
            `Bonjour TefLook,\nJe souhaite commander :\n`
          )}${summary}${encodeURIComponent(`\n\nTotal: ${total} MAD\nMerci !`)}`;

          set({ items: updated, checkoutUrl, isLoading: false });
        } catch (err) {
          set({
            error: err instanceof Error ? err.message : "Erreur lors de l'ajout au panier",
            isLoading: false,
          });
        }
      },

      updateQuantity: async (variantId, quantity) => {
        if (quantity <= 0) {
          await get().removeItem(variantId);
          return;
        }

        const updated = get().items.map((item) =>
          item.variantId === variantId ? { ...item, quantity } : item
        );
        set({ items: updated });
      },

      removeItem: async (variantId) => {
        const updated = get().items.filter((item) => item.variantId !== variantId);
        set({ items: updated });
      },

      syncCart: async () => {
        set({ isSyncing: true });
        // Simulating quick sync
        setTimeout(() => {
          set({ isSyncing: false });
        }, 150);
      },

      clearCart: () => {
        set({ items: [] });
      },
    }),
    {
      name: "teflook-shopify-cart",
      skipHydration: true,
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    }
  )
);
