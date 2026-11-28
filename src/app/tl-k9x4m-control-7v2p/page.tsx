"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  AlertCircle,
  ArrowRight,
  ArrowUpRight,
  CheckCircle2,
  ClipboardList,
  Clock,
  Coins,
  Eye,
  FolderTree,
  HelpCircle,
  MapPin,
  Package,
  Plus,
  ShoppingBag,
  TrendingUp,
  Truck,
  Users,
  MessageCircle,
  Phone,
  Save,
  LoaderCircle,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  fetchSyncedCODOrders,
  getDashboardStats,
  type CODOrder,
} from "@/lib/cod-service";
import { supabase } from "@/lib/supabase";
import {
  fetchSiteSettings,
  saveSiteSettings,
  cleanWhatsAppNumber,
  normalizeInstagramUrl,
  DEFAULT_INSTAGRAM_URL,
  DEFAULT_SITE_SETTINGS,
  type SiteSettings,
} from "@/lib/site-settings";
import {
  ADMIN_CATEGORIES_PATH,
  ADMIN_CHECKOUT_FIELDS_PATH,
  ADMIN_ORDERS_PATH,
  ADMIN_PRODUCTS_PATH,
  ADMIN_REVIEWS_PATH,
  ADMIN_SETTINGS_PATH,
} from "@/lib/admin-config";

const INITIAL_STATS: ReturnType<typeof getDashboardStats> = {
  totalRevenue: 0,
  totalOrdersCount: 0,
  pendingOrders: 0,
  confirmedOrders: 0,
  shippedOrders: 0,
  deliveredOrders: 0,
  confirmationRate: 100,
  productsCount: 0,
  reviewsCount: 0,
  recentOrders: [],
};

export default function AdminDashboardPage() {
  const [stats, setStats] = useState(INITIAL_STATS);
  const [recentOrders, setRecentOrders] = useState<CODOrder[]>([]);
  const [isMounted, setIsMounted] = useState(false);

  // WhatsApp Support Settings state
  const [siteSettings, setSiteSettings] = useState<SiteSettings>(DEFAULT_SITE_SETTINGS);
  const [isSavingSettings, setIsSavingSettings] = useState(false);
  const [settingsToast, setSettingsToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  useEffect(() => {
    setIsMounted(true);

    async function loadDashboard() {
      const [orders, prodRes, revRes] = await Promise.all([
        fetchSyncedCODOrders(),
        fetch("/api/products", { cache: "no-store" })
          .then((r) => (r.ok ? r.json() : null))
          .catch(() => null),
        fetch("/api/reviews", { cache: "no-store" })
          .then((r) => (r.ok ? r.json() : null))
          .catch(() => null),
      ]);

      const prodCount = Array.isArray(prodRes) ? prodRes.length : undefined;
      const revCount = Array.isArray(revRes) ? revRes.length : undefined;
      setStats(getDashboardStats(orders, prodCount, revCount));
      setRecentOrders(orders.slice(0, 5));
    }

    void loadDashboard();

    fetchSiteSettings().then((s) => {
      if (s) setSiteSettings(s);
    });

    const channel = supabase
      .channel("teflook-dashboard-orders")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "orders" },
        () => {
          void loadDashboard();
        }
      )
      .subscribe();

    const handleLocalSync = () => {
      void loadDashboard();
    };
    window.addEventListener("teflook:cod-order-created", handleLocalSync);

    return () => {
      window.removeEventListener("teflook:cod-order-created", handleLocalSync);
      void supabase.removeChannel(channel);
    };
  }, []);

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingSettings(true);
    const res = await saveSiteSettings(siteSettings);
    setIsSavingSettings(false);

    if (res.success && res.data) {
      setSiteSettings(res.data);
      setSettingsToast({ message: "Numéro WhatsApp mis à jour avec succès !", type: "success" });
    } else {
      setSettingsToast({ message: res.error || "Erreur de sauvegarde", type: "error" });
    }

    setTimeout(() => {
      setSettingsToast(null);
    }, 4500);
  };

  const statusBadges: Record<
    string,
    { label: string; color: string; icon: React.ReactNode }
  > = {
    pending: {
      label: "En attente d'appel",
      color: "bg-amber-100 text-amber-800 border-amber-300",
      icon: <Clock size={12} />,
    },
    confirmed: {
      label: "Confirmée",
      color: "bg-blue-100 text-blue-800 border-blue-300",
      icon: <CheckCircle2 size={12} />,
    },
    shipped: {
      label: "En cours de livraison",
      color: "bg-purple-100 text-purple-800 border-purple-300",
      icon: <Truck size={12} />,
    },
    delivered: {
      label: "Livrée & Encaissée",
      color: "bg-emerald-100 text-emerald-800 border-emerald-300",
      icon: <Coins size={12} />,
    },
    cancelled: {
      label: "Annulée",
      color: "bg-rose-100 text-rose-800 border-rose-300",
      icon: <AlertCircle size={12} />,
    },
  };

  return (
    <div className="space-y-8">
      {/* Settings Toast Notification */}
      {settingsToast && (
        <div
          className={`fixed top-5 right-5 z-50 flex items-center gap-3 px-5 py-3.5 rounded-2xl shadow-2xl text-xs sm:text-sm font-bold text-white animate-in fade-in slide-in-from-top-4 ${
            settingsToast.type === "error" ? "bg-rose-600" : "bg-emerald-700"
          }`}
        >
          <CheckCircle2 size={18} />
          <span>{settingsToast.message}</span>
        </div>
      )}

      {/* 1. Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-black text-foreground">
            Tableau de Bord E-Commerce TefLook
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-muted-foreground">
            Pilotage des flux Cash on Delivery (COD), expéditions au Maroc et catalogue d'éveil.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link href={ADMIN_PRODUCTS_PATH}>
            <Button variant="outline" size="sm" className="gap-2 rounded-xl text-xs">
              <Plus size={15} />
              Ajouter un produit
            </Button>
          </Link>
          <Link href={ADMIN_ORDERS_PATH}>
            <Button size="sm" className="gap-2 rounded-xl bg-brand-orange text-white hover:bg-brand-orange/90 text-xs">
              <Truck size={15} />
              Gérer les commandes ({stats.pendingOrders} en attente)
            </Button>
          </Link>
        </div>
      </div>

      {/* 2. Key Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        {/* Metric 1: Revenue */}
        <div
          className="rounded-2xl border border-border bg-card p-5 shadow-xs flex flex-col justify-between"
          title="Chiffre d'affaires calculé uniquement sur les commandes livrées et payées (exclut les retours et les encours)."
        >
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                Chiffre d'Affaires COD
              </span>
              <span
                className="group relative inline-flex items-center text-muted-foreground/80 hover:text-foreground cursor-help"
                title="Chiffre d'affaires calculé uniquement sur les commandes livrées et payées (exclut les retours et les encours)."
                aria-label="Chiffre d'affaires calculé uniquement sur les commandes livrées et payées (exclut les retours et les encours)."
              >
                <HelpCircle size={13} />
                <span className="pointer-events-none invisible opacity-0 group-hover:visible group-hover:opacity-100 transition-opacity absolute left-0 top-5 z-20 w-60 rounded-lg border border-border bg-foreground px-2.5 py-1.5 text-[11px] font-normal normal-case tracking-normal text-background shadow-md">
                  Chiffre d&apos;affaires calculé uniquement sur les commandes livrées et payées (exclut les retours et les encours).
                </span>
              </span>
            </div>
            <div className="grid size-9 shrink-0 place-items-center rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-200">
              <Coins size={18} />
            </div>
          </div>
          <div className="mt-4">
            <div className="font-display text-2xl sm:text-3xl font-black text-foreground">
              {stats.totalRevenue.toLocaleString("fr-FR")} MAD
            </div>
            <p className="mt-1 text-[11px] text-emerald-700 font-semibold flex items-center gap-1">
              <TrendingUp size={12} className="shrink-0" />
              Total des produits livrés &amp; encaissés (100%)
            </p>
          </div>
        </div>

        {/* Metric 2: Total Orders */}
        <div className="rounded-2xl border border-border bg-card p-5 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
              Commandes Reçues
            </span>
            <div className="grid size-9 place-items-center rounded-xl bg-blue-50 text-blue-600 border border-blue-200">
              <Truck size={18} />
            </div>
          </div>
          <div className="mt-4">
            <div className="font-display text-2xl sm:text-3xl font-black text-foreground">
              {stats.totalOrdersCount}
            </div>
            <p className="mt-1 text-[11px] text-muted-foreground">
              <strong className="text-amber-600">{stats.pendingOrders}</strong> en attente d'appel client
            </p>
          </div>
        </div>

        {/* Metric 3: Confirmation Rate */}
        <div className="rounded-2xl border border-border bg-card p-5 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
              Taux de Confirmation COD
            </span>
            <div className="grid size-9 place-items-center rounded-xl bg-purple-50 text-purple-600 border border-purple-200">
              <CheckCircle2 size={18} />
            </div>
          </div>
          <div className="mt-4">
            <div className="font-display text-2xl sm:text-3xl font-black text-foreground">
              {stats.confirmationRate}%
            </div>
            <p className="mt-1 text-[11px] text-muted-foreground">
              Ratio de validation téléphonique des commandes
            </p>
          </div>
        </div>

        {/* Metric 4: Catalog Products */}
        <div className="rounded-2xl border border-border bg-card p-5 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
              Catalogue Produits
            </span>
            <div className="grid size-9 place-items-center rounded-xl bg-brand-mist text-brand-teal border border-brand-teal/20">
              <Package size={18} />
            </div>
          </div>
          <div className="mt-4">
            <div className="font-display text-2xl sm:text-3xl font-black text-foreground">
              {stats.productsCount} articles
            </div>
            <p className="mt-1 text-[11px] text-muted-foreground">
              Sur 6 piliers de développement & éveil
            </p>
          </div>
        </div>
      </div>

      {/* 3. Recent COD Orders Table */}
      <div className="rounded-2xl border border-border bg-card overflow-hidden shadow-xs">
        <div className="flex items-center justify-between p-5 border-b border-border bg-[#F9F8F6]">
          <div>
            <h2 className="font-display text-base sm:text-lg font-bold text-foreground">
              Dernières commandes Cash on Delivery (COD)
            </h2>
            <p className="text-xs text-muted-foreground">
              Flux des commandes passées avec règlement en espèces à la livraison
            </p>
          </div>
          <Link
            href={ADMIN_ORDERS_PATH}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-brand-teal hover:text-brand-orange transition-colors"
          >
            <span>Voir toutes les commandes</span>
            <ArrowRight size={14} />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-border bg-secondary/40 text-[11px] uppercase tracking-wider text-muted-foreground font-bold">
                <th className="py-3.5 px-4 sm:px-6">N° Commande</th>
                <th className="py-3.5 px-4">Client & Ville</th>
                <th className="py-3.5 px-4">Articles</th>
                <th className="py-3.5 px-4">Montant (MAD)</th>
                <th className="py-3.5 px-4">Statut COD</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {recentOrders.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-10 text-center text-muted-foreground">
                    Aucune commande enregistrée pour le moment.
                  </td>
                </tr>
              ) : (
                recentOrders.map((order) => {
                  const badgeInfo = statusBadges[order.status] || statusBadges.pending;
                  return (
                    <tr key={order.id} className="hover:bg-secondary/30 transition-colors">
                      <td className="py-4 px-4 sm:px-6 font-bold text-foreground">
                        <Link href={`${ADMIN_ORDERS_PATH}?search=${order.id}`} className="hover:text-brand-teal">
                          #{order.id}
                        </Link>
                        <span className="block text-[10px] text-muted-foreground font-normal">
                          {new Date(order.createdAt).toLocaleDateString("fr-FR", {
                            day: "numeric",
                            month: "short",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <div className="font-semibold text-foreground">{order.customerName}</div>
                        <div className="text-[11px] text-muted-foreground flex items-center gap-1">
                          <MapPin size={11} className="text-brand-teal" />
                          <span>{order.customerCity}</span>
                          <span>· {order.customerPhone}</span>
                        </div>
                      </td>
                      <td className="py-4 px-4 text-muted-foreground">
                        <span className="font-medium text-foreground">
                          {order.items.reduce((s, i) => s + i.quantity, 0)} article(s)
                        </span>
                        <span className="block truncate max-w-[200px] text-[11px]">
                          {order.items.map((i) => i.title).join(", ")}
                        </span>
                      </td>
                      <td className="py-4 px-4 font-bold text-brand-orange-deep text-sm whitespace-nowrap">
                        {order.totalMad} MAD
                      </td>
                      <td className="py-4 px-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-bold ${badgeInfo.color}`}
                        >
                          {badgeInfo.icon}
                          <span>{badgeInfo.label}</span>
                        </span>
                      </td>
                      <td className="py-4 px-4 text-right whitespace-nowrap">
                        <Link href={`${ADMIN_ORDERS_PATH}?search=${order.id}`}>
                          <Button variant="ghost" size="sm" className="h-8 gap-1.5 rounded-lg text-xs">
                            <Eye size={14} />
                            <span>Détails</span>
                          </Button>
                        </Link>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 4. Configuration Support WhatsApp */}
      <div className="rounded-2xl border border-border bg-card p-6 shadow-xs">
        <form onSubmit={handleSaveSettings} className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-border">
            <div className="flex items-center gap-3">
              <div className="grid size-10 place-items-center rounded-xl bg-[#25D366]/15 text-[#25D366]">
                <MessageCircle size={22} />
              </div>
              <div>
                <h3 className="font-display text-base font-bold text-foreground">
                  Support Client WhatsApp
                </h3>
                <p className="text-xs text-muted-foreground">
                  Configurez le numéro WhatsApp pour le bouton flottant de support et les commandes directes
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
                  siteSettings.whatsapp_enabled
                    ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                    : "bg-muted text-muted-foreground border border-border"
                }`}
              >
                <span
                  className={`size-2 rounded-full ${
                    siteSettings.whatsapp_enabled ? "bg-emerald-500 animate-pulse" : "bg-muted-foreground"
                  }`}
                />
                {siteSettings.whatsapp_enabled ? "Bouton Actif sur le site" : "Désactivé"}
              </span>

              <label className="relative inline-flex items-center cursor-pointer ml-2">
                <input
                  type="checkbox"
                  checked={siteSettings.whatsapp_enabled}
                  onChange={(e) =>
                    setSiteSettings({ ...siteSettings, whatsapp_enabled: e.target.checked })
                  }
                  className="sr-only peer"
                />
                <div className="w-10 h-5.5 bg-muted peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4.5 after:w-4.5 after:transition-all peer-checked:bg-[#25D366]" />
              </label>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 sm:gap-4 items-end">
            <div className="sm:col-span-5 space-y-1">
              <label className="block text-xs font-bold text-foreground">
                Numéro WhatsApp / WhatsApp Phone *
              </label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center gap-1.5 pointer-events-none">
                  <span className="text-sm">🇲🇦</span>
                  <Phone size={13} className="text-muted-foreground" />
                </div>
                <input
                  type="text"
                  required
                  value={siteSettings.whatsapp_phone}
                  onChange={(e) =>
                    setSiteSettings({ ...siteSettings, whatsapp_phone: e.target.value })
                  }
                  placeholder="+212600000000 ou 0661234567"
                  className="w-full h-10 pl-14 pr-3 rounded-xl border border-border bg-background text-xs sm:text-sm font-semibold outline-none focus:border-[#25D366]"
                />
              </div>
              <p className="text-[10px] text-muted-foreground">
                Format marocain local ou international supporté.
              </p>
            </div>

            <div className="sm:col-span-3 space-y-1">
              <label className="block text-xs font-bold text-foreground">
                Position du bouton
              </label>
              <div className="grid grid-cols-2 gap-1.5 rounded-xl border border-border bg-background p-1 h-10">
                <button
                  type="button"
                  onClick={() => setSiteSettings({ ...siteSettings, whatsapp_position: "left" })}
                  className={`rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                    siteSettings.whatsapp_position === "left"
                      ? "bg-[#25D366] text-white shadow-xs"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Bas à gauche
                </button>
                <button
                  type="button"
                  onClick={() => setSiteSettings({ ...siteSettings, whatsapp_position: "right" })}
                  className={`rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                    siteSettings.whatsapp_position !== "left"
                      ? "bg-[#25D366] text-white shadow-xs"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Bas à droite
                </button>
              </div>
              <p className="text-[10px] text-muted-foreground">
                Haut de page placé à l&apos;opposé.
              </p>
            </div>

            <div className="sm:col-span-2 flex items-center sm:pb-4">
              <a
                href={`https://wa.me/${cleanWhatsAppNumber(siteSettings.whatsapp_phone)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full h-10 inline-flex items-center justify-center gap-1.5 px-3 rounded-xl border border-border hover:border-[#25D366] hover:text-[#25D366] text-xs font-bold text-foreground bg-secondary/50 transition-colors"
              >
                <ExternalLink size={13} />
                <span>Tester</span>
              </a>
            </div>

            <div className="sm:col-span-2 flex items-center sm:pb-4">
              <Button
                type="submit"
                disabled={isSavingSettings}
                className="w-full h-10 bg-brand-orange text-white hover:bg-brand-orange/90 font-bold text-xs sm:text-sm cursor-pointer"
              >
                {isSavingSettings ? (
                  <>
                    <LoaderCircle size={14} className="animate-spin mr-1.5" />
                    ...
                  </>
                ) : (
                  <>
                    <Save size={14} className="mr-1.5" />
                    Enregistrer
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Instagram URL Row */}
          <div className="pt-3 border-t border-border/70 grid grid-cols-1 sm:grid-cols-12 gap-3 sm:gap-4 items-end">
            <div className="sm:col-span-9 space-y-1">
              <label className="block text-xs font-bold text-foreground">
                Lien Instagram / Instagram URL
              </label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center pointer-events-none">
                  <span className="grid size-5 place-items-center rounded-md bg-gradient-to-tr from-[#f09433] via-[#dc2743] to-[#bc1888] text-white">
                    <svg
                      viewBox="0 0 24 24"
                      className="size-3.5 fill-none stroke-current stroke-[2.2]"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
                      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
                    </svg>
                  </span>
                </div>
                <input
                  type="text"
                  value={siteSettings.instagram_url}
                  onChange={(e) =>
                    setSiteSettings({ ...siteSettings, instagram_url: e.target.value })
                  }
                  placeholder="https://instagram.com/teflook"
                  className="w-full h-10 pl-11 pr-3 rounded-xl border border-border bg-background text-xs sm:text-sm font-medium outline-none focus:border-[#dc2743]"
                />
              </div>
              <p className="text-[10px] text-muted-foreground">
                Affiché dans le pied de page de la boutique. Laissez vide pour utiliser le compte officiel par défaut.
              </p>
            </div>

            <div className="sm:col-span-3 flex items-center sm:pb-4">
              <a
                href={normalizeInstagramUrl(siteSettings.instagram_url) || DEFAULT_INSTAGRAM_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full h-10 inline-flex items-center justify-center gap-1.5 px-3 rounded-xl border border-border hover:border-[#dc2743] hover:text-[#dc2743] text-xs font-bold text-foreground bg-secondary/50 transition-colors"
              >
                <ExternalLink size={13} />
                <span>Ouvrir Instagram</span>
              </a>
            </div>
          </div>
        </form>
      </div>

      {/* 5. Delivery Pipeline & Moroccan Coverage */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Column 1 & 2: Process Steps */}
        <div className="lg:col-span-2 rounded-2xl border border-border bg-card p-6 shadow-xs">
          <h3 className="font-display text-base font-bold text-foreground mb-1">
            Circuit Opérationnel Cash on Delivery (Maroc)
          </h3>
          <p className="text-xs text-muted-foreground mb-6">
            Procédure standard pour garantir 0 impayé et un taux de livraison maximal
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-xs">
            <div className="rounded-xl border border-border p-4 bg-[#F9F8F6] relative">
              <div className="size-6 rounded-full bg-brand-teal text-white font-bold grid place-items-center mb-3 text-[11px]">
                1
              </div>
              <h4 className="font-bold text-foreground">Commande en ligne</h4>
              <p className="mt-1 text-muted-foreground text-[11px]">
                Le client valide son panier sans payer d'avance.
              </p>
            </div>

            <div className="rounded-xl border border-border p-4 bg-[#F9F8F6] relative">
              <div className="size-6 rounded-full bg-brand-teal text-white font-bold grid place-items-center mb-3 text-[11px]">
                2
              </div>
              <h4 className="font-bold text-foreground">Appel de confirmation</h4>
              <p className="mt-1 text-muted-foreground text-[11px]">
                Validation de l'adresse et de l'heure idéale de livraison.
              </p>
            </div>

            <div className="rounded-xl border border-border p-4 bg-[#F9F8F6] relative">
              <div className="size-6 rounded-full bg-brand-teal text-white font-bold grid place-items-center mb-3 text-[11px]">
                3
              </div>
              <h4 className="font-bold text-foreground">Expédition 24/48h</h4>
              <p className="mt-1 text-muted-foreground text-[11px]">
                Prise en charge par le transporteur local partout au Maroc.
              </p>
            </div>

            <div className="rounded-xl border border-emerald-300 p-4 bg-emerald-50/50 relative">
              <div className="size-6 rounded-full bg-emerald-600 text-white font-bold grid place-items-center mb-3 text-[11px]">
                4
              </div>
              <h4 className="font-bold text-emerald-950">Paiement en espèces</h4>
              <p className="mt-1 text-emerald-800 text-[11px]">
                Remise du colis et encaissement direct par le livreur.
              </p>
            </div>
          </div>
        </div>

        {/* Column 3: Quick Shortcuts */}
        <div className="rounded-2xl border border-border bg-card p-6 shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="font-display text-base font-bold text-foreground mb-1">
              Raccourcis Administrateur
            </h3>
            <p className="text-xs text-muted-foreground mb-4">
              Accès rapide aux modules de gestion
            </p>

            <div className="space-y-2.5">
              <Link
                href={ADMIN_ORDERS_PATH}
                className="flex items-center justify-between rounded-xl border border-border p-3 hover:border-brand-teal hover:bg-brand-mist/30 transition-all text-xs font-bold text-foreground"
              >
                <div className="flex items-center gap-2.5">
                  <Truck size={16} className="text-brand-orange" />
                  <span>Traiter les commandes COD</span>
                </div>
                <ArrowRight size={14} className="text-muted-foreground" />
              </Link>

              <Link
                href={ADMIN_CHECKOUT_FIELDS_PATH}
                className="flex items-center justify-between rounded-xl border border-border p-3 hover:border-brand-teal hover:bg-brand-mist/30 transition-all text-xs font-bold text-foreground"
              >
                <div className="flex items-center gap-2.5">
                  <ClipboardList size={16} className="text-brand-teal" />
                  <span>Personnaliser le formulaire COD</span>
                </div>
                <ArrowRight size={14} className="text-muted-foreground" />
              </Link>

              <Link
                href={ADMIN_PRODUCTS_PATH}
                className="flex items-center justify-between rounded-xl border border-border p-3 hover:border-brand-teal hover:bg-brand-mist/30 transition-all text-xs font-bold text-foreground"
              >
                <div className="flex items-center gap-2.5">
                  <Package size={16} className="text-brand-teal" />
                  <span>Ajouter / Modifier des produits</span>
                </div>
                <ArrowRight size={14} className="text-muted-foreground" />
              </Link>

              <Link
                href={ADMIN_CATEGORIES_PATH}
                className="flex items-center justify-between rounded-xl border border-border p-3 hover:border-brand-teal hover:bg-brand-mist/30 transition-all text-xs font-bold text-foreground"
              >
                <div className="flex items-center gap-2.5">
                  <FolderTree size={16} className="text-brand-teal" />
                  <span>Configurer les 6 catégories</span>
                </div>
                <ArrowRight size={14} className="text-muted-foreground" />
              </Link>

              <Link
                href={ADMIN_REVIEWS_PATH}
                className="flex items-center justify-between rounded-xl border border-border p-3 hover:border-brand-teal hover:bg-brand-mist/30 transition-all text-xs font-bold text-foreground"
              >
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 size={16} className="text-emerald-600" />
                  <span>Modérer les avis & Acheteurs vérifiés</span>
                </div>
                <ArrowRight size={14} className="text-muted-foreground" />
              </Link>

              <Link
                href={ADMIN_SETTINGS_PATH}
                className="flex items-center justify-between rounded-xl border border-border p-3 hover:border-brand-teal hover:bg-brand-mist/30 transition-all text-xs font-bold text-foreground"
              >
                <div className="flex items-center gap-2.5">
                  <MessageCircle size={16} className="text-[#25D366]" />
                  <span>Support & Numéro WhatsApp</span>
                </div>
                <ArrowRight size={14} className="text-muted-foreground" />
              </Link>
            </div>
          </div>

          <div className="pt-4 border-t border-border mt-4 text-[11px] text-muted-foreground text-center">
            TefLook E-Commerce v2.4 · Conçu pour les familles marocaines
          </div>
        </div>
      </div>
    </div>
  );
}
