"use client";

import React, { useEffect, useState } from "react";
import {
  ArrowDown,
  ArrowUp,
  CheckCircle2,
  ClipboardList,
  Copy,
  Database,
  Eye,
  LoaderCircle,
  Plus,
  RotateCcw,
  Save,
  Trash2,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  CHECKOUT_FIELDS_SQL_MIGRATION,
  DEFAULT_CHECKOUT_FIELDS,
  fetchCheckoutFields,
  sanitizeFieldKey,
  saveCheckoutFields,
  sortCheckoutFields,
  type CheckoutFieldConfig,
  type CheckoutFieldType,
} from "@/lib/checkout-fields";
import { cn } from "@/lib/utils";

const FIELD_TYPE_OPTIONS: { value: CheckoutFieldType; label: string }[] = [
  { value: "text", label: "Texte court (text)" },
  { value: "textarea", label: "Texte long (textarea)" },
  { value: "select", label: "Liste déroulante (select)" },
  { value: "checkbox", label: "Case à cocher (checkbox)" },
  { value: "number", label: "Nombre (number)" },
];

export default function AdminCheckoutFieldsPage() {
  const [fields, setFields] = useState<CheckoutFieldConfig[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [needsMigration, setNeedsMigration] = useState(false);
  const [copiedSql, setCopiedSql] = useState(false);
  const [previewLocale, setPreviewLocale] = useState<"fr" | "ar">("fr");
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);

  // New Custom Field Drawer/Form
  const [isAddingField, setIsAddingField] = useState(false);
  const [newField, setNewField] = useState({
    label_fr: "",
    label_ar: "",
    field_key: "",
    field_type: "text" as CheckoutFieldType,
    placeholder_fr: "",
    placeholder_ar: "",
    optionsText: "",
    is_required: false,
    is_enabled: true,
  });

  useEffect(() => {
    fetchCheckoutFields().then((res) => {
      setFields(res.fields);
      setNeedsMigration(Boolean(res.needsMigration));
      setIsLoading(false);
    });
  }, []);

  const showToast = (message: string, type: "success" | "error" = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4500);
  };

  function handleFieldUpdate(
    id: string,
    patch: Partial<CheckoutFieldConfig>
  ) {
    setFields((prev) =>
      prev.map((field) => (field.id === id ? { ...field, ...patch } : field))
    );
  }

  function handleMove(index: number, direction: -1 | 1) {
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= fields.length) return;

    setFields((prev) => {
      const next = [...prev];
      const [moved] = next.splice(index, 1);
      next.splice(targetIndex, 0, moved);
      return next.map((f, i) => ({ ...f, display_order: i + 1 }));
    });
  }

  function handleDeleteField(field: CheckoutFieldConfig) {
    if (field.is_system) {
      showToast(
        "Les champs principaux ne peuvent pas être supprimés — désactivez-les avec le bouton interrupteur.",
        "error"
      );
      return;
    }
    setFields((prev) =>
      prev
        .filter((f) => f.id !== field.id)
        .map((f, idx) => ({ ...f, display_order: idx + 1 }))
    );
  }

  function handleCreateField(e: React.FormEvent) {
    e.preventDefault();
    const labelFr = newField.label_fr.trim();
    if (!labelFr) {
      showToast("Veuillez saisir un libellé en français.", "error");
      return;
    }

    const baseKey =
      sanitizeFieldKey(newField.field_key || labelFr) ||
      `custom_${Date.now()}`;
    const existingKeys = new Set(fields.map((f) => f.field_key));
    let finalKey = baseKey;
    let counter = 2;
    while (existingKeys.has(finalKey)) {
      finalKey = `${baseKey}_${counter}`;
      counter += 1;
    }

    const parsedOptions =
      newField.field_type === "select"
        ? newField.optionsText
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean)
        : undefined;

    if (
      newField.field_type === "select" &&
      (!parsedOptions || parsedOptions.length === 0)
    ) {
      showToast(
        "Veuillez indiquer au moins une option séparée par des virgules pour la liste déroulante.",
        "error"
      );
      return;
    }

    const created: CheckoutFieldConfig = {
      id: `field-${finalKey}-${Date.now()}`,
      field_key: finalKey,
      label_fr: labelFr,
      label_ar: newField.label_ar.trim() || labelFr,
      field_type: newField.field_type,
      is_required: newField.is_required,
      is_enabled: newField.is_enabled,
      display_order: fields.length + 1,
      placeholder_fr: newField.placeholder_fr.trim(),
      placeholder_ar: newField.placeholder_ar.trim(),
      options: parsedOptions,
      is_system: false,
    };

    setFields((prev) => sortCheckoutFields([...prev, created]));
    setNewField({
      label_fr: "",
      label_ar: "",
      field_key: "",
      field_type: "text",
      placeholder_fr: "",
      placeholder_ar: "",
      optionsText: "",
      is_required: false,
      is_enabled: true,
    });
    setIsAddingField(false);
    showToast(`Champ "${labelFr}" ajouté — pensez à enregistrer !`);
  }

  async function handleSaveAll() {
    setIsSaving(true);
    const res = await saveCheckoutFields(fields);
    setIsSaving(false);

    setFields(res.fields);
    setNeedsMigration(Boolean(res.needsMigration));

    if (res.success && !res.needsMigration) {
      showToast(
        "Formulaire de commande enregistré avec succès dans Supabase !"
      );
    } else if (res.success && res.needsMigration) {
      showToast(
        "Sauvegardé localement. Exécutez le SQL ci-dessous dans Supabase pour persister en base.",
        "error"
      );
    } else {
      showToast(res.error || "Erreur lors de la sauvegarde.", "error");
    }
  }

  function handleResetDefaults() {
    if (
      !window.confirm(
        "Réinitialiser tous les champs du formulaire aux valeurs par défaut ?"
      )
    ) {
      return;
    }
    setFields(DEFAULT_CHECKOUT_FIELDS);
    showToast("Valeurs par défaut restaurées — cliquez sur Enregistrer.");
  }

  async function handleCopySql() {
    try {
      await navigator.clipboard.writeText(CHECKOUT_FIELDS_SQL_MIGRATION);
      setCopiedSql(true);
      setTimeout(() => setCopiedSql(false), 2500);
    } catch {}
  }

  const enabledFields = fields.filter((f) => f.is_enabled);

  return (
    <div className="space-y-8 max-w-6xl">
      {/* Toast Notification */}
      {toast && (
        <div
          className={cn(
            "fixed top-5 end-5 z-50 flex items-center gap-3 px-5 py-3.5 rounded-2xl shadow-2xl text-xs sm:text-sm font-bold text-white animate-in fade-in slide-in-from-top-4",
            toast.type === "error" ? "bg-[#F67D56]" : "bg-[#4B9393]"
          )}
        >
          <CheckCircle2 size={18} />
          <span>{toast.message}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-[#4B9393]/15">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full bg-[#4B9393]/10 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-[#4B9393] mb-2">
            <ClipboardList size={13} />
            <span>Constructeur Checkout COD</span>
          </div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-[#1A3C34]">
            Champs du Formulaire de Commande
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-[#1A3C34]/70">
            Activez, réordonnez, personnalisez les libellés bilingues FR/AR et ajoutez des champs sur mesure à votre fenêtre Cash on Delivery.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <Button
            type="button"
            variant="outline"
            onClick={handleResetDefaults}
            className="rounded-2xl border-[#4B9393]/25 bg-[#F3EFE6]/70 text-[#1A3C34] hover:bg-[#F3EFE6] text-xs font-semibold cursor-pointer"
          >
            <RotateCcw size={14} className="me-1.5" />
            Réinitialiser
          </Button>
          <Button
            type="button"
            onClick={() => setIsAddingField((v) => !v)}
            className="rounded-2xl bg-[#4B9393] hover:bg-[#3D7B7B] text-white text-xs font-bold shadow-sm cursor-pointer"
          >
            <Plus size={15} className="me-1.5" />
            Ajouter un champ
          </Button>
          <Button
            type="button"
            onClick={() => void handleSaveAll()}
            disabled={isSaving || isLoading}
            className="rounded-2xl bg-[#F67D56] hover:bg-[#e06d48] text-white text-xs sm:text-sm font-bold shadow-md cursor-pointer"
          >
            {isSaving ? (
              <LoaderCircle size={15} className="animate-spin me-1.5" />
            ) : (
              <Save size={15} className="me-1.5" />
            )}
            Enregistrer ({enabledFields.length} actifs)
          </Button>
        </div>
      </div>

      {/* Optional Supabase Migration Notice */}
      {needsMigration && (
        <div className="rounded-3xl border border-[#4B9393]/25 bg-[#F3EFE6] p-5 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 text-sm font-bold text-[#1A3C34]">
              <Database size={18} className="text-[#4B9393]" />
              <span>
                Table Supabase <code className="text-[#F67D56]">checkout_fields</code> non initialisée
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
            En attendant l&apos;exécution de cette requête dans l&apos;éditeur SQL Supabase, vos modifications sont actives localement dans ce navigateur.
          </p>
        </div>
      )}

      {/* Add Custom Field Form */}
      {isAddingField && (
        <form
          onSubmit={handleCreateField}
          className="rounded-3xl border border-[#4B9393]/25 bg-[#F3EFE6]/70 p-6 sm:p-8 shadow-sm space-y-5 animate-in fade-in duration-200"
        >
          <div className="flex items-center justify-between border-b border-[#4B9393]/15 pb-3">
            <h2 className="font-display text-lg font-bold text-[#1A3C34]">
              Nouveau champ personnalisé
            </h2>
            <button
              type="button"
              onClick={() => setIsAddingField(false)}
              className="grid size-8 place-items-center rounded-full text-[#1A3C34]/60 hover:bg-white cursor-pointer"
            >
              <X size={16} />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#1A3C34] mb-1.5">
                Libellé (Français) *
              </label>
              <input
                type="text"
                required
                placeholder="Ex: Créneau de livraison préféré"
                value={newField.label_fr}
                onChange={(e) =>
                  setNewField((prev) => ({
                    ...prev,
                    label_fr: e.target.value,
                    field_key: prev.field_key || sanitizeFieldKey(e.target.value),
                  }))
                }
                className="w-full h-10 px-3.5 rounded-xl border border-[#4B9393]/20 bg-white text-sm text-[#1A3C34] outline-none focus:border-[#4B9393]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#1A3C34] mb-1.5">
                Libellé (Arabe)
              </label>
              <input
                type="text"
                dir="rtl"
                placeholder="مثال: وقت التوصيل المفضل"
                value={newField.label_ar}
                onChange={(e) =>
                  setNewField((prev) => ({ ...prev, label_ar: e.target.value }))
                }
                className="w-full h-10 px-3.5 rounded-xl border border-[#4B9393]/20 bg-white text-sm text-[#1A3C34] outline-none focus:border-[#4B9393]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#1A3C34] mb-1.5">
                Type de champ
              </label>
              <select
                value={newField.field_type}
                onChange={(e) =>
                  setNewField((prev) => ({
                    ...prev,
                    field_type: e.target.value as CheckoutFieldType,
                  }))
                }
                className="w-full h-10 px-3.5 rounded-xl border border-[#4B9393]/20 bg-white text-sm text-[#1A3C34] outline-none focus:border-[#4B9393]"
              >
                {FIELD_TYPE_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#1A3C34] mb-1.5">
                Clé technique (field_key)
              </label>
              <input
                type="text"
                placeholder="ex: delivery_window"
                value={newField.field_key}
                onChange={(e) =>
                  setNewField((prev) => ({
                    ...prev,
                    field_key: sanitizeFieldKey(e.target.value),
                  }))
                }
                className="w-full h-10 px-3.5 rounded-xl border border-[#4B9393]/20 bg-white font-mono text-xs text-[#1A3C34] outline-none focus:border-[#4B9393]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#1A3C34] mb-1.5">
                Placeholder (Français)
              </label>
              <input
                type="text"
                placeholder="Ex: Matin (9h-13h) ou Après-midi"
                value={newField.placeholder_fr}
                onChange={(e) =>
                  setNewField((prev) => ({
                    ...prev,
                    placeholder_fr: e.target.value,
                  }))
                }
                className="w-full h-10 px-3.5 rounded-xl border border-[#4B9393]/20 bg-white text-sm text-[#1A3C34] outline-none focus:border-[#4B9393]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#1A3C34] mb-1.5">
                Placeholder (Arabe)
              </label>
              <input
                type="text"
                dir="rtl"
                placeholder="مثال: صباحاً أو مساءً"
                value={newField.placeholder_ar}
                onChange={(e) =>
                  setNewField((prev) => ({
                    ...prev,
                    placeholder_ar: e.target.value,
                  }))
                }
                className="w-full h-10 px-3.5 rounded-xl border border-[#4B9393]/20 bg-white text-sm text-[#1A3C34] outline-none focus:border-[#4B9393]"
              />
            </div>

            {newField.field_type === "select" && (
              <div className="sm:col-span-2 lg:col-span-3">
                <label className="block text-xs font-bold text-[#1A3C34] mb-1.5">
                  Options de la liste (séparées par des virgules) *
                </label>
                <input
                  type="text"
                  placeholder="Ex: Matin (09h - 13h), Après-midi (14h - 18h), Soir (18h - 21h)"
                  value={newField.optionsText}
                  onChange={(e) =>
                    setNewField((prev) => ({
                      ...prev,
                      optionsText: e.target.value,
                    }))
                  }
                  className="w-full h-10 px-3.5 rounded-xl border border-[#4B9393]/20 bg-white text-sm text-[#1A3C34] outline-none focus:border-[#4B9393]"
                />
              </div>
            )}
          </div>

          <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
            <label className="inline-flex items-center gap-2.5 text-xs font-bold text-[#1A3C34] cursor-pointer">
              <input
                type="checkbox"
                checked={newField.is_required}
                onChange={(e) =>
                  setNewField((prev) => ({
                    ...prev,
                    is_required: e.target.checked,
                  }))
                }
                className="size-4 accent-[#4B9393] rounded"
              />
              <span>Champ obligatoire lors de la commande</span>
            </label>

            <div className="flex items-center gap-2.5">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsAddingField(false)}
                className="rounded-xl text-xs cursor-pointer"
              >
                Annuler
              </Button>
              <Button
                type="submit"
                className="rounded-xl bg-[#F67D56] hover:bg-[#e06d48] text-white text-xs font-bold cursor-pointer"
              >
                Ajouter au formulaire
              </Button>
            </div>
          </div>
        </form>
      )}

      {isLoading ? (
        <div className="py-16 grid place-items-center">
          <LoaderCircle size={28} className="animate-spin text-[#4B9393]" />
        </div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
          {/* Left 7 Cols: Fields List & Inline Editors */}
          <div className="xl:col-span-7 space-y-4">
            {fields.map((field, idx) => (
              <div
                key={field.id}
                className={cn(
                  "rounded-3xl border p-5 sm:p-6 transition-all shadow-xs space-y-4",
                  field.is_enabled
                    ? "bg-white border-[#4B9393]/20"
                    : "bg-[#F3EFE6]/50 border-slate-200/80 opacity-80"
                )}
              >
                {/* Top Controls Row */}
                <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-[#4B9393]/10">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="inline-flex size-7 items-center justify-center rounded-full bg-[#4B9393]/10 text-xs font-bold text-[#4B9393] tabular-nums shrink-0">
                      {idx + 1}
                    </span>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-display font-bold text-sm sm:text-base text-[#1A3C34] truncate">
                          {field.label_fr}
                        </span>
                        <code className="rounded-full bg-[#F3EFE6] px-2.5 py-0.5 text-[10px] font-mono font-semibold text-[#1A3C34]/75">
                          {field.field_key}
                        </code>
                        <span className="rounded-full bg-[#4B9393]/10 px-2.5 py-0.5 text-[10px] font-bold text-[#4B9393]">
                          {field.field_type}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Order, Required & Enable Actions */}
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      disabled={idx === 0}
                      onClick={() => handleMove(idx, -1)}
                      aria-label="Monter"
                      className="grid size-8 place-items-center rounded-xl border border-[#4B9393]/20 bg-[#F3EFE6]/60 text-[#1A3C34] hover:bg-[#4B9393] hover:text-white disabled:opacity-35 transition-colors cursor-pointer"
                    >
                      <ArrowUp size={14} />
                    </button>
                    <button
                      type="button"
                      disabled={idx === fields.length - 1}
                      onClick={() => handleMove(idx, 1)}
                      aria-label="Descendre"
                      className="grid size-8 place-items-center rounded-xl border border-[#4B9393]/20 bg-[#F3EFE6]/60 text-[#1A3C34] hover:bg-[#4B9393] hover:text-white disabled:opacity-35 transition-colors cursor-pointer"
                    >
                      <ArrowDown size={14} />
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        handleFieldUpdate(field.id, {
                          is_required: !field.is_required,
                        })
                      }
                      className={cn(
                        "rounded-full px-3 py-1 text-[11px] font-bold transition-colors cursor-pointer border",
                        field.is_required
                          ? "bg-[#F67D56]/12 border-[#F67D56]/30 text-[#F67D56]"
                          : "bg-slate-100 border-slate-200 text-slate-500 hover:border-[#4B9393]/40"
                      )}
                    >
                      {field.is_required ? "Obligatoire *" : "Optionnel"}
                    </button>

                    {/* Toggle Switch */}
                    <label
                      className="relative inline-flex items-center cursor-pointer"
                      title={field.is_enabled ? "Activé" : "Désactivé"}
                    >
                      <input
                        type="checkbox"
                        checked={field.is_enabled}
                        onChange={(e) =>
                          handleFieldUpdate(field.id, {
                            is_enabled: e.target.checked,
                          })
                        }
                        className="sr-only peer"
                      />
                      <div className="w-10 h-5.5 bg-slate-200 rounded-full peer peer-checked:bg-[#4B9393] after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:rounded-full after:h-4.5 after:w-4.5 after:transition-all peer-checked:after:translate-x-4.5" />
                    </label>

                    {!field.is_system && (
                      <button
                        type="button"
                        onClick={() => handleDeleteField(field)}
                        aria-label="Supprimer ce champ"
                        className="grid size-8 place-items-center rounded-xl text-slate-400 hover:text-[#F67D56] hover:bg-[#F67D56]/10 transition-colors cursor-pointer"
                      >
                        <Trash2 size={15} />
                      </button>
                    )}
                  </div>
                </div>

                {/* Inline Bilingual Config Inputs */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="block font-semibold text-[#1A3C34]/70 mb-1">
                      Libellé (FR)
                    </label>
                    <input
                      type="text"
                      value={field.label_fr}
                      onChange={(e) =>
                        handleFieldUpdate(field.id, { label_fr: e.target.value })
                      }
                      className="w-full h-9 px-3 rounded-xl border border-[#4B9393]/20 bg-[#F3EFE6]/35 focus:bg-white text-[#1A3C34] outline-none focus:border-[#4B9393]"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-[#1A3C34]/70 mb-1">
                      Libellé (AR)
                    </label>
                    <input
                      type="text"
                      dir="rtl"
                      value={field.label_ar}
                      onChange={(e) =>
                        handleFieldUpdate(field.id, { label_ar: e.target.value })
                      }
                      className="w-full h-9 px-3 rounded-xl border border-[#4B9393]/20 bg-[#F3EFE6]/35 focus:bg-white text-[#1A3C34] outline-none focus:border-[#4B9393]"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-[#1A3C34]/70 mb-1">
                      Placeholder (FR)
                    </label>
                    <input
                      type="text"
                      value={field.placeholder_fr}
                      onChange={(e) =>
                        handleFieldUpdate(field.id, {
                          placeholder_fr: e.target.value,
                        })
                      }
                      className="w-full h-9 px-3 rounded-xl border border-[#4B9393]/20 bg-[#F3EFE6]/35 focus:bg-white text-[#1A3C34] outline-none focus:border-[#4B9393]"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-[#1A3C34]/70 mb-1">
                      Placeholder (AR)
                    </label>
                    <input
                      type="text"
                      dir="rtl"
                      value={field.placeholder_ar}
                      onChange={(e) =>
                        handleFieldUpdate(field.id, {
                          placeholder_ar: e.target.value,
                        })
                      }
                      className="w-full h-9 px-3 rounded-xl border border-[#4B9393]/20 bg-[#F3EFE6]/35 focus:bg-white text-[#1A3C34] outline-none focus:border-[#4B9393]"
                    />
                  </div>

                  {field.field_type === "select" && (
                    <div className="sm:col-span-2">
                      <label className="block font-semibold text-[#1A3C34]/70 mb-1">
                        Options (séparées par des virgules)
                      </label>
                      <input
                        type="text"
                        value={(field.options || []).join(", ")}
                        onChange={(e) =>
                          handleFieldUpdate(field.id, {
                            options: e.target.value
                              .split(",")
                              .map((s) => s.trim())
                              .filter(Boolean),
                          })
                        }
                        className="w-full h-9 px-3 rounded-xl border border-[#4B9393]/20 bg-[#F3EFE6]/35 focus:bg-white text-[#1A3C34] outline-none focus:border-[#4B9393]"
                      />
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Right 5 Cols: Live Checkout Modal Preview */}
          <div className="xl:col-span-5 xl:sticky xl:top-24 rounded-3xl border border-[#4B9393]/20 bg-[#F3EFE6] p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between gap-2 pb-3 border-b border-[#4B9393]/15">
              <div className="flex items-center gap-2 text-xs font-bold text-[#1A3C34]">
                <Eye size={16} className="text-[#4B9393]" />
                <span>Aperçu Formulaire Client</span>
              </div>

              <div className="inline-flex rounded-full bg-white p-1 border border-[#4B9393]/20 text-[11px] font-bold">
                <button
                  type="button"
                  onClick={() => setPreviewLocale("fr")}
                  className={cn(
                    "px-2.5 py-0.5 rounded-full transition-colors cursor-pointer",
                    previewLocale === "fr"
                      ? "bg-[#4B9393] text-white"
                      : "text-[#1A3C34]/70"
                  )}
                >
                  FR
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewLocale("ar")}
                  className={cn(
                    "px-2.5 py-0.5 rounded-full transition-colors cursor-pointer",
                    previewLocale === "ar"
                      ? "bg-[#4B9393] text-white"
                      : "text-[#1A3C34]/70"
                  )}
                >
                  AR (RTL)
                </button>
              </div>
            </div>

            <div
              dir={previewLocale === "ar" ? "rtl" : "ltr"}
              className="rounded-2xl bg-white border border-[#4B9393]/15 p-5 space-y-3.5"
            >
              {enabledFields.length === 0 ? (
                <p className="text-xs text-center text-slate-400 py-6">
                  Aucun champ activé. Activez au moins un champ à gauche.
                </p>
              ) : (
                enabledFields.map((field) => {
                  const label =
                    previewLocale === "ar"
                      ? field.label_ar || field.label_fr
                      : field.label_fr;
                  const placeholder =
                    previewLocale === "ar"
                      ? field.placeholder_ar || field.placeholder_fr
                      : field.placeholder_fr;

                  if (field.field_type === "checkbox") {
                    return (
                      <div
                        key={field.id}
                        className="flex items-center gap-2.5 rounded-xl border border-[#4B9393]/15 bg-[#F3EFE6]/50 px-3 py-2.5 text-xs"
                      >
                        <input
                          type="checkbox"
                          disabled
                          className="size-4 accent-[#4B9393]"
                        />
                        <span className="font-semibold text-[#1A3C34]">
                          {label}
                          {field.is_required && (
                            <span className="text-[#F67D56] ms-1">*</span>
                          )}
                        </span>
                      </div>
                    );
                  }

                  return (
                    <div key={field.id}>
                      <label className="block text-xs font-bold text-[#1A3C34] mb-1">
                        {label}
                        {field.is_required && (
                          <span className="text-[#F67D56] ms-1">*</span>
                        )}
                      </label>
                      {field.field_type === "textarea" ? (
                        <textarea
                          disabled
                          rows={2}
                          placeholder={placeholder}
                          className="w-full p-2.5 rounded-xl border border-slate-200 bg-[#F3EFE6]/30 text-xs resize-none"
                        />
                      ) : field.field_type === "select" ? (
                        <select
                          disabled
                          className="w-full h-9 px-3 rounded-xl border border-slate-200 bg-[#F3EFE6]/30 text-xs"
                        >
                          <option>
                            {(field.options && field.options[0]) ||
                              placeholder ||
                              label}
                          </option>
                        </select>
                      ) : (
                        <input
                          type={field.field_type === "number" ? "number" : "text"}
                          disabled
                          placeholder={placeholder}
                          className="w-full h-9 px-3 rounded-xl border border-slate-200 bg-[#F3EFE6]/30 text-xs"
                        />
                      )}
                    </div>
                  );
                })
              )}

              <div className="pt-2">
                <div className="w-full py-3 px-4 rounded-xl bg-[#F67D56] text-white text-center text-xs font-bold shadow-sm">
                  {previewLocale === "ar"
                    ? "تأكيد الطلب • الدفع عند الاستلام"
                    : "Valider ma commande (COD)"}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
