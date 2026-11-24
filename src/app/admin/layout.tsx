"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  BarChart3,
  ExternalLink,
  FolderTree,
  LayoutDashboard,
  LogOut,
  Menu,
  MessageCircle,
  MessageSquare,
  Package,
  ShoppingBag,
  Store,
  Truck,
  Users,
  X,
} from "lucide-react";
import { isAuthenticated, logoutAdmin } from "@/lib/admin-auth";
import { Button } from "@/components/ui/button";
import { BrandLogo } from "@/components/ui/BrandLogo";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Don't guard the login page itself
    if (pathname === "/admin/login") return;

    if (!isAuthenticated()) {
      router.push("/admin/login");
    }
  }, [pathname, router]);

  // If on login page, render children without sidebar shell
  if (pathname === "/admin/login") {
    return <>{children}</>;
  }

  if (!mounted) {
    return (
      <div className="min-h-screen grid place-items-center bg-[#F9F8F6]">
        <div className="size-8 rounded-full border-2 border-brand-teal border-t-transparent animate-spin" />
      </div>
    );
  }

  const navItems = [
    {
      label: "Vue d'ensemble",
      href: "/admin",
      icon: LayoutDashboard,
      exact: true,
    },
    {
      label: "Commandes COD",
      href: "/admin/orders",
      icon: Truck,
      badge: "COD",
    },
    {
      label: "Catalogue Produits",
      href: "/admin/products",
      icon: Package,
    },
    {
      label: "Catégories d'éveil",
      href: "/admin/categories",
      icon: FolderTree,
    },
    {
      label: "Avis & Témoignages",
      href: "/admin/reviews",
      icon: MessageSquare,
      badge: "Vérifiés",
    },
    {
      label: "Support WhatsApp",
      href: "/admin/settings",
      icon: MessageCircle,
      badge: "Direct",
    },
  ];

  const SidebarContent = () => (
    <div className="flex h-full flex-col justify-between p-5 bg-[#2C6466] text-[#FBF9F5]">
      <div>
        {/* Brand */}
        <div className="flex items-center justify-between pb-6 border-b border-white/10">
          <BrandLogo size="md" variant="dark" href="/admin" subtitle="Admin Console" />
          <button
            type="button"
            onClick={() => setMobileSidebarOpen(false)}
            className="md:hidden text-white/70 hover:text-white"
          >
            <X size={20} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="mt-6 space-y-1.5" aria-label="Menu administration">
          {navItems.map((item) => {
            const isActive = item.exact
              ? pathname === item.href
              : pathname.startsWith(item.href);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileSidebarOpen(false)}
                className={`flex items-center justify-between rounded-xl px-3.5 py-3 text-xs font-bold transition-all duration-200 ${
                  isActive
                    ? "bg-[#FE7C58] text-white shadow-sm shadow-black/10"
                    : "text-white/75 hover:bg-white/10 hover:text-white"
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon size={18} className={isActive ? "text-white" : "text-white/70"} />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span
                    className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                      isActive ? "bg-[#FEC748] text-[#2C6466]" : "bg-white/15 text-white/90"
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Bottom utilities */}
      <div className="pt-6 border-t border-white/10 space-y-2">
        <Link
          href="/"
          target="_blank"
          className="flex items-center justify-between rounded-xl px-3.5 py-2.5 text-xs font-semibold text-white/80 hover:bg-white/10 hover:text-white transition-colors"
        >
          <div className="flex items-center gap-2.5">
            <Store size={16} />
            <span>Voir la boutique</span>
          </div>
          <ExternalLink size={13} className="text-white/50" />
        </Link>
        <button
          type="button"
          onClick={logoutAdmin}
          className="flex w-full items-center gap-2.5 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-red-300 hover:bg-red-500/20 hover:text-red-200 transition-colors cursor-pointer"
        >
          <LogOut size={16} />
          <span>Déconnexion</span>
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F9F8F6] flex">
      {/* Desktop Sidebar */}
      <aside className="hidden md:block w-64 shrink-0 border-r border-border h-screen sticky top-0">
        <SidebarContent />
      </aside>

      {/* Mobile Drawer */}
      {mobileSidebarOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-xs"
            onClick={() => setMobileSidebarOpen(false)}
          />
          <div className="relative z-10 w-72 h-full shadow-2xl">
            <SidebarContent />
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Topbar */}
        <header className="sticky top-0 z-20 h-16 border-b border-border bg-card/95 backdrop-blur-md px-4 sm:px-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setMobileSidebarOpen(true)}
            >
              <Menu size={20} />
            </Button>
            <div className="flex items-center gap-2">
              <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xs font-bold text-foreground">Boutique en ligne active 🇲🇦</span>
              <span className="hidden sm:inline text-xs text-muted-foreground">· Mode Cash on Delivery</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/"
              target="_blank"
              className="hidden sm:inline-flex items-center gap-1.5 text-xs font-bold text-brand-teal hover:text-brand-orange transition-colors"
            >
              <span>Accéder au site client</span>
              <ExternalLink size={13} />
            </Link>
            <div className="flex items-center gap-2 pl-3 border-l border-border">
              <div className="size-8 rounded-full bg-brand-teal text-white font-bold grid place-items-center text-xs">
                A
              </div>
              <span className="text-xs font-bold hidden sm:inline text-foreground">Admin TefLook</span>
            </div>
          </div>
        </header>

        {/* Content Body */}
        <main className="flex-1 p-4 sm:p-8 max-w-7xl w-full mx-auto">{children}</main>
      </div>
    </div>
  );
}
