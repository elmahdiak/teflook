"use client";

import React from "react";
import { Truck, PhoneCall, Sparkles, Tag } from "lucide-react";

export function TopAnnouncementBar() {
  return (
    <div className="w-full bg-[#1E293B] text-white text-[11px] sm:text-xs font-medium border-b border-[#334155] relative z-40 select-none">
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 h-9 sm:h-10 flex items-center justify-between gap-4">
        
        {/* Left: Promotional Offer Badge */}
        <div className="flex items-center gap-2 shrink-0">
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#FF6B00] text-white text-[10px] font-black uppercase tracking-wider animate-pulse">
            <Sparkles className="w-3 h-3" />
            <span>Offres Spéciales</span>
          </span>
          <span className="hidden md:inline text-[#CBD5E1] text-[11px]">
            Jusqu&apos;à <strong className="text-white">-50%</strong> sur la sélection Enfance &amp; Éveil
          </span>
        </div>

        {/* Center: Delivery Notice */}
        <div className="flex items-center gap-1.5 text-center truncate justify-center">
          <Truck className="w-3.5 h-3.5 text-[#4A9099] shrink-0" />
          <span className="truncate text-slate-200">
            <span className="font-bold text-[#4A9099]">Livraison Gratuite</span> dès 300 MAD partout au Maroc • Code : <strong className="text-[#FF6B00]">TEFPROMO</strong>
          </span>
        </div>

        {/* Right: Customer Service Direct Link */}
        <div className="hidden sm:flex items-center gap-3 shrink-0 text-slate-300 text-[11px]">
          <a
            href="https://wa.me/212600000000"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 hover:text-white transition-colors"
          >
            <PhoneCall className="w-3 h-3 text-[#4A9099]" />
            <span className="font-semibold">Aide &amp; Commande WhatsApp</span>
          </a>
        </div>

      </div>
    </div>
  );
}
