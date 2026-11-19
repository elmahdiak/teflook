"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Search,
  ShoppingBag,
  User,
  Menu,
  X,
  ChevronDown,
  Sparkles,
  Award,
} from "lucide-react";
import { useCart } from "@/context/CartContext";
import { BrandLogo } from "@/components/ui/BrandLogo";
import { AccountModal } from "./AccountModal";
import { CATEGORIES } from "@/data/teflookData";

export function Navbar() {
  const {
    totalItems,
    totalMad,
    totalEur,
    currency,
    setCurrency,
    language,
    setLanguage,
    setIsCartOpen,
    setIsSearchOpen,
  } = useCart();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [accountModalOpen, setAccountModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [langDropdownOpen, setLangDropdownOpen] = useState(false);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSearchOpen(true);
  };

  return (
    <>
      <header className="sticky top-0 z-40 w-full bg-white shadow-xs border-b border-[#E8E5DF] transition-all">
        {/* ============================================================== */}
        {/* 1. MAIN HEADER BAR                                             */}
        {/* ============================================================== */}
        <div className="border-b border-[#F1EFEA]">
          <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-3.5 sm:py-4 flex items-center justify-between gap-3 sm:gap-6 lg:gap-8">
            
            {/* Left: Mobile Menu Toggle & Brand Logo */}
            <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden p-2 rounded-xl text-[#1E293B] hover:bg-[#F9F8F6] border border-[#E8E5DF] transition-colors"
                aria-label="Menu des catégories"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>

              <BrandLogo size="md" />
            </div>

            {/* Center: Full-Width Rounded Search Bar */}
            <div className="flex-1 max-w-2xl mx-auto hidden md:block">
              <form
                onSubmit={handleSearchSubmit}
                onClick={() => setIsSearchOpen(true)}
                className="relative w-full flex items-center cursor-pointer group"
              >
                <input
                  type="text"
                  placeholder="Rechercher par compétence (émotions, autonomie, logique, créativité)..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  readOnly
                  className="w-full h-11.5 pl-5 pr-14 text-xs sm:text-sm rounded-full bg-[#F9F8F6] border border-[#E8E5DF] group-hover:border-[#4A9099] text-[#1E293B] placeholder:text-[#94A3B8] focus:outline-none transition-all shadow-2xs cursor-pointer"
                />
                <button
                  type="submit"
                  className="absolute right-1.5 w-8.5 h-8.5 rounded-full bg-[#4A9099] group-hover:bg-[#3D7A82] text-white flex items-center justify-center transition-all shadow-xs"
                  aria-label="Rechercher"
                >
                  <Search className="w-4 h-4" />
                </button>
              </form>
            </div>

            {/* Right: Country Flag (🇲🇦), Language Toggle, User Account, Shopping Cart */}
            <div className="flex items-center gap-2 sm:gap-3.5 shrink-0">
              
              {/* Country Flag & Language Toggle Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setLangDropdownOpen(!langDropdownOpen)}
                  className="flex items-center gap-1.5 px-2.5 sm:px-3 py-2 rounded-full border border-[#E8E5DF] bg-[#F9F8F6] text-xs font-semibold text-[#1E293B] hover:border-[#4A9099] transition-colors shadow-2xs"
                  aria-label="Choisir la langue et le pays"
                >
                  <span className="text-base leading-none" title="Maroc">🇲🇦</span>
                  <span className="font-bold text-[#4A9099]">{language}</span>
                  <span className="text-[#94A3B8]">/</span>
                  <span className="text-[#FF6B00] font-bold">{currency}</span>
                  <ChevronDown className="w-3.5 h-3.5 text-[#64748B]" />
                </button>

                {langDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-52 bg-white rounded-2xl shadow-xl border border-[#E8E5DF] p-2.5 z-50 animate-in fade-in zoom-in-95 text-xs">
                    <div className="p-2 border-b border-[#F1EFEA]">
                      <p className="font-semibold text-[11px] text-[#64748B]">Pays de livraison</p>
                      <div className="flex items-center gap-2 mt-1 font-bold text-[#1E293B]">
                        <span className="text-base">🇲🇦</span>
                        <span>Maroc (Toutes les villes)</span>
                      </div>
                    </div>

                    <div className="py-2 border-b border-[#F1EFEA]">
                      <p className="font-semibold text-[11px] text-[#64748B] px-2 mb-1">Langue / اللغة</p>
                      <div className="grid grid-cols-2 gap-1">
                        <button
                          onClick={() => {
                            setLanguage("FR");
                            setLangDropdownOpen(false);
                          }}
                          className={`px-3 py-1.5 rounded-xl font-bold transition-colors ${
                            language === "FR"
                              ? "bg-[#4A9099] text-white"
                              : "bg-[#F9F8F6] hover:bg-[#EBF4F5] text-[#1E293B]"
                          }`}
                        >
                          Français
                        </button>
                        <button
                          onClick={() => {
                            setLanguage("AR");
                            setLangDropdownOpen(false);
                          }}
                          className={`px-3 py-1.5 rounded-xl font-bold font-arabic transition-colors ${
                            language === "AR"
                              ? "bg-[#4A9099] text-white"
                              : "bg-[#F9F8F6] hover:bg-[#EBF4F5] text-[#1E293B]"
                          }`}
                        >
                          العربية
                        </button>
                      </div>
                    </div>

                    <div className="pt-2">
                      <p className="font-semibold text-[11px] text-[#64748B] px-2 mb-1">Devise</p>
                      <div className="grid grid-cols-2 gap-1">
                        <button
                          onClick={() => {
                            setCurrency("MAD");
                            setLangDropdownOpen(false);
                          }}
                          className={`px-3 py-1.5 rounded-xl font-bold transition-colors ${
                            currency === "MAD"
                              ? "bg-[#FF6B00] text-white"
                              : "bg-[#F9F8F6] hover:bg-[#EBF4F5] text-[#1E293B]"
                          }`}
                        >
                          MAD (DH)
                        </button>
                        <button
                          onClick={() => {
                            setCurrency("EUR");
                            setLangDropdownOpen(false);
                          }}
                          className={`px-3 py-1.5 rounded-xl font-bold transition-colors ${
                            currency === "EUR"
                              ? "bg-[#FF6B00] text-white"
                              : "bg-[#F9F8F6] hover:bg-[#EBF4F5] text-[#1E293B]"
                          }`}
                        >
                          EUR (€)
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* User Account Button */}
              <button
                onClick={() => setAccountModalOpen(true)}
                className="flex items-center gap-2 p-2 sm:px-3 sm:py-2 rounded-full border border-[#E8E5DF] bg-[#F9F8F6] text-[#1E293B] hover:border-[#4A9099] hover:bg-white transition-all text-xs font-semibold shadow-2xs group"
                aria-label="Mon Compte"
              >
                <div className="w-6 h-6 rounded-full bg-[#EBF4F5] flex items-center justify-center text-[#4A9099] group-hover:bg-[#4A9099] group-hover:text-white transition-colors">
                  <User className="w-3.5 h-3.5" />
                </div>
                <span className="hidden xl:inline text-[#1E293B]">Mon Compte</span>
              </button>

              {/* Shopping Cart Button with Dynamic Badge Count */}
              <button
                onClick={() => setIsCartOpen(true)}
                className="relative flex items-center gap-2.5 px-3.5 py-2 sm:py-2.5 rounded-full bg-[#4A9099] hover:bg-[#3D7A82] text-white transition-all shadow-md active:scale-95 group cursor-pointer"
                aria-label="Voir le Panier"
              >
                <div className="relative">
                  <ShoppingBag className="w-4 h-4 text-white" />
                  {totalItems > 0 && (
                    <span className="absolute -top-2.5 -right-2.5 bg-[#FF6B00] text-white font-extrabold text-[10px] w-4.5 h-4.5 rounded-full flex items-center justify-center border-2 border-white shadow-xs animate-in zoom-in-75">
                      {totalItems}
                    </span>
                  )}
                </div>
                <span className="text-xs font-extrabold hidden sm:inline">
                  {currency === "MAD" ? `${totalMad.toFixed(0)} MAD` : `${totalEur.toFixed(0)} €`}
                </span>
              </button>

            </div>

          </div>

          {/* Mobile Full-Width Search Input (Visible only on mobile/tablet) */}
          <div className="md:hidden px-4 pb-3">
            <form
              onSubmit={handleSearchSubmit}
              onClick={() => setIsSearchOpen(true)}
              className="relative w-full flex items-center cursor-pointer"
            >
              <input
                type="text"
                placeholder="Rechercher par compétence (autonomie, émotions)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                readOnly
                className="w-full h-10 pl-4 pr-12 text-xs rounded-full bg-[#F9F8F6] border border-[#E8E5DF] text-[#1E293B] placeholder:text-[#94A3B8] focus:outline-none"
              />
              <button
                type="submit"
                className="absolute right-1 w-8 h-8 rounded-full bg-[#4A9099] text-white flex items-center justify-center"
              >
                <Search className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>
        </div>

        {/* ============================================================== */}
        {/* 2. SUB-HEADER: THE 6 OFFICIAL EDUCATIONAL CATEGORIES           */}
        {/* ============================================================== */}
        <div className="bg-[#FAF9F7] border-b border-[#E8E5DF] overflow-x-auto no-scrollbar">
          <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <nav className="flex items-center gap-2 sm:gap-2.5 py-2.5 whitespace-nowrap text-xs font-bold tracking-tight">
              {CATEGORIES.map((cat, idx) => {
                const isOrangeAccent = idx % 2 === 1;

                return (
                  <a
                    key={cat.id}
                    href={`#${cat.slug}`}
                    className={`group inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border transition-all shrink-0 font-bold ${
                      isOrangeAccent
                        ? "bg-white hover:bg-[#FF6B00]/10 text-[#334155] hover:text-[#FF6B00] border-[#E8E5DF] hover:border-[#FF6B00]/40"
                        : "bg-white hover:bg-[#4A9099]/10 text-[#334155] hover:text-[#4A9099] border-[#E8E5DF] hover:border-[#4A9099]/40"
                    }`}
                  >
                    <span
                      className={`w-1.5 h-1.5 rounded-full transition-transform group-hover:scale-125 ${
                        isOrangeAccent ? "bg-[#FF6B00]" : "bg-[#4A9099]"
                      }`}
                    />
                    <span>{cat.name}</span>
                    {cat.highlight && (
                      <span
                        className={`text-[9px] px-1.5 py-0.2 rounded-full font-black ${
                          isOrangeAccent
                            ? "bg-[#FF6B00]/15 text-[#FF6B00]"
                            : "bg-[#4A9099]/15 text-[#4A9099]"
                        }`}
                      >
                        {cat.highlight}
                      </span>
                    )}
                  </a>
                );
              })}
            </nav>
          </div>
        </div>

        {/* ============================================================== */}
        {/* MOBILE NAVIGATION DRAWER (6 OFFICIAL CATEGORIES)               */}
        {/* ============================================================== */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-[#E8E5DF] bg-white px-4 py-4 space-y-3 animate-in slide-in-from-top-2 duration-200">
            <p className="text-[11px] font-bold uppercase tracking-wider text-[#4A9099]">
              Les 6 Piliers Éducatifs &amp; Développementaux
            </p>
            <div className="space-y-1.5">
              {CATEGORIES.map((cat, idx) => (
                <a
                  key={cat.id}
                  href={`#${cat.slug}`}
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-between p-3 rounded-xl bg-[#FAF9F7] hover:bg-[#EBF4F5] text-xs font-bold text-[#1E293B] border border-[#E8E5DF] transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <span
                      className={`w-2 h-2 rounded-full ${
                        idx % 2 === 1 ? "bg-[#FF6B00]" : "bg-[#4A9099]"
                      }`}
                    />
                    <span>{cat.name}</span>
                  </div>
                  <span className="text-[10px] text-[#94A3B8]">
                    {cat.itemCount} outils
                  </span>
                </a>
              ))}
            </div>
          </div>
        )}
      </header>

      {/* Account Modal */}
      <AccountModal
        isOpen={accountModalOpen}
        onClose={() => setAccountModalOpen(false)}
      />
    </>
  );
}
