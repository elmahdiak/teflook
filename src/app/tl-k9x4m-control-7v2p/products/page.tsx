"use client";

import React, { useEffect, useState, useRef } from "react";
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCircle2,
  Edit2,
  FolderTree,
  Image as ImageIcon,
  Link as LinkIcon,
  LoaderCircle,
  Package,
  Plus,
  RotateCcw,
  Search,
  Star,
  Trash2,
  Upload,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  MAX_PRODUCT_IMAGES,
  clearAllAdminProducts,
  deleteAdminProduct,
  getAdminCategories,
  getAdminProducts,
  normalizeProductImages,
  resetAllAdminProducts,
  saveAdminProduct,
  type AdminProduct,
} from "@/lib/cod-service";

export default function AdminProductsPage() {
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [categories, setCategories] = useState<{ slug: string; name: string }[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  // Modals & Dialogs
  const [modalOpen, setModalOpen] = useState(false);
  const [confirmClearOpen, setConfirmClearOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<AdminProduct | null>(null);

  // Notifications
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    title: "",
    priceMad: "",
    oldPriceMad: "",
    categorySlug: "discipline-maitrise-de-soi",
    ageBracket: "7 - 10 ans",
    ageRange: "6 à 9 ans",
    skills: "",
    sku: "",
    images: [] as string[],
    description: "",
    inStock: true,
  });

  // Multi-Image Upload / URL Manager state
  const [imageInputTab, setImageInputTab] = useState<"upload" | "url">("upload");
  const [pendingImageUrl, setPendingImageUrl] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const showToast = (message: string, type: "success" | "error" = "success") => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 4000);
  };

  useEffect(() => {
    setProducts(getAdminProducts());
    setCategories(getAdminCategories().map((c) => ({ slug: c.slug, name: c.name })));

    // Synchronize if server has fresher products
    fetch("/api/products", { cache: "no-store" })
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setProducts(data);
          try {
            localStorage.setItem("teflook_admin_products_v2", JSON.stringify(data));
          } catch {}
        }
      })
      .catch(() => {});
  }, []);

  function openCreateModal() {
    setEditingProduct(null);
    setFormData({
      title: "",
      priceMad: "",
      oldPriceMad: "",
      categorySlug: categories[0]?.slug || "discipline-maitrise-de-soi",
      ageBracket: "7 - 10 ans",
      ageRange: "6 à 9 ans",
      skills: "",
      sku: "",
      images: [],
      description: "",
      inStock: true,
    });
    setPendingImageUrl("");
    setImageInputTab("upload");
    setModalOpen(true);
  }

  function openEditModal(prod: AdminProduct) {
    setEditingProduct(prod);
    const existingImages = normalizeProductImages(prod);
    setFormData({
      title: prod.title,
      priceMad: String(prod.priceMad),
      oldPriceMad: prod.oldPriceMad ? String(prod.oldPriceMad) : "",
      categorySlug: prod.categorySlug,
      ageBracket: prod.ageBracket || "7 - 10 ans",
      ageRange: prod.ageRange || prod.ageBracket || "6 à 9 ans",
      skills: Array.isArray(prod.skills) ? prod.skills.join(", ") : "",
      sku: prod.sku || prod.reference || "",
      images: existingImages,
      description: prod.description || "",
      inStock: prod.inStock,
    });
    setPendingImageUrl("");
    setImageInputTab(
      existingImages.some((url) => url.startsWith("/uploads/")) || existingImages.length === 0
        ? "upload"
        : "url"
    );
    setModalOpen(true);
  }

  // Handle multi-file upload (up to MAX_PRODUCT_IMAGES)
  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const selectedFiles = Array.from(e.target.files || []);
    e.target.value = "";
    if (selectedFiles.length === 0) return;

    const remainingSlots = MAX_PRODUCT_IMAGES - formData.images.length;
    if (remainingSlots <= 0) {
      showToast(`Maximum ${MAX_PRODUCT_IMAGES} images par produit atteint.`, "error");
      return;
    }

    const filesToUpload = selectedFiles.slice(0, remainingSlots);
    const hitLimit = selectedFiles.length > remainingSlots;

    setIsUploading(true);
    try {
      const results = await Promise.all(
        filesToUpload.map(async (file) => {
          const uploadData = new FormData();
          uploadData.append("file", file);
          const res = await fetch("/api/upload", {
            method: "POST",
            body: uploadData,
          });
          const json = await res.json();
          if (!res.ok || json.error || !json.url) {
            throw new Error(json.error || `Échec pour ${file.name}`);
          }
          return String(json.url);
        })
      );

      setFormData((prev) => ({
        ...prev,
        images: normalizeProductImages({ images: [...prev.images, ...results] }),
      }));

      if (hitLimit) {
        showToast(
          `${results.length} image(s) ajoutée(s) (limite maximale de ${MAX_PRODUCT_IMAGES} images par produit).`
        );
      } else {
        showToast(
          results.length > 1
            ? `${results.length} images importées avec succès !`
            : "Image importée avec succès !"
        );
      }
    } catch (err) {
      console.error(err);
      showToast(
        err instanceof Error
          ? err.message
          : "Erreur lors de l'envoi de l'image au serveur.",
        "error"
      );
    } finally {
      setIsUploading(false);
    }
  }

  function handleAddImageUrl() {
    const trimmed = pendingImageUrl.trim();
    if (!trimmed) return;

    if (formData.images.length >= MAX_PRODUCT_IMAGES) {
      showToast(`Maximum ${MAX_PRODUCT_IMAGES} images par produit atteint.`, "error");
      return;
    }

    if (formData.images.includes(trimmed)) {
      showToast("Cette image est déjà dans la galerie du produit.", "error");
      return;
    }

    setFormData((prev) => ({
      ...prev,
      images: normalizeProductImages({ images: [...prev.images, trimmed] }),
    }));
    setPendingImageUrl("");
  }

  function handleMoveImage(index: number, delta: -1 | 1) {
    const targetIndex = index + delta;
    if (targetIndex < 0 || targetIndex >= formData.images.length) return;
    setFormData((prev) => {
      const next = [...prev.images];
      const [moved] = next.splice(index, 1);
      next.splice(targetIndex, 0, moved);
      return { ...prev, images: next };
    });
  }

  function handleMakePrimaryImage(index: number) {
    if (index <= 0 || index >= formData.images.length) return;
    setFormData((prev) => {
      const next = [...prev.images];
      const [selected] = next.splice(index, 1);
      next.unshift(selected);
      return { ...prev, images: next };
    });
  }

  function handleRemoveImage(index: number) {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
  }

  function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!formData.title || !formData.priceMad) return;

    const catObj = categories.find((c) => c.slug === formData.categorySlug);

    const skillsArray = formData.skills
      ? formData.skills
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean)
      : [];

    const finalImages = normalizeProductImages({
      images: pendingImageUrl.trim()
        ? [...formData.images, pendingImageUrl.trim()]
        : formData.images,
    });

    const saved = saveAdminProduct({
      ...(editingProduct
        ? {
            material: editingProduct.material,
            origin: editingProduct.origin,
            features: editingProduct.features,
            title_ar: editingProduct.title_ar,
            description_ar: editingProduct.description_ar,
            categoryName_ar: editingProduct.categoryName_ar,
          }
        : {}),
      id: editingProduct?.id,
      title: formData.title.trim(),
      categorySlug: formData.categorySlug,
      categoryName: catObj?.name || formData.categorySlug,
      priceMad: Number(formData.priceMad),
      oldPriceMad: formData.oldPriceMad ? Number(formData.oldPriceMad) : undefined,
      ageBracket: formData.ageBracket,
      ageRange: formData.ageRange.trim() || formData.ageBracket,
      skills: skillsArray,
      sku: formData.sku.trim() || undefined,
      reference: formData.sku.trim() ? `Référence ${formData.sku.trim()}` : undefined,
      images: finalImages,
      description: formData.description.trim(),
      inStock: formData.inStock,
    });

    setProducts(getAdminProducts());
    setModalOpen(false);
    showToast(
      editingProduct
        ? `Le produit "${saved.title}" a été modifié avec succès.`
        : `Nouveau produit "${saved.title}" ajouté au catalogue.`
    );
  }

  async function handleDelete(id: string, title: string) {
    if (window.confirm(`Supprimer définitivement "${title}" ?`)) {
      deleteAdminProduct(id);
      setProducts((prev) => prev.filter((p) => p.id !== id));
      showToast(`Produit "${title}" supprimé avec succès.`);
      try {
        await fetch(`/api/products?id=${encodeURIComponent(id)}`, { method: "DELETE" });
      } catch (e) {
        console.warn("Delete API error:", e);
      }
    }
  }

  // Clear all products (Fresh database start)
  async function handleConfirmClearAll() {
    clearAllAdminProducts();
    setProducts([]);
    setConfirmClearOpen(false);
    showToast("Base de données vidée : tous les produits ont été supprimés.", "success");
    try {
      await fetch("/api/products?all=true", { method: "DELETE" });
    } catch (e) {
      console.warn("Clear all API error:", e);
    }
  }

  // Restore 24 seeded products
  async function handleResetToDefaults() {
    if (
      window.confirm(
        "Voulez-vous restaurer les 24 produits officiels de démonstration ? Cela rechargera le catalogue complet dans Supabase."
      )
    ) {
      const restored = resetAllAdminProducts();
      setProducts(restored);
      showToast("Catalogue restauré avec les 24 produits de base.");
      try {
        await fetch("/api/products?reset=true", { method: "DELETE" });
      } catch (e) {
        console.warn("Reset API error:", e);
      }
    }
  }

  const filtered = products.filter((p) => {
    const matchesCat = selectedCategory === "all" || p.categorySlug === selectedCategory;
    const query = searchTerm.trim().toLowerCase();
    const matchesSearch =
      !query || p.title.toLowerCase().includes(query) || p.description.toLowerCase().includes(query);
    return matchesCat && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toast && (
        <div
          className={`fixed top-5 right-5 z-50 flex items-center gap-3 px-5 py-3.5 rounded-2xl shadow-2xl text-xs sm:text-sm font-bold text-white transition-all animate-in fade-in slide-in-from-top-4 ${
            toast.type === "error" ? "bg-rose-600" : "bg-emerald-700"
          }`}
        >
          {toast.type === "error" ? <AlertTriangle size={18} /> : <CheckCircle2 size={18} />}
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
            Catalogue Produits ({products.length})
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-muted-foreground">
            Gestion des prix en MAD, téléversement d'images, stocks et synchronisation instantanée avec le site public.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Clear Catalog Button */}
          {products.length > 0 && (
            <Button
              type="button"
              variant="outline"
              onClick={() => setConfirmClearOpen(true)}
              className="gap-2 rounded-xl text-rose-600 border-rose-200 hover:bg-rose-50 hover:text-rose-700 text-xs sm:text-sm font-bold cursor-pointer"
            >
              <Trash2 size={15} />
              Vider le catalogue
            </Button>
          )}

          {/* Reset / Restore Demo Products */}
          <Button
            type="button"
            variant="outline"
            onClick={handleResetToDefaults}
            className="gap-2 rounded-xl text-muted-foreground hover:text-foreground text-xs sm:text-sm font-medium cursor-pointer"
            title="Recharger les produits initiaux"
          >
            <RotateCcw size={14} />
            Restaurer démo
          </Button>

          {/* Create Product Button */}
          <Button
            onClick={openCreateModal}
            className="gap-2 rounded-xl bg-brand-orange text-white hover:bg-brand-orange/90 text-xs sm:text-sm font-bold shadow-md shadow-brand-orange/20 cursor-pointer"
          >
            <Plus size={16} />
            Ajouter un nouveau produit
          </Button>
        </div>
      </div>

      {/* Confirmation Modal to Clear All Products */}
      {confirmClearOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-xs"
            onClick={() => setConfirmClearOpen(false)}
          />
          <div className="relative z-10 w-full max-w-md rounded-2xl bg-card border border-border shadow-2xl p-6 space-y-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center gap-3 text-rose-600">
              <div className="size-10 rounded-full bg-rose-100 flex items-center justify-center shrink-0">
                <AlertTriangle size={22} />
              </div>
              <div>
                <h3 className="font-bold text-base text-foreground">Vider complètement le catalogue ?</h3>
                <p className="text-xs text-muted-foreground">Action irréversible (remise à zéro)</p>
              </div>
            </div>
            <p className="text-xs sm:text-sm text-foreground/80 leading-relaxed">
              Êtes-vous sûr de vouloir supprimer tous les <strong>{products.length} produits</strong> ? La base de
              données sera complètement vidée et le site public affichera immédiatement 0 produit afin que vous puissiez
              repartir à zéro.
            </p>
            <div className="pt-2 flex justify-end gap-2.5">
              <Button type="button" variant="outline" onClick={() => setConfirmClearOpen(false)}>
                Annuler
              </Button>
              <Button
                type="button"
                onClick={handleConfirmClearAll}
                className="bg-rose-600 hover:bg-rose-700 text-white font-bold"
              >
                Oui, tout supprimer
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Filters & Search */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Rechercher par titre ou description..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full h-10 pl-10 pr-4 rounded-xl border border-border bg-card text-xs sm:text-sm outline-none focus:border-brand-teal transition-colors"
          />
        </div>

        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="h-10 px-3.5 rounded-xl border border-border bg-card text-xs sm:text-sm font-medium outline-none focus:border-brand-teal transition-colors"
        >
          <option value="all">Toutes les catégories ({products.length})</option>
          {categories.map((c) => {
            const count = products.filter((p) => p.categorySlug === c.slug).length;
            return (
              <option key={c.slug} value={c.slug}>
                {c.name} ({count})
              </option>
            );
          })}
        </select>
      </div>

      {/* Products Table */}
      <div className="rounded-2xl border border-border bg-card overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead>
              <tr className="border-b border-border bg-[#F9F8F6] text-muted-foreground font-bold uppercase tracking-wider text-[11px]">
                <th className="py-3 px-4">Produit</th>
                <th className="py-3 px-4">Catégorie</th>
                <th className="py-3 px-4">Prix de vente</th>
                <th className="py-3 px-4">Statut Stock</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-muted-foreground">
                    <Package size={36} className="mx-auto mb-2 text-muted-foreground/40" />
                    <p className="font-bold text-foreground">Aucun produit dans le catalogue</p>
                    <p className="text-xs mt-1">
                      {searchTerm
                        ? "Aucun résultat ne correspond à votre recherche."
                        : "Cliquez sur 'Ajouter un nouveau produit' pour créer votre premier article."}
                    </p>
                  </td>
                </tr>
              ) : (
                filtered.map((prod) => (
                  <tr key={prod.id} className="hover:bg-muted/30 transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className="relative shrink-0">
                          <img
                            src={prod.images[0] || "/images/teflook-mark.png"}
                            alt={prod.title}
                            className="size-12 rounded-xl object-cover border border-border bg-white"
                          />
                          {prod.images.length > 1 && (
                            <span
                              title={`${prod.images.length} photos`}
                              className="absolute -bottom-1 -right-1 rounded-full bg-[#4b9797] px-1.5 py-0.2 text-[10px] font-bold text-white shadow-xs"
                            >
                              +{prod.images.length - 1}
                            </span>
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="font-bold text-foreground line-clamp-1">{prod.title}</p>
                          <span className="text-[11px] text-muted-foreground">{prod.ageBracket || "Tous âges"}</span>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-brand-teal/10 text-brand-teal">
                        <FolderTree size={12} />
                        {prod.categoryName}
                      </span>
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span className="font-display font-bold text-brand-orange text-sm sm:text-base">
                        {prod.priceMad} MAD
                      </span>
                      {prod.oldPriceMad && (
                        <span className="ml-2 text-xs text-muted-foreground line-through">
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
                          className="grid size-8 place-items-center rounded-lg text-muted-foreground hover:text-brand-teal hover:bg-brand-mist/50 transition-colors cursor-pointer"
                          title="Modifier"
                        >
                          <Edit2 size={14} />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(prod.id, prod.title)}
                          className="grid size-8 place-items-center rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors cursor-pointer"
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

      {/* Create / Edit Modal with Dual Image Support */}
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
                className="grid size-8 place-items-center rounded-full text-muted-foreground hover:bg-secondary cursor-pointer"
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
                  <label className="block font-bold text-foreground mb-1">Tranche d'âge principale</label>
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

              {/* Extended Specifications (Âge recommandé, Compétences développées, SKU) */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3 rounded-xl border border-border/80 bg-muted/15">
                <div>
                  <label className="block font-bold text-foreground mb-1">
                    Âge recommandé
                  </label>
                  <input
                    type="text"
                    value={formData.ageRange}
                    onChange={(e) => setFormData({ ...formData, ageRange: e.target.value })}
                    placeholder="Ex: 6 à 9 ans, 9 ans et +"
                    className="w-full h-9 px-3 rounded-lg border border-border bg-background text-xs outline-none focus:border-brand-teal"
                  />
                  <span className="text-[10px] text-muted-foreground mt-0.5 block">Affiché sur l'onglet Détails</span>
                </div>

                <div>
                  <label className="block font-bold text-foreground mb-1">
                    Compétence développée
                  </label>
                  <input
                    type="text"
                    value={formData.skills}
                    onChange={(e) => setFormData({ ...formData, skills: e.target.value })}
                    placeholder="Concentration, Créativité..."
                    className="w-full h-9 px-3 rounded-lg border border-border bg-background text-xs outline-none focus:border-brand-teal"
                  />
                  <span className="text-[10px] text-muted-foreground mt-0.5 block">Séparées par une virgule</span>
                </div>

                <div>
                  <label className="block font-bold text-foreground mb-1">
                    Référence / SKU
                  </label>
                  <input
                    type="text"
                    value={formData.sku}
                    onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                    placeholder="Ex: 67907 ou REF-67907"
                    className="w-full h-9 px-3 rounded-lg border border-border bg-background text-xs outline-none focus:border-brand-teal"
                  />
                  <span className="text-[10px] text-muted-foreground mt-0.5 block">Code référence produit</span>
                </div>
              </div>

              {/* MULTI-IMAGE PRODUCT GALLERY MANAGER (Upload + URL + Reorder/Remove) */}
              <div className="rounded-xl border border-border p-3.5 bg-muted/20 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <label className="font-bold text-foreground flex items-center gap-1.5">
                    <ImageIcon size={14} className="text-brand-teal" />
                    Images du produit ({formData.images.length}/{MAX_PRODUCT_IMAGES})
                  </label>
                  {/* Mode Selector Tabs */}
                  <div className="flex items-center bg-background border border-border rounded-lg p-0.5 text-[11px] font-bold">
                    <button
                      type="button"
                      onClick={() => setImageInputTab("upload")}
                      className={`flex items-center gap-1 px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                        imageInputTab === "upload"
                          ? "bg-brand-teal text-white shadow-xs"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      <Upload size={12} />
                      Téléverser
                    </button>
                    <button
                      type="button"
                      onClick={() => setImageInputTab("url")}
                      className={`flex items-center gap-1 px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                        imageInputTab === "url"
                          ? "bg-brand-teal text-white shadow-xs"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      <LinkIcon size={12} />
                      Ajouter URL
                    </button>
                  </div>
                </div>

                {/* Option A: Multi-File Upload Picker */}
                {imageInputTab === "upload" && (
                  <div className="space-y-2">
                    <input
                      type="file"
                      ref={fileInputRef}
                      multiple
                      accept="image/*"
                      onChange={handleFileUpload}
                      disabled={isUploading || formData.images.length >= MAX_PRODUCT_IMAGES}
                      className="hidden"
                      id="productImageFile"
                    />
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isUploading || formData.images.length >= MAX_PRODUCT_IMAGES}
                      className="w-full border-2 border-dashed border-border hover:border-brand-teal disabled:opacity-50 disabled:cursor-not-allowed rounded-xl p-4 text-center cursor-pointer transition-colors bg-background"
                    >
                      {isUploading ? (
                        <div className="flex flex-col items-center justify-center gap-2 py-1">
                          <LoaderCircle size={22} className="animate-spin text-brand-teal" />
                          <span className="text-xs font-semibold text-muted-foreground">
                            Téléversement en cours...
                          </span>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center justify-center gap-1 py-0.5">
                          <Upload size={20} className="text-brand-teal" />
                          <span className="text-xs font-bold text-foreground">
                            {formData.images.length >= MAX_PRODUCT_IMAGES
                              ? `Limite de ${MAX_PRODUCT_IMAGES} images atteinte`
                              : "Cliquez pour sélectionner une ou plusieurs images"}
                          </span>
                          <span className="text-[11px] text-muted-foreground">
                            PNG, JPG, WebP ou GIF (max {MAX_PRODUCT_IMAGES} images, 10 Mo/fichier)
                          </span>
                        </div>
                      )}
                    </button>
                  </div>
                )}

                {/* Option B: Add Image URL Input */}
                {imageInputTab === "url" && (
                  <div className="flex items-center gap-2">
                    <input
                      type="url"
                      value={pendingImageUrl}
                      onChange={(e) => setPendingImageUrl(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          handleAddImageUrl();
                        }
                      }}
                      placeholder="https://images.unsplash.com/... ou /uploads/..."
                      disabled={formData.images.length >= MAX_PRODUCT_IMAGES}
                      className="flex-1 h-10 px-3 rounded-xl border border-border bg-background text-xs outline-none focus:border-brand-teal disabled:opacity-50"
                    />
                    <Button
                      type="button"
                      onClick={handleAddImageUrl}
                      disabled={
                        !pendingImageUrl.trim() ||
                        formData.images.length >= MAX_PRODUCT_IMAGES
                      }
                      className="h-10 px-3.5 rounded-xl bg-brand-teal hover:bg-brand-teal/90 text-white text-xs font-bold cursor-pointer shrink-0"
                    >
                      <Plus size={14} className="mr-1" />
                      Ajouter
                    </Button>
                  </div>
                )}

                {/* Multi-Image Gallery Grid with Reorder & Remove */}
                {formData.images.length > 0 && (
                  <div className="space-y-2 pt-1">
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                      {formData.images.map((imgUrl, idx) => (
                        <div
                          key={`${imgUrl}-${idx}`}
                          className={`group relative rounded-xl border p-1.5 bg-background transition-all ${
                            idx === 0
                              ? "border-[#4b9797] ring-1 ring-[#4b9797]/25"
                              : "border-border"
                          }`}
                        >
                          <div className="relative aspect-square w-full overflow-hidden rounded-lg bg-white border border-border/60">
                            <img
                              src={imgUrl}
                              alt={`Image ${idx + 1}`}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = "/images/teflook-mark.png";
                              }}
                            />
                            <span
                              className={`absolute top-1.5 left-1.5 rounded-full px-2 py-0.5 text-[10px] font-bold shadow-xs ${
                                idx === 0
                                  ? "bg-[#4b9797] text-white"
                                  : "bg-black/65 text-white"
                              }`}
                            >
                              {idx === 0 ? "Principale" : `#${idx + 1}`}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleRemoveImage(idx)}
                              className="absolute top-1.5 right-1.5 grid size-6 place-items-center rounded-full bg-white/90 text-rose-600 hover:bg-rose-600 hover:text-white border border-rose-200 shadow-xs transition-colors cursor-pointer"
                              title="Supprimer cette image"
                            >
                              <Trash2 size={12} />
                            </button>
                          </div>

                          {/* Reorder & Promote Controls */}
                          <div className="mt-1.5 flex items-center justify-between gap-1">
                            <div className="flex items-center gap-1">
                              <button
                                type="button"
                                onClick={() => handleMoveImage(idx, -1)}
                                disabled={idx === 0}
                                className="grid size-6 place-items-center rounded-md border border-border bg-muted/40 text-foreground hover:bg-brand-teal/15 hover:text-brand-teal disabled:opacity-35 disabled:cursor-not-allowed cursor-pointer"
                                title="Déplacer à gauche"
                              >
                                <ArrowLeft size={12} />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleMoveImage(idx, 1)}
                                disabled={idx === formData.images.length - 1}
                                className="grid size-6 place-items-center rounded-md border border-border bg-muted/40 text-foreground hover:bg-brand-teal/15 hover:text-brand-teal disabled:opacity-35 disabled:cursor-not-allowed cursor-pointer"
                                title="Déplacer à droite"
                              >
                                <ArrowRight size={12} />
                              </button>
                            </div>

                            {idx > 0 ? (
                              <button
                                type="button"
                                onClick={() => handleMakePrimaryImage(idx)}
                                className="inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[10px] font-bold text-[#4b9797] hover:bg-[#4b9797]/10 transition-colors cursor-pointer"
                                title="Définir comme image principale"
                              >
                                <Star size={11} />
                                <span>Principale</span>
                              </button>
                            ) : (
                              <span className="text-[10px] font-semibold text-emerald-700 flex items-center gap-0.5 pr-1">
                                <Check size={11} /> Couverture
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                    <p className="text-[10px] text-muted-foreground">
                      La première image (« Principale ») s'affiche sur les cartes boutique. Utilisez les flèches pour réorganiser l'ordre de la galerie.
                    </p>
                  </div>
                )}
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block font-bold text-foreground">Description détaillée & sections</label>
                  <span className="text-[10px] text-muted-foreground">Supporte sous-titres (C'est quoi ?, etc.) et puces</span>
                </div>
                <textarea
                  rows={5}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder={`C'est quoi ?\nUn outil visuel pédagogique pour apaiser les transitions du quotidien...\n\nCe que votre enfant y gagne :\n• Autonomie dans ses routines\n• Meilleure gestion du temps sans stress`}
                  className="w-full p-3 rounded-xl border border-border bg-background text-xs outline-none focus:border-brand-teal resize-y leading-relaxed font-sans"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="inStockCheck"
                  checked={formData.inStock}
                  onChange={(e) => setFormData({ ...formData, inStock: e.target.checked })}
                  className="rounded text-brand-teal focus:ring-brand-teal size-4 cursor-pointer"
                />
                <label htmlFor="inStockCheck" className="font-bold text-foreground cursor-pointer">
                  Produit en stock (prêt à être commandé en COD)
                </label>
              </div>

              <div className="pt-3 border-t border-border flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setModalOpen(false)}>
                  Annuler
                </Button>
                <Button
                  type="submit"
                  disabled={isUploading}
                  className="bg-brand-orange text-white hover:bg-brand-orange/90 font-bold cursor-pointer"
                >
                  {isUploading ? "Téléversement..." : "Enregistrer le produit"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
