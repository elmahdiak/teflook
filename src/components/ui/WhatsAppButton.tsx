"use client";

import React, { useEffect, useState } from "react";
import { MessageCircle } from "lucide-react";
import { useTefLookLanguage } from "@/lib/teflook-language";
import { cn } from "@/lib/utils";

export interface WhatsAppButtonProps {
  phoneNumber?: string;
  defaultMessage?: string;
  label?: string;
  className?: string;
}

export function WhatsAppButton({
  phoneNumber = "212600000000",
  defaultMessage,
  label,
  className,
}: WhatsAppButtonProps) {
  const { locale, direction } = useTefLookLanguage();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Use selected language once mounted, fallback to French for SSR consistency
  const activeLocale = mounted ? locale : "fr";
  const isAr = activeLocale === "ar";

  // Dynamic button labels according to specification:
  // - French (fr): "Besoin d'aide ?"
  // - Arabic (ar): "حاجة للمساعدة؟"
  // - English / default: "Need help?"
  const resolvedLabel =
    label ||
    (isAr
      ? "حاجة للمساعدة؟"
      : activeLocale === "fr"
      ? "Besoin d'aide ?"
      : "Need help?");

  // Pre-filled WhatsApp message in user's language
  const resolvedMessage =
    defaultMessage ||
    (isAr
      ? "مرحباً تيفلوك، أحتاج إلى مساعدة في اختيار منتج أو بخصوص طلبيتي."
      : "Bonjour TefLook, j'ai besoin d'aide pour choisir un produit (protection enfant, jouets d'éveil, commande).");

  const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(
    resolvedMessage
  )}`;

  return (
    <aside aria-label="Support WhatsApp" className="relative z-40">
      <a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        dir={isAr ? "rtl" : "ltr"}
        className={cn(
          "fixed bottom-6 z-40 flex items-center gap-2.5 px-4.5 py-2.5 sm:px-5.5 sm:py-3 rounded-full bg-[#25D366] hover:bg-[#20ba59] text-[#1E293B] shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 transition-all duration-300 group cursor-pointer border border-[#1ebd5a]/30 select-none",
          // Positioning: in LTR bottom-6 right-6, in RTL bottom-6 left-6 or right-6
          isAr ? "bottom-6 left-6 flex-row-reverse" : "bottom-6 right-6",
          className
        )}
        aria-label={
          isAr
            ? "تواصل مع خدمة عملاء تيفلوك عبر واتساب"
            : "Contacter le service client TefLook sur WhatsApp"
        }
      >
        {/* High-Contrast Bold Text */}
        <span
          className={cn(
            "font-extrabold text-xs sm:text-sm text-[#1E293B] tracking-tight whitespace-nowrap",
            isAr && "font-sans font-bold text-sm tracking-normal"
          )}
        >
          {resolvedLabel}
        </span>

        {/* Clean Chat Bubble Icon with subtle interaction */}
        <MessageCircle className="size-5 text-[#1E293B] stroke-[2.3] transition-transform duration-300 group-hover:rotate-6 shrink-0" />
      </a>
    </aside>
  );
}
