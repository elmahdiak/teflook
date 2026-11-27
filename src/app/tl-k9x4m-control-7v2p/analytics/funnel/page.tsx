"use client";

import React, { useCallback, useEffect, useState } from "react";
import {
  ArrowRight,
  BarChart3,
  CheckCircle2,
  Copy,
  Database,
  Eye,
  HeartHandshake,
  HelpCircle,
  LoaderCircle,
  Megaphone,
  RefreshCw,
  Save,
  ShoppingBag,
  Sparkles,
  TrendingUp,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  ANALYTICS_SQL_MIGRATION,
  DEFAULT_MARKETING_METRICS,
  formatDurationCompact,
  type AnalyticsDateRange,
  type FunnelAnalyticsData,
  type MarketingMetricsConfig,
} from "@/lib/analytics";
import { cn } from "@/lib/utils";

const RANGE_OPTIONS: { value: AnalyticsDateRange; label: string }[] = [
  { value: "7d", label: "7 derniers jours" },
  { value: "30d", label: "30 derniers jours" },
  { value: "all", label: "Tout le temps" },
];

interface KpiCardDescriptor {
  number: number;
  label: string;
  value: string;
  subtext: string;
  tooltip: string;
  accent?: "teal" | "coral" | "forest";
  breakdownPills?: { label: string; pct: number; count: number }[];
}

export default function AdminFunnelAnalyticsPage() {
  const [range, setRange] = useState<AnalyticsDateRange>("30d");
  const [data, setData] = useState<FunnelAnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [copiedSql, setCopiedSql] = useState(false);

  // Ads / Campaign Metrics Modal
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isSavingMetrics, setIsSavingMetrics] = useState(false);
  const [metricsForm, setMetricsForm] = useState<MarketingMetricsConfig>(
    DEFAULT_MARKETING_METRICS["30d"]
  );
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);

  const showToast = useCallback(
    (message: string, type: "success" | "error" = "success") => {
      setToast({ message, type });
      setTimeout(() => setToast(null), 4000);
    },
    []
  );

  const loadFunnel = useCallback(async (selectedRange: AnalyticsDateRange) => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/analytics/funnel?range=${selectedRange}`, {
        cache: "no-store",
      });
      if (res.ok) {
        const json = (await res.json()) as FunnelAnalyticsData;
        setData(json);
        setMetricsForm(json.marketingMetrics);
      }
    } catch (e) {
      console.error("Failed to fetch funnel analytics:", e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadFunnel(range);
  }, [range, loadFunnel]);

  async function handleSaveMetrics(e: React.FormEvent) {
    e.preventDefault();
    setIsSavingMetrics(true);
    try {
      const res = await fetch("/api/analytics/metrics", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...metricsForm, range }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        showToast(
          json?.error || "Impossible d'enregistrer les métriques Ads.",
          "error"
        );
        return;
      }

      setIsEditModalOpen(false);
      showToast("Données Ads & Campagnes enregistrées dans Supabase !");
      await loadFunnel(range);
    } catch {
      showToast("Erreur réseau lors de la sauvegarde.", "error");
    } finally {
      setIsSavingMetrics(false);
    }
  }

  async function handleCopySql() {
    try {
      await navigator.clipboard.writeText(ANALYTICS_SQL_MIGRATION);
      setCopiedSql(true);
      setTimeout(() => setCopiedSql(false), 2500);
    } catch {}
  }

  const k = data?.kpis;

  const awarenessKpis: KpiCardDescriptor[] = k
    ? [
        {
          number: 1,
          label: "Impressions (Visites totales du site)",
          value: k.impressions.toLocaleString("fr-FR"),
          subtext: "Nombre total de visites sur le site",
          tooltip:
            "Nombre total de fois où le site web a été visité sur la période sélectionnée.",
          accent: "teal",
        },
        {
          number: 2,
          label: "Reach / Portée (Visiteurs uniques)",
          value: k.reach.toLocaleString("fr-FR"),
          subtext: "Appareils / visiteurs uniques",
          tooltip:
            "Nombre total d'appareils individuels uniques ayant visité le site.",
          accent: "teal",
        },
        {
          number: 3,
          label: "Frequency / Fréquence",
          value: `${k.frequency.toFixed(2)}x`,
          subtext: "Visites moyennes par visiteur unique",
          tooltip:
            "Nombre moyen de fois où chaque visiteur individuel visite le site sur la période.",
          accent: "forest",
        },
      ]
    : [];

  const considerationKpis: KpiCardDescriptor[] = k
    ? [
        {
          number: 4,
          label: "Sources de trafic",
          value: k.uniqueTrafficSourcesCount.toLocaleString("fr-FR"),
          subtext: "Répartition des canaux d'acquisition",
          tooltip:
            "Origine des visiteurs (Direct, Instagram, Facebook/Ads, TikTok, WhatsApp, Google, etc.) sur la période sélectionnée.",
          accent: "teal",
          breakdownPills: k.trafficSourcesBreakdown.slice(0, 6).map((item) => ({
            label: item.source,
            pct: item.percentage,
            count: item.sessionsCount,
          })),
        },
        {
          number: 5,
          label: "Visiteurs première fois",
          value: k.firstTimeVisitors.toLocaleString("fr-FR"),
          subtext: `Sur ${k.totalUniqueVisitors.toLocaleString("fr-FR")} visiteurs uniques`,
          tooltip: "Visiteurs uniques dont la première visite a eu lieu sur la période",
          accent: "teal",
        },
        {
          number: 6,
          label: "Pages par visiteur",
          value: k.pagesPerVisitor.toFixed(2),
          subtext: `${k.totalPageViews.toLocaleString("fr-FR")} pages vues au total`,
          tooltip: "Total événements page_view ÷ Visiteurs uniques",
          accent: "forest",
        },
        {
          number: 7,
          label: "Temps moyen par page",
          value: formatDurationCompact(k.avgTimePerPageSeconds),
          subtext: "Durée moyenne par page consultée",
          tooltip: "Moyenne de duration_seconds issue des événements page_exit",
          accent: "forest",
        },
        {
          number: 8,
          label: "Inscriptions Email / Newsletter",
          value: k.emailNewsletterSignups.toLocaleString("fr-FR"),
          subtext: "Newsletter footer + e-mails commandes",
          tooltip: "Événements newsletter_signup + e-mails uniques capturés",
          accent: "coral",
        },
      ]
    : [];

  const conversionKpis: KpiCardDescriptor[] = k
    ? [
        {
          number: 9,
          label: "Nombre de conversions",
          value: k.conversionsCount.toLocaleString("fr-FR"),
          subtext: `${Math.round(k.totalRevenueMad).toLocaleString("fr-FR")} MAD générés`,
          tooltip: "Nombre total de commandes COD valides dans public.orders",
          accent: "coral",
        },
        {
          number: 10,
          label: "Temps jusqu'à conversion",
          value: formatDurationCompact(k.avgTimeToConversionSeconds),
          subtext: "De la 1re visite à la commande COD",
          tooltip: "Délai moyen entre le premier page_view et order_completed",
          accent: "teal",
        },
        {
          number: 11,
          label: "Coût par conversion (CPA)",
          value: `${k.costPerConversionMad.toFixed(2)} MAD`,
          subtext: `Budget Ads : ${metricsForm.ad_spend_mad.toLocaleString("fr-FR")} MAD`,
          tooltip: "ad_spend_mad ÷ Nombre de conversions",
          accent: "coral",
        },
        {
          number: 12,
          label: "Points de contact moyens",
          value: k.avgTouchpoints.toFixed(2),
          subtext: "Visites / sessions avant achat",
          tooltip: "Moyenne des sessions (session_id) avant order_completed",
          accent: "forest",
        },
        {
          number: 13,
          label: "Panier moyen (AOV)",
          value: `${Math.round(k.averageOrderSizeMad).toLocaleString("fr-FR")} MAD`,
          subtext: "Chiffre d'affaires ÷ Commandes",
          tooltip: "Revenu total ÷ Nombre de commandes sur la période",
          accent: "teal",
        },
        {
          number: 14,
          label: "Abandon de panier",
          value: k.abandonedCartVisitorsCount.toLocaleString("fr-FR"),
          subtext: `${k.abandonedCartVisitorsCount} ${
            k.abandonedCartVisitorsCount === 1
              ? "visiteur a ajouté"
              : "visiteurs ont ajouté"
          } au panier sans acheter`,
          tooltip:
            "Nombre de visiteurs uniques ayant ajouté un produit au panier ou ouvert le formulaire sans finaliser d'achat (exclut ceux qui sont revenus acheter).",
          accent: "coral",
        },
      ]
    : [];

  const loyaltyKpis: KpiCardDescriptor[] = k
    ? [
        {
          number: 15,
          label: "Taux d'achat répété",
          value: `${k.repeatPurchaseRatePct.toFixed(1)}%`,
          subtext: `${k.repeatCustomersCount} récurrents / ${k.uniqueCustomersCount} clients`,
          tooltip: "% de numéros de téléphone (customer_phone) avec 2+ commandes",
          accent: "teal",
        },
        {
          number: 16,
          label: "Délai moyen entre achats",
          value:
            k.avgDaysBetweenPurchases !== null
              ? `${k.avgDaysBetweenPurchases.toFixed(1)} j`
              : "—",
          subtext: "Jours moyens entre commandes successives",
          tooltip: "Intervalle moyen en jours pour les clients récurrents",
          accent: "forest",
        },
        {
          number: 17,
          label: "Commandes par client",
          value: k.ordersPerCustomer.toFixed(2),
          subtext: "Fréquence d'achat par numéro unique",
          tooltip: "Total commandes ÷ Clients uniques (customer_phone)",
          accent: "teal",
        },
        {
          number: 18,
          label: "Taux d'activation de compte",
          value: `${k.accountActivationRatePct.toFixed(1)}%`,
          subtext: `${k.accountActivationsCount.toLocaleString("fr-FR")} comptes activés`,
          tooltip: "account_activations ÷ Inscriptions / acheteurs",
          accent: "forest",
        },
        {
          number: 19,
          label: "Programme fidélité / parrainage",
          value: k.loyaltyRewardsEngagements.toLocaleString("fr-FR"),
          subtext: "Campagnes fidélité + codes promo/parrainage",
          tooltip: "marketing_metrics.rewards_engagements + codes parrainage/promo",
          accent: "coral",
        },
      ]
    : [];

  const stagesMeta = [
    {
      stageTitle: "Étape 1 — Awareness (Notoriété)",
      subtitle: "Visites globales, appareils uniques et fréquence calculés depuis analytics_events",
      icon: Megaphone,
      badgeClass: "bg-[#4B9393]/12 text-[#4B9393] border-[#4B9393]/25",
      kpis: awarenessKpis,
    },
    {
      stageTitle: "Étape 2 — Consideration (Considération)",
      subtitle: "Intérêt parental, exploration du catalogue et capture e-mail",
      icon: Eye,
      badgeClass: "bg-[#F3EFE6] text-[#1A3C34] border-[#4B9393]/25",
      kpis: considerationKpis,
    },
    {
      stageTitle: "Étape 3 — Conversion",
      subtitle: "Performance du tunnel Cash on Delivery et rentabilité Ads",
      icon: ShoppingBag,
      badgeClass: "bg-[#F67D56]/12 text-[#F67D56] border-[#F67D56]/25",
      kpis: conversionKpis,
    },
    {
      stageTitle: "Étape 4 — Loyalty (Fidélisation)",
      subtitle: "Réachat, fréquence client et engagement long terme",
      icon: HeartHandshake,
      badgeClass: "bg-[#1A3C34]/10 text-[#1A3C34] border-[#1A3C34]/20",
      kpis: loyaltyKpis,
    },
  ];

  const maxFunnelVol = Math.max(
    1,
    ...(data?.stages.map((s) => s.primaryMetricValue) || [1])
  );

  return (
    <div className="space-y-8 max-w-6xl">
      {/* Toast Notification */}
      {toast && (
        <div
          role="status"
          className={cn(
            "fixed top-5 end-5 z-50 flex items-center gap-3 px-5 py-3.5 rounded-2xl shadow-2xl text-xs sm:text-sm font-bold text-white animate-in fade-in slide-in-from-top-4",
            toast.type === "error" ? "bg-[#F67D56]" : "bg-[#4B9393]"
          )}
        >
          <CheckCircle2 size={18} />
          <span>{toast.message}</span>
        </div>
      )}

      {/* Ads / Campaigns Edit Modal */}
      {isEditModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="edit-metrics-title"
        >
          <div
            className="fixed inset-0 bg-[#1A3C34]/50 backdrop-blur-xs"
            onClick={() => !isSavingMetrics && setIsEditModalOpen(false)}
            aria-hidden="true"
          />
          <form
            onSubmit={handleSaveMetrics}
            className="relative z-10 w-full max-w-lg rounded-3xl border border-[#4B9393]/25 bg-white p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-150"
          >
            <div className="flex items-center justify-between pb-3 border-b border-[#4B9393]/15">
              <div>
                <h2
                  id="edit-metrics-title"
                  className="font-display text-lg font-bold text-[#1A3C34]"
                >
                  Éditer données Ads / Campagnes
                </h2>
                <p className="text-xs text-[#1A3C34]/65 mt-0.5">
                  Période active :{" "}
                  <strong className="text-[#4B9393]">
                    {RANGE_OPTIONS.find((r) => r.value === range)?.label}
                  </strong>
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsEditModalOpen(false)}
                className="grid size-8 place-items-center rounded-full text-[#1A3C34]/60 hover:bg-[#F3EFE6] cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block font-bold text-[#1A3C34] mb-1">
                  Budget Ads dépensé (MAD)
                </label>
                <input
                  type="number"
                  min={0}
                  step="0.01"
                  value={metricsForm.ad_spend_mad}
                  onChange={(e) =>
                    setMetricsForm((prev) => ({
                      ...prev,
                      ad_spend_mad: Number(e.target.value) || 0,
                    }))
                  }
                  className="w-full h-10 px-3 rounded-xl border border-[#4B9393]/25 bg-[#F3EFE6]/35 focus:bg-white text-sm text-[#1A3C34] outline-none focus:border-[#4B9393]"
                />
              </div>

              <div>
                <label className="block font-bold text-[#1A3C34] mb-1">
                  Activations de compte
                </label>
                <input
                  type="number"
                  min={0}
                  value={metricsForm.account_activations}
                  onChange={(e) =>
                    setMetricsForm((prev) => ({
                      ...prev,
                      account_activations: Number(e.target.value) || 0,
                    }))
                  }
                  className="w-full h-10 px-3 rounded-xl border border-[#4B9393]/25 bg-[#F3EFE6]/35 focus:bg-white text-sm text-[#1A3C34] outline-none focus:border-[#4B9393]"
                />
              </div>

              <div>
                <label className="block font-bold text-[#1A3C34] mb-1">
                  Engagements fidélité / parrainage
                </label>
                <input
                  type="number"
                  min={0}
                  value={metricsForm.rewards_engagements}
                  onChange={(e) =>
                    setMetricsForm((prev) => ({
                      ...prev,
                      rewards_engagements: Number(e.target.value) || 0,
                    }))
                  }
                  className="w-full h-10 px-3 rounded-xl border border-[#4B9393]/25 bg-[#F3EFE6]/35 focus:bg-white text-sm text-[#1A3C34] outline-none focus:border-[#4B9393]"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-[#4B9393]/15">
              <Button
                type="button"
                variant="outline"
                disabled={isSavingMetrics}
                onClick={() => setIsEditModalOpen(false)}
                className="rounded-xl text-xs cursor-pointer"
              >
                Annuler
              </Button>
              <Button
                type="submit"
                disabled={isSavingMetrics}
                className="rounded-xl bg-[#F67D56] hover:bg-[#e56c45] text-white text-xs font-bold shadow-sm cursor-pointer"
              >
                {isSavingMetrics ? (
                  <LoaderCircle size={14} className="animate-spin me-1.5" />
                ) : (
                  <Save size={14} className="me-1.5" />
                )}
                Enregistrer dans Supabase
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* Header & Top Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-5 border-b border-[#4B9393]/15">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full bg-[#4B9393]/10 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-[#4B9393] mb-2">
            <BarChart3 size={13} />
            <span>Analytics TefLook</span>
          </div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-[#1A3C34]">
            Funnel Analytics (4 Étapes · 19 KPIs)
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-[#1A3C34]/70">
            Visualisez l&apos;acquisition Meta/Google Ads, le comportement boutique, les conversions COD et la fidélisation client.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          {/* Date Range Filter */}
          <div className="inline-flex rounded-2xl border border-[#4B9393]/20 bg-[#F3EFE6]/70 p-1 text-xs font-bold">
            {RANGE_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setRange(opt.value)}
                className={cn(
                  "px-3 py-1.5 rounded-xl transition-all cursor-pointer",
                  range === opt.value
                    ? "bg-[#4B9393] text-white shadow-xs"
                    : "text-[#1A3C34]/75 hover:text-[#1A3C34]"
                )}
              >
                {opt.label}
              </button>
            ))}
          </div>

          <Button
            type="button"
            variant="outline"
            disabled={isLoading}
            onClick={() => void loadFunnel(range)}
            className="rounded-2xl border-[#4B9393]/25 bg-white text-[#1A3C34] hover:bg-[#F3EFE6] text-xs font-semibold cursor-pointer"
          >
            {isLoading ? (
              <LoaderCircle size={14} className="animate-spin me-1.5" />
            ) : (
              <RefreshCw size={14} className="me-1.5" />
            )}
            Actualiser
          </Button>

          <Button
            type="button"
            onClick={() => setIsEditModalOpen(true)}
            className="rounded-2xl bg-[#F67D56] hover:bg-[#e56c45] text-white text-xs sm:text-sm font-bold shadow-sm cursor-pointer"
          >
            <Sparkles size={14} className="me-1.5" />
            Éditer données Ads / Campagnes
          </Button>
        </div>
      </div>

      {/* Optional Supabase Migration Banner */}
      {data?.needsMigration && (
        <div className="rounded-3xl border border-[#4B9393]/25 bg-[#F3EFE6] p-5 space-y-2.5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 text-sm font-bold text-[#1A3C34]">
              <Database size={18} className="text-[#4B9393]" />
              <span>
                Tables Supabase manquantes :{" "}
                <code className="text-[#F67D56]">
                  {data.missingTables.join(", ")}
                </code>
              </span>
            </div>
            <button
              type="button"
              onClick={() => void handleCopySql()}
              className="inline-flex items-center gap-1.5 rounded-full bg-white border border-[#4B9393]/25 px-3 py-1 text-xs font-bold text-[#4B9393] hover:bg-[#4B9393] hover:text-white transition-colors cursor-pointer"
            >
              <Copy size={13} />
              <span>{copiedSql ? "SQL copié !" : "Copier le SQL Supabase"}</span>
            </button>
          </div>
          <p className="text-xs text-[#1A3C34]/75">
            Exécutez cette migration dans votre éditeur SQL Supabase pour commencer l&apos;enregistrement automatique des événements visiteurs et des données campagnes.
          </p>
        </div>
      )}

      {isLoading && !data ? (
        <div className="py-20 grid place-items-center">
          <LoaderCircle size={30} className="animate-spin text-[#4B9393]" />
        </div>
      ) : (
        <>
          {/* Visual 4-Stage Conversion Funnel Bar */}
          {data && (
            <section className="rounded-3xl border border-[#4B9393]/20 bg-[#F3EFE6]/65 p-5 sm:p-6 shadow-xs space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2 text-sm font-bold text-[#1A3C34]">
                  <TrendingUp size={17} className="text-[#4B9393]" />
                  <span>Vue d&apos;ensemble de l&apos;Entonnoir de Conversion</span>
                </div>
                <span className="text-[11px] font-semibold text-[#1A3C34]/65">
                  Taux de passage & déperdition par étape
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 items-stretch">
                {data.stages.map((stage, idx) => {
                  const barPct = Math.max(
                    8,
                    Math.round((stage.primaryMetricValue / maxFunnelVol) * 100)
                  );
                  const barColors = [
                    "bg-[#4B9393]",
                    "bg-[#3B7C7C]",
                    "bg-[#F67D56]",
                    "bg-[#1A3C34]",
                  ];
                  return (
                    <div
                      key={stage.key}
                      className="relative rounded-2xl border border-[#4B9393]/15 bg-white p-4 flex flex-col justify-between gap-3 shadow-2xs"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-[#4B9393]">
                          {stage.title}
                        </span>
                        {stage.conversionToNextPct !== null && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-[#F3EFE6] px-2 py-0.5 text-[10px] font-bold text-[#1A3C34] tabular-nums">
                            <ArrowRight size={10} className="text-[#F67D56]" />
                            {stage.conversionToNextPct}%
                          </span>
                        )}
                      </div>

                      <div>
                        <div className="font-display text-2xl font-extrabold text-[#1A3C34] tabular-nums">
                          {stage.primaryFormatted}
                        </div>
                        <p className="text-[11px] font-semibold text-[#1A3C34]/70 mt-0.5">
                          {stage.primaryMetricLabel}
                        </p>
                      </div>

                      <div className="space-y-1.5">
                        <div className="h-2 w-full rounded-full bg-[#F3EFE6] overflow-hidden">
                          <div
                            className={cn(
                              "h-full rounded-full transition-all duration-500",
                              barColors[idx] || "bg-[#4B9393]"
                            )}
                            style={{ width: `${barPct}%` }}
                          />
                        </div>
                        <p className="text-[11px] text-[#1A3C34]/60">
                          {stage.secondaryNote}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          )}

          {/* 4 Clean Architectural Stage Cards with All 19 Exact KPIs */}
          <div className="space-y-6">
            {stagesMeta.map((stage) => {
              const Icon = stage.icon;
              return (
                <section
                  key={stage.stageTitle}
                  className="rounded-3xl border border-[#4B9393]/20 bg-white p-5 sm:p-7 shadow-xs space-y-5"
                >
                  <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-[#4B9393]/12">
                    <div className="flex items-center gap-3">
                      <div
                        className={cn(
                          "grid size-10 place-items-center rounded-2xl border shrink-0",
                          stage.badgeClass
                        )}
                      >
                        <Icon size={18} />
                      </div>
                      <div>
                        <h2 className="font-display text-lg sm:text-xl font-bold text-[#1A3C34]">
                          {stage.stageTitle}
                        </h2>
                        <p className="text-xs text-[#1A3C34]/65">
                          {stage.subtitle}
                        </p>
                      </div>
                    </div>
                    <span className="rounded-full bg-[#F3EFE6] px-3 py-1 text-[11px] font-bold text-[#1A3C34]/80">
                      {stage.kpis.length} KPIs
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {stage.kpis.map((kpi) => (
                      <div
                        key={kpi.number}
                        className="rounded-2xl border border-[#4B9393]/12 bg-[#F3EFE6]/45 p-4 flex flex-col justify-between gap-2.5 hover:border-[#4B9393]/35 transition-colors"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <span className="text-xs font-bold text-[#1A3C34]/85 leading-snug">
                            <span className="text-[#4B9393] me-1 tabular-nums">
                              #{kpi.number}
                            </span>
                            {kpi.label}
                          </span>
                          <span
                            title={kpi.tooltip}
                            className="text-[#4B9393]/75 hover:text-[#4B9393] shrink-0 cursor-help"
                          >
                            <HelpCircle size={14} />
                          </span>
                        </div>

                        <div
                          className={cn(
                            "font-display text-2xl font-extrabold tabular-nums tracking-tight",
                            kpi.accent === "coral"
                              ? "text-[#F67D56]"
                              : kpi.accent === "teal"
                                ? "text-[#4B9393]"
                                : "text-[#1A3C34]"
                          )}
                        >
                          {kpi.value}
                        </div>

                        {kpi.breakdownPills && kpi.breakdownPills.length > 0 && (
                          <div className="flex flex-wrap gap-1.5">
                            {kpi.breakdownPills.map((pill) => (
                              <span
                                key={pill.label}
                                title={`${pill.count} visite(s)`}
                                className="inline-flex items-center gap-1 rounded-full border border-[#4B9393]/20 bg-white px-2.5 py-0.5 text-[11px] font-bold text-[#1A3C34]"
                              >
                                <span>{pill.label}:</span>
                                <span className="text-[#4B9393] tabular-nums">
                                  {pill.pct}%
                                </span>
                              </span>
                            ))}
                          </div>
                        )}

                        <p className="text-[11px] text-[#1A3C34]/65 leading-snug">
                          {kpi.subtext}
                        </p>
                      </div>
                    ))}
                  </div>
                </section>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
