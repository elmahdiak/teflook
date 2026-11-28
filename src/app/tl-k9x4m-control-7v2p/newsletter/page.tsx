"use client";

import React, { useCallback, useEffect, useState } from "react";
import {
  CheckCircle2,
  Copy,
  Database,
  Download,
  LoaderCircle,
  Mail,
  RefreshCw,
  Search,
  Trash2,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  NEWSLETTER_SQL_MIGRATION,
  type NewsletterStatus,
  type NewsletterSubscriber,
} from "@/lib/community-submissions";
import { supabase } from "@/lib/supabase";
import { cn } from "@/lib/utils";

export default function AdminNewsletterPage() {
  const [subscribers, setSubscribers] = useState<NewsletterSubscriber[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [needsMigration, setNeedsMigration] = useState(false);
  const [copiedSql, setCopiedSql] = useState(false);
  const [copiedEmails, setCopiedEmails] = useState(false);
  const [statusFilter, setStatusFilter] = useState<"all" | NewsletterStatus>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);

  const showToast = useCallback(
    (message: string, type: "success" | "error" = "success") => {
      setToast({ message, type });
      setTimeout(() => setToast(null), 3500);
    },
    []
  );

  const loadSubscribers = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/newsletter", { cache: "no-store" });
      if (res.ok) {
        const json = await res.json();
        setSubscribers(Array.isArray(json.subscribers) ? json.subscribers : []);
        setNeedsMigration(Boolean(json.needsMigration));
      }
    } catch (e) {
      console.error("Failed to fetch subscribers:", e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadSubscribers();

    const channel = supabase
      .channel("teflook-admin-newsletter")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "newsletter_subscribers" },
        () => {
          void loadSubscribers();
        }
      )
      .subscribe();

    const handleSync = () => {
      void loadSubscribers();
    };
    window.addEventListener("teflook:newsletter-subscribed", handleSync);

    let bc: BroadcastChannel | null = null;
    if (typeof BroadcastChannel !== "undefined") {
      bc = new BroadcastChannel("teflook_sync");
      bc.onmessage = (event) => {
        if (event.data?.type === "newsletter-subscribed") {
          void loadSubscribers();
        }
      };
    }

    return () => {
      window.removeEventListener("teflook:newsletter-subscribed", handleSync);
      if (bc) bc.close();
      void supabase.removeChannel(channel);
    };
  }, [loadSubscribers]);

  async function handleToggleStatus(sub: NewsletterSubscriber) {
    const nextStatus: NewsletterStatus =
      sub.status === "active" ? "unsubscribed" : "active";

    setSubscribers((prev) =>
      prev.map((s) => (s.id === sub.id ? { ...s, status: nextStatus } : s))
    );

    const res = await fetch("/api/newsletter", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: sub.id, status: nextStatus }),
    });

    if (!res.ok) {
      setSubscribers((prev) =>
        prev.map((s) => (s.id === sub.id ? sub : s))
      );
      showToast("Impossible de modifier le statut.", "error");
    } else {
      showToast(
        nextStatus === "active"
          ? `${sub.email} marqué comme actif.`
          : `${sub.email} marqué comme désabonné.`
      );
    }
  }

  async function handleDelete(sub: NewsletterSubscriber) {
    if (!window.confirm(`Supprimer l'abonné ${sub.email} ?`)) return;

    const res = await fetch(`/api/newsletter?id=${encodeURIComponent(sub.id)}`, {
      method: "DELETE",
    });

    if (res.ok) {
      setSubscribers((prev) => prev.filter((s) => s.id !== sub.id));
      showToast("Abonné supprimé.");
    } else {
      showToast("Erreur lors de la suppression.", "error");
    }
  }

  const filtered = subscribers.filter((sub) => {
    const matchesStatus = statusFilter === "all" || sub.status === statusFilter;
    const q = searchTerm.trim().toLowerCase();
    const matchesSearch = !q || sub.email.toLowerCase().includes(q);
    return matchesStatus && matchesSearch;
  });

  function handleExportCsv() {
    if (filtered.length === 0) {
      showToast("Aucun inscrit à exporter.", "error");
      return;
    }

    const header = "email,status,created_at";
    const rows = filtered.map((s) => {
      const safeEmail = `"${s.email.replace(/"/g, '""')}"`;
      const safeStatus = `"${s.status}"`;
      const safeDate = `"${s.created_at}"`;
      return `${safeEmail},${safeStatus},${safeDate}`;
    });

    const csv = [header, ...rows].join("\n");
    const blob = new Blob(["\uFEFF" + csv], {
      type: "text/csv;charset=utf-8;",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    const today = new Date().toISOString().slice(0, 10);
    link.href = url;
    link.download = `teflook-newsletter-${today}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    showToast(`${filtered.length} adresse(s) exportée(s) en CSV.`);
  }

  async function handleCopyEmails() {
    if (filtered.length === 0) return;
    try {
      await navigator.clipboard.writeText(filtered.map((s) => s.email).join(", "));
      setCopiedEmails(true);
      showToast(`${filtered.length} e-mail(s) copiés dans le presse-papiers.`);
      setTimeout(() => setCopiedEmails(false), 2500);
    } catch {}
  }

  async function handleCopySql() {
    try {
      await navigator.clipboard.writeText(NEWSLETTER_SQL_MIGRATION);
      setCopiedSql(true);
      setTimeout(() => setCopiedSql(false), 2500);
    } catch {}
  }

  const activeCount = subscribers.filter((s) => s.status === "active").length;
  const nowMonth = new Date().toISOString().slice(0, 7);
  const thisMonthCount = subscribers.filter((s) =>
    s.created_at.startsWith(nowMonth)
  ).length;

  return (
    <div className="space-y-6 max-w-6xl">
      {/* Toast */}
      {toast && (
        <div
          role="status"
          className={cn(
            "fixed top-5 end-5 z-50 flex items-center gap-2.5 px-5 py-3.5 rounded-2xl shadow-2xl text-xs sm:text-sm font-bold text-white animate-in fade-in slide-in-from-top-4",
            toast.type === "error" ? "bg-[#F67D56]" : "bg-[#4B9393]"
          )}
        >
          <CheckCircle2 size={17} />
          <span>{toast.message}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#4B9393]/15">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full bg-[#4B9393]/10 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-[#4B9393] mb-2">
            <Mail size={13} />
            <span>Base E-mailing TefLook</span>
          </div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-[#1A3C34]">
            Newsletter / Inscriptions
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-[#1A3C34]/70">
            Consultez, gérez et exportez les adresses e-mail collectées via le pied de page de votre boutique.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <Button
            type="button"
            variant="outline"
            disabled={isLoading}
            onClick={() => void loadSubscribers()}
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
            variant="outline"
            disabled={filtered.length === 0}
            onClick={() => void handleCopyEmails()}
            className="rounded-2xl border-[#4B9393]/25 bg-[#F3EFE6]/60 text-[#1A3C34] hover:bg-[#F3EFE6] text-xs font-semibold cursor-pointer"
          >
            <Copy size={14} className="me-1.5" />
            {copiedEmails ? "E-mails copiés !" : "Copier la liste"}
          </Button>
          <Button
            type="button"
            disabled={filtered.length === 0}
            onClick={handleExportCsv}
            className="rounded-2xl bg-[#F67D56] hover:bg-[#e56c45] text-white text-xs sm:text-sm font-bold shadow-sm cursor-pointer"
          >
            <Download size={14} className="me-1.5" />
            Exporter CSV ({filtered.length})
          </Button>
        </div>
      </div>

      {/* Migration Banner if needed */}
      {needsMigration && (
        <div className="rounded-3xl border border-[#4B9393]/25 bg-[#F3EFE6] p-5 space-y-2.5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-sm font-bold text-[#1A3C34]">
              <Database size={18} className="text-[#4B9393]" />
              <span>
                Table <code className="text-[#F67D56]">newsletter_subscribers</code> absente dans Supabase
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
            Exécutez ce script dans votre éditeur SQL Supabase pour activer l&apos;enregistrement des abonnés à la newsletter.
          </p>
        </div>
      )}

      {/* Subscriber Counts Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-2xl border border-[#4B9393]/15 bg-white p-5 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#1A3C34]/65">
              Total Inscrits
            </span>
            <p className="mt-1 font-display text-2xl font-extrabold text-[#1A3C34] tabular-nums">
              {subscribers.length.toLocaleString("fr-FR")}
            </p>
          </div>
          <div className="grid size-10 place-items-center rounded-xl bg-[#F3EFE6] text-[#4B9393]">
            <Users size={18} />
          </div>
        </div>

        <div className="rounded-2xl border border-[#4B9393]/15 bg-white p-5 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#1A3C34]/65">
              Abonnés Actifs
            </span>
            <p className="mt-1 font-display text-2xl font-extrabold text-[#4B9393] tabular-nums">
              {activeCount.toLocaleString("fr-FR")}
            </p>
          </div>
          <div className="grid size-10 place-items-center rounded-xl bg-[#4B9393]/12 text-[#4B9393]">
            <CheckCircle2 size={18} />
          </div>
        </div>

        <div className="rounded-2xl border border-[#4B9393]/15 bg-white p-5 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#1A3C34]/65">
              Nouveaux ce mois-ci
            </span>
            <p className="mt-1 font-display text-2xl font-extrabold text-[#F67D56] tabular-nums">
              {thisMonthCount.toLocaleString("fr-FR")}
            </p>
          </div>
          <div className="grid size-10 place-items-center rounded-xl bg-[#F67D56]/12 text-[#F67D56]">
            <Mail size={18} />
          </div>
        </div>
      </div>

      {/* Filters + Search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="inline-flex rounded-2xl border border-[#4B9393]/20 bg-[#F3EFE6]/70 p-1 text-xs font-bold">
          {[
            { id: "all" as const, label: `Tous (${subscribers.length})` },
            { id: "active" as const, label: `Actifs (${activeCount})` },
            {
              id: "unsubscribed" as const,
              label: `Désabonnés (${subscribers.length - activeCount})`,
            },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setStatusFilter(tab.id)}
              className={cn(
                "px-3 py-1.5 rounded-xl transition-all cursor-pointer",
                statusFilter === tab.id
                  ? "bg-[#4B9393] text-white shadow-xs"
                  : "text-[#1A3C34]/75 hover:text-[#1A3C34]"
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-72">
          <Search
            size={15}
            className="absolute inset-y-0 left-3 my-auto text-[#1A3C34]/45 pointer-events-none"
          />
          <input
            type="search"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Rechercher un e-mail..."
            className="w-full h-10 pl-9 pr-3 rounded-xl border border-[#4B9393]/20 bg-white text-xs text-[#1A3C34] outline-none focus:border-[#4B9393]"
          />
        </div>
      </div>

      {/* Subscribers Table */}
      <div className="rounded-2xl border border-[#4B9393]/20 bg-white overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-[#4B9393]/15 bg-[#F3EFE6]/60 text-[11px] uppercase tracking-wider text-[#1A3C34]/70 font-bold">
                <th className="py-3.5 px-5">Adresse E-mail</th>
                <th className="py-3.5 px-4">Statut</th>
                <th className="py-3.5 px-4">Date d&apos;inscription</th>
                <th className="py-3.5 px-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#4B9393]/10">
              {isLoading && subscribers.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-12 text-center text-[#1A3C34]/60">
                    <div className="inline-flex items-center gap-2">
                      <LoaderCircle size={16} className="animate-spin text-[#4B9393]" />
                      <span>Chargement des abonnés...</span>
                    </div>
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-12 text-center text-[#1A3C34]/60">
                    Aucun inscrit trouvé pour le moment.
                  </td>
                </tr>
              ) : (
                filtered.map((sub) => (
                  <tr
                    key={sub.id}
                    className="hover:bg-[#F3EFE6]/30 transition-colors"
                  >
                    <td className="py-3.5 px-5 font-semibold text-[#1A3C34]">
                      <a
                        href={`mailto:${sub.email}`}
                        className="hover:text-[#4B9393] transition-colors"
                      >
                        {sub.email}
                      </a>
                    </td>
                    <td className="py-3.5 px-4">
                      <button
                        type="button"
                        onClick={() => void handleToggleStatus(sub)}
                        title="Cliquer pour changer le statut"
                        className={cn(
                          "inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-bold border cursor-pointer transition-colors",
                          sub.status === "active"
                            ? "bg-[#4B9393]/12 border-[#4B9393]/30 text-[#4B9393]"
                            : "bg-slate-100 border-slate-200 text-slate-600"
                        )}
                      >
                        {sub.status === "active" ? "Actif" : "Désabonné"}
                      </button>
                    </td>
                    <td className="py-3.5 px-4 text-[#1A3C34]/75">
                      {new Date(sub.created_at).toLocaleString("fr-FR", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </td>
                    <td className="py-3.5 px-5 text-right">
                      <button
                        type="button"
                        onClick={() => void handleDelete(sub)}
                        aria-label={`Supprimer ${sub.email}`}
                        className="inline-flex items-center justify-center rounded-xl border border-red-200 bg-red-50/70 size-8 text-red-500 hover:bg-red-100 hover:text-red-700 transition-colors cursor-pointer"
                      >
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

