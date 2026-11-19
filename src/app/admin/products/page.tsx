"use client";

import React, { useEffect, useState } from "react";
import {
  Check,
  Edit2,
  FolderTree,
  LoaderCircle,
  Package,
  Plus,
  Search,
  Trash2,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  deleteAdminProduct,
  getAdminCategories,
  getAdminProducts,
  saveAdminProduct,
  type AdminProduct,
} from "@/lib/cod-service";

export default function AdminProductsPage() {
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [categories, setCategories] = useState<{ slug: string; name: string }[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  const [modalOpen, setModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<AdminProduct | null>(null);

  const [formData, setFormData] = useState({
    title: "",
    priceMad: "",
    oldPriceMad: "",
    categorySlug: "discipline-maitrise-de-soi",
    ageBracket: "7 - 10 ans",
    imageUrl: "",
    description: "",
    inStock: true,
  });

  useEffect(() => {
    setProducts(getAdminProducts());
    setCategories(
      getAdminCategories().map((c) => ({ slug: c.slug, name: c.name }))
    );
  }, []);

  function openCreateModal() {
    setEditingProduct(null);
    setFormData({
      title: "",
      priceMad: "",
      oldPriceMad: "",
      categorySlug: categories[0]?.slug || "discipline-maitrise-de-soi",
      ageBracket: "7 - 10 ans",
      imageUrl: "https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?q=80&w=800&auto=format&fit=crop",
      description: "",
      inStock: true,
    });
    setModalOpen(true);
  }

  function openEditModal(prod: AdminProduct) {
    setEditingProduct(prod);
    setFormData({
      title: prod.title,
      priceMad: String(prod.priceMad),
      oldPriceMad: prod.oldPriceMad ? String(prod.oldPriceMad) : "",
      categorySlug: prod.categorySlug,
      ageBracket: prod.ageBracket || "7 - 10 ans",
      imageUrl: prod.images[0] || "",
      description: prod.description || "",
      inStock: prod.inStock,
    });
    setModalOpen(true);
  }

  function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!formData.title || !formData.priceMad) return;

    const catObj = categories.find((c) => c.slug === formData.categorySlug);

    saveAdminProduct({
      id: editingProduct?.id,
      title: formData.title.trim(),
      categorySlug: formData.categorySlug,
      categoryName: catObj?.name || formData.categorySlug,
      priceMad: Number(formData.priceMad),
      oldPriceMad: formData.oldPriceMad ? Number(formData.oldPriceMad) : undefined,
      ageBracket: formData.ageBracket,
      images: [formData.imageUrl.trim() || "https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?q=80&w=800&auto=format&fit=crop"],
      description: formData.description.trim(),
      inStock: formData.inStock,
    });

    setProducts(getAdminProducts());
    setModalOpen(false);
  }

  function handleDelete(id: string, title: string) {
    if (window.confirm(`Supprimer définitivement "${title}" ?`)) {
      deleteAdminProduct(id);
      setProducts(getAdminProducts());
    }
  }

  const filtered = products.filter((p) => {
    const matchesCat =
      selectedCategory === "all" || p.categorySlug === selectedCategory;
    const query = searchTerm.trim().toLowerCase();
    const matchesSearch =
      !query ||
      p.title.toLowerCase().includes(query) ||
      p.description.toLowerCase().includes(query);
    return matchesCat && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-black text-foreground">
            Catalogue Produits ({products.length})
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-muted-foreground">
            Création, modification des prix en MAD, gestion des stocks et assignation aux catégories.
          </p>
        </div>
        <Button
          onClick={openCreateModal}
          className="gap-2 rounded-xl bg-brand-orange text-white hover:bg-brand-orange/90 text-xs sm:text-sm font-bold shadow-md shadow-brand-orange/20 cursor-pointer"
        >
          <Plus size={16} />
          Ajouter un nouveau produit
        </Button>
      </div>

      {/* Filter and Search */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-1">
          <button
            type="button"
            onClick={() => setSelectedCategory("all")}
            className={`rounded-xl px-3 py-1.5 text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
              selectedCategory === "all"
                ? "bg-brand-teal text-white shadow-xs"
                : "border border-border bg-card text-muted-foreground hover:bg-secondary"
            }`}
          >
            Tous ({products.length})
          </button>
          {categories.map((c) => (
            <button
              key={c.slug}
              type="button"
              onClick={() => setSelectedCategory(c.slug)}
              className={`rounded-xl px-3 py-1.5 text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                selectedCategory === c.slug
                  ? "bg-brand-teal text-white shadow-xs"
                  : "border border-border bg-card text-muted-foreground hover:bg-secondary"
              }`}
            >
              {c.name.split(" ")[0]}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-72">
          <Search size={15} className="absolute inset-y-0 left-3 my-auto text-muted-foreground" />
          <input
            type="search"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Rechercher un produit..."
            className="w-full h-9 pl-9 pr-3 rounded-xl border border-border bg-card text-xs outline-none focus:border-brand-teal focus:ring-2 focus:ring-brand-teal/20"
          />
        </div>
      </div>

      {/* Product Grid Table */}
      <div className="rounded-2xl border border-border bg-card overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-border bg-[#F9F8F6] text-[11px] uppercase tracking-wider text-muted-foreground font-bold">
                <th className="py-3 px-4 sm:px-6">Aperçu & Titre</th>
                <th className="py-3 px-4">Pilier d'éveil</th>
                <th className="py-3 px-4">Âge</th>
                <th className="py-3 px-4">Prix (MAD)</th>
                <th className="py-3 px-4">Stock</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-muted-foreground">
                    Aucun produit trouvé.
                  </td>
                </tr>
              ) : (
                filtered.map((prod) => (
                  <tr key={prod.id} className="hover:bg-secondary/20 transition-colors">
                    <td className="py-3 px-4 sm:px-6">
                      <div className="flex items-center gap-3">
                        <img
                          src={prod.images[0] || "/images/teflook-mark.png"}
                          alt=""
                          className="size-12 rounded-xl object-cover bg-secondary border border-border shrink-0"
                        />
                        <div className="min-w-0 max-w-[280px]">
                          <p className="font-bold text-foreground text-xs truncate">{prod.title}</p>
                          <p className="text-[10px] text-muted-foreground truncate">{prod.description}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="inline-block rounded-lg bg-brand-mist/60 px-2 py-0.5 text-[10px] font-bold text-brand-teal">
                        {prod.categoryName}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-muted-foreground font-medium">
                      {prod.ageBracket}
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span className="font-extrabold text-brand-orange-deep text-sm">
                        {prod.priceMad} MAD
                      </span>
                      {prod.oldPriceMad && (
                        <span className="text-[10px] text-muted-foreground line-through block">
                          {prod.oldPriceMad} MAD
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      {prod.inStock ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700">
                          <Check size={12} /> En stock
                        </span>
                      ) : (
                        <span className="text-[11px] font-bold text-rose-600">Rupture</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => openEditModal(prod)}
                          className="grid size-8 place-items-center rounded-lg text-muted-foreground hover:text-brand-teal hover:bg-brand-mist/50 transition-colors"
                          title="Modifier"
                        >
                          <Edit2 size={14} />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(prod.id, prod.title)}
                          className="grid size-8 place-items-center rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                          title="Supprimer"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create / Edit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/50 backdrop-blur-xs" onClick={() => setModalOpen(false)} />
          <div className="relative z-10 w-full max-w-lg rounded-2xl bg-card border border-border shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-border p-5 bg-[#F9F8F6]">
              <h3 className="font-display text-lg font-bold text-foreground">
                {editingProduct ? "Modifier le produit" : "Ajouter un nouveau produit"}
              </h3>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="grid size-8 place-items-center rounded-full text-muted-foreground hover:bg-secondary"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-5 space-y-4 max-h-[75vh] overflow-y-auto text-xs">
              <div>
                <label className="block font-bold text-foreground mb-1">Titre du produit *</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Ex: Minuteur Visuel Focus & Rituels"
                  className="w-full h-10 px-3 rounded-xl border border-border bg-background text-sm outline-none focus:border-brand-teal"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-foreground mb-1">Prix de vente (MAD) *</label>
                  <input
                    type="number"
                    required
                    value={formData.priceMad}
                    onChange={(e) => setFormData({ ...formData, priceMad: e.target.value })}
                    placeholder="199"
                    className="w-full h-10 px-3 rounded-xl border border-border bg-background text-sm outline-none focus:border-brand-teal"
                  />
                </div>
                <div>
                  <label className="block font-bold text-foreground mb-1">Ancien Prix barré (MAD)</label>
                  <input
                    type="number"
                    value={formData.oldPriceMad}
                    onChange={(e) => setFormData({ ...formData, oldPriceMad: e.target.value })}
                    placeholder="249"
                    className="w-full h-10 px-3 rounded-xl border border-border bg-background text-sm outline-none focus:border-brand-teal"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-foreground mb-1">Catégorie d'éveil *</label>
                  <select
                    value={formData.categorySlug}
                    onChange={(e) => setFormData({ ...formData, categorySlug: e.target.value })}
                    className="w-full h-10 px-3 rounded-xl border border-border bg-background text-xs font-medium outline-none focus:border-brand-teal"
                  >
                    {categories.map((c) => (
                      <option key={c.slug} value={c.slug}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-foreground mb-1">Tranche d'âge</label>
                  <select
                    value={formData.ageBracket}
                    onChange={(e) => setFormData({ ...formData, ageBracket: e.target.value })}
                    className="w-full h-10 px-3 rounded-xl border border-border bg-background text-xs font-medium outline-none focus:border-brand-teal"
                  >
                    <option value="5 - 6 ans">5 - 6 ans</option>
                    <option value="7 - 10 ans">7 - 10 ans</option>
                    <option value="11 - 12 ans">11 - 12 ans</option>
                    <option value="13 - 15 ans">13 - 15 ans</option>
                    <option value="Tous âges">Tous âges</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-foreground mb-1">Lien de l'image (URL) *</label>
                <input
                  type="url"
                  required
                  value={formData.imageUrl}
                  onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full h-10 px-3 rounded-xl border border-border bg-background text-xs outline-none focus:border-brand-teal"
                />
              </div>

              <div>
                <label className="block font-bold text-foreground mb-1">Description détaillée</label>
                <textarea
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Description du produit et de ses bienfaits pédagogiques..."
                  className="w-full p-3 rounded-xl border border-border bg-background text-xs outline-none focus:border-brand-teal resize-none"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="inStockCheck"
                  checked={formData.inStock}
                  onChange={(e) => setFormData({ ...formData, inStock: e.target.checked })}
                  className="rounded text-brand-teal focus:ring-brand-teal size-4"
                />
                <label htmlFor="inStockCheck" className="font-bold text-foreground cursor-pointer">
                  Produit en stock (prêt à être commandé en COD)
                </label>
              </div>

              <div className="pt-3 border-t border-border flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setModalOpen(false)}>
                  Annuler
                </Button>
                <Button type="submit" className="bg-brand-orange text-white hover:bg-brand-orange/90 font-bold">
                  Enregistrer le produit
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
