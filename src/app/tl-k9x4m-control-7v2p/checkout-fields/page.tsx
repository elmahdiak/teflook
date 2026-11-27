"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  AlertTriangle,
  ArrowDown,
  ArrowUp,
  Check,
  CheckCircle2,
  ClipboardList,
  Copy,
  Database,
  Eye,
  LoaderCircle,
  Package,
  Plus,
  RotateCcw,
  Save,
  ShoppingBag,
  Trash2,
  Truck,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ArabicInputWithKeyboard } from "@/components/admin/ArabicVirtualKeyboard";
import {
  CheckoutFieldAddonIcon,
  DEFAULT_SHIPPING_FEE_MAD,
  SPLIT_INPUT_GROUP_CLASS,
  getAddonBoxClass,
} from "@/components/cart/CheckoutFieldAddonIcon";
import {
  CHECKOUT_FIELDS_SQL_MIGRATION,
  DEFAULT_CHECKOUT_FIELDS,
  MOROCCAN_CITIES_OPTIONS,
  deleteCheckoutField,
  fetchCheckoutFields,
  normalizeCheckoutField,
  sanitizeFieldKey,
  saveCheckoutFields,
  sortCheckoutFields,
  type CheckoutFieldConfig,
  type CheckoutFieldType,
} from "@/lib/checkout-fields";
import { cn } from "@/lib/utils";

const FIELD_TYPE_OPTIONS: { value: CheckoutFieldType; label: string }[] = [
  { value: "text", label: "Texte court (text)" },
  { value: "tel", label: "Téléphone (tel)" },
  { value: "email", label: "E-mail (email)" },
  { value: "number", label: "Nombre (number)" },
  { value: "textarea", label: "Texte long (textarea)" },
  { value: "select", label: "Liste déroulante (select)" },
  { value: "radio", label: "Choix unique (radio)" },
  { value: "checkbox", label: "Case à cocher (checkbox)" },
  { value: "date", label: "Date (date)" },
  { value: "time", label: "Heure (time)" },
  { value: "url", label: "Lien / URL (url)" },
];

function hasChoiceOptions(type: CheckoutFieldType): boolean {
  return type === "select" || type === "radio";
}

export default function AdminCheckoutFieldsPage() {
  const [fields, setFields] = useState<CheckoutFieldConfig[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [needsMigration, setNeedsMigration] = useState(false);
  const [copiedSql, setCopiedSql] = useState(false);
  const [previewLocale, setPreviewLocale] = useState<"fr" | "ar">("fr");
  const [dirtyFieldIds, setDirtyFieldIds] = useState<Record<string, boolean>>({});
  const [optionsDrafts, setOptionsDrafts] = useState<Record<string, string>>({});
  const [activeKeyboardId, setActiveKeyboardId] = useState<string | null>(null);
  const [lastSavedAt, setLastSavedAt] = useState<string | null>(null);
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);

  // Delete confirmation modal state
  const [fieldToDelete, setFieldToDelete] = useState<CheckoutFieldConfig | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

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

  // Track latest state & serialized save queue so rapid blur/toggle edits never overwrite newer typing
  const latestFieldsRef = useRef<CheckoutFieldConfig[]>([]);
  const mutationVersionRef = useRef(0);
  const lastSavedSnapshotRef = useRef("");
  const saveQueueRef = useRef<Promise<void>>(Promise.resolve());
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showToast = useCallback(
    (message: string, type: "success" | "error" = "success") => {
      setToast({ message, type });
      if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
      toastTimerRef.current = setTimeout(() => setToast(null), 4000);
    },
    []
  );

  useEffect(() => {
    fetchCheckoutFields().then((res) => {
      latestFieldsRef.current = res.fields;
      lastSavedSnapshotRef.current = JSON.stringify(sortCheckoutFields(res.fields));
      setFields(res.fields);
      setNeedsMigration(Boolean(res.needsMigration));
      setIsLoading(false);
    });
    return () => {
      if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    };
  }, []);

  const persistFields = useCallback(
    (
      nextFields: CheckoutFieldConfig[],
      options?: {
        force?: boolean;
        successMessage?: string;
        fieldIdJustSaved?: string;
      }
    ): Promise<boolean> => {
      const normalizedSnapshot = sortCheckoutFields(
        nextFields.map((f, idx) => normalizeCheckoutField(f, idx))
      );
      const serialized = JSON.stringify(normalizedSnapshot);
      const force = Boolean(options?.force);

      if (!force && serialized === lastSavedSnapshotRef.current) {
        if (options?.fieldIdJustSaved) {
          setDirtyFieldIds((prev) => {
            if (!prev[options.fieldIdJustSaved!]) return prev;
            const copy = { ...prev };
            delete copy[options.fieldIdJustSaved!];
            return copy;
          });
        }
        return Promise.resolve(true);
      }

      const expectedVersion = mutationVersionRef.current;

      const task = saveQueueRef.current.then(async () => {
        setIsSaving(true);
        const res = await saveCheckoutFields(normalizedSnapshot);
        setIsSaving(false);

        setNeedsMigration(Boolean(res.needsMigration));

        if (res.success) {
          lastSavedSnapshotRef.current = JSON.stringify(
            sortCheckoutFields(res.fields)
          );
          if (mutationVersionRef.current === expectedVersion) {
            latestFieldsRef.current = res.fields;
            setFields(res.fields);
            setDirtyFieldIds({});
          } else if (options?.fieldIdJustSaved) {
            setDirtyFieldIds((prev) => {
              const copy = { ...prev };
              delete copy[options.fieldIdJustSaved!];
              return copy;
            });
          }

          if (res.needsMigration) {
            showToast(
              "Sauvegardé localement. Exécutez le SQL ci-dessous dans Supabase pour persister en base.",
              "error"
            );
            return false;
          }

          setLastSavedAt(
            new Date().toLocaleTimeString("fr-FR", {
              hour: "2-digit",
              minute: "2-digit",
            })
          );
          showToast(
            options?.successMessage ||
              "Modifications enregistrées dans Supabase !"
          );
          return true;
        }

        showToast(res.error || "Erreur lors de la sauvegarde.", "error");
        return false;
      });

      saveQueueRef.current = task.then(() => undefined);
      return task;
    },
    [showToast]
  );

  function applyFieldsChange(
    updater: (prev: CheckoutFieldConfig[]) => CheckoutFieldConfig[],
    dirtyId?: string
  ): CheckoutFieldConfig[] {
    mutationVersionRef.current += 1;
    const next = updater(latestFieldsRef.current);
    latestFieldsRef.current = next;
    setFields(next);

    if (dirtyId) {
      setDirtyFieldIds((prev) => ({ ...prev, [dirtyId]: true }));
    }
    return next;
  }

  function handleFieldTextChange(
    id: string,
    patch: Partial<CheckoutFieldConfig>
  ) {
    applyFieldsChange(
      (prev) => prev.map((field) => (field.id === id ? { ...field, ...patch } : field)),
      id
    );
  }

  function handleFieldImmediateSave(
    id: string,
    patch: Partial<CheckoutFieldConfig>,
    successMessage?: string
  ) {
    const next = applyFieldsChange((prev) =>
      prev.map((field) => (field.id === id ? { ...field, ...patch } : field))
    );
    void persistFields(next, {
      successMessage:
        successMessage || "Champ mis à jour et enregistré dans Supabase !",
      fieldIdJustSaved: id,
    });
  }

  function handleTypeChange(
    field: CheckoutFieldConfig,
    nextType: CheckoutFieldType
  ) {
    const patch: Partial<CheckoutFieldConfig> = { field_type: nextType };
    if (
      hasChoiceOptions(nextType) &&
      (!field.options || field.options.length === 0)
    ) {
      patch.options =
        field.field_key === "city"
          ? MOROCCAN_CITIES_OPTIONS
          : ["Option 1", "Option 2"];
    }
    handleFieldImmediateSave(
      field.id,
      patch,
      `Type du champ « ${field.label_fr} » enregistré !`
    );
  }

  function handleFieldBlur(fieldId: string) {
    if (!dirtyFieldIds[fieldId]) return;
    void persistFields(latestFieldsRef.current, {
      successMessage: "Modifications du champ enregistrées dans Supabase !",
      fieldIdJustSaved: fieldId,
    });
  }

  function handleMove(index: number, direction: -1 | 1) {
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= latestFieldsRef.current.length) return;

    const next = applyFieldsChange((prev) => {
      const copy = [...prev];
      const [moved] = copy.splice(index, 1);
      copy.splice(targetIndex, 0, moved);
      return copy.map((f, i) => ({ ...f, display_order: i + 1 }));
    });

    void persistFields(next, {
      successMessage: "Ordre des champs enregistré dans Supabase !",
    });
  }

  async function handleConfirmDeleteField() {
    if (!fieldToDelete || isDeleting) return;
    const target = fieldToDelete;
    setIsDeleting(true);

    mutationVersionRef.current += 1;
    const expectedVersion = mutationVersionRef.current;
    const remaining = latestFieldsRef.current
      .filter((f) => f.id !== target.id)
      .map((f, idx) => ({ ...f, display_order: idx + 1 }));

    latestFieldsRef.current = remaining;
    setFields(remaining);
    setDirtyFieldIds((prev) => {
      const copy = { ...prev };
      delete copy[target.id];
      return copy;
    });
    setOptionsDrafts((prev) => {
      const copy = { ...prev };
      delete copy[target.id];
      return copy;
    });

    const res = await deleteCheckoutField(target.id, remaining);
    setIsDeleting(false);
    setFieldToDelete(null);
    setNeedsMigration(Boolean(res.needsMigration));

    if (res.success) {
      lastSavedSnapshotRef.current = JSON.stringify(
        sortCheckoutFields(res.fields)
      );
      if (mutationVersionRef.current === expectedVersion) {
        latestFieldsRef.current = res.fields;
        setFields(res.fields);
        setDirtyFieldIds({});
      }

      if (res.needsMigration) {
        showToast(
          `Champ « ${target.label_fr} » supprimé localement. Exécutez le SQL pour persister dans Supabase.`,
          "error"
        );
      } else {
        setLastSavedAt(
          new Date().toLocaleTimeString("fr-FR", {
            hour: "2-digit",
            minute: "2-digit",
          })
        );
        showToast(`Champ « ${target.label_fr} » supprimé de Supabase !`);
      }
    } else {
      showToast(
        res.error || "Erreur lors de la suppression dans Supabase.",
        "error"
      );
    }
  }

  async function handleCreateField(e: React.FormEvent) {
    e.preventDefault();
    const labelFr = newField.label_fr.trim();
    if (!labelFr) {
      showToast("Veuillez saisir un libellé en français.", "error");
      return;
    }

    const baseKey =
      sanitizeFieldKey(newField.field_key || labelFr) ||
      `custom_${Date.now()}`;
    const existingKeys = new Set(
      latestFieldsRef.current.map((f) => f.field_key)
    );
    let finalKey = baseKey;
    let counter = 2;
    while (existingKeys.has(finalKey)) {
      finalKey = `${baseKey}_${counter}`;
      counter += 1;
    }

    const parsedOptions = hasChoiceOptions(newField.field_type)
      ? newField.optionsText
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean)
      : undefined;

    if (
      hasChoiceOptions(newField.field_type) &&
      (!parsedOptions || parsedOptions.length === 0)
    ) {
      showToast(
        "Veuillez indiquer au moins une option séparée par des virgules.",
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
      display_order: latestFieldsRef.current.length + 1,
      placeholder_fr: newField.placeholder_fr.trim(),
      placeholder_ar: newField.placeholder_ar.trim(),
      options: parsedOptions,
      is_system: false,
    };

    const next = applyFieldsChange((prev) => sortCheckoutFields([...prev, created]));
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

    await persistFields(next, {
      force: true,
      successMessage: `Champ « ${labelFr} » ajouté et enregistré dans Supabase !`,
    });
  }

  async function handleSaveAll() {
    await persistFields(latestFieldsRef.current, {
      force: true,
      successMessage:
        "Formulaire de commande enregistré avec succès dans Supabase !",
    });
  }

  function handleResetDefaults() {
    if (
      !window.confirm(
        "Réinitialiser tous les champs du formulaire aux valeurs par défaut ?"
      )
    ) {
      return;
    }
    setOptionsDrafts({});
    setDirtyFieldIds({});
    const next = applyFieldsChange(() => DEFAULT_CHECKOUT_FIELDS);
    void persistFields(next, {
      force: true,
      successMessage:
        "Valeurs par défaut restaurées et enregistrées dans Supabase !",
    });
  }

  async function handleCopySql() {
    try {
      await navigator.clipboard.writeText(CHECKOUT_FIELDS_SQL_MIGRATION);
      setCopiedSql(true);
      setTimeout(() => setCopiedSql(false), 2500);
    } catch {}
  }

  const enabledFields = fields.filter((f) => f.is_enabled);
  const hasUnsavedChanges = Object.keys(dirtyFieldIds).length > 0;

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

      {/* Delete Confirmation Modal */}
      {fieldToDelete && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="delete-field-title"
        >
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-xs"
            onClick={() => !isDeleting && setFieldToDelete(null)}
            aria-hidden="true"
          />
          <div className="relative z-10 w-full max-w-md rounded-3xl border border-[#4B9393]/20 bg-white p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-start gap-3.5">
              <div className="grid size-11 shrink-0 place-items-center rounded-2xl bg-red-50 text-red-600 border border-red-200">
                <AlertTriangle size={20} />
              </div>
              <div className="space-y-1">
                <h2
                  id="delete-field-title"
                  className="font-display text-lg font-bold text-[#1A3C34]"
                >
                  Supprimer ce champ ?
                </h2>
                <p className="text-xs sm:text-sm text-[#1A3C34]/75 leading-relaxed">
                  Voulez-vous vraiment supprimer le champ{" "}
                  <strong className="text-[#1A3C34]">
                    « {fieldToDelete.label_fr} »
                  </strong>{" "}
                  (<code className="text-xs">{fieldToDelete.field_key}</code>) ?
                  Il sera retiré immédiatement de Supabase et du formulaire
                  client.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-100">
              <Button
                type="button"
                variant="outline"
                disabled={isDeleting}
                onClick={() => setFieldToDelete(null)}
                className="rounded-xl text-xs font-semibold cursor-pointer"
              >
                Annuler
              </Button>
              <Button
                type="button"
                disabled={isDeleting}
                onClick={() => void handleConfirmDeleteField()}
                className="rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow-sm cursor-pointer"
              >
                {isDeleting ? (
                  <LoaderCircle size={14} className="animate-spin me-1.5" />
                ) : (
                  <Trash2 size={14} className="me-1.5" />
                )}
                Confirmer la suppression
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-[#4B9393]/15">
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <div className="inline-flex items-center gap-2 rounded-full bg-[#4B9393]/10 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-[#4B9393]">
              <ClipboardList size={13} />
              <span>Constructeur Checkout COD</span>
            </div>
            {isSaving ? (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-[#F3EFE6] px-2.5 py-1 text-[11px] font-semibold text-[#1A3C34]">
                <LoaderCircle size={12} className="animate-spin text-[#4B9393]" />
                Synchronisation Supabase...
              </span>
            ) : hasUnsavedChanges ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-[#F67D56]/10 px-2.5 py-1 text-[11px] font-semibold text-[#F67D56]">
                Modifications en attente de sauvegarde
              </span>
            ) : lastSavedAt ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 border border-emerald-200 px-2.5 py-1 text-[11px] font-semibold text-emerald-700">
                <Check size={12} />
                Synchronisé à {lastSavedAt}
              </span>
            ) : null}
          </div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-[#1A3C34]">
            Champs du Formulaire de Commande
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-[#1A3C34]/70">
            Modifiez, réordonnez, activez/désactivez ou supprimez chaque champ : toute modification est synchronisée avec Supabase et le formulaire client.
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
                Table ou contrainte Supabase <code className="text-[#F67D56]">checkout_fields</code> à initialiser / mettre à jour
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
              <ArabicInputWithKeyboard
                keyboardId="new-label-ar"
                isOpen={activeKeyboardId === "new-label-ar"}
                onToggle={(id) =>
                  setActiveKeyboardId((prev) => (prev === id ? null : id))
                }
                onClose={() => setActiveKeyboardId(null)}
                placeholder="مثال: وقت التوصيل المفضل"
                value={newField.label_ar}
                onChange={(nextVal) =>
                  setNewField((prev) => ({ ...prev, label_ar: nextVal }))
                }
                inputClassName="w-full h-10 rounded-xl border border-[#4B9393]/20 bg-white text-sm text-[#1A3C34] outline-none focus:border-[#4B9393]"
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
              <ArabicInputWithKeyboard
                keyboardId="new-placeholder-ar"
                isOpen={activeKeyboardId === "new-placeholder-ar"}
                onToggle={(id) =>
                  setActiveKeyboardId((prev) => (prev === id ? null : id))
                }
                onClose={() => setActiveKeyboardId(null)}
                placeholder="مثال: صباحاً أو مساءً"
                value={newField.placeholder_ar}
                onChange={(nextVal) =>
                  setNewField((prev) => ({
                    ...prev,
                    placeholder_ar: nextVal,
                  }))
                }
                inputClassName="w-full h-10 rounded-xl border border-[#4B9393]/20 bg-white text-sm text-[#1A3C34] outline-none focus:border-[#4B9393]"
              />
            </div>

            {hasChoiceOptions(newField.field_type) && (
              <div className="sm:col-span-2 lg:col-span-3">
                <label className="block text-xs font-bold text-[#1A3C34] mb-1.5">
                  Options de choix (séparées par des virgules) *
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
                disabled={isSaving}
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
            {fields.length === 0 ? (
              <div className="rounded-3xl border border-dashed border-[#4B9393]/30 bg-[#F3EFE6]/50 p-10 text-center space-y-4">
                <p className="text-sm font-semibold text-[#1A3C34]">
                  Aucun champ dans le formulaire.
                </p>
                <div className="flex flex-wrap items-center justify-center gap-3">
                  <Button
                    type="button"
                    onClick={() => setIsAddingField(true)}
                    className="rounded-2xl bg-[#4B9393] hover:bg-[#3D7B7B] text-white text-xs font-bold cursor-pointer"
                  >
                    <Plus size={14} className="me-1.5" />
                    Ajouter un champ
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleResetDefaults}
                    className="rounded-2xl text-xs font-semibold cursor-pointer"
                  >
                    <RotateCcw size={14} className="me-1.5" />
                    Restaurer les champs par défaut
                  </Button>
                </div>
              </div>
            ) : (
              fields.map((field, idx) => {
                const isDirty = Boolean(dirtyFieldIds[field.id]);
                const optionsDisplayValue =
                  optionsDrafts[field.id] ?? (field.options || []).join(", ");

                return (
                  <div
                    key={field.id}
                    className={cn(
                      "rounded-3xl border p-5 sm:p-6 transition-all shadow-xs space-y-4",
                      field.is_enabled
                        ? "bg-white border-[#4B9393]/20"
                        : "bg-[#F3EFE6]/50 border-slate-200/80 opacity-85",
                      isDirty && "ring-2 ring-[#F67D56]/30"
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
                              {field.label_fr || field.field_key}
                            </span>
                            <code className="rounded-full bg-[#F3EFE6] px-2.5 py-0.5 text-[10px] font-mono font-semibold text-[#1A3C34]/75">
                              {field.field_key}
                            </code>
                            <span className="rounded-full bg-[#4B9393]/10 px-2.5 py-0.5 text-[10px] font-bold text-[#4B9393]">
                              {field.field_type}
                            </span>
                            {isDirty && (
                              <span className="rounded-full bg-[#F67D56]/12 px-2 py-0.5 text-[10px] font-bold text-[#F67D56]">
                                Non enregistré
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Order, Required, Enable, Save & Delete Actions */}
                      <div className="flex flex-wrap items-center gap-2">
                        <button
                          type="button"
                          disabled={idx === 0}
                          onClick={() => handleMove(idx, -1)}
                          aria-label="Monter"
                          title="Monter"
                          className="grid size-8 place-items-center rounded-xl border border-[#4B9393]/20 bg-[#F3EFE6]/60 text-[#1A3C34] hover:bg-[#4B9393] hover:text-white disabled:opacity-35 transition-colors cursor-pointer"
                        >
                          <ArrowUp size={14} />
                        </button>
                        <button
                          type="button"
                          disabled={idx === fields.length - 1}
                          onClick={() => handleMove(idx, 1)}
                          aria-label="Descendre"
                          title="Descendre"
                          className="grid size-8 place-items-center rounded-xl border border-[#4B9393]/20 bg-[#F3EFE6]/60 text-[#1A3C34] hover:bg-[#4B9393] hover:text-white disabled:opacity-35 transition-colors cursor-pointer"
                        >
                          <ArrowDown size={14} />
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            handleFieldImmediateSave(
                              field.id,
                              { is_required: !field.is_required },
                              `Champ « ${field.label_fr} » défini comme ${
                                !field.is_required ? "obligatoire" : "optionnel"
                              }.`
                            )
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
                              handleFieldImmediateSave(
                                field.id,
                                { is_enabled: e.target.checked },
                                `Champ « ${field.label_fr} » ${
                                  e.target.checked ? "activé" : "désactivé"
                                } !`
                              )
                            }
                            className="sr-only peer"
                          />
                          <div className="w-10 h-5.5 bg-slate-200 rounded-full peer peer-checked:bg-[#4B9393] after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:rounded-full after:h-4.5 after:w-4.5 after:transition-all peer-checked:after:translate-x-4.5" />
                        </label>

                        {/* Per-Card Explicit Save Button */}
                        <button
                          type="button"
                          disabled={isSaving}
                          onClick={() =>
                            void persistFields(latestFieldsRef.current, {
                              force: true,
                              successMessage: `Champ « ${field.label_fr} » enregistré dans Supabase !`,
                              fieldIdJustSaved: field.id,
                            })
                          }
                          title="Enregistrer ce champ dans Supabase"
                          className={cn(
                            "inline-flex items-center gap-1 rounded-xl px-2.5 h-8 text-[11px] font-bold border transition-colors cursor-pointer",
                            isDirty
                              ? "bg-[#F67D56] border-[#F67D56] text-white hover:bg-[#e06d48] shadow-xs"
                              : "bg-[#4B9393]/8 border-[#4B9393]/20 text-[#4B9393] hover:bg-[#4B9393] hover:text-white"
                          )}
                        >
                          <Save size={13} />
                          <span className="hidden sm:inline">Enregistrer</span>
                        </button>

                        {/* Delete Field Button (all cards) */}
                        <button
                          type="button"
                          onClick={() => setFieldToDelete(field)}
                          aria-label={`Supprimer ${field.label_fr}`}
                          title="Supprimer ce champ"
                          className="inline-flex items-center justify-center rounded-xl border border-red-200 bg-red-50/70 size-8 text-red-500 hover:bg-red-100 hover:text-red-700 hover:border-red-300 transition-colors cursor-pointer"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>

                    {/* Inline Bilingual & Type Config Inputs */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                      <div>
                        <label className="block font-semibold text-[#1A3C34]/70 mb-1">
                          Libellé (FR)
                        </label>
                        <input
                          type="text"
                          value={field.label_fr}
                          onChange={(e) =>
                            handleFieldTextChange(field.id, {
                              label_fr: e.target.value,
                            })
                          }
                          onBlur={() => handleFieldBlur(field.id)}
                          className="w-full h-9 px-3 rounded-xl border border-[#4B9393]/20 bg-[#F3EFE6]/35 focus:bg-white text-[#1A3C34] outline-none focus:border-[#4B9393]"
                        />
                      </div>
                      <div>
                        <label className="block font-semibold text-[#1A3C34]/70 mb-1">
                          Libellé (AR)
                        </label>
                        <ArabicInputWithKeyboard
                          keyboardId={`${field.id}-label-ar`}
                          isOpen={activeKeyboardId === `${field.id}-label-ar`}
                          onToggle={(id) =>
                            setActiveKeyboardId((prev) =>
                              prev === id ? null : id
                            )
                          }
                          onClose={() => setActiveKeyboardId(null)}
                          value={field.label_ar}
                          onChange={(nextVal) =>
                            handleFieldTextChange(field.id, {
                              label_ar: nextVal,
                            })
                          }
                          onBlur={() => handleFieldBlur(field.id)}
                          inputClassName="w-full h-9 rounded-xl border border-[#4B9393]/20 bg-[#F3EFE6]/35 focus:bg-white text-[#1A3C34] outline-none focus:border-[#4B9393]"
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
                            handleFieldTextChange(field.id, {
                              placeholder_fr: e.target.value,
                            })
                          }
                          onBlur={() => handleFieldBlur(field.id)}
                          className="w-full h-9 px-3 rounded-xl border border-[#4B9393]/20 bg-[#F3EFE6]/35 focus:bg-white text-[#1A3C34] outline-none focus:border-[#4B9393]"
                        />
                      </div>
                      <div>
                        <label className="block font-semibold text-[#1A3C34]/70 mb-1">
                          Placeholder (AR)
                        </label>
                        <ArabicInputWithKeyboard
                          keyboardId={`${field.id}-placeholder-ar`}
                          isOpen={
                            activeKeyboardId === `${field.id}-placeholder-ar`
                          }
                          onToggle={(id) =>
                            setActiveKeyboardId((prev) =>
                              prev === id ? null : id
                            )
                          }
                          onClose={() => setActiveKeyboardId(null)}
                          value={field.placeholder_ar}
                          onChange={(nextVal) =>
                            handleFieldTextChange(field.id, {
                              placeholder_ar: nextVal,
                            })
                          }
                          onBlur={() => handleFieldBlur(field.id)}
                          inputClassName="w-full h-9 rounded-xl border border-[#4B9393]/20 bg-[#F3EFE6]/35 focus:bg-white text-[#1A3C34] outline-none focus:border-[#4B9393]"
                        />
                      </div>

                      <div
                        className={cn(
                          hasChoiceOptions(field.field_type)
                            ? "sm:col-span-1"
                            : "sm:col-span-2"
                        )}
                      >
                        <label className="block font-semibold text-[#1A3C34]/70 mb-1">
                          Type de champ
                        </label>
                        <select
                          value={field.field_type}
                          onChange={(e) =>
                            handleTypeChange(
                              field,
                              e.target.value as CheckoutFieldType
                            )
                          }
                          className="w-full h-9 px-3 rounded-xl border border-[#4B9393]/20 bg-[#F3EFE6]/35 focus:bg-white text-[#1A3C34] outline-none focus:border-[#4B9393] cursor-pointer"
                        >
                          {FIELD_TYPE_OPTIONS.map((opt) => (
                            <option key={opt.value} value={opt.value}>
                              {opt.label}
                            </option>
                          ))}
                        </select>
                      </div>

                      {hasChoiceOptions(field.field_type) && (
                        <div>
                          <label className="block font-semibold text-[#1A3C34]/70 mb-1">
                            Options (séparées par des virgules)
                          </label>
                          <input
                            type="text"
                            placeholder="Ex: Matin, Après-midi, Soir"
                            value={optionsDisplayValue}
                            onChange={(e) => {
                              const raw = e.target.value;
                              setOptionsDrafts((prev) => ({
                                ...prev,
                                [field.id]: raw,
                              }));
                              handleFieldTextChange(field.id, {
                                options: raw
                                  .split(",")
                                  .map((s) => s.trim())
                                  .filter(Boolean),
                              });
                            }}
                            onBlur={() => {
                              setOptionsDrafts((prev) => {
                                const copy = { ...prev };
                                delete copy[field.id];
                                return copy;
                              });
                              handleFieldBlur(field.id);
                            }}
                            className="w-full h-9 px-3 rounded-xl border border-[#4B9393]/20 bg-[#F3EFE6]/35 focus:bg-white text-[#1A3C34] outline-none focus:border-[#4B9393]"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            )}

            {/* Footer Save Bar */}
            {fields.length > 0 && (
              <div className="flex flex-wrap items-center justify-between gap-3 rounded-3xl border border-[#4B9393]/20 bg-[#F3EFE6]/70 px-5 py-4">
                <p className="text-xs text-[#1A3C34]/75">
                  Les interrupteurs et changements de type s&apos;enregistrent instantanément ; les libellés et placeholders se synchronisent dès que vous quittez un champ ou cliquez sur Enregistrer.
                </p>
                <Button
                  type="button"
                  onClick={() => void handleSaveAll()}
                  disabled={isSaving || isLoading}
                  className="rounded-2xl bg-[#F67D56] hover:bg-[#e06d48] text-white text-xs sm:text-sm font-bold shadow-sm cursor-pointer shrink-0"
                >
                  {isSaving ? (
                    <LoaderCircle size={15} className="animate-spin me-1.5" />
                  ) : (
                    <Save size={15} className="me-1.5" />
                  )}
                  Enregistrer tout
                </Button>
              </div>
            )}
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
              className="rounded-2xl bg-white border border-[#4B9393]/20 overflow-hidden shadow-xs"
            >
              {/* Preview Modal Header */}
              <div className="border-b border-[#4B9393]/15 bg-[#F3EFE6]/70 px-4 py-3 flex items-center gap-2.5">
                <div className="grid size-8 place-items-center rounded-lg bg-[#4B9393] text-white shrink-0">
                  <ShoppingBag size={14} />
                </div>
                <div className="min-w-0">
                  <p className="font-display text-xs font-bold text-[#1A3C34] truncate">
                    {previewLocale === "ar"
                      ? "يرجى ملء الاستمارة للطلب"
                      : "Veuillez remplir le formulaire pour commander"}
                  </p>
                  <p className="text-[10px] font-medium text-[#4B9393]">
                    {previewLocale === "ar"
                      ? "الدفع نقداً عند الاستلام • المغرب"
                      : "Paiement en espèces à la livraison"}
                  </p>
                </div>
              </div>

              <div className="p-4 space-y-3.5">
                {/* Preview Product Summary Row */}
                <div className="rounded-xl border border-[#4B9393]/20 bg-[#F3EFE6]/45 p-2.5 flex items-center justify-between gap-2.5">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="relative shrink-0 mt-1 me-1">
                      <div className="w-11 h-11 rounded-xl border border-[#4B9393]/15 bg-[#F3EFE6] flex items-center justify-center text-[#4B9393]">
                        <Package size={18} />
                      </div>
                      <span className="absolute -top-2 -right-2 bg-[#1A3C34] text-white text-[10px] font-bold w-4.5 h-4.5 rounded-full flex items-center justify-center">
                        1
                      </span>
                    </div>
                    <span className="text-xs font-bold text-[#1A3C34] truncate">
                      {previewLocale === "ar"
                        ? "لعبة تعليمية تيفلوك"
                        : "Coffret éducatif TefLook"}
                    </span>
                  </div>
                  <span className="text-xs font-extrabold text-[#1A3C34] shrink-0">
                    240 {previewLocale === "ar" ? "درهم" : "MAD"}
                  </span>
                </div>

                {/* Preview Shipping Card */}
                <div className="space-y-1">
                  <span className="block text-[10px] font-bold uppercase tracking-wider text-[#1A3C34]/70">
                    {previewLocale === "ar" ? "خيارات الشحن" : "Options d'expédition"}
                  </span>
                  <div className="border border-[#4B9393]/25 bg-[#F3EFE6]/40 rounded-xl p-2.5 flex items-center justify-between gap-2 text-xs">
                    <div className="flex items-center gap-2">
                      <span className="size-3.5 rounded-full border-2 border-[#4B9393] bg-white flex items-center justify-center">
                        <span className="size-1.5 rounded-full bg-[#4B9393]" />
                      </span>
                      <span className="font-semibold text-[#1A3C34]">
                        {previewLocale === "ar"
                          ? "التوصيل لجميع المدن المغربية"
                          : "Partout au Maroc"}
                      </span>
                    </div>
                    <span className="font-extrabold text-[#1A3C34]">
                      {DEFAULT_SHIPPING_FEE_MAD}{" "}
                      {previewLocale === "ar" ? "درهم" : "MAD"}
                    </span>
                  </div>
                </div>

                {enabledFields.length === 0 ? (
                  <p className="text-xs text-center text-slate-400 py-6">
                    Aucun champ activé. Activez au moins un champ à gauche.
                  </p>
                ) : (
                  <div className="space-y-2.5">
                    {enabledFields.map((field) => {
                      const isPreviewAr = previewLocale === "ar";
                      const label = isPreviewAr
                        ? field.label_ar || field.label_fr
                        : field.label_fr;
                      const placeholder = isPreviewAr
                        ? field.placeholder_ar || field.placeholder_fr
                        : field.placeholder_fr;
                      const addonBoxClass = getAddonBoxClass(isPreviewAr);

                      if (field.field_type === "checkbox") {
                        return (
                          <div
                            key={field.id}
                            className="flex items-center gap-2.5 rounded-xl border border-[#4B9393]/25 bg-[#F3EFE6]/30 px-3 py-2.5 text-xs"
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

                      if (field.field_type === "radio") {
                        const radioOpts =
                          field.options && field.options.length > 0
                            ? field.options
                            : ["Option 1", "Option 2"];
                        return (
                          <div key={field.id} className="space-y-1.5">
                            <label className="block text-xs font-bold text-[#1A3C34]">
                              {label}
                              {field.is_required && (
                                <span className="text-[#F67D56] ms-1">*</span>
                              )}
                            </label>
                            <div className="grid grid-cols-2 gap-1.5">
                              {radioOpts.map((opt, radioIdx) => (
                                <div
                                  key={`${opt}-${radioIdx}`}
                                  className={cn(
                                    "flex items-center gap-2 rounded-xl border px-2.5 py-2 text-[11px] font-medium text-[#1A3C34]",
                                    radioIdx === 0
                                      ? "border-[#4B9393] bg-[#F3EFE6]/65"
                                      : "border-[#4B9393]/20 bg-white"
                                  )}
                                >
                                  <input
                                    type="radio"
                                    disabled
                                    name={`preview-radio-${field.id}`}
                                    defaultChecked={radioIdx === 0}
                                    className="size-3.5 accent-[#4B9393]"
                                  />
                                  <span className="truncate">{opt}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        );
                      }

                      const previewInputType =
                        field.field_type === "tel" ||
                        field.field_type === "email" ||
                        field.field_type === "number" ||
                        field.field_type === "date" ||
                        field.field_type === "time" ||
                        field.field_type === "url"
                          ? field.field_type
                          : "text";

                      return (
                        <div key={field.id}>
                          <label className="block text-xs font-bold text-[#1A3C34] mb-1">
                            {label}
                            {field.is_required && (
                              <span className="text-[#F67D56] ms-1">*</span>
                            )}
                          </label>
                          <div className={SPLIT_INPUT_GROUP_CLASS}>
                            <div className={addonBoxClass}>
                              <CheckoutFieldAddonIcon field={field} size={14} />
                            </div>

                            {field.field_type === "textarea" ? (
                              <textarea
                                disabled
                                rows={2}
                                placeholder={placeholder}
                                className="flex-1 min-w-0 p-2.5 text-xs text-[#1A3C34] bg-transparent resize-none"
                              />
                            ) : field.field_type === "select" ? (
                              <select
                                disabled
                                defaultValue=""
                                className="flex-1 min-w-0 h-9 px-3 text-xs text-[#1A3C34]/50 bg-transparent"
                              >
                                <option value="" disabled>
                                  {placeholder ||
                                    (field.field_key === "city"
                                      ? isPreviewAr
                                        ? "اختر مدينتك..."
                                        : "Choisir votre ville..."
                                      : isPreviewAr
                                        ? "اختر خياراً..."
                                        : "Sélectionner...")}
                                </option>
                              </select>
                            ) : (
                              <input
                                type={previewInputType}
                                disabled
                                placeholder={placeholder}
                                className="flex-1 min-w-0 h-9 px-3 text-xs text-[#1A3C34] bg-transparent"
                              />
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                <div className="pt-1 space-y-2">
                  <div className="w-full py-3 px-4 rounded-xl bg-[#F67D56] text-white text-xs font-bold shadow-md flex items-center justify-center gap-2">
                    <ShoppingBag size={15} />
                    <span>
                      {previewLocale === "ar"
                        ? `اطلب الآن • ${240 + DEFAULT_SHIPPING_FEE_MAD} درهم`
                        : `Commander maintenant • ${240 + DEFAULT_SHIPPING_FEE_MAD} MAD`}
                    </span>
                  </div>
                  <p className="text-center text-[10px] font-medium text-[#1A3C34]/70 flex items-center justify-center gap-1">
                    <Truck size={11} className="text-[#4B9393]" />
                    <span>
                      {previewLocale === "ar"
                        ? "توصيل خلال 24-48 ساعة • الدفع نقداً عند الاستلام"
                        : "Livraison 24–48h • Paiement en espèces à la livraison"}
                    </span>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
