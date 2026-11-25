"use client";

import React, { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Menu, Search, ShoppingBag, X } from "lucide-react";
import { BrandLogo } from "@/components/ui/BrandLogo";
import { TefLookLanguageSwitcher } from "@/components/teflook-language-switcher";
import { useCartStore } from "@/lib/shopify-cart";
import { CHILD_STORE_CATEGORIES, type ChildStoreCategory } from "@/lib/teflook-categories";
import { CHILD_STORE_CATEGORY_MESSAGE_KEYS, useTefLookLanguage } from "@/lib/teflook-language";
import { cn } from "@/lib/utils";

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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
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
      } else if (e.key === "Escape" && isSearchOpen) {
        e.preventDefault();
        setIsSearchOpen(false);
        searchInputRef.current?.blur();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isSearchOpen]);

  const categories = CHILD_STORE_CATEGORIES.map((category) => ({
    ...category,
    label: t(CHILD_STORE_CATEGORY_MESSAGE_KEYS[category.value]),
  }));

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

  function handleCategoryClick(category: ChildStoreCategory) {
    setMobileMenuOpen(false);
    if (onSelectCategory) {
      onSelectCategory(category);
      document.getElementById("boutique")?.scrollIntoView({ behavior: "smooth" });
    } else {
      router.push(`/?category=${encodeURIComponent(category)}#boutique`);
    }
  }

  return (
    <header className="sticky top-0 z-40 w-full" dir={direction}>
      {/* 1. Main TefLook Navigation Bar */}
      <nav
        aria-label={t("a11y.categories")}
        className="w-full bg-[#FAF8F5]/95 backdrop-blur-md border-b border-[#E8E2D9]"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-[72px] flex items-center justify-between gap-4">
          {/* Left/Start: TefLook Brand Logo */}
          <BrandLogo size="md" />

          {/* Center: Desktop Category Navigation Links (Top 4 on xl screens) */}
          <div className="hidden xl:flex items-center gap-6 2xl:gap-7 min-w-0">
            {categories.slice(0, 4).map((category) => {
              const isSelected = activeCategory === category.value;
              return (
                <button
                  key={category.value}
                  type="button"
                  onClick={() => handleCategoryClick(category.value)}
                  className={cn(
                    "font-brand-logo font-medium text-[13.5px] transition-colors duration-200 py-2 whitespace-nowrap shrink-0 cursor-pointer relative",
                    isAr && "font-sans tracking-normal font-semibold",
                    isSelected
                      ? "text-[#E86F51] font-bold after:absolute after:bottom-1 after:inset-x-0 after:h-[2px] after:bg-[#E86F51] after:rounded-full"
                      : "text-[#1A4D4B] hover:text-[#E86F51]"
                  )}
                >
                  {category.label}
                </button>
              );
            })}
          </div>

          {/* Right/End: Utility Controls (Search Toggle, FR/AR Switcher, Mobile Menu, Shopping Bag) */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
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
              <Search size={19} strokeWidth={2.1} aria-hidden="true" />
            </button>

            {/* Language Switcher Pill (FR / عربي) */}
            <TefLookLanguageSwitcher compact />

            {/* Mobile Categories Menu Toggle */}
            <button
              type="button"
              aria-label={t("a11y.openMenu")}
              aria-expanded={mobileMenuOpen}
              onClick={() => setMobileMenuOpen((open) => !open)}
              className="xl:hidden w-10 h-10 rounded-xl flex items-center justify-center text-[#1A4D4B] hover:bg-white border border-transparent hover:border-[#E8E2D9] transition-all duration-200 cursor-pointer"
            >
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>

            {/* Shopping Bag Button with Coral Count Badge */}
            <button
              type="button"
              onClick={onOpenCart}
              aria-label={`${t("a11y.cart")}, ${count}`}
              className="relative w-10 h-10 rounded-xl flex items-center justify-center text-[#1A4D4B] hover:bg-white hover:text-[#E86F51] border border-transparent hover:border-[#E8E2D9] transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#4b9797] cursor-pointer"
            >
              <ShoppingBag size={20} strokeWidth={2} aria-hidden="true" />
              {count > 0 && (
                <span className="absolute top-1.5 end-1.5 min-w-[16px] h-4 px-1 rounded-full bg-[#E86F51] text-white font-brand-logo text-[10px] font-bold flex items-center justify-center ring-2 ring-[#FAF8F5]">
                  {count > 9 ? "9+" : count}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Mobile Category Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="border-t border-[#E8E2D9] bg-[#FAF8F5] px-5 py-3 xl:hidden">
            {categories.map((category) => (
              <button
                type="button"
                key={category.value}
                onClick={() => handleCategoryClick(category.value)}
                className={cn(
                  "flex items-center justify-between w-full border-b border-[#E8E2D9] py-3 text-start text-sm font-bold transition-colors last:border-0 cursor-pointer",
                  activeCategory === category.value
                    ? "text-[#E86F51] bg-[#E86F51]/5 px-2.5 rounded-lg"
                    : "text-[#1A4D4B] hover:text-[#E86F51]",
                  isAr && "font-sans"
                )}
              >
                <span>{category.label}</span>
                {activeCategory === category.value && (
                  <span className="w-2 h-2 rounded-full bg-[#E86F51]" />
                )}
              </button>
            ))}
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
                className="text-[#4b9797] hover:text-[#1A4D4B] flex items-center justify-center shrink-0 transition-colors cursor-pointer"
              >
                <Search size={18} strokeWidth={2.2} aria-hidden="true" />
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
                className="w-8 h-8 rounded-lg bg-[#FAF8F5] hover:bg-[#E86F51]/15 text-[#1A3C34]/65 hover:text-[#E86F51] flex items-center justify-center transition-colors duration-200 shrink-0 cursor-pointer"
              >
                <X size={17} strokeWidth={2.2} aria-hidden="true" />
              </button>
            </form>
          </div>
        </div>
      </div>
    </header>
  );
}
