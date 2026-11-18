"use client";

import React from "react";
import Image from "next/image";
import {
  ShieldCheck,
  Sparkles,
  Heart,
  CheckCircle2,
  ArrowRight,
  ShoppingBag,
  Award,
  Users,
  Compass,
} from "lucide-react";
import { useCart } from "@/context/CartContext";
import { PRODUCTS } from "@/data/teflookData";

export function ChildSafetyDevelopmentSection() {
  const { addToCart, setActiveQuickProduct, currency } = useCart();

  const prodSafety = PRODUCTS.find((p) => p.id === "prod-trend-1");
  const prodEveil = PRODUCTS.find((p) => p.id === "prod-trend-2");
  const prodConnexion = PRODUCTS.find((p) => p.id === "prod-trend-3");

  return (
    <div className="space-y-0">
      {/* ============================================================== */}
      {/* 1. PROTECTION ENFANT SECTION (#protection-enfant)             */}
      {/* ============================================================== */}
      <section
        id="protection-enfant"
        className="py-16 sm:py-24 bg-white border-b border-[#E8E5DF] relative overflow-hidden"
      >
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
            
            {/* Left: Image Card */}
            <div className="lg:col-span-6 relative">
              <div className="relative aspect-4/3 sm:aspect-16/10 rounded-3xl overflow-hidden shadow-xl border-4 border-[#FAF9F7]">
                <Image
                  src="https://images.unsplash.com/photo-1584622650111-993a426fbf0a?q=80&w=1200&auto=format&fit=crop"
                  alt="Sécurité et protection enfant à la maison"
                  fill
                  sizes="(max-width: 1024px) 100vw, 600px"
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                <div className="absolute bottom-5 left-5 right-5 text-white">
                  <span className="px-2.5 py-1 rounded-full bg-[#4A9099] text-[10px] font-bold uppercase tracking-wider">
                    Protection Domestique
                  </span>
                  <p className="text-lg font-bold mt-1">Sécurité Préventive &amp; Zéro Risque</p>
                </div>
              </div>
              <div className="absolute -top-4 -left-4 w-20 h-20 bg-[#4A9099]/10 rounded-full blur-xl pointer-events-none" />
            </div>

            {/* Right: Content & Value Propositions */}
            <div className="lg:col-span-6 space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#EBF4F5] text-[#4A9099] text-xs font-extrabold uppercase tracking-wider">
                <ShieldCheck className="w-4 h-4" />
                <span>Protection Enfant</span>
              </div>

              <h2 className="text-3xl sm:text-4xl font-black text-[#1E293B] tracking-tight leading-tight">
                Prévenir les accidents domestiques pour une{" "}
                <span className="text-[#4A9099]">sérénité absolue</span>
              </h2>

              <p className="text-[#64748B] text-sm sm:text-base leading-relaxed">
                Plus de 80% des accidents de la petite enfance surviennent à l&apos;intérieur du domicile. Nos dispositifs de sécurité ont été pensés pour protéger les petites mains curieuses sans dénaturer l&apos;esthétique de votre intérieur.
              </p>

              <div className="space-y-3 pt-2">
                {[
                  "Bloque-portes amortissants brevetés anti-pincement de doigts",
                  "Caches-prises à fermeture rotative automatique 100% sécurisés",
                  "Coins de tables et rebords en silicone ultra-amortissant sans BPA",
                  "Verrous magnétiques invisibles pour tiroirs et placards de cuisine",
                ].map((feat, idx) => (
                  <div key={idx} className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-[#4A9099] shrink-0 mt-0.5" />
                    <span className="text-sm font-medium text-[#334155]">{feat}</span>
                  </div>
                ))}
              </div>

              {prodSafety && (
                <div className="pt-4 flex flex-col sm:flex-row sm:items-center gap-4">
                  <button
                    onClick={() => addToCart(prodSafety)}
                    className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-full bg-[#4A9099] hover:bg-[#3D7A82] text-white font-extrabold text-sm shadow-md transition-all active:scale-95"
                  >
                    <ShoppingBag className="w-4 h-4" />
                    <span>Commander le Kit Sécurité ({currency === "MAD" ? `${prodSafety.priceMad} MAD` : `${prodSafety.priceEur.toFixed(2)} €`})</span>
                  </button>
                  <button
                    onClick={() => setActiveQuickProduct(prodSafety)}
                    className="text-xs font-bold text-[#4A9099] hover:underline"
                  >
                    Voir tous les détails du kit →
                  </button>
                </div>
              )}
            </div>

          </div>
        </div>
      </section>

      {/* ============================================================== */}
      {/* 2. JOUETS D'ÉVEIL SECTION (#jouets-eveil)                     */}
      {/* ============================================================== */}
      <section
        id="jouets-eveil"
        className="py-16 sm:py-24 bg-[#FAF9F7] border-b border-[#E8E5DF] relative overflow-hidden"
      >
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
            
            {/* Left: Content */}
            <div className="lg:col-span-6 space-y-6 order-2 lg:order-1">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FF6B00]/10 text-[#FF6B00] text-xs font-extrabold uppercase tracking-wider">
                <Sparkles className="w-4 h-4" />
                <span>Jouets d&apos;Éveil</span>
              </div>

              <h2 className="text-3xl sm:text-4xl font-black text-[#1E293B] tracking-tight leading-tight">
                Éveiller la curiosité et la motricité avec des{" "}
                <span className="text-[#FF6B00]">matières saines</span>
              </h2>

              <p className="text-[#64748B] text-sm sm:text-base leading-relaxed">
                Inspirée des pédagogies actives Montessori, notre sélection de jouets d&apos;éveil stimule l&apos;intelligence sensorielle, la coordination œil-main et la persévérance à travers le jeu libre et naturel.
              </p>

              <div className="space-y-3 pt-2">
                {[
                  "Bois de hêtre naturel poli à la main, doux et sans échardes",
                  "Peintures écologiques à base d'eau et colorants alimentaires sûrs",
                  "Développement autonome des compétences cognitives et de la motricité",
                  "Conception durable conçue pour traverser les générations de fratrie",
                ].map((feat, idx) => (
                  <div key={idx} className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-[#FF6B00] shrink-0 mt-0.5" />
                    <span className="text-sm font-medium text-[#334155]">{feat}</span>
                  </div>
                ))}
              </div>

              {prodEveil && (
                <div className="pt-4 flex flex-col sm:flex-row sm:items-center gap-4">
                  <button
                    onClick={() => addToCart(prodEveil)}
                    className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-full bg-[#FF6B00] hover:bg-[#E66000] text-white font-extrabold text-sm shadow-md transition-all active:scale-95"
                  >
                    <ShoppingBag className="w-4 h-4" />
                    <span>Commander le Kit d&apos;Éveil ({currency === "MAD" ? `${prodEveil.priceMad} MAD` : `${prodEveil.priceEur.toFixed(2)} €`})</span>
                  </button>
                  <button
                    onClick={() => setActiveQuickProduct(prodEveil)}
                    className="text-xs font-bold text-[#FF6B00] hover:underline"
                  >
                    Voir le contenu sensoriel →
                  </button>
                </div>
              )}
            </div>

            {/* Right: Image Card */}
            <div className="lg:col-span-6 relative order-1 lg:order-2">
              <div className="relative aspect-4/3 sm:aspect-16/10 rounded-3xl overflow-hidden shadow-xl border-4 border-white">
                <Image
                  src="https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?q=80&w=1200&auto=format&fit=crop"
                  alt="Jouets en bois d'éveil sensoriel Montessori pour enfant"
                  fill
                  sizes="(max-width: 1024px) 100vw, 600px"
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                <div className="absolute bottom-5 left-5 right-5 text-white">
                  <span className="px-2.5 py-1 rounded-full bg-[#FF6B00] text-[10px] font-bold uppercase tracking-wider">
                    Méthode Sensorielle
                  </span>
                  <p className="text-lg font-bold mt-1">Apprendre en S&apos;amusant</p>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ============================================================== */}
      {/* 3. CONNEXION PARENTS-ENFANTS SECTION (#connexion-parents-enfants) */}
      {/* ============================================================== */}
      <section
        id="connexion-parents-enfants"
        className="py-16 sm:py-24 bg-white border-b border-[#E8E5DF] relative overflow-hidden"
      >
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
            
            {/* Left: Image Card */}
            <div className="lg:col-span-6 relative">
              <div className="relative aspect-4/3 sm:aspect-16/10 rounded-3xl overflow-hidden shadow-xl border-4 border-[#FAF9F7]">
                <Image
                  src="https://images.unsplash.com/photo-1502086223501-7ea6ecd79368?q=80&w=1200&auto=format&fit=crop"
                  alt="Moment complice parent et enfant"
                  fill
                  sizes="(max-width: 1024px) 100vw, 600px"
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                <div className="absolute bottom-5 left-5 right-5 text-white">
                  <span className="px-2.5 py-1 rounded-full bg-rose-600 text-[10px] font-bold uppercase tracking-wider">
                    Lien Émotionnel
                  </span>
                  <p className="text-lg font-bold mt-1">Moments Précieux Partagés</p>
                </div>
              </div>
            </div>

            {/* Right: Content */}
            <div className="lg:col-span-6 space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-50 text-rose-600 text-xs font-extrabold uppercase tracking-wider">
                <Heart className="w-4 h-4 fill-rose-600" />
                <span>Connexion Parents-Enfants</span>
              </div>

              <h2 className="text-3xl sm:text-4xl font-black text-[#1E293B] tracking-tight leading-tight">
                Tisser des liens profonds et nourrir la{" "}
                <span className="text-[#4A9099]">complicité familiale</span>
              </h2>

              <p className="text-[#64748B] text-sm sm:text-base leading-relaxed">
                Dans le tumulte du quotidien, prendre 15 minutes de qualité pour écouter, rire et échanger avec son enfant transforme durablement son sentiment de sécurité affective et son estime personnelle.
              </p>

              <div className="space-y-3 pt-2">
                {[
                  "Questions bienveillantes pour libérer la parole et les émotions de l'enfant",
                  "Défis rires et rituels doux pour apaiser les tensions avant le coucher",
                  "Guide pour les parents : écoute empathique et communication non-violente",
                  "Convient dès 4 ans pour des souvenirs inoubliables en famille",
                ].map((feat, idx) => (
                  <div key={idx} className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-[#4A9099] shrink-0 mt-0.5" />
                    <span className="text-sm font-medium text-[#334155]">{feat}</span>
                  </div>
                ))}
              </div>

              {prodConnexion && (
                <div className="pt-4 flex flex-col sm:flex-row sm:items-center gap-4">
                  <button
                    onClick={() => addToCart(prodConnexion)}
                    className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-full bg-[#1E293B] hover:bg-[#334155] text-white font-extrabold text-sm shadow-md transition-all active:scale-95"
                  >
                    <ShoppingBag className="w-4 h-4" />
                    <span>Commander le Jeu de Cartes ({currency === "MAD" ? `${prodConnexion.priceMad} MAD` : `${prodConnexion.priceEur.toFixed(2)} €`})</span>
                  </button>
                  <button
                    onClick={() => setActiveQuickProduct(prodConnexion)}
                    className="text-xs font-bold text-[#4A9099] hover:underline"
                  >
                    Découvrir les exemples de questions →
                  </button>
                </div>
              )}
            </div>

          </div>
        </div>
      </section>

      {/* ============================================================== */}
      {/* 4. À PROPOS SECTION (#a-propos)                                */}
      {/* ============================================================== */}
      <section
        id="a-propos"
        className="py-16 sm:py-24 bg-[#FAF9F7] border-b border-[#E8E5DF] relative overflow-hidden"
      >
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center space-y-4 mb-14">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#4A9099]/10 text-[#4A9099] text-xs font-extrabold uppercase tracking-wider">
              <Compass className="w-4 h-4" />
              <span>Notre Mission TefLook</span>
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-[#1E293B] tracking-tight">
              Prendre soin de l&apos;enfant,{" "}
              <span className="text-[#FF6B00]">accompagner les parents</span>
            </h2>
            <p className="text-[#64748B] text-sm sm:text-base leading-relaxed">
              TefLook est née de la conviction que chaque enfant mérite un cadre sécurisant, stimulant et rempli d&apos;amour. En alliant l&apos;exigence artisanale marocaine aux meilleures pratiques pédiatriques, nous concevons des solutions durables pour chaque étape du développement.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
            <div className="bg-white p-7 rounded-3xl border border-[#E8E5DF] shadow-xs space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-[#EBF4F5] text-[#4A9099] flex items-center justify-center">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="font-extrabold text-lg text-[#1E293B]">Exigence &amp; Sécurité</h3>
              <p className="text-xs sm:text-sm text-[#64748B] leading-relaxed">
                Tous nos produits font l&apos;objet de tests stricts de résistance et d&apos;innocuité pour garantir une utilisation sereine au quotidien.
              </p>
            </div>

            <div className="bg-white p-7 rounded-3xl border border-[#E8E5DF] shadow-xs space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-[#FFF2EB] text-[#FF6B00] flex items-center justify-center">
                <Award className="w-6 h-6" />
              </div>
              <h3 className="font-extrabold text-lg text-[#1E293B]">Artisanat &amp; Matières Nobles</h3>
              <p className="text-xs sm:text-sm text-[#64748B] leading-relaxed">
                Nous privilégions le bois certifié, les fibres naturelles et les finitions non toxiques respectueuses de la santé des bébés.
              </p>
            </div>

            <div className="bg-white p-7 rounded-3xl border border-[#E8E5DF] shadow-xs space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-[#EBF4F5] text-[#4A9099] flex items-center justify-center">
                <Users className="w-6 h-6" />
              </div>
              <h3 className="font-extrabold text-lg text-[#1E293B]">Proximité &amp; Écoute</h3>
              <p className="text-xs sm:text-sm text-[#64748B] leading-relaxed">
                Une équipe marocaine à votre écoute pour vous conseiller et vous accompagner dans votre rôle de parent.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
