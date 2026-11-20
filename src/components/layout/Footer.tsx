"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowUp,
  MessageCircle,
  ShieldCheck,
  Truck,
  CreditCard,
  RotateCcw,
  CheckCircle,
  Lock,
  PhoneCall,
  Mail,
  MapPin,
} from "lucide-react";
import { BrandLogo } from "@/components/ui/BrandLogo";

export function Footer() {
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 300) {
        setShowScrollTop(true);
      } else {
        setShowScrollTop(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const whatsappUrl =
    "https://wa.me/212600000000?text=" +
    encodeURIComponent(
      "Bonjour TefLook, j'ai une question concernant un produit ou une commande sur la boutique en ligne."
    );

  return (
    <footer className="bg-white border-t border-[#E8E5DF] text-[#1E293B] relative select-none">
      
      {/* ============================================================== */}
      {/* 1. REASSURANCE TRUST BANNER (Top of Footer)                    */}
      {/* ============================================================== */}
      <div className="border-b border-[#E8E5DF] bg-[#FAF9F7] py-8 sm:py-10">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8">
            
            {/* Reassurance 1 */}
            <div className="flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-2xl bg-[#EBF5F5] text-[#4C9A9C] flex items-center justify-center shrink-0">
                <Truck className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-extrabold text-xs sm:text-sm text-[#1E293B]">
                  Livraison 24/48h au Maroc
                </h4>
                <p className="text-[11px] text-[#64748B] mt-0.5">
                  Expédition rapide à domicile dans toutes les villes
                </p>
              </div>
            </div>

            {/* Reassurance 2 */}
            <div className="flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-2xl bg-[#FDF2EE] text-[#FE7C58] flex items-center justify-center shrink-0">
                <CreditCard className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-extrabold text-xs sm:text-sm text-[#1E293B]">
                  Paiement à la Livraison
                </h4>
                <p className="text-[11px] text-[#64748B] mt-0.5">
                  Réglez en espèces à réception ou par carte bancaire
                </p>
              </div>
            </div>

            {/* Reassurance 3 */}
            <div className="flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-2xl bg-[#EBF5F5] text-[#4C9A9C] flex items-center justify-center shrink-0">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-extrabold text-xs sm:text-sm text-[#1E293B]">
                  100% Produits Certifiés
                </h4>
                <p className="text-[11px] text-[#64748B] mt-0.5">
                  Normes de sécurité européennes CE &amp; Oeko-Tex
                </p>
              </div>
            </div>

            {/* Reassurance 4 */}
            <div className="flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-2xl bg-[#FDF2EE] text-[#FE7C58] flex items-center justify-center shrink-0">
                <RotateCcw className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-extrabold text-xs sm:text-sm text-[#1E293B]">
                  Retours Faciles sous 14j
                </h4>
                <p className="text-[11px] text-[#64748B] mt-0.5">
                  Échange ou remboursement simple sans tracas
                </p>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* ============================================================== */}
      {/* 2. MAIN 4-COLUMN FOOTER LAYOUT                                */}
      {/* ============================================================== */}
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-14 sm:pt-16 pb-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-10 lg:gap-8 pb-12 border-b border-[#E8E5DF]">
          
          {/* Column 1: Brand Info & Contact */}
          <div className="lg:col-span-4 space-y-4">
            <BrandLogo size="md" />
            <p className="text-xs sm:text-sm text-[#64748B] max-w-sm leading-relaxed">
              TefLook est votre destination de référence pour l&apos;éveil sensoriel, la sécurité domestique et le bien-être de votre enfant au Maroc.
            </p>

            <div className="space-y-2 pt-1 text-xs text-[#64748B]">
              <div className="flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5 text-[#4C9A9C] shrink-0" />
                <span>Casablanca &amp; Fès, Royaume du Maroc</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-[#4C9A9C] shrink-0" />
                <span>contact@teflook.com</span>
              </div>
              <div className="flex items-center gap-2">
                <PhoneCall className="w-3.5 h-3.5 text-[#4C9A9C] shrink-0" />
                <span>Support téléphonique : +212 5 22 00 00 00</span>
              </div>
            </div>

            <div className="pt-2">
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-xs font-bold text-emerald-700 hover:text-emerald-800 transition-colors bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-200"
              >
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping inline-block" />
                <span>Conseils WhatsApp 7j/7 : +212 6 00 00 00 00</span>
              </a>
            </div>
          </div>

          {/* Column 2: Les 6 Piliers Éducatifs */}
          <div className="lg:col-span-3 lg:pl-4 space-y-3.5">
            <h4 className="text-xs font-black uppercase tracking-[0.15em] text-[#1E293B]">
              Piliers Éducatifs
            </h4>
            <ul className="space-y-2.5 text-xs sm:text-sm font-medium text-[#64748B]">
              <li>
                <a href="#discipline-maitrise-de-soi" className="hover:text-[#4C9A9C] transition-colors inline-block">
                  Discipline et maîtrise de soi
                </a>
              </li>
              <li>
                <a href="#intelligence-emotionnelle" className="hover:text-[#FE7C58] transition-colors inline-block">
                  Intelligence émotionnelle
                </a>
              </li>
              <li>
                <a href="#autonomie-competences-de-vie" className="hover:text-[#4C9A9C] transition-colors inline-block">
                  Autonomie et compétences de vie
                </a>
              </li>
              <li>
                <a href="#confiance-en-soi-competences-sociales" className="hover:text-[#FE7C58] transition-colors inline-block">
                  Confiance en soi &amp; social
                </a>
              </li>
              <li>
                <a href="#creativite-imagination" className="hover:text-[#4C9A9C] transition-colors inline-block">
                  Créativité et imagination
                </a>
              </li>
              <li>
                <a href="#esprit-critique-resolution-problemes" className="hover:text-[#FE7C58] transition-colors inline-block">
                  Esprit critique &amp; résolution
                </a>
              </li>
            </ul>
          </div>

          {/* Column 3: Service Client & Aide */}
          <div className="lg:col-span-2 space-y-3.5">
            <h4 className="text-xs font-black uppercase tracking-[0.15em] text-[#1E293B]">
              Service Client
            </h4>
            <ul className="space-y-2.5 text-xs sm:text-sm font-medium text-[#64748B]">
              <li>
                <a href="#suivi-commande" className="hover:text-[#4C9A9C] transition-colors inline-block">
                  Suivi de Commande
                </a>
              </li>
              <li>
                <a href="#livraison" className="hover:text-[#4C9A9C] transition-colors inline-block">
                  Délais &amp; Tarifs de Livraison
                </a>
              </li>
              <li>
                <a href="#paiement" className="hover:text-[#4C9A9C] transition-colors inline-block">
                  Paiement à la Livraison
                </a>
              </li>
              <li>
                <a href="#retours" className="hover:text-[#4C9A9C] transition-colors inline-block">
                  Retours &amp; Remboursements
                </a>
              </li>
              <li>
                <a href="#guide-tailles" className="hover:text-[#4C9A9C] transition-colors inline-block">
                  Guide des Tailles
                </a>
              </li>
              <li>
                <a href="#faq" className="hover:text-[#4C9A9C] transition-colors inline-block">
                  Foire Aux Questions (FAQ)
                </a>
              </li>
            </ul>
          </div>

          {/* Column 4: TefLook & Engagements */}
          <div className="lg:col-span-3 space-y-3.5">
            <h4 className="text-xs font-black uppercase tracking-[0.15em] text-[#1E293B]">
              Engagements &amp; Légal
            </h4>
            <ul className="space-y-2.5 text-xs sm:text-sm font-medium text-[#64748B]">
              <li>
                <a href="#notre-histoire" className="hover:text-[#1E293B] transition-colors inline-block">
                  Notre Histoire &amp; Mission
                </a>
              </li>
              <li>
                <a href="#charte-qualite" className="hover:text-[#1E293B] transition-colors inline-block">
                  Charte Qualité &amp; Sécurité Enfant
                </a>
              </li>
              <li>
                <a href="#confidentialite" className="hover:text-[#1E293B] transition-colors inline-block">
                  Politique de Confidentialité
                </a>
              </li>
              <li>
                <a href="#cgv" className="hover:text-[#1E293B] transition-colors inline-block">
                  Conditions Générales de Vente
                </a>
              </li>
              <li>
                <a href="#mentions-legales" className="hover:text-[#1E293B] transition-colors inline-block">
                  Mentions Légales
                </a>
              </li>
            </ul>

            {/* Mobile App Badges */}
            <div className="pt-3">
              <span className="text-[11px] font-bold text-[#94A3B8] block mb-2">
                Application Mobile
              </span>
              <div className="flex gap-2">
                <div className="px-3 py-1.5 rounded-xl bg-[#FAF9F7] border border-[#E8E5DF] text-[11px] font-bold text-[#1E293B]">
                  App Store
                </div>
                <div className="px-3 py-1.5 rounded-xl bg-[#FAF9F7] border border-[#E8E5DF] text-[11px] font-bold text-[#1E293B]">
                  Google Play
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* ============================================================== */}
        {/* 3. PAYMENT METHODS & SECURITY BADGES ROW                       */}
        {/* ============================================================== */}
        <div className="py-6 flex flex-col md:flex-row items-center justify-between gap-4 border-b border-[#E8E5DF] text-xs">
          <div className="flex items-center gap-2 text-[#64748B]">
            <Lock className="w-4 h-4 text-emerald-600" />
            <span className="font-semibold">Moyens de paiement 100% sécurisés :</span>
          </div>

          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            {/* Cash on Delivery (COD) Badge */}
            <span className="px-3 py-1 rounded-lg bg-[#FAF9F7] border border-[#E8E5DF] font-bold text-[#1E293B] text-[11px]">
              💵 Paiement Cash à la Livraison
            </span>
            {/* CMI Maroc */}
            <span className="px-3 py-1 rounded-lg bg-[#FAF9F7] border border-[#E8E5DF] font-black text-[#006699] text-[11px]">
              CMI
            </span>
            {/* Visa */}
            <span className="px-3 py-1 rounded-lg bg-[#FAF9F7] border border-[#E8E5DF] font-black text-[#1A1F71] text-[11px]">
              VISA
            </span>
            {/* Mastercard */}
            <span className="px-3 py-1 rounded-lg bg-[#FAF9F7] border border-[#E8E5DF] font-black text-[#EB001B] text-[11px]">
              Mastercard
            </span>
            {/* SSL 256-bit */}
            <span className="px-3 py-1 rounded-lg bg-emerald-50 border border-emerald-200 font-bold text-emerald-700 text-[11px] flex items-center gap-1">
              <CheckCircle className="w-3 h-3 text-emerald-600" />
              <span>SSL 256-bit</span>
            </span>
          </div>
        </div>

        {/* ============================================================== */}
        {/* 4. COPYRIGHT & BOTTOM BAR                                      */}
        {/* ============================================================== */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#94A3B8]">
          <div className="flex items-center gap-2">
            <p>© 2026 TEFLOOK. Tous droits réservés.</p>
            <span>•</span>
            <span className="font-arabic text-[#FE7C58] font-bold">
              المملكة المغربية
            </span>
          </div>

          <div className="flex items-center gap-4">
            <span>Fait avec passion pour les familles marocaines</span>
            {showScrollTop && (
              <button
                onClick={scrollToTop}
                className="w-8 h-8 rounded-full bg-[#4C9A9C] text-white flex items-center justify-center hover:bg-[#3E8688] transition-colors shadow-sm"
                aria-label="Retour en haut"
                title="Retour en haut de page"
              >
                <ArrowUp className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

      </div>
    </footer>
  );
}
