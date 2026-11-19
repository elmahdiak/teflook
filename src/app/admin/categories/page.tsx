"use client";

import React, { useEffect, useState } from "react";
import { Edit2, FolderTree, Plus, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  deleteAdminCategory,
  getAdminCategories,
  saveAdminCategory,
  type AdminCategory,
} from "@/lib/cod-service";

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<AdminCategory[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<AdminCategory | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    subtitle: "",
    slug: "",
    imageUrl: "",
    itemCount: 4,
  });

  useEffect(() => {
    setCategories(getAdminCategories());
  }, []);

  function openCreateModal() {
    setEditingCategory(null);
    setFormData({
      name: "",
      subtitle: "",
      slug: "",
      imageUrl: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?q=80&w=600&auto=format&fit=crop",
      itemCount: 4,
    });
    setModalOpen(true);
  }

  function openEditModal(cat: AdminCategory) {
    setEditingCategory(cat);
    setFormData({
      name: cat.name,
      subtitle: cat.subtitle,
      slug: cat.slug,
      imageUrl: cat.imageUrl,
      itemCount: cat.itemCount,
    });
    setModalOpen(true);
  }

  function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!formData.name) return;

    const slug =
      formData.slug.trim() ||
      formData.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");

    saveAdminCategory({
      id: editingCategory?.id,
      name: formData.name.trim(),
      subtitle: formData.subtitle.trim() || "Développement",
      slug,
      imageUrl: formData.imageUrl.trim(),
      itemCount: formData.itemCount,
    });

    setCategories(getAdminCategories());
    setModalOpen(false);
  }

  function handleDelete(id: string, name: string) {
    if (window.confirm(`Supprimer la catégorie "${name}" ?`)) {
      deleteAdminCategory(id);
      setCategories(getAdminCategories());
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-black text-foreground">
            Catégories & Piliers d'Éveil ({categories.length})
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-muted-foreground">
            Configuration des 6 piliers officiels de développement de l'enfant et de leurs visuels.
          </p>
        </div>
        <Button
          onClick={openCreateModal}
          className="gap-2 rounded-xl bg-brand-teal text-white hover:bg-brand-teal/90 text-xs sm:text-sm font-bold shadow-md shadow-brand-teal/20"
        >
          <Plus size={16} />
          Ajouter un pilier / catégorie
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {categories.map((cat) => (
          <div
            key={cat.id}
            className="group rounded-2xl border border-border bg-card overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
          >
            <div className="p-5 flex items-start gap-4">
              <img
                src={cat.imageUrl}
                alt=""
                className="size-16 rounded-full object-cover border-2 border-white ring-2 ring-brand-teal/20 shrink-0 shadow-xs"
              />
              <div className="min-w-0 flex-1">
                <span className="text-[11px] font-bold uppercase tracking-wider text-brand-orange">
                  {cat.subtitle}
                </span>
                <h3 className="font-display text-base font-bold text-foreground leading-snug mt-0.5">
                  {cat.name}
                </h3>
                <p className="text-[11px] font-mono text-muted-foreground mt-1 truncate">
                  Slug: /{cat.slug}
                </p>
              </div>
            </div>

            <div className="border-t border-border/60 bg-[#F9F8F6] px-5 py-3 flex items-center justify-between text-xs">
              <span className="text-muted-foreground font-medium">
                {cat.itemCount || 4} produits assignés
              </span>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => openEditModal(cat)}
                  className="grid size-8 place-items-center rounded-lg text-muted-foreground hover:text-brand-teal hover:bg-brand-mist/50 transition-colors"
                  title="Modifier"
                >
                  <Edit2 size={14} />
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(cat.id, cat.name)}
                  className="grid size-8 place-items-center rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                  title="Supprimer"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Category Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/50 backdrop-blur-xs" onClick={() => setModalOpen(false)} />
          <div className="relative z-10 w-full max-w-md rounded-2xl bg-card border border-border shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-border p-5 bg-[#F9F8F6]">
              <h3 className="font-display text-lg font-bold text-foreground">
                {editingCategory ? "Modifier la catégorie" : "Ajouter une catégorie"}
              </h3>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="grid size-8 place-items-center rounded-full text-muted-foreground hover:bg-secondary"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-5 space-y-4 text-xs">
              <div>
                <label className="block font-bold text-foreground mb-1">Nom du pilier / catégorie *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Ex: Discipline et maîtrise de soi"
                  className="w-full h-10 px-3 rounded-xl border border-border bg-background text-sm outline-none focus:border-brand-teal"
                />
              </div>

              <div>
                <label className="block font-bold text-foreground mb-1">Sous-titre / Mot-clé orange *</label>
                <input
                  type="text"
                  required
                  value={formData.subtitle}
                  onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                  placeholder="Ex: Maîtrise, Empathie, Autonomie..."
                  className="w-full h-10 px-3 rounded-xl border border-border bg-background text-sm outline-none focus:border-brand-teal"
                />
              </div>

              <div>
                <label className="block font-bold text-foreground mb-1">Identifiant d'URL (Slug)</label>
                <input
                  type="text"
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  placeholder="discipline-maitrise-de-soi"
                  className="w-full h-10 px-3 rounded-xl border border-border bg-background text-xs outline-none focus:border-brand-teal font-mono"
                />
              </div>

              <div>
                <label className="block font-bold text-foreground mb-1">Lien de l'image circulaire (URL)</label>
                <input
                  type="url"
                  required
                  value={formData.imageUrl}
                  onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full h-10 px-3 rounded-xl border border-border bg-background text-xs outline-none focus:border-brand-teal"
                />
              </div>

              <div className="pt-3 border-t border-border flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setModalOpen(false)}>
                  Annuler
                </Button>
                <Button type="submit" className="bg-brand-teal text-white hover:bg-brand-teal/90 font-bold">
                  Enregistrer
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
