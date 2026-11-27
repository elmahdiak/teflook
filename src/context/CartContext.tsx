"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { ProductItem } from "@/data/teflookData";
import { trackAnalyticsEvent } from "@/lib/analytics";

export interface CartItem {
  product: ProductItem;
  quantity: number;
  selectedSize?: number;
}

interface CartContextType {
  items: CartItem[];
  addToCart: (product: ProductItem, selectedSize?: number) => void;
  removeFromCart: (productId: string, selectedSize?: number) => void;
  updateQuantity: (productId: string, quantity: number, selectedSize?: number) => void;
  clearCart: () => void;
  totalItems: number;
  totalMad: number;
  totalEur: number;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  currency: "MAD" | "EUR";
  setCurrency: (c: "MAD" | "EUR") => void;
  language: "FR" | "AR" | "EN";
  setLanguage: (l: "FR" | "AR" | "EN") => void;
  activeQuickProduct: ProductItem | null;
  setActiveQuickProduct: (product: ProductItem | null) => void;
  isSearchOpen: boolean;
  setIsSearchOpen: (open: boolean) => void;
  notification: string | null;
  showNotification: (msg: string) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [currency, setCurrency] = useState<"MAD" | "EUR">("MAD");
  const [language, setLanguage] = useState<"FR" | "AR" | "EN">("FR");
  const [activeQuickProduct, setActiveQuickProduct] = useState<ProductItem | null>(null);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);

  // Initialize with local storage if available
  useEffect(() => {
    try {
      const saved = localStorage.getItem("teflook_cart");
      if (saved) {
        setItems(JSON.parse(saved));
      }
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem("teflook_cart", JSON.stringify(items));
    } catch {
      // ignore
    }
  }, [items]);

  const showNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => {
      setNotification((curr) => (curr === msg ? null : curr));
    }, 3500);
  };

  const addToCart = (product: ProductItem, selectedSize?: number) => {
    setItems((prev) => {
      const existingIndex = prev.findIndex(
        (item) => item.product.id === product.id && item.selectedSize === selectedSize
      );
      if (existingIndex > -1) {
        const next = [...prev];
        next[existingIndex] = {
          ...next[existingIndex],
          quantity: next[existingIndex].quantity + 1,
        };
        return next;
      }
      return [...prev, { product, quantity: 1, selectedSize }];
    });
    showNotification(`« ${product.name} » ajouté au panier`);
    trackAnalyticsEvent({
      eventType: "cart_add",
      metadata: {
        source: "add_to_cart",
        product_id: product.id,
        title: product.name,
        quantity: 1,
        price_mad: product.priceMad,
      },
    });
  };

  const removeFromCart = (productId: string, selectedSize?: number) => {
    setItems((prev) =>
      prev.filter(
        (item) => !(item.product.id === productId && item.selectedSize === selectedSize)
      )
    );
  };

  const updateQuantity = (productId: string, quantity: number, selectedSize?: number) => {
    if (quantity <= 0) {
      removeFromCart(productId, selectedSize);
      return;
    }
    setItems((prev) =>
      prev.map((item) => {
        if (item.product.id === productId && item.selectedSize === selectedSize) {
          return { ...item, quantity };
        }
        return item;
      })
    );
  };

  const clearCart = () => setItems([]);

  const totalItems = items.reduce((acc, item) => acc + item.quantity, 0);
  const totalMad = items.reduce((acc, item) => acc + item.product.priceMad * item.quantity, 0);
  const totalEur = items.reduce((acc, item) => acc + item.product.priceEur * item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        totalItems,
        totalMad,
        totalEur,
        isCartOpen,
        setIsCartOpen,
        currency,
        setCurrency,
        language,
        setLanguage,
        activeQuickProduct,
        setActiveQuickProduct,
        isSearchOpen,
        setIsSearchOpen,
        notification,
        showNotification,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
