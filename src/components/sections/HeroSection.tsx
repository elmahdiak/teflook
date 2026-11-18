"use client";

import React, { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import {
  ChevronLeft,
  ChevronRight,
  ArrowRight,
  ShieldCheck,
  HeartHandshake,
  Sparkles,
  Truck,
  CheckCircle2,
} from "lucide-react";

interface SlideItem {
  id: number;
  image: string;
  tag: string;
  alt: string;
}

const HERO_SLIDES: SlideItem[] = [
  {
    id: 1,
    image:
      "https://images.unsplash.com/photo-1609234656388-0ff363383899?q=80&w=2000&auto=format&fit=crop",
    tag: "Sécurité & Sérénité",
    alt: "Parents et enfant riant ensemble dans un salon chaleureux",
  },
  {
    id: 2,
    image:
      "https://images.unsplash.com/photo-1544717305-2782549b5136?q=80&w=2000&auto=format&fit=crop",
    tag: "Éveil Sensoriel & Motricité",
    alt: "Mère câlinant tendrement son enfant avec complicité",
  },
  {
    id: 3,
    image:
      "https://images.unsplash.com/photo-1511895426328-dc8714191300?q=80&w=2000&auto=format&fit=crop",
    tag: "Complicité Parent-Enfant",
    alt: "Famille partageant un moment de jeu et d'apprentissage",
  },
];

export function HeroSection() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const nextSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev + 1) % HERO_SLIDES.length);
  }, []);

  const prevSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev - 1 + HERO_SLIDES.length) % HERO_SLIDES.length);
  }, []);

  // Auto-play slider every 5 seconds (pauses when user hovers over carousel)
  useEffect(() => {
    if (isPaused) return;
    const timer = setInterval(() => {
      nextSlide();
    }, 5000);
    return () => clearInterval(timer);
  }, [isPaused, nextSlide]);

  return (
    <section
      id="hero"
      className="relative w-full overflow-hidden bg-gradient-to-b from-[#F9F8F6] via-[#FAF9F7] to-[#F1EFEA] border-b border-[#E8E5DF]"
    >
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          
          {/* ============================================================ */}
          {/* LEFT COLUMN: HERO CONTENT (FRENCH HEADLINE, SUBTEXT & CTA)    */}
          {/* ============================================================ */}
          <div className="lg:col-span-6 flex flex-col justify-center space-y-6 sm:space-y-7 z-10">
            
            {/* Pill Tag */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#EBF4F5] border border-[#4A9099]/30 text-[#4A9099] w-fit shadow-2xs">
              <Sparkles className="w-4 h-4 text-[#FF6B00] animate-pulse" />
              <span className="text-xs font-extrabold uppercase tracking-wider">
                Bien-Être &amp; Éveil Familial
              </span>
            </div>

            {/* Main Headline with Highlighted Brand Colors */}
            <h1 className="font-sans text-3xl sm:text-4xl md:text-5xl lg:text-[46px] xl:text-[52px] font-black tracking-tight text-[#1E293B] leading-[1.15]">
              Favoriser le{" "}
              <span className="text-[#4A9099] relative inline-block">
                développement
                <svg
                  className="absolute left-0 -bottom-1.5 w-full h-2 text-[#4A9099]/20"
                  viewBox="0 0 100 12"
                  preserveAspectRatio="none"
                >
                  <path d="M0,0 Q50,12 100,0" stroke="currentColor" strokeWidth="4" fill="none" />
                </svg>
              </span>{" "}
              &amp; la{" "}
              <span className="text-[#FF6B00] relative inline-block">
                connexion
                <svg
                  className="absolute left-0 -bottom-1.5 w-full h-2 text-[#FF6B00]/25"
                  viewBox="0 0 100 12"
                  preserveAspectRatio="none"
                >
                  <path d="M0,0 Q50,12 100,0" stroke="currentColor" strokeWidth="4" fill="none" />
                </svg>
              </span>{" "}
              de l&apos;enfant
            </h1>

            {/* Subtext */}
            <p className="text-base sm:text-lg text-[#475569] leading-relaxed max-w-xl font-normal">
              Soutenir la protection de l&apos;enfance, la croissance développementale et le lien précieux entre parent et enfant.
            </p>

            {/* Action Buttons & Quick CTAs */}
            <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
              <a
                href="#produits-tendances"
                className="inline-flex items-center justify-center gap-3 px-8 py-4 rounded-full bg-[#FF6B00] hover:bg-[#E66000] text-white font-extrabold text-base shadow-lg shadow-[#FF6B00]/25 hover:shadow-xl hover:shadow-[#FF6B00]/35 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 group"
              >
                <span>Découvrir notre collection</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </a>

              <a
                href="#protection-enfant"
                className="inline-flex items-center justify-center gap-2 px-6 py-4 rounded-full bg-white hover:bg-[#EBF4F5]/60 text-[#1E293B] hover:text-[#4A9099] font-bold text-sm border border-[#E8E5DF] hover:border-[#4A9099] shadow-2xs transition-all"
              >
                <ShieldCheck className="w-4 h-4 text-[#4A9099]" />
                <span>Kits de Sécurité</span>
              </a>
            </div>

            {/* Reassurance Badges */}
            <div className="pt-4 border-t border-[#E8E5DF]/80 grid grid-cols-3 gap-3 text-xs text-[#64748B]">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#4A9099] shrink-0" />
                <span className="font-medium">Normes CE &amp; Sécurité</span>
              </div>
              <div className="flex items-center gap-2">
                <Truck className="w-4 h-4 text-[#4A9099] shrink-0" />
                <span className="font-medium">Livraison 24/48h</span>
              </div>
              <div className="flex items-center gap-2">
                <HeartHandshake className="w-4 h-4 text-[#FF6B00] shrink-0" />
                <span className="font-medium">Paiement à la livraison</span>
              </div>
            </div>
          </div>

          {/* ============================================================ */}
          {/* RIGHT COLUMN: INTERACTIVE LIFESTYLE IMAGE SLIDER             */}
          {/* ============================================================ */}
          <div
            className="lg:col-span-6 relative"
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
          >
            {/* Slider Card Container */}
            <div className="relative h-[380px] sm:h-[460px] md:h-[500px] lg:h-[520px] w-full rounded-3xl overflow-hidden shadow-2xl border-4 border-white bg-slate-100 select-none group">
              
              {/* Slides */}
              {HERO_SLIDES.map((slide, index) => (
                <div
                  key={slide.id}
                  className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
                    index === currentSlide ? "opacity-100 z-10" : "opacity-0 z-0 pointer-events-none"
                  }`}
                >
                  <Image
                    src={slide.image}
                    alt={slide.alt}
                    fill
                    priority={index === 0}
                    sizes="(max-width: 1024px) 100vw, 50vw"
                    className="object-cover object-center transition-transform duration-1000 ease-out group-hover:scale-105"
                  />

                  {/* Gentle Cinematic Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/10" />

                  {/* Floating Slide Tag */}
                  <div className="absolute top-5 left-5 z-20">
                    <span className="px-3 py-1.5 rounded-full bg-white/90 backdrop-blur-md text-[#1E293B] font-extrabold text-xs shadow-md border border-white/50">
                      {slide.tag}
                    </span>
                  </div>

                  {/* Bottom Caption Pill */}
                  <div className="absolute bottom-5 left-5 right-5 z-20 flex items-center justify-between text-white">
                    <p className="text-xs sm:text-sm font-semibold drop-shadow-md line-clamp-1 max-w-[75%]">
                      {slide.alt}
                    </p>
                    <span className="text-[11px] font-mono font-bold bg-black/40 backdrop-blur-sm px-2.5 py-1 rounded-full border border-white/20">
                      0{index + 1} / 0{HERO_SLIDES.length}
                    </span>
                  </div>
                </div>
              ))}

              {/* Prev / Next Navigation Arrows */}
              <button
                onClick={prevSlide}
                className="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-white/85 hover:bg-white text-[#1E293B] flex items-center justify-center shadow-lg transition-all hover:scale-110 active:scale-95"
                aria-label="Image précédente"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>

              <button
                onClick={nextSlide}
                className="absolute right-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-white/85 hover:bg-white text-[#1E293B] flex items-center justify-center shadow-lg transition-all hover:scale-110 active:scale-95"
                aria-label="Image suivante"
              >
                <ChevronRight className="w-5 h-5" />
              </button>

              {/* Slider Dots Indicator */}
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2">
                {HERO_SLIDES.map((_, dotIdx) => (
                  <button
                    key={dotIdx}
                    onClick={() => setCurrentSlide(dotIdx)}
                    className={`transition-all duration-300 rounded-full h-2 ${
                      dotIdx === currentSlide
                        ? "w-7 bg-[#FF6B00]"
                        : "w-2 bg-white/70 hover:bg-white"
                    }`}
                    aria-label={`Aller au slide ${dotIdx + 1}`}
                  />
                ))}
              </div>
            </div>

            {/* Decorative Subtle Background Glow */}
            <div className="absolute -bottom-6 -right-6 -z-10 w-72 h-72 bg-[#4A9099]/15 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -top-6 -left-6 -z-10 w-72 h-72 bg-[#FF6B00]/15 rounded-full blur-3xl pointer-events-none" />
          </div>

        </div>
      </div>
    </section>
  );
}
