"use client";

import React, { useCallback, useEffect, useState } from "react";
import {
  CheckCircle2,
  Copy,
  Database,
  Eye,
  Inbox,
  LoaderCircle,
  Mail,
  MailOpen,
  Phone,
  RefreshCw,
  Search,
  Trash2,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  CONTACT_MESSAGES_SQL_MIGRATION,
  type ContactMessageItem,
  type ContactMessageStatus,
} from "@/lib/community-submissions";
import { supabase } from "@/lib/supabase";
import { cn } from "@/lib/utils";

export default function AdminContactMessagesPage() {
  const [messages, setMessages] = useState<ContactMessageItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [needsMigration, setNeedsMigration] = useState(false);
  const [copiedSql, setCopiedSql] = useState(false);
  const [statusFilter, setStatusFilter] = useState<"all" | ContactMessageStatus>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedMessage, setSelectedMessage] =
    useState<ContactMessageItem | null>(null);
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

  const loadMessages = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/contact", { cache: "no-store" });
      if (res.ok) {
        const json = await res.json();
        setMessages(Array.isArray(json.messages) ? json.messages : []);
        setNeedsMigration(Boolean(json.needsMigration));
      }
    } catch (e) {
      console.error("Failed to fetch contact messages:", e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadMessages();

    const channel = supabase
      .channel("teflook-admin-contact-messages")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "contact_messages" },
        () => {
          void loadMessages();
        }
      )
      .subscribe();

    const handleSync = () => {
      void loadMessages();
    };
    window.addEventListener("teflook:contact-message-created", handleSync);

    let bc: BroadcastChannel | null = null;
    if (typeof BroadcastChannel !== "undefined") {
      bc = new BroadcastChannel("teflook_sync");
      bc.onmessage = (event) => {
        if (event.data?.type === "contact-message-created") {
          void loadMessages();
        }
      };
    }

    return () => {
      window.removeEventListener("teflook:contact-message-created", handleSync);
      if (bc) bc.close();
      void supabase.removeChannel(channel);
    };
  }, [loadMessages]);

  async function handleToggleRead(msg: ContactMessageItem) {
    const nextStatus: ContactMessageStatus =
      msg.status === "read" ? "unread" : "read";

    setMessages((prev) =>
      prev.map((m) => (m.id === msg.id ? { ...m, status: nextStatus } : m))
    );
    if (selectedMessage?.id === msg.id) {
      setSelectedMessage({ ...selectedMessage, status: nextStatus });
    }

    const res = await fetch("/api/contact", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: msg.id, status: nextStatus }),
    });
    const json = await res.json().catch(() => null);

    if (!res.ok) {
      setMessages((prev) => prev.map((m) => (m.id === msg.id ? msg : m)));
      if (selectedMessage?.id === msg.id) {
        setSelectedMessage(msg);
      }
      if (json?.needsMigration) {
        setNeedsMigration(true);
      }
      showToast(
        json?.error || "Impossible de mettre à jour le statut.",
        "error"
      );
    } else {
      showToast(
        nextStatus === "read"
          ? "Message marqué comme lu."
          : "Message marqué comme non lu."
      );
    }
  }

  async function handleOpenMessage(msg: ContactMessageItem) {
    setSelectedMessage(msg);
    if (msg.status === "unread") {
      await handleToggleRead(msg);
    }
  }

  async function handleDelete(msg: ContactMessageItem) {
    if (
      !window.confirm(
        `Supprimer définitivement le message de ${msg.name} ?`
      )
    ) {
      return;
    }

    const res = await fetch(`/api/contact?id=${encodeURIComponent(msg.id)}`, {
      method: "DELETE",
    });

    if (res.ok) {
      setMessages((prev) => prev.filter((m) => m.id !== msg.id));
      if (selectedMessage?.id === msg.id) {
        setSelectedMessage(null);
      }
      showToast("Message supprimé.");
    } else {
      showToast("Erreur lors de la suppression.", "error");
    }
  }

  async function handleCopySql() {
    try {
      await navigator.clipboard.writeText(CONTACT_MESSAGES_SQL_MIGRATION);
      setCopiedSql(true);
      setTimeout(() => setCopiedSql(false), 2500);
    } catch {}
  }

  const unreadCount = messages.filter((m) => m.status === "unread").length;

  const filtered = messages.filter((msg) => {
    const matchesStatus =
      statusFilter === "all" || msg.status === statusFilter;
    const q = searchTerm.trim().toLowerCase();
    const matchesSearch =
      !q ||
      msg.name.toLowerCase().includes(q) ||
      msg.email.toLowerCase().includes(q) ||
      (msg.phone && msg.phone.toLowerCase().includes(q)) ||
      msg.message.toLowerCase().includes(q);
    return matchesStatus && matchesSearch;
  });

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
            <Inbox size={13} />
            <span>Boîte de Réception Client</span>
          </div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-[#1A3C34]">
            Messages de Contact
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-[#1A3C34]/70">
            Consultez et traitez les demandes envoyées depuis la page Contactez-Nous.
          </p>
        </div>

        <Button
          type="button"
          variant="outline"
          disabled={isLoading}
          onClick={() => void loadMessages()}
          className="rounded-2xl border-[#4B9393]/25 bg-white text-[#1A3C34] hover:bg-[#F3EFE6] text-xs font-semibold cursor-pointer self-start sm:self-auto"
        >
          {isLoading ? (
            <LoaderCircle size={14} className="animate-spin me-1.5" />
          ) : (
            <RefreshCw size={14} className="me-1.5" />
          )}
          Actualiser
        </Button>
      </div>

      {/* Migration Banner if needed */}
      {needsMigration && (
        <div className="rounded-3xl border border-[#4B9393]/25 bg-[#F3EFE6] p-5 space-y-2.5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-sm font-bold text-[#1A3C34]">
              <Database size={18} className="text-[#4B9393]" />
              <span>
                Mise à jour / création table <code className="text-[#F67D56]">contact_messages</code> requise
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
            Exécutez ce script dans votre éditeur SQL Supabase pour activer la gestion complète et le statut Lu / Non lu.
          </p>
        </div>
      )}

      {/* Filter Tabs + Search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="inline-flex rounded-2xl border border-[#4B9393]/20 bg-[#F3EFE6]/70 p-1 text-xs font-bold">
          {[
            { id: "all" as const, label: `Tous (${messages.length})` },
            { id: "unread" as const, label: `Non lus (${unreadCount})` },
            {
              id: "read" as const,
              label: `Lus (${messages.length - unreadCount})`,
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

        <div className="relative w-full sm:w-80">
          <Search
            size={15}
            className="absolute inset-y-0 left-3 my-auto text-[#1A3C34]/45 pointer-events-none"
          />
          <input
            type="search"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Rechercher nom, e-mail, téléphone, message..."
            className="w-full h-10 pl-9 pr-3 rounded-xl border border-[#4B9393]/20 bg-white text-xs text-[#1A3C34] outline-none focus:border-[#4B9393]"
          />
        </div>
      </div>

      {/* Messages Table */}
      <div className="rounded-2xl border border-[#4B9393]/20 bg-white overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-[#4B9393]/15 bg-[#F3EFE6]/60 text-[11px] uppercase tracking-wider text-[#1A3C34]/70 font-bold">
                <th className="py-3.5 px-5">Nom &amp; Contact</th>
                <th className="py-3.5 px-4">Message</th>
                <th className="py-3.5 px-4">Date</th>
                <th className="py-3.5 px-4">Statut</th>
                <th className="py-3.5 px-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#4B9393]/10">
              {isLoading && messages.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-[#1A3C34]/60">
                    <div className="inline-flex items-center gap-2">
                      <LoaderCircle size={16} className="animate-spin text-[#4B9393]" />
                      <span>Chargement des messages...</span>
                    </div>
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-[#1A3C34]/60">
                    Aucun message de contact trouvé.
                  </td>
                </tr>
              ) : (
                filtered.map((msg) => {
                  const isUnread = msg.status === "unread";
                  return (
                    <tr
                      key={msg.id}
                      className={cn(
                        "transition-colors",
                        isUnread
                          ? "bg-[#F3EFE6]/35 hover:bg-[#F3EFE6]/65"
                          : "hover:bg-[#F3EFE6]/25"
                      )}
                    >
                      <td className="py-4 px-5 align-top">
                        <div className="flex items-center gap-2">
                          {isUnread && (
                            <span
                              aria-label="Non lu"
                              className="size-2 shrink-0 rounded-full bg-[#F67D56]"
                            />
                          )}
                          <span className="font-bold text-[#1A3C34] text-sm">
                            {msg.name}
                          </span>
                        </div>
                        <div className="mt-1 space-y-0.5 text-[11px]">
                          <a
                            href={`mailto:${msg.email}`}
                            className="flex items-center gap-1.5 text-[#4B9393] hover:underline"
                          >
                            <Mail size={11} />
                            <span>{msg.email}</span>
                          </a>
                          {msg.phone && (
                            <a
                              href={`tel:${msg.phone}`}
                              className="flex items-center gap-1.5 text-[#1A3C34]/75 hover:text-[#4B9393]"
                            >
                              <Phone size={11} />
                              <span>{msg.phone}</span>
                            </a>
                          )}
                        </div>
                      </td>

                      <td className="py-4 px-4 align-top max-w-md">
                        <button
                          type="button"
                          onClick={() => void handleOpenMessage(msg)}
                          className="text-left group cursor-pointer"
                        >
                          <p
                            className={cn(
                              "line-clamp-2 text-[#1A3C34]/85 group-hover:text-[#4B9393] transition-colors leading-relaxed",
                              isUnread && "font-semibold text-[#1A3C34]"
                            )}
                          >
                            {msg.message}
                          </p>
                          <span className="text-[10px] font-bold text-[#4B9393] inline-flex items-center gap-1 mt-1">
                            <Eye size={11} />
                            Lire le message complet
                          </span>
                        </button>
                      </td>

                      <td className="py-4 px-4 align-top whitespace-nowrap text-[#1A3C34]/75">
                        {new Date(msg.created_at).toLocaleString("fr-FR", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </td>

                      <td className="py-4 px-4 align-top whitespace-nowrap">
                        <span
                          className={cn(
                            "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-bold border",
                            isUnread
                              ? "bg-[#F67D56]/12 border-[#F67D56]/30 text-[#F67D56]"
                              : "bg-[#4B9393]/12 border-[#4B9393]/25 text-[#4B9393]"
                          )}
                        >
                          {isUnread ? (
                            <>
                              <Mail size={11} />
                              Non lu
                            </>
                          ) : (
                            <>
                              <MailOpen size={11} />
                              Lu
                            </>
                          )}
                        </span>
                      </td>

                      <td className="py-4 px-5 align-top text-right whitespace-nowrap">
                        <div className="inline-flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => void handleToggleRead(msg)}
                            title={
                              isUnread
                                ? "Marquer comme lu"
                                : "Marquer comme non lu"
                            }
                            className="inline-flex items-center gap-1 rounded-xl border border-[#4B9393]/25 bg-[#F3EFE6]/60 px-2.5 h-8 text-[11px] font-bold text-[#1A3C34] hover:bg-[#4B9393] hover:text-white transition-colors cursor-pointer"
                          >
                            {isUnread ? (
                              <>
                                <MailOpen size={13} />
                                <span className="hidden md:inline">
                                  Marquer lu
                                </span>
                              </>
                            ) : (
                              <>
                                <Mail size={13} />
                                <span className="hidden md:inline">
                                  Non lu
                                </span>
                              </>
                            )}
                          </button>

                          <button
                            type="button"
                            onClick={() => void handleDelete(msg)}
                            aria-label={`Supprimer le message de ${msg.name}`}
                            className="inline-flex items-center justify-center rounded-xl border border-red-200 bg-red-50/70 size-8 text-red-500 hover:bg-red-100 hover:text-red-700 transition-colors cursor-pointer"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Message Detail Modal */}
      {selectedMessage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
        >
          <div
            className="fixed inset-0 bg-[#1A3C34]/50 backdrop-blur-xs"
            onClick={() => setSelectedMessage(null)}
            aria-hidden="true"
          />
          <div className="relative z-10 w-full max-w-lg rounded-3xl border border-[#4B9393]/20 bg-white p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-start justify-between gap-3 pb-3 border-b border-[#4B9393]/15">
              <div>
                <h2 className="font-display text-lg font-bold text-[#1A3C34]">
                  Message de {selectedMessage.name}
                </h2>
                <p className="text-xs text-[#1A3C34]/65 mt-0.5">
                  Reçu le{" "}
                  {new Date(selectedMessage.created_at).toLocaleString("fr-FR", {
                    day: "2-digit",
                    month: "long",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedMessage(null)}
                className="grid size-8 place-items-center rounded-full text-[#1A3C34]/60 hover:bg-[#F3EFE6] cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            <div className="rounded-2xl border border-[#4B9393]/15 bg-[#F3EFE6]/50 p-3.5 text-xs space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[#1A3C34]/65">E-mail :</span>
                <a
                  href={`mailto:${selectedMessage.email}`}
                  className="font-bold text-[#4B9393] hover:underline"
                >
                  {selectedMessage.email}
                </a>
              </div>
              {selectedMessage.phone && (
                <div className="flex items-center justify-between">
                  <span className="text-[#1A3C34]/65">Téléphone :</span>
                  <a
                    href={`tel:${selectedMessage.phone}`}
                    className="font-bold text-[#1A3C34]"
                  >
                    {selectedMessage.phone}
                  </a>
                </div>
              )}
            </div>

            <div className="rounded-2xl border border-[#4B9393]/15 bg-white p-4 text-sm text-[#1A3C34] leading-relaxed whitespace-pre-wrap max-h-64 overflow-y-auto">
              {selectedMessage.message}
            </div>

            <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-[#4B9393]/15">
              <Button
                type="button"
                variant="outline"
                onClick={() => void handleToggleRead(selectedMessage)}
                className="rounded-xl text-xs cursor-pointer"
              >
                {selectedMessage.status === "read"
                  ? "Marquer comme non lu"
                  : "Marquer comme lu"}
              </Button>

              <div className="flex items-center gap-2">
                <a
                  href={`mailto:${selectedMessage.email}?subject=${encodeURIComponent(
                    "Réponse à votre message — Maison TefLook"
                  )}`}
                  className="inline-flex h-9 items-center gap-1.5 rounded-xl bg-[#4B9393] px-4 text-xs font-bold text-white hover:bg-[#3d7b7b] transition-colors"
                >
                  <Mail size={14} />
                  Répondre par e-mail
                </a>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setSelectedMessage(null)}
                  className="rounded-xl text-xs cursor-pointer"
                >
                  Fermer
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

