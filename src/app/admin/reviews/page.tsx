"use client";

import React, { useEffect, useState } from "react";
import {
  BadgeCheck,
  CheckCircle2,
  Clock,
  Eye,
  EyeOff,
  MessageSquare,
  Plus,
  ShieldCheck,
  Star,
  Trash2,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  deleteReview,
  getAdminReviews,
  toggleReviewApproval,
  toggleReviewVerified,
  type AdminReview,
} from "@/lib/cod-service";

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState<AdminReview[]>([]);
  const [filter, setFilter] = useState<"all" | "approved" | "pending">("all");

  useEffect(() => {
    setReviews(getAdminReviews());
  }, []);

  function handleToggleApproval(id: string) {
    toggleReviewApproval(id);
    setReviews(getAdminReviews());
  }

  function handleToggleVerified(id: string) {
    toggleReviewVerified(id);
    setReviews(getAdminReviews());
  }

  function handleDelete(id: string, author: string) {
    if (window.confirm(`Supprimer l'avis de "${author}" ?`)) {
      deleteReview(id);
      setReviews(getAdminReviews());
    }
  }

  const filtered = reviews.filter((r) => {
    if (filter === "all") return true;
    return r.status === filter;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-black text-foreground">
            Modération des Avis & Témoignages ({reviews.length})
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-muted-foreground">
            Contrôle des retours clients et attribution du badge filigrane officiel <strong>Acheteur vérifié</strong>.
          </p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => setFilter("all")}
          className={`rounded-xl px-3.5 py-1.5 text-xs font-bold transition-all cursor-pointer ${
            filter === "all"
              ? "bg-brand-teal text-white shadow-xs"
              : "border border-border bg-card text-muted-foreground hover:bg-secondary"
          }`}
        >
          Tous les avis ({reviews.length})
        </button>
        <button
          type="button"
          onClick={() => setFilter("approved")}
          className={`rounded-xl px-3.5 py-1.5 text-xs font-bold transition-all cursor-pointer ${
            filter === "approved"
              ? "bg-brand-teal text-white shadow-xs"
              : "border border-border bg-card text-muted-foreground hover:bg-secondary"
          }`}
        >
          Approuvés en ligne ({reviews.filter((r) => r.status === "approved").length})
        </button>
        <button
          type="button"
          onClick={() => setFilter("pending")}
          className={`rounded-xl px-3.5 py-1.5 text-xs font-bold transition-all cursor-pointer ${
            filter === "pending"
              ? "bg-brand-teal text-white shadow-xs"
              : "border border-border bg-card text-muted-foreground hover:bg-secondary"
          }`}
        >
          En attente ({reviews.filter((r) => r.status === "pending").length})
        </button>
      </div>

      {/* Reviews Cards List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map((rev) => (
          <div
            key={rev.id}
            className={`rounded-2xl border bg-card p-5 shadow-xs transition-all flex flex-col justify-between ${
              rev.status === "approved" ? "border-border" : "border-amber-200 bg-amber-50/20"
            }`}
          >
            <div>
              {/* Reviewer Header */}
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-foreground text-sm">{rev.authorName}</span>
                    <span className="text-xs text-muted-foreground">({rev.city})</span>

                    {/* Verified Buyer Watermark Badge */}
                    {rev.isVerifiedBuyer && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 border border-emerald-300/80 px-2.5 py-0.5 text-[10px] font-bold text-emerald-800 shadow-xs">
                        <BadgeCheck size={13} className="text-emerald-600 shrink-0" />
                        <span>Acheteur vérifié</span>
                      </span>
                    )}
                  </div>

                  {/* Stars & Product */}
                  <div className="flex items-center gap-2 mt-1">
                    <div className="flex items-center text-amber-500">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          size={13}
                          fill={i < Math.floor(rev.rating) ? "currentColor" : "none"}
                        />
                      ))}
                    </div>
                    <span className="text-[11px] font-bold text-brand-teal">
                      · {rev.productName}
                    </span>
                  </div>
                </div>

                {/* Status indicator */}
                <span
                  className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold ${
                    rev.status === "approved"
                      ? "bg-emerald-100 text-emerald-800"
                      : "bg-amber-100 text-amber-800"
                  }`}
                >
                  {rev.status === "approved" ? (
                    <>
                      <CheckCircle2 size={11} /> En ligne
                    </>
                  ) : (
                    <>
                      <Clock size={11} /> Modération
                    </>
                  )}
                </span>
              </div>

              {/* Review Comment */}
              <p className="mt-3 text-xs text-foreground/80 leading-relaxed italic bg-secondary/30 p-3 rounded-xl border border-border/50">
                « {rev.comment} »
              </p>
            </div>

            {/* Bottom Actions */}
            <div className="mt-4 pt-3 border-t border-border/60 flex items-center justify-between text-xs">
              <span className="text-[11px] text-muted-foreground">{rev.date}</span>

              <div className="flex items-center gap-2">
                {/* Toggle Verified Buyer */}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleToggleVerified(rev.id)}
                  className={`h-7 px-2.5 rounded-lg text-[11px] font-bold ${
                    rev.isVerifiedBuyer
                      ? "border-emerald-300 text-emerald-800 bg-emerald-50 hover:bg-emerald-100"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                  title="Activer/Désactiver le badge Acheteur Vérifié"
                >
                  <ShieldCheck size={13} className="mr-1" />
                  {rev.isVerifiedBuyer ? "Vérifié ✓" : "Non vérifié"}
                </Button>

                {/* Toggle Approval */}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleToggleApproval(rev.id)}
                  className="h-7 px-2.5 rounded-lg text-[11px] font-bold"
                >
                  {rev.status === "approved" ? (
                    <>
                      <EyeOff size={13} className="mr-1" /> Masquer
                    </>
                  ) : (
                    <>
                      <Eye size={13} className="mr-1" /> Approuver
                    </>
                  )}
                </Button>

                {/* Delete */}
                <button
                  type="button"
                  onClick={() => handleDelete(rev.id, rev.authorName)}
                  className="grid size-7 place-items-center rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                  title="Supprimer"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
