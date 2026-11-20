"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Hammer, User, ZoomIn, CheckCircle2 } from "lucide-react";
import { WORKSHOP_STEPS, WorkshopStep } from "@/data/teflookData";
import { Badge } from "@/components/ui/badge";

export function WorkshopGallerySection() {
  const [activeStep, setActiveStep] = useState<WorkshopStep>(WORKSHOP_STEPS[0]);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  return (
    <section id="atelier" className="py-20 sm:py-28 bg-[#F9F8F6] border-b border-[#E8E5DF]">
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-[#EDF3F1] border border-[#1A3C34]/30 text-xs font-semibold text-[#1A3C34]">
            <Hammer className="w-3.5 h-3.5 text-[#C85A32]" />
            <span>Gestes &amp; Outils d&apos;Élite</span>
          </div>
          <h2 className="font-serif-brand text-3xl sm:text-4xl md:text-5xl font-bold text-[#1E293B] tracking-tight">
            À l&apos;intérieur de l&apos;atelier
          </h2>
          <p className="font-arabic text-lg text-[#C85A32] font-bold">
            من قلب ورشاتنا التقليدية في فاس ومراكش : حيث تصنع الفخامة يدوياً
          </p>
          <p className="text-sm sm:text-base text-[#334155] leading-relaxed">
            Pénétrez dans les coulisses de notre maison. Du premier coup de tranchet jusqu&apos;à l&apos;estampille au fer chaud, découvrez les six étapes maîtresses qui subliment chaque création TefLook.
          </p>
        </div>

        {/* Interactive Step Timeline Bar */}
        <div className="flex items-center justify-between gap-2 overflow-x-auto pb-4 mb-10 scrollbar-none border-b border-[#E8E5DF]">
          {WORKSHOP_STEPS.map((step) => (
            <button
              key={step.step}
              onClick={() => setActiveStep(step)}
              className={`flex items-center gap-2.5 px-4 py-2.5 rounded-2xl whitespace-nowrap text-xs font-semibold transition-all ${
                activeStep.step === step.step
                  ? "bg-[#1A3C34] text-white shadow-md"
                  : "bg-white text-[#334155] border border-[#E8E5DF] hover:bg-[#EDF3F1] hover:text-[#1A3C34]"
              }`}
            >
              <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                activeStep.step === step.step ? "bg-[#C85A32] text-white" : "bg-[#F9F8F6] text-[#1A3C34]"
              }`}>
                {step.step}
              </span>
              <span>{step.title}</span>
            </button>
          ))}
        </div>

        {/* Feature Focus Banner for Active Step */}
        <div className="bg-white rounded-3xl border border-[#E8E5DF] p-6 sm:p-10 shadow-md mb-16 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-7 space-y-4">
            <div className="flex items-center gap-2">
              <Badge variant="orange">Étape {activeStep.step} sur 06</Badge>
              <span className="text-xs text-[#64748B] font-medium flex items-center gap-1">
                <User className="w-3.5 h-3.5 text-[#1A3C34]" />
                {activeStep.artisanRole}
              </span>
            </div>

            <h3 className="font-serif-brand text-2xl sm:text-3xl font-bold text-[#1E293B]">
              {activeStep.title}
            </h3>

            <p className="text-sm sm:text-base text-[#334155] leading-relaxed">
              {activeStep.description}
            </p>

            <div className="pt-2 flex flex-wrap gap-4 text-xs text-[#64748B]">
              <span className="flex items-center gap-1.5 font-medium text-[#1E293B]">
                <CheckCircle2 className="w-4 h-4 text-[#1A3C34]" />
                Outils d&apos;époque restaurés
              </span>
              <span className="flex items-center gap-1.5 font-medium text-[#1E293B]">
                <CheckCircle2 className="w-4 h-4 text-[#C85A32]" />
                Zéro colle chimique nocive
              </span>
              <span className="flex items-center gap-1.5 font-medium text-[#1E293B]">
                <CheckCircle2 className="w-4 h-4 text-[#1A3C34]" />
                Estampille TefLook certifiée
              </span>
            </div>
          </div>

          <div
            className="lg:col-span-5 relative aspect-4/3 w-full rounded-2xl overflow-hidden shadow-lg border border-[#E8E5DF] group cursor-pointer"
            onClick={() => setSelectedImage(activeStep.image)}
          >
            <Image
              src={activeStep.image}
              alt={activeStep.title}
              fill
              sizes="(max-width: 1024px) 100vw, 450px"
              className="object-cover group-hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-[#1E293B]/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white gap-2">
              <ZoomIn className="w-5 h-5 text-[#C85A32]" />
              <span className="text-xs font-semibold">Agrandir la photo</span>
            </div>
          </div>
        </div>

        {/* 6-Photo Masonry Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {WORKSHOP_STEPS.map((step) => (
            <div
              key={step.step}
              onClick={() => setActiveStep(step)}
              className="group relative rounded-3xl overflow-hidden bg-white border border-[#E8E5DF] shadow-xs hover:shadow-xl transition-all duration-300 cursor-pointer"
            >
              <div className="relative aspect-4/3 w-full overflow-hidden bg-[#F9F8F6]">
                <Image
                  src={step.image}
                  alt={step.title}
                  fill
                  sizes="(max-width: 768px) 100vw, 33vw"
                  className="object-cover group-hover:scale-108 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#1E293B]/90 via-[#1E293B]/20 to-transparent opacity-85 group-hover:opacity-95 transition-opacity" />

                {/* Step indicator */}
                <div className="absolute top-4 left-4 bg-white/95 text-[#1E293B] font-bold text-xs px-2.5 py-1 rounded-full border border-[#E8E5DF] shadow-xs flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#C85A32]" />
                  Étape {step.step}
                </div>

                {/* Text inside image */}
                <div className="absolute bottom-4 left-4 right-4 text-white">
                  <h4 className="font-serif-brand font-bold text-lg group-hover:text-[#C85A32] transition-colors leading-tight">
                    {step.title}
                  </h4>
                  <p className="text-[11px] text-[#CBD5E1] mt-1 line-clamp-1">
                    {step.artisanRole}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Lightbox Modal if image clicked */}
        {selectedImage && (
          <div
            className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 cursor-pointer"
            onClick={() => setSelectedImage(null)}
          >
            <div className="relative max-w-4xl w-full max-h-[85vh] aspect-16/10 rounded-2xl overflow-hidden shadow-2xl border-2 border-white/20">
              <Image src={selectedImage} alt="Agrandissement atelier" fill className="object-cover" />
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
