"use client";

import React from "react";
import { CartProvider } from "@/context/CartContext";
import { TopAnnouncementBar } from "@/components/layout/TopAnnouncementBar";
import { Navbar } from "@/components/layout/Navbar";
import { MarketplaceHero } from "@/components/sections/MarketplaceHero";
import { MarketplaceSections } from "@/components/sections/MarketplaceSections";
import { ReviewsSection } from "@/components/sections/ReviewsSection";
import { Footer } from "@/components/layout/Footer";
import { CartDrawer } from "@/components/cart/CartDrawer";
import { QuickViewModal } from "@/components/cart/QuickViewModal";
import { SearchModal } from "@/components/cart/SearchModal";
import { ToastNotification } from "@/components/ui/ToastNotification";

export default function Home() {
  return (
    <CartProvider>
      <div className="min-h-screen flex flex-col bg-[#F8F9FA] text-[#1E293B] selection:bg-[#FF6B00] selection:text-white">
        
        {/* 1. Top Announcement Promotional Bar */}
        <TopAnnouncementBar />

        {/* 2. Main Header & Sub-Header Category Bar */}
        <Navbar />

        {/* Main E-Commerce Page Content */}
        <main className="flex-1">
          {/* 3. Hero & Promotional Banners Section (Main Banner, Quick Category Circles, Secondary Strips) */}
          <MarketplaceHero />

          {/* 4. Full Page Content Sections (10 Sequential Sections matching Reference) */}
          <MarketplaceSections />

          {/* 5. Customer Reviews & Testimonials from Moroccan Families */}
          <ReviewsSection />
        </main>

        {/* 6. Comprehensive 4-Column Footer with Payment Badges & Utilities */}
        <Footer />

        {/* Interactive Modals & Drawers */}
        <CartDrawer />
        <QuickViewModal />
        <SearchModal />
        <ToastNotification />
      </div>
    </CartProvider>
  );
}
