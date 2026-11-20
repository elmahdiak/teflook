"use client";

import React from "react";
import Image from "next/image";
import { Sparkles, ShieldCheck, HeartHandshake, Droplets, Feather } from "lucide-react";

export function EditorialStorySection() {
  const pillars = [
    {
      icon: Droplets,
      title: "Tannage 100% Végétal & Écologique",
      description:
        "Aucun sel de chrome ni dérivé pétrochimique. Nos cuirs sont trempés dans des décoctions d'écorces de grenade, de henné et de mimosa des montagnes de l'Atlas.",
    },
    {
      icon: Feather,
      title: "Souplesse Immédiate & Confort Absolu",
      description:
        "Nourri aux huiles végétales et à l'huile d'argan pure, le cuir TefLook s'assouplit dès les premières heures pour épouser parfaitement la morphologie du pied.",
    },
    {
      icon: HeartHandshake,
      title: "Maîtrise Transmise de Père en Fils",
      description:
        "Chaque geste de découpe, de couture sellier et de mise en forme honore plus de huit siècles d'artisanat marocain d'élite hérité des médinas de Fès.",
    },
    {
      icon: ShieldCheck,
      title: "Une Patine Vivante Qui s'Embellit",
      description:
        "Contrairement aux cuirs industriels plastifiés, notre cuir pleine fleur vit, respire et développe avec le temps une patine noble et unique.",
    },
  ];

  return (
    <section id="sandales" className="py-20 lg:py-28 bg-[#F2EFE9] border-b border-[#E8E5DF] relative overflow-hidden">
      {/* Decorative background circle */}
      <div className="absolute top-1/2 -right-32 w-96 h-96 rounded-full bg-[#4C9A9C]/10 blur-[130px] pointer-events-none" />

      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          {/* Visual Presentation Collage */}
          <div className="lg:col-span-5 relative order-2 lg:order-1">
            <div className="relative aspect-4/5 w-full rounded-3xl overflow-hidden shadow-2xl border-4 border-white">
              <Image
                src="https://images.unsplash.com/photo-1539020140153-e479b8c22e70?q=80&w=1200&auto=format&fit=crop"
                alt="Les cuves séculaires de tannage végétal de Fès au Maroc"
                fill
                sizes="(max-width: 1024px) 100vw, 500px"
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#1E293B]/85 via-transparent to-transparent" />
              <div className="absolute bottom-6 left-6 right-6 text-white">
                <span className="text-[11px] uppercase tracking-widest text-[#FE7C58] font-bold">
                  Patrimoine Mondial UNESCO
                </span>
                <h4 className="font-serif-brand text-2xl font-bold">
                  Les Tanneries Chouara de Fès
                </h4>
                <p className="text-xs text-[#CBD5E1] mt-1">
                  Pratique artisanale ininterrompue depuis le XIe siècle
                </p>
              </div>
            </div>

            {/* Overlapping Detail Card */}
            <div className="hidden sm:block absolute -bottom-8 -right-6 p-4 rounded-2xl bg-white shadow-xl border border-[#E8E5DF] max-w-xs">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-[#EBF5F5] border border-[#4C9A9C]/20 flex items-center justify-center text-[#4C9A9C]">
                  <Sparkles className="w-6 h-6 text-[#FE7C58]" />
                </div>
                <div>
                  <h5 className="font-serif-brand font-bold text-sm text-[#1E293B]">
                    Secret d&apos;Atelier TefLook
                  </h5>
                  <p className="text-[11px] text-[#64748B]">
                    Patiné à la cire d&apos;abeille et aux extraits d&apos;argan
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Editorial Text Content */}
          <div className="lg:col-span-7 space-y-6 order-1 lg:order-2">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-[#4C9A9C]/30 text-xs font-semibold text-[#4C9A9C]">
                <Sparkles className="w-3.5 h-3.5 text-[#FE7C58]" />
                <span>Savoir-Faire &amp; Tradition Ancestrale</span>
              </div>
              <h2 className="font-serif-brand text-3xl sm:text-4xl md:text-5xl font-bold text-[#1E293B] tracking-tight leading-tight">
                L&apos;art du bronzage et la noblesse du cuir marocain
              </h2>
              <p className="font-arabic text-xl text-[#FE7C58] font-bold">
                فن الدباغة الأصيلة وسر النعومة الخالدة لجلد فاس ومراكش
              </p>
            </div>

            <div className="prose text-[#334155] text-sm sm:text-base leading-relaxed space-y-4 font-normal">
              <p>
                Au cœur des ruelles millénaires de la médina de Fès, les maîtres tanneurs de TefLook perpétuent un rituel que le temps n&apos;a jamais altéré. Les peaux de chèvre et d&apos;agneau sont travaillées à la main dans les cuves polygonales en pierre calcaire, sous la lumière dorée du ciel marocain.
              </p>
              <p>
                Pour donner au cuir <strong className="text-[#4C9A9C]">Tef</strong><strong className="text-[#FE7C58]">Look</strong> sa souplesse exceptionnelle et son toucher soyeux, nous n&apos;utilisons que des pigments végétaux naturels : le <strong>safran de Taliouine</strong> pour les reflets dorés, l&apos;<strong>écorce de grenade séchée</strong> pour les mordorés profonds, et l&apos;<strong>huile d&apos;argan bio</strong> d&apos;Essaouira pour nourrir le grain.
              </p>
            </div>

            {/* 4 Pillars Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
              {pillars.map((pillar, i) => {
                const Icon = pillar.icon;
                return (
                  <div
                    key={i}
                    className="p-4 rounded-2xl bg-white border border-[#E8E5DF] shadow-xs space-y-2"
                  >
                    <div className="w-8 h-8 rounded-lg bg-[#EBF5F5] flex items-center justify-center text-[#4C9A9C]">
                      <Icon className="w-4 h-4 text-[#FE7C58]" />
                    </div>
                    <h4 className="font-serif-brand font-bold text-sm text-[#1E293B]">
                      {pillar.title}
                    </h4>
                    <p className="text-xs text-[#64748B] leading-relaxed">
                      {pillar.description}
                    </p>
                  </div>
                );
              })}
            </div>

            {/* Quote Block */}
            <blockquote className="p-4 rounded-2xl bg-white border-l-4 border-[#FE7C58] italic text-xs sm:text-sm text-[#334155]">
              &quot;Une belle babouche ou une sandale en cuir véritable ne s&apos;achète pas pour une saison : elle s&apos;apprivoise, elle respire avec vous et se transmet comme un hommage aux artisans qui l&apos;ont fait naître.&quot;
              <footer className="text-[11px] font-semibold text-[#4C9A9C] mt-1 not-italic">
                — Maâlem Abdellatif, Maître Bottier TefLook
              </footer>
            </blockquote>
          </div>
        </div>
      </div>
    </section>
  );
}
