"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { TefLookLanguageSwitcher } from "@/components/teflook-language-switcher";
import { useCartStore } from "@/lib/shopify-cart";
import type { ChildStoreCategory } from "@/lib/teflook-categories";
import { useTefLookLanguage } from "@/lib/teflook-language";
import { cn } from "@/lib/utils";

const HEADER_SVG_PROPS = {
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  className: "w-5 h-5",
  "aria-hidden": true as const,
};

function HeaderMenuIcon() {
  return (
    <svg {...HEADER_SVG_PROPS}>
      <line x1="4" y1="6" x2="20" y2="6" />
      <line x1="4" y1="12" x2="20" y2="12" />
      <line x1="4" y1="18" x2="20" y2="18" />
    </svg>
  );
}

function HeaderCloseIcon() {
  return (
    <svg {...HEADER_SVG_PROPS}>
      <path d="M18 6 6 18" />
      <path d="m6 6 12 12" />
    </svg>
  );
}

function HeaderSearchIcon() {
  return (
    <svg {...HEADER_SVG_PROPS}>
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-4.35-4.35" />
    </svg>
  );
}

function HeaderBagIcon() {
  return (
    <svg {...HEADER_SVG_PROPS}>
      <path d="M5.5 8h13l1 12H4.5L5.5 8Z" />
      <path d="M9 8V6a3 3 0 0 1 6 0v2" />
      <path d="M9 11a3 3 0 0 0 6 0" />
    </svg>
  );
}

export interface HeaderProps {
  activeCategory?: ChildStoreCategory | "all";
  onSelectCategory?: (category: ChildStoreCategory | "all") => void;
  searchTerm?: string;
  onSearchChange?: (value: string) => void;
  onOpenCart: () => void;
  defaultSearchOpen?: boolean;
}

export function Header({
  activeCategory = "all",
  onSelectCategory,
  searchTerm,
  onSearchChange,
  onOpenCart,
  defaultSearchOpen = false,
}: HeaderProps) {
  const router = useRouter();
  const { direction, locale, t, isMounted } = useTefLookLanguage();
  const { items, hasHydrated } = useCartStore();

  const [isSearchOpen, setIsSearchOpen] = useState(defaultSearchOpen);
  const [menuOpen, setMenuOpen] = useState(false);
  const [internalQuery, setInternalQuery] = useState(searchTerm ?? "");
  const searchInputRef = useRef<HTMLInputElement>(null);

  const currentQuery = searchTerm !== undefined ? searchTerm : internalQuery;
  const isAr = isMounted && locale === "ar";
  const count = isMounted && hasHydrated ? items.reduce((total, item) => total + item.quantity, 0) : 0;

  useEffect(() => {
    void useCartStore.persist.rehydrate();
  }, []);

  useEffect(() => {
    if (searchTerm !== undefined) {
      setInternalQuery(searchTerm);
    }
  }, [searchTerm]);

  // Global keyboard shortcuts: '/' opens & focuses search, 'Escape' closes/resets
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      const tagName = target?.tagName;
      const isTyping =
        tagName === "INPUT" ||
        tagName === "TEXTAREA" ||
        tagName === "SELECT" ||
        target?.isContentEditable;

      if (e.key === "/" && !isTyping) {
        e.preventDefault();
        setIsSearchOpen(true);
        setTimeout(() => {
          searchInputRef.current?.focus();
        }, 80);
      } else if (e.key === "Escape") {
        if (isSearchOpen) {
          e.preventDefault();
          setIsSearchOpen(false);
          searchInputRef.current?.blur();
        }
        if (menuOpen) {
          setMenuOpen(false);
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isSearchOpen, menuOpen]);

  const navLinks = [
    { key: "home", label: t("nav.home"), href: "/" },
    { key: "collections", label: t("nav.collections"), href: "/#boutique" },
    { key: "about", label: t("nav.about"), href: "/#univers" },
    { key: "contact", label: t("nav.contact"), href: "/#contact" },
  ] as const;

  function handleQueryUpdate(value: string) {
    setInternalQuery(value);
    if (onSearchChange) {
      onSearchChange(value);
    }
  }

  function handleSearchToggle() {
    const nextState = !isSearchOpen;
    setIsSearchOpen(nextState);
    if (nextState) {
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 80);
    } else {
      searchInputRef.current?.blur();
    }
  }

  function handleSearchSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = currentQuery.trim();
    if (onSearchChange) {
      onSearchChange(currentQuery);
      if (trimmed) {
        document.getElementById("boutique")?.scrollIntoView({ behavior: "smooth" });
      } else {
        searchInputRef.current?.focus();
      }
    } else {
      if (trimmed) {
        router.push(`/?q=${encodeURIComponent(trimmed)}#boutique`);
      } else {
        searchInputRef.current?.focus();
      }
    }
  }

  function handleCloseSearch() {
    setIsSearchOpen(false);
    searchInputRef.current?.blur();
  }

  return (
    <header className="sticky top-0 z-40 w-full" dir={direction}>
      {/* 1. Main 3-Zone TefLook Navigation Bar */}
      <nav
        aria-label={t("a11y.navigation")}
        className="w-full bg-[#FAF8F5]/95 backdrop-blur-md border-b border-[#E8E2D9]"
      >
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-20 sm:h-22 md:h-24 grid grid-cols-[1fr_auto_1fr] items-center gap-2">
          {/* Start Zone: Menu Trigger + Minimalist Language Dropdown */}
          <div className="justify-self-start flex items-center gap-1.5 sm:gap-3 min-w-0">
            <button
              type="button"
              aria-label={t("a11y.openMenu")}
              aria-expanded={menuOpen}
              aria-controls="teflook-navigation-menu"
              onClick={() => setMenuOpen((open) => !open)}
              className={cn(
                "inline-flex items-center justify-center gap-1.5 h-10 px-2.5 sm:px-3 rounded-xl text-[#1A4D4B] transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#4b9797] cursor-pointer shrink-0",
                menuOpen
                  ? "bg-white border border-[#4b9797] ring-2 ring-[#4b9797]/20"
                  : "border border-transparent hover:bg-white hover:border-[#E8E2D9] hover:text-[#4b9797]"
              )}
            >
              {menuOpen ? <HeaderCloseIcon /> : <HeaderMenuIcon />}
              <span
                className={cn(
                  "hidden sm:inline font-brand-logo text-[13px] font-semibold",
                  isAr && "font-sans"
                )}
              >
                {isAr ? "القائمة" : "Menu"}
              </span>
            </button>

            <TefLookLanguageSwitcher compact />
          </div>

          {/* Center Zone: Dead-Center Stacked TefLook Image Logo */}
          <Link
            href="/"
            aria-label={isAr ? "الصفحة الرئيسية تيفلوك" : "Accueil TefLook"}
            className="justify-self-center flex items-center justify-center rounded-xl transition-transform duration-200 hover:scale-[1.03] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#4b9797]"
          >
            <Image
              src="/images/teflook-stacked-logo.png"
              alt="TefLook"
              width={220}
              height={220}
              quality={100}
              priority
              className="h-14 sm:h-16 md:h-20 w-auto object-contain mix-blend-multiply"
            />
          </Link>

          {/* End Zone: Search Toggle Button + Shopping Bag Button */}
          <div className="justify-self-end flex items-center gap-1.5 sm:gap-3 shrink-0">
            {/* Search Toggle Button */}
            <button
              type="button"
              onClick={handleSearchToggle}
              aria-expanded={isSearchOpen}
              aria-controls="teflook-search-panel"
              aria-label={t("a11y.search")}
              title={isAr ? "بحث (اضغط /)" : "Rechercher (touche /)"}
              className={cn(
                "relative w-10 h-10 rounded-xl flex items-center justify-center text-[#1A4D4B] transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#4b9797] cursor-pointer",
                isSearchOpen
                  ? "bg-white border border-[#4b9797] ring-2 ring-[#4b9797]/25"
                  : "border border-transparent hover:bg-white hover:border-[#E8E2D9] hover:text-[#4b9797]"
              )}
            >
              <HeaderSearchIcon />
            </button>

            {/* Shopping Bag Button with Coral Count Badge */}
            <button
              type="button"
              onClick={onOpenCart}
              aria-label={`${t("a11y.cart")}, ${count}`}
              className="relative w-10 h-10 rounded-xl flex items-center justify-center text-[#1A4D4B] hover:bg-white hover:text-[#E86F51] border border-transparent hover:border-[#E8E2D9] transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#4b9797] cursor-pointer"
            >
              <HeaderBagIcon />
              {count > 0 && (
                <span className="absolute top-1 end-1 min-w-[16px] h-4 px-1 rounded-full bg-[#E86F51] text-white font-brand-logo text-[10px] font-bold flex items-center justify-center ring-2 ring-[#FAF8F5]">
                  {count > 9 ? "9+" : count}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Main Navigation Menu Drawer (Desktop & Mobile) */}
        {menuOpen && (
          <div
            id="teflook-navigation-menu"
            className="border-t border-[#E8E2D9] bg-[#FAF8F5] px-4 sm:px-6 lg:px-8 py-3 shadow-sm"
          >
            <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-1 sm:gap-2">
              {navLinks.map((item) => (
                <Link
                  key={item.key}
                  href={item.href}
                  onClick={() => setMenuOpen(false)}
                  className={cn(
                    "flex items-center justify-between w-full px-3 py-2.5 rounded-xl text-start text-sm font-bold text-[#1A4D4B] hover:bg-white hover:text-[#E86F51] transition-colors",
                    isAr && "font-sans"
                  )}
                >
                  <span>{item.label}</span>
                </Link>
              ))}
            </div>
          </div>
        )}
      </nav>

      {/* 2. Collapsible Horizontal Search Bar Panel */}
      <div
        id="teflook-search-panel"
        role="search"
        aria-label={t("a11y.search")}
        className={cn(
          "grid transition-all duration-200 ease-out bg-[#FAF8F5]/95 backdrop-blur-md border-[#E8E2D9]",
          isSearchOpen
            ? "grid-rows-[1fr] opacity-100 border-b shadow-xs"
            : "grid-rows-[0fr] opacity-0 border-b-0 pointer-events-none"
        )}
      >
        <div className="overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5 sm:py-3">
            <form
              onSubmit={handleSearchSubmit}
              noValidate
              className="flex items-center gap-2 sm:gap-2.5 px-3 sm:px-4 h-11 sm:h-12 rounded-xl bg-white border border-[#E8E2D9] shadow-xs hover:border-[#4b9797]/50 focus-within:border-[#4b9797] focus-within:ring-2 focus-within:ring-[#4b9797]/20 transition-all duration-200"
            >
              {/* Search Submit Icon */}
              <button
                type="submit"
                aria-label={t("a11y.search")}
                className="w-9 h-9 rounded-xl text-[#4b9797] hover:text-[#1A4D4B] hover:bg-[#FAF8F5] flex items-center justify-center shrink-0 transition-colors cursor-pointer"
              >
                <HeaderSearchIcon />
              </button>

              {/* Horizontal Search Input */}
              <input
                ref={searchInputRef}
                type="text"
                dir={direction}
                autoComplete="off"
                spellCheck={false}
                value={currentQuery}
                onChange={(e) => handleQueryUpdate(e.target.value)}
                placeholder={isAr ? "ابحث عن منتج..." : "Rechercher..."}
                aria-label={t("a11y.search")}
                className={cn(
                  "flex-1 min-w-0 bg-transparent border-0 px-1 py-2 text-sm sm:text-[15px] font-medium text-[#1A3C34] placeholder:text-[#1A3C34]/45 placeholder:font-normal focus:outline-none text-start placeholder:text-start",
                  isAr && "font-sans"
                )}
              />

              {/* Clear Query Button (when text is entered) */}
              {currentQuery.length > 0 && (
                <button
                  type="button"
                  onClick={() => {
                    handleQueryUpdate("");
                    searchInputRef.current?.focus();
                  }}
                  aria-label={t("a11y.clearSearch")}
                  className={cn(
                    "px-2.5 py-1 rounded-lg text-xs font-semibold text-[#1A3C34]/65 hover:text-[#E86F51] hover:bg-[#FAF8F5] transition-colors shrink-0 cursor-pointer",
                    isAr && "font-sans"
                  )}
                >
                  {isAr ? "مسح" : "Effacer"}
                </button>
              )}

              {/* Close Search Bar Button */}
              <button
                type="button"
                onClick={handleCloseSearch}
                aria-label={isAr ? "إغلاق البحث" : "Fermer la recherche"}
                title={isAr ? "إغلاق" : "Fermer"}
                className="w-9 h-9 rounded-xl bg-[#FAF8F5] hover:bg-[#E86F51]/15 text-[#1A4D4B] hover:text-[#E86F51] border border-transparent hover:border-[#E8E2D9] flex items-center justify-center transition-colors duration-200 shrink-0 cursor-pointer"
              >
                <HeaderCloseIcon />
              </button>
            </form>
          </div>
        </div>
      </div>
    </header>
  );
}
