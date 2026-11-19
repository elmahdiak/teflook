"use client";

import React from "react";
import { MessageCircle } from "lucide-react";

interface WhatsAppButtonProps {
  phoneNumber?: string;
  defaultMessage?: string;
  label?: string;
}

export function WhatsAppButton({
  phoneNumber = "212600000000",
  defaultMessage = "Bonjour TefLook, j'ai besoin d'aide pour choisir un produit (protection enfant, jouets d'éveil, commande).",
  label = "Need help?",
}: WhatsAppButtonProps) {
  const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(
    defaultMessage
  )}`;

  return (
    <aside aria-label="Support WhatsApp">
      <a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-6 right-6 z-40 flex items-center gap-2.5 px-5 py-2.5 sm:px-6 sm:py-3 rounded-full bg-[#25D366] hover:bg-[#20ba59] text-[#1E293B] shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 transition-all duration-300 group cursor-pointer border border-[#1ebd5a]/30 select-none"
        aria-label="Contacter le service client TefLook sur WhatsApp"
      >
        {/* Clean Chat Bubble Icon */}
        <MessageCircle className="w-5 h-5 text-[#1E293B] stroke-[2.3] transition-transform duration-300 group-hover:rotate-6" />

        {/* High-Contrast Bold Text */}
        <span className="font-extrabold text-xs sm:text-sm text-[#1E293B] tracking-tight whitespace-nowrap">
          {label}
        </span>
      </a>
    </aside>
  );
}
