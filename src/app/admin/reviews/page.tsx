"use client";

import React, { useEffect, useState } from "react";
import {
  BadgeCheck,
  CheckCircle2,
  Clock,
  Filter,
  LoaderCircle,
  MessageSquare,
  Package,
  Plus,
  Search,
  ShieldCheck,
  Star,
  Trash2,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import type { ProductReview } from "@/lib/reviews-service";
import type { AdminProduct } from "@/lib/cod-service";

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState<ProductReview[]>([]);
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedProductFilter, setSelectedProductFilter] = useState<string>("all");
  const [selectedRatingFilter, setSelectedRatingFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  // New Review Form
  const [formData, setFormData] = useState({
    productId: "",
    authorName: "",
    authorRole: "Parent",
    rating: 5,
    comment: "",
    isVerified: true,
  });

  const showToast = (message: string, type: "success" | "error" = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  // Load reviews & products
  async function loadData() {
    setIsLoading(true);
    try {
      const [reviewsRes, productsRes] = await Promise.all([
        fetch("/api/reviews", { cache: "no-store" }),
        fetch("/api/products", { cache: "no-store" }),
      ]);

      if (reviewsRes.ok) {
        const revData = await reviewsRes.json();
        if (Array.isArray(revData)) {
          setReviews(revData);
        }
      }

      if (productsRes.ok) {
        const prodData = await productsRes.json();
        if (Array.isArray(prodData)) {
          setProducts(prodData);
          if (prodData.length > 0 && !formData.productId) {
            setFormData((prev) => ({ ...prev, productId: prodData[0].id }));
          }
        }
      }
    } catch (e) {
      console.error("loadData error:", e);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  async function handleToggleVerified(id: string, currentStatus: boolean | undefined) {
    try {
      const newStatus = !currentStatus;
      setReviews((prev) =>
        prev.map((r) => (r.id === id ? { ...r, is_verified: newStatus } : r))
      );

      const res = await fetch("/api/reviews", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, is_verified: newStatus }),
      });

      if (!res.ok) {
        showToast("Erreur lors de la mise à jour.", "error");
        loadData();
      } else {
        showToast("Statut acheteur vérifié mis à jour.");
      }
    } catch {
      showToast("Erreur réseau.", "error");
    }
  }

  async function handleDelete(id: string, author: string) {
    if (window.confirm(`Supprimer définitivement l'avis de "${author}" ?`)) {
      setReviews((prev) => prev.filter((r) => r.id !== id));
      try {
        const res = await fetch(`/api/reviews?id=${encodeURIComponent(id)}`, {
          method: "DELETE",
        });
        if (res.ok) {
          showToast(`Avis de "${author}" supprimé avec succès.`);
        } else {
          showToast("Erreur lors de la suppression.", "error");
          loadData();
        }
      } catch {
        showToast("Erreur réseau lors de la suppression.", "error");
        loadData();
      }
    }
  }

  async function handleCreateReview(e: React.FormEvent) {
    e.preventDefault();
    if (!formData.productId || !formData.authorName.trim() || !formData.comment.trim()) {
      showToast("Veuillez renseigner tous les champs obligatoires.", "error");
      return;
    }

    setIsSubmitting(true);
    try {
      const selectedProd = products.find((p) => p.id === formData.productId);
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: formData.productId,
          productHandle: selectedProd?.handle || formData.productId,
          authorName: formData.authorName.trim(),
          authorRole: formData.authorRole.trim() || "Parent",
          rating: Number(formData.rating),
          comment: formData.comment.trim(),
          isVerified: formData.isVerified,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success && data.review) {
        setReviews((prev) => [data.review, ...prev]);
        setModalOpen(false);
        setFormData({
          productId: products[0]?.id || "",
          authorName: "",
          authorRole: "Parent",
          rating: 5,
          comment: "",
          isVerified: true,
        });
        showToast("Nouvel avis enregistré avec succès !");
      } else {
        showToast(data.error || "Erreur lors de l'enregistrement de l'avis.", "error");
      }
    } catch {
      showToast("Erreur réseau lors de l'enregistrement.", "error");
    } finally {
      setIsSubmitting(false);
    }
  }

  // Filter reviews
  const filtered = reviews.filter((r) => {
    const matchProduct =
      selectedProductFilter === "all" ||
      r.product_id === selectedProductFilter ||
      r.product_handle === selectedProductFilter;

    const matchRating =
      selectedRatingFilter === "all" ||
      String(r.rating) === selectedRatingFilter;

    const query = searchQuery.trim().toLowerCase();
    const matchSearch =
      !query ||
      r.author_name.toLowerCase().includes(query) ||
      r.comment.toLowerCase().includes(query) ||
      (r.author_role && r.author_role.toLowerCase().includes(query));

    return matchProduct && matchRating && matchSearch;
  });

  const averageRating =
    reviews.length > 0
      ? (reviews.reduce((sum, r) => sum + (r.rating || 5), 0) / reviews.length).toFixed(1)
      : "0.0";

  const verifiedCount = reviews.filter((r) => r.is_verified).length;

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toast && (
        <div
          className={`fixed top-5 right-5 z-50 flex items-center gap-3 px-5 py-3.5 rounded-2xl shadow-2xl text-xs sm:text-sm font-bold text-white transition-all animate-in fade-in slide-in-from-top-4 ${
            toast.type === "error" ? "bg-rose-600" : "bg-emerald-700"
          }`}
        >
          {toast.type === "error" ? <X size={18} /> : <CheckCircle2 size={18} />}
          <span>{toast.message}</span>
          <button type="button" onClick={() => setToast(null)} className="ml-2 hover:opacity-80">
            <X size={14} />
          </button>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-black text-foreground">
            Avis & Témoignages Parents ({reviews.length})
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-muted-foreground">
            Gestion centralisée des avis par produit, attribution du badge <strong>Acheteur vérifié</strong> et synchronisation instantanée avec le site.
          </p>
        </div>

        <Button
          onClick={() => setModalOpen(true)}
          className="bg-brand-teal hover:bg-[#3d7d7d] text-white rounded-xl shadow-xs self-start sm:self-auto cursor-pointer"
        >
          <Plus size={16} className="mr-1.5" />
          Ajouter un avis
        </Button>
      </div>

      {/* Metrics Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-2xl border border-border bg-card p-4 sm:p-5 shadow-xs">
          <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            Note Moyenne Globale
          </p>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="font-display text-3xl font-extrabold text-[#1A2D2A]">
              {averageRating}
            </span>
            <span className="text-sm font-semibold text-muted-foreground">/ 5</span>
            <div className="flex items-center text-[#ffbf00] ml-2">
              <Star size={16} fill="currentColor" />
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-card p-4 sm:p-5 shadow-xs">
          <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            Total Avis Déposés
          </p>
          <div className="mt-2">
            <span className="font-display text-3xl font-extrabold text-[#1A2D2A]">
              {reviews.length}
            </span>
            <span className="text-xs text-muted-foreground ml-2">avis enregistrés</span>
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-card p-4 sm:p-5 shadow-xs">
          <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            Avis Vérifiés
          </p>
          <div className="mt-2 flex items-center gap-2">
            <span className="font-display text-3xl font-extrabold text-emerald-700">
              {verifiedCount}
            </span>
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 px-2.5 py-0.5 text-xs font-bold">
              <BadgeCheck size={13} className="text-emerald-600" />
              {reviews.length > 0 ? Math.round((verifiedCount / reviews.length) * 100) : 0}% du total
            </span>
          </div>
        </div>
      </div>

      {/* Filters Toolbar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 p-3 rounded-2xl border border-border bg-card">
        {/* Search */}
        <div className="relative flex-1 max-w-sm">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Rechercher par auteur ou mot-clé..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-9 pl-9 pr-3 text-xs rounded-xl border border-border bg-[#FBF9F5] focus:bg-white focus:outline-none"
          />
        </div>

        {/* Dropdowns */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Product Filter */}
          <select
            value={selectedProductFilter}
            onChange={(e) => setSelectedProductFilter(e.target.value)}
            aria-label="Filtrer par produit"
            className="h-9 px-3 text-xs font-semibold rounded-xl border border-border bg-[#FBF9F5] focus:outline-none"
          >
            <option value="all">Tous les produits ({products.length})</option>
            {products.map((p) => (
              <option key={p.id} value={p.id}>
                {p.title}
              </option>
            ))}
          </select>

          {/* Rating Filter */}
          <select
            value={selectedRatingFilter}
            onChange={(e) => setSelectedRatingFilter(e.target.value)}
            aria-label="Filtrer par note"
            className="h-9 px-3 text-xs font-semibold rounded-xl border border-border bg-[#FBF9F5] focus:outline-none"
          >
            <option value="all">Toutes les notes</option>
            <option value="5">5 étoiles ★★★★★</option>
            <option value="4">4 étoiles ★★★★☆</option>
            <option value="3">3 étoiles ★★★☆☆</option>
            <option value="2">2 étoiles ★★☆☆☆</option>
            <option value="1">1 étoile ★☆☆☆☆</option>
          </select>
        </div>
      </div>

      {/* Reviews Cards List */}
      {isLoading ? (
        <div className="py-14 grid place-items-center">
          <LoaderCircle size={28} className="animate-spin text-brand-teal" />
          <p className="mt-2 text-xs text-muted-foreground font-semibold">Chargement des avis...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border p-12 text-center bg-card">
          <MessageSquare size={32} className="mx-auto text-muted-foreground/60 mb-3" />
          <h3 className="font-display text-base font-bold text-foreground">
            Aucun avis trouvé
          </h3>
          <p className="mt-1 text-xs text-muted-foreground max-w-sm mx-auto">
            {reviews.length === 0
              ? "Aucun avis parent enregistré dans la base de données pour l'instant."
              : "Aucun avis ne correspond aux filtres sélectionnés."}
          </p>
          <Button
            onClick={() => setModalOpen(true)}
            size="sm"
            className="mt-4 bg-brand-teal hover:bg-[#3d7d7d] text-white rounded-xl text-xs"
          >
            <Plus size={13} className="mr-1" /> Ajouter le premier avis
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map((rev) => {
            const matchedProduct = products.find(
              (p) => p.id === rev.product_id || p.handle === rev.product_handle
            );
            const dateFormatted = rev.created_at
              ? new Date(rev.created_at).toLocaleDateString("fr-FR", {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                })
              : "";

            return (
              <div
                key={rev.id}
                className="rounded-2xl border border-border bg-card p-5 shadow-xs transition-all flex flex-col justify-between hover:shadow-md"
              >
                <div>
                  {/* Header Row */}
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-foreground text-sm">{rev.author_name}</span>
                        {rev.author_role && (
                          <span className="text-[11px] font-semibold text-brand-teal">
                            ({rev.author_role})
                          </span>
                        )}

                        {rev.is_verified && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 border border-emerald-300/80 px-2 py-0.5 text-[10px] font-bold text-emerald-800">
                            <BadgeCheck size={12} className="text-emerald-600" />
                            <span>Vérifié</span>
                          </span>
                        )}
                      </div>

                      {/* Stars & Product Title */}
                      <div className="flex items-center gap-2 mt-1 flex-wrap">
                        <div className="flex items-center text-[#ffbf00]">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              size={13}
                              fill={i < rev.rating ? "currentColor" : "none"}
                            />
                          ))}
                        </div>
                        <span className="text-[11px] font-bold text-muted-foreground">
                          · {matchedProduct?.title || rev.product_handle || rev.product_id}
                        </span>
                      </div>
                    </div>

                    <span className="text-[10px] text-muted-foreground shrink-0 font-medium">
                      {dateFormatted}
                    </span>
                  </div>

                  {/* Comment */}
                  <p className="mt-3 text-xs text-foreground/85 leading-relaxed italic bg-secondary/30 p-3 rounded-xl border border-border/50">
                    « {rev.comment} »
                  </p>
                </div>

                {/* Bottom Actions */}
                <div className="mt-4 pt-3 border-t border-border/60 flex items-center justify-between text-xs">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleToggleVerified(rev.id, rev.is_verified)}
                    className={`h-7 px-2.5 rounded-lg text-[11px] font-bold cursor-pointer ${
                      rev.is_verified
                        ? "border-emerald-300 text-emerald-800 bg-emerald-50 hover:bg-emerald-100"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <ShieldCheck size={13} className="mr-1" />
                    {rev.is_verified ? "Acheteur Vérifié ✓" : "Non vérifié"}
                  </Button>

                  <button
                    type="button"
                    onClick={() => handleDelete(rev.id, rev.author_name)}
                    className="grid size-7 place-items-center rounded-lg text-muted-foreground hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                    title="Supprimer cet avis"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ADD REVIEW MODAL */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl border border-border">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <h3 className="font-display text-lg font-bold text-foreground">
                Ajouter un avis parent
              </h3>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="grid size-8 place-items-center rounded-full text-muted-foreground hover:bg-secondary cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleCreateReview} className="mt-4 space-y-4">
              {/* Product Select */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5">
                  Produit associé *
                </label>
                <select
                  required
                  value={formData.productId}
                  onChange={(e) => setFormData({ ...formData, productId: e.target.value })}
                  className="w-full h-10 px-3 text-xs sm:text-sm rounded-xl border border-border bg-[#FBF9F5] focus:outline-none"
                >
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.title} ({p.priceMad} MAD)
                    </option>
                  ))}
                </select>
              </div>

              {/* Author & Role */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5">
                    Nom de l'auteur *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Nadia Bennis"
                    value={formData.authorName}
                    onChange={(e) => setFormData({ ...formData, authorName: e.target.value })}
                    className="w-full h-10 px-3 text-xs sm:text-sm rounded-xl border border-border bg-[#FBF9F5] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5">
                    Profil / Rôle
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: Maman de Rayan (6 ans)"
                    value={formData.authorRole}
                    onChange={(e) => setFormData({ ...formData, authorRole: e.target.value })}
                    className="w-full h-10 px-3 text-xs sm:text-sm rounded-xl border border-border bg-[#FBF9F5] focus:outline-none"
                  />
                </div>
              </div>

              {/* Rating & Verified */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-center">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5">
                    Note attribuée (1 à 5)
                  </label>
                  <select
                    value={formData.rating}
                    onChange={(e) => setFormData({ ...formData, rating: Number(e.target.value) })}
                    className="w-full h-10 px-3 text-xs sm:text-sm rounded-xl border border-border bg-[#FBF9F5] focus:outline-none font-bold text-[#ffbf00]"
                  >
                    <option value={5}>5 étoiles ★★★★★ (Excellent)</option>
                    <option value={4}>4 étoiles ★★★★☆ (Très bien)</option>
                    <option value={3}>3 étoiles ★★★☆☆ (Bien)</option>
                    <option value={2}>2 étoiles ★★☆☆☆ (Moyen)</option>
                    <option value={1}>1 étoile ★☆☆☆☆ (Décevant)</option>
                  </select>
                </div>

                <div className="pt-5 flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="isVerifiedCheckbox"
                    checked={formData.isVerified}
                    onChange={(e) => setFormData({ ...formData, isVerified: e.target.checked })}
                    className="size-4 rounded text-brand-teal focus:ring-brand-teal"
                  />
                  <label htmlFor="isVerifiedCheckbox" className="text-xs font-bold text-foreground cursor-pointer">
                    Badge Acheteur Vérifié
                  </label>
                </div>
              </div>

              {/* Comment */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5">
                  Commentaire / Témoignage *
                </label>
                <textarea
                  required
                  rows={3}
                  placeholder="Partagez le retour d'expérience avec ce matériel..."
                  value={formData.comment}
                  onChange={(e) => setFormData({ ...formData, comment: e.target.value })}
                  className="w-full p-3 text-xs sm:text-sm rounded-xl border border-border bg-[#FBF9F5] focus:outline-none resize-y"
                />
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center justify-end gap-2 pt-2 border-t border-border">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setModalOpen(false)}
                  className="rounded-xl"
                >
                  Annuler
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-brand-teal hover:bg-[#3d7d7d] text-white rounded-xl font-bold cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <LoaderCircle size={14} className="animate-spin mr-1.5" />
                      Enregistrement...
                    </>
                  ) : (
                    "Enregistrer l'avis"
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
