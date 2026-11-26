"use client";

import React, { useState } from "react";
import { Star, Heart, Quote, BadgeCheck } from "lucide-react";
import { REVIEWS } from "@/data/teflookData";

export function ReviewsSection() {
  const [filterCity, setFilterCity] = useState<string>("all");

  const filteredReviews =
    filterCity === "all"
      ? REVIEWS
      : REVIEWS.filter((r) => r.city.toLowerCase().includes(filterCity.toLowerCase()));

  return (
    <section id="temoignages" className="py-20 sm:py-28 bg-[#FBF9F5] border-b border-[#E8E5DF]">
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-14 space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-[#FDF2EE] border border-[#FE7C58]/30 text-xs font-semibold text-[#FE7C58]">
            <Heart className="w-3.5 h-3.5 text-[#FE7C58] fill-[#FE7C58]" />
            <span>La Confiance de Nos Passionnés</span>
          </div>
          <h2 className="font-serif-brand text-3xl sm:text-4xl md:text-5xl font-bold text-[#1E293B] tracking-tight">
            Nos clients témoignent
          </h2>
          <p className="font-arabic text-lg text-[#FE7C58] font-bold">
            شهادات عملائنا الكرام في المغرب وعبر العالم
          </p>

          {/* Aggregate Rating Banner */}
          <div className="pt-2 flex items-center justify-center gap-3">
            <div className="flex text-[#FEC748]">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-5 h-5 fill-[#FEC748]" />
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
                    ? "bg-[#4C9A9C] text-white font-semibold shadow-xs"
                    : "bg-white text-[#334155] border border-[#E8E5DF] hover:bg-[#EBF5F5] hover:text-[#4C9A9C]"
                }`}
              >
                {c === "all" ? "Tous les avis" : c}
              </button>
            )
          )}
        </div>

        {/* Reviews Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-8 pt-4">
          {filteredReviews.map((rev) => (
            <article
              key={rev.id}
              className="relative bg-slate-50/80 border border-slate-100 rounded-2xl p-6 sm:p-8 shadow-[0_4px_20px_-4px_rgba(26,60,52,0.06)] flex flex-col items-center text-center"
            >
              {/* Floating Teal Circular Quote Badge */}
              <span
                aria-hidden="true"
                className="absolute -top-3 -right-3 sm:-top-3.5 sm:-right-3.5 w-10 h-10 rounded-full bg-[#4b9797] text-white flex items-center justify-center shadow-md"
              >
                <Quote className="w-4 h-4 fill-current" />
              </span>

              {/* Centered Star Rating Row */}
              <div
                className="text-[#ffbf00] flex items-center justify-center gap-1 mb-3"
                aria-label={`${rev.rating} / 5`}
              >
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    size={16}
                    className={
                      i < rev.rating
                        ? "fill-[#ffbf00] text-[#ffbf00]"
                        : "fill-slate-200/70 text-slate-200"
                    }
                  />
                ))}
              </div>

              {/* Centered Reviewer Name */}
              <h3 className="font-display font-bold text-lg sm:text-xl text-[#1A3C34] mb-3">
                {rev.authorName}
              </h3>

              {/* Centered Comment */}
              <p className="font-sans text-sm sm:text-base text-[#3D524D] leading-relaxed mb-6 max-w-xl">
                {rev.comment}
              </p>

              {/* Divider Line */}
              <div className="w-full border-t border-slate-200/80 mb-4 mt-auto" />

              {/* Bottom Product Reference / City */}
              <div className="font-sans text-xs sm:text-sm text-slate-500 font-medium flex items-center justify-center gap-1.5 flex-wrap">
                {rev.verified && (
                  <BadgeCheck className="w-4 h-4 text-[#4b9797] shrink-0" aria-hidden="true" />
                )}
                <span>
                  {rev.productName} • {rev.city}
                </span>
              </div>
            </article>
          ))}
        </div>

        {/* Social Proof Badges Strip */}
        <div className="mt-16 p-6 sm:p-8 rounded-3xl bg-white border border-[#E8E5DF] shadow-xs grid grid-cols-2 lg:grid-cols-4 gap-6 text-center">
          <div>
            <p className="font-serif-brand text-3xl sm:text-4xl font-bold text-[#4C9A9C]">99.4%</p>
            <p className="text-xs text-[#64748B] mt-1">Satisfaction client certifiée</p>
          </div>
          <div>
            <p className="font-serif-brand text-3xl sm:text-4xl font-bold text-[#FE7C58]">24/48h</p>
            <p className="text-xs text-[#64748B] mt-1">Délai moyen de livraison au Maroc</p>
          </div>
          <div>
            <p className="font-serif-brand text-3xl sm:text-4xl font-bold text-[#4C9A9C]">14 Jours</p>
            <p className="text-xs text-[#64748B] mt-1">Échange de pointure sans frais</p>
          </div>
          <div>
            <p className="font-serif-brand text-3xl sm:text-4xl font-bold text-[#FE7C58]">100%</p>
            <p className="text-xs text-[#64748B] mt-1">Cuir naturel tanné végétal</p>
          </div>
        </div>
      </div>
    </section>
  );
}
