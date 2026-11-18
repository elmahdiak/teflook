"use client";

import React from "react";
import { CheckCircle2 } from "lucide-react";
import { useCart } from "@/context/CartContext";

export function ToastNotification() {
  const { notification } = useCart();

  if (!notification) return null;

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2.5 px-5 py-3 rounded-2xl bg-[#1E293B] text-white shadow-2xl border border-[#4A9099]/50 animate-in fade-in slide-in-from-bottom-4 duration-300">
      <CheckCircle2 className="w-4 h-4 text-[#FF6B00] shrink-0" />
      <span className="text-xs sm:text-sm font-medium tracking-wide">
        {notification}
      </span>
    </div>
  );
}
