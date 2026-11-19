"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Star, Heart, Quote } from "lucide-react";
import { REVIEWS } from "@/data/teflookData";

export function ReviewsSection() {
  const [filterCity, setFilterCity] = useState<string>("all");

  const filteredReviews =
    filterCity === "all"
      ? REVIEWS
      : REVIEWS.filter((r) => r.city.toLowerCase().includes(filterCity.toLowerCase()));

  return (
    <section id="temoignages" className="py-20 sm:py-28 bg-[#F9F8F6] border-b border-[#E8E5DF]">
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-14 space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-[#FFF2EB] border border-[#FF6B00]/30 text-xs font-semibold text-[#FF6B00]">
            <Heart className="w-3.5 h-3.5 text-[#FF6B00] fill-[#FF6B00]" />
            <span>La Confiance de Nos Passionnés</span>
          </div>
          <h2 className="font-serif-brand text-3xl sm:text-4xl md:text-5xl font-bold text-[#1E293B] tracking-tight">
            Nos clients témoignent
          </h2>
          <p className="font-arabic text-lg text-[#FF6B00] font-bold">
            شهادات عملائنا الكرام في المغرب وعبر العالم
          </p>

          {/* Aggregate Rating Banner */}
          <div className="pt-2 flex items-center justify-center gap-3">
            <div className="flex text-[#FF6B00]">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-5 h-5 fill-[#FF6B00]" />
              ))}
            </div>
            <span className="font-bold text-2xl text-[#1E293B]">4.9 / 5</span>
            <span className="text-xs text-[#64748B]">
              (Basé sur plus de 1 200 commandes vérifiées)
            </span>
          </div>
        </div>

        {/* Filter by City / Origin */}
        <div className="flex items-center justify-center gap-2 mb-10 flex-wrap text-xs">
          <span className="text-[#64748B] font-medium mr-2">Filtrer par ville :</span>
          {["all", "Casablanca", "Rabat", "Fès", "Marrakech"].map(
            (c) => (
              <button
                key={c}
                onClick={() => setFilterCity(c)}
                className={`px-3.5 py-1.5 rounded-xl font-medium transition-all ${
                  filterCity === c
                    ? "bg-[#4A9099] text-white font-semibold shadow-xs"
                    : "bg-white text-[#334155] border border-[#E8E5DF] hover:bg-[#EBF4F5] hover:text-[#4A9099]"
                }`}
              >
                {c === "all" ? "Tous les avis" : c}
              </button>
            )
          )}
        </div>

        {/* Reviews Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {filteredReviews.map((rev) => (
            <div
              key={rev.id}
              className="rounded-3xl bg-white border border-[#E8E5DF] p-6 sm:p-7 shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col justify-between relative group"
            >
              {/* Subtle top quote emblem */}
              <Quote className="w-8 h-8 text-[#F9F8F6] absolute top-6 right-6 group-hover:text-[#EBF4F5] transition-colors" />

              <div className="space-y-4">
                {/* Product preview pill */}
                <div className="flex items-center gap-3 pb-3 border-b border-[#F1F5F9]">
                  <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-[#F9F8F6] shrink-0 border border-[#E8E5DF]">
                    <Image
                      src={rev.productImage}
                      alt={rev.productName}
                      fill
                      sizes="48px"
                      className="object-cover"
                    />
                  </div>
                  <div>
                    <span className="text-[10px] text-[#64748B] uppercase tracking-wider block">
                      Article commandé
                    </span>
                    <h5 className="font-serif-brand font-semibold text-xs text-[#1E293B] line-clamp-1">
                      {rev.productName}
                    </h5>
                  </div>
                </div>

                {/* Stars */}
                <div className="flex items-center gap-1.5">
                  <div className="flex text-[#FF6B00]">
                    {[...Array(rev.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-[#FF6B00]" />
                    ))}
                  </div>
                  <span className="text-[11px] font-semibold text-[#4A9099] bg-[#EBF4F5] px-2 py-0.5 rounded-full border border-[#4A9099]/30">
                    Achat Vérifié
                  </span>
                </div>

                {/* Comment */}
                <p className="text-sm text-[#334155] leading-relaxed italic">
                  &quot;{rev.comment}&quot;
                </p>
              </div>

              {/* Author & City */}
              <div className="pt-5 mt-4 border-t border-[#F1F5F9] flex items-center justify-between">
                <div>
                  <h6 className="font-serif-brand font-bold text-sm text-[#1E293B]">
                    {rev.authorName}
                  </h6>
                  <p className="text-xs text-[#4A9099] font-medium">{rev.city}</p>
                </div>
                <span className="text-[11px] text-[#94A3B8]">{rev.date}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Social Proof Badges Strip */}
        <div className="mt-16 p-6 sm:p-8 rounded-3xl bg-white border border-[#E8E5DF] shadow-xs grid grid-cols-2 lg:grid-cols-4 gap-6 text-center">
          <div>
            <p className="font-serif-brand text-3xl sm:text-4xl font-bold text-[#4A9099]">99.4%</p>
            <p className="text-xs text-[#64748B] mt-1">Satisfaction client certifiée</p>
          </div>
          <div>
            <p className="font-serif-brand text-3xl sm:text-4xl font-bold text-[#FF6B00]">24/48h</p>
            <p className="text-xs text-[#64748B] mt-1">Délai moyen de livraison au Maroc</p>
          </div>
          <div>
            <p className="font-serif-brand text-3xl sm:text-4xl font-bold text-[#4A9099]">14 Jours</p>
            <p className="text-xs text-[#64748B] mt-1">Échange de pointure sans frais</p>
          </div>
          <div>
            <p className="font-serif-brand text-3xl sm:text-4xl font-bold text-[#FF6B00]">100%</p>
            <p className="text-xs text-[#64748B] mt-1">Cuir naturel tanné végétal</p>
          </div>
        </div>
      </div>
    </section>
  );
}
