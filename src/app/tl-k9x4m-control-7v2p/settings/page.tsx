"use client";

import React, { useEffect, useState } from "react";
import {
  Check,
  CheckCircle2,
  ExternalLink,
  LoaderCircle,
  MessageCircle,
  Phone,
  Power,
  RotateCcw,
  Save,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  cleanWhatsAppNumber,
  fetchSiteSettings,
  saveSiteSettings,
  DEFAULT_SITE_SETTINGS,
  type SiteSettings,
} from "@/lib/site-settings";

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<SiteSettings>(DEFAULT_SITE_SETTINGS);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  useEffect(() => {
    fetchSiteSettings().then((s) => {
      if (s) setSettings(s);
      setIsLoading(false);
    });
  }, []);

  const showToast = (message: string, type: "success" | "error" = "success") => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 4500);
  };

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setIsSaving(true);

    const res = await saveSiteSettings(settings);
    setIsSaving(false);

    if (res.success && res.data) {
      setSettings(res.data);
      showToast("Paramètres WhatsApp enregistrés avec succès dans Supabase !");
    } else {
      showToast(res.error || "Erreur lors de la sauvegarde.", "error");
    }
  }

  const cleanedPhone = cleanWhatsAppNumber(settings.whatsapp_phone);
  const testWhatsAppUrl = `https://wa.me/${cleanedPhone}?text=${encodeURIComponent(
    "Bonjour TefLook, message de test depuis le panneau administrateur."
  )}`;

  return (
    <div className="space-y-8 max-w-4xl">
      {/* Toast Notification */}
      {toast && (
        <div
          className={`fixed top-5 right-5 z-50 flex items-center gap-3 px-5 py-3.5 rounded-2xl shadow-2xl text-xs sm:text-sm font-bold text-white animate-in fade-in slide-in-from-top-4 ${
            toast.type === "error" ? "bg-rose-600" : "bg-emerald-700"
          }`}
        >
          <CheckCircle2 size={18} />
          <span>{toast.message}</span>
        </div>
      )}

      {/* Header */}
      <div className="pb-4 border-b border-border">
        <h1 className="font-display text-2xl sm:text-3xl font-black text-foreground">
          Configuration Support & WhatsApp
        </h1>
        <p className="mt-1 text-xs sm:text-sm text-muted-foreground">
          Gérez le numéro de téléphone WhatsApp de la boutique affiché aux visiteurs sur le storefront public.
        </p>
      </div>

      {isLoading ? (
        <div className="py-12 grid place-items-center">
          <LoaderCircle size={28} className="animate-spin text-brand-teal" />
        </div>
      ) : (
        <form onSubmit={handleSave} className="space-y-6">
          {/* Main WhatsApp Card */}
          <div className="rounded-2xl sm:rounded-3xl border border-border bg-card p-6 sm:p-8 shadow-xs space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-border">
              <div className="flex items-center gap-3">
                <div className="grid size-11 place-items-center rounded-2xl bg-[#25D366]/15 text-[#25D366]">
                  <MessageCircle size={24} />
                </div>
                <div>
                  <h2 className="font-display text-lg font-bold text-foreground">
                    Support Client WhatsApp
                  </h2>
                  <p className="text-xs text-muted-foreground">
                    Bouton flottant et liens de contact direct pour les clients
                  </p>
                </div>
              </div>

              {/* Status Badge */}
              <span
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
                  settings.whatsapp_enabled
                    ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                    : "bg-muted text-muted-foreground border border-border"
                }`}
              >
                <span
                  className={`size-2 rounded-full ${
                    settings.whatsapp_enabled ? "bg-emerald-500 animate-pulse" : "bg-muted-foreground"
                  }`}
                />
                {settings.whatsapp_enabled ? "Bouton Actif sur le site" : "Désactivé"}
              </span>
            </div>

            {/* Toggle Switch */}
            <div className="flex items-center justify-between p-4 rounded-xl border border-border bg-muted/20">
              <div>
                <span className="font-bold text-sm text-foreground block">
                  Activer le bouton flottant WhatsApp
                </span>
                <span className="text-xs text-muted-foreground">
                  Affiche ou masque le bouton vert dans le coin inférieur droit de toutes les pages.
                </span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.whatsapp_enabled}
                  onChange={(e) =>
                    setSettings({ ...settings, whatsapp_enabled: e.target.checked })
                  }
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-muted peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#25D366]" />
              </label>
            </div>

            {/* Phone Number Input */}
            <div className="space-y-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-foreground">
                Numéro WhatsApp officiel (Maroc ou International) *
              </label>
              <div className="relative">
                <div className="absolute left-3.5 top-1/2 -translate-y-1/2 flex items-center gap-2 pointer-events-none">
                  <span className="text-base">🇲🇦</span>
                  <Phone size={15} className="text-muted-foreground" />
                </div>
                <input
                  type="text"
                  required
                  value={settings.whatsapp_phone}
                  onChange={(e) =>
                    setSettings({ ...settings, whatsapp_phone: e.target.value })
                  }
                  placeholder="+212600000000 ou 0661234567"
                  className="w-full h-11 pl-16 pr-4 rounded-xl border border-border bg-background text-sm font-semibold outline-none focus:border-[#25D366] transition-colors"
                />
              </div>
              <p className="text-[11px] text-muted-foreground">
                Format libre accepté : local marocain (ex: <code className="font-mono text-foreground font-bold">0661234567</code>) ou international (ex: <code className="font-mono text-foreground font-bold">+212 600-000000</code>). Il est automatiquement normalisé en <code className="font-mono text-[#25D366] font-bold">{cleanedPhone}</code>.
              </p>
            </div>

            {/* Floating Position Selector */}
            <div className="space-y-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-foreground">
                Position du bouton flottant sur l&apos;écran
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setSettings({ ...settings, whatsapp_position: "right" })}
                  className={`flex items-center justify-between p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                    settings.whatsapp_position !== "left"
                      ? "border-[#25D366] bg-[#25D366]/10 ring-2 ring-[#25D366]/20"
                      : "border-border bg-background hover:bg-muted/30"
                  }`}
                >
                  <div>
                    <span className="block text-xs sm:text-sm font-bold text-foreground">
                      Bas à droite / Bottom Right
                    </span>
                    <span className="block text-[11px] text-muted-foreground mt-0.5">
                      Bouton &laquo; Retour en haut &raquo; placé en bas à gauche
                    </span>
                  </div>
                  <span
                    className={`size-4 rounded-full border-2 flex items-center justify-center shrink-0 ${
                      settings.whatsapp_position !== "left" ? "border-[#25D366]" : "border-muted-foreground/40"
                    }`}
                  >
                    {settings.whatsapp_position !== "left" && (
                      <span className="size-2 rounded-full bg-[#25D366]" />
                    )}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setSettings({ ...settings, whatsapp_position: "left" })}
                  className={`flex items-center justify-between p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                    settings.whatsapp_position === "left"
                      ? "border-[#25D366] bg-[#25D366]/10 ring-2 ring-[#25D366]/20"
                      : "border-border bg-background hover:bg-muted/30"
                  }`}
                >
                  <div>
                    <span className="block text-xs sm:text-sm font-bold text-foreground">
                      Bas à gauche / Bottom Left
                    </span>
                    <span className="block text-[11px] text-muted-foreground mt-0.5">
                      Bouton &laquo; Retour en haut &raquo; placé en bas à droite
                    </span>
                  </div>
                  <span
                    className={`size-4 rounded-full border-2 flex items-center justify-center shrink-0 ${
                      settings.whatsapp_position === "left" ? "border-[#25D366]" : "border-muted-foreground/40"
                    }`}
                  >
                    {settings.whatsapp_position === "left" && (
                      <span className="size-2 rounded-full bg-[#25D366]" />
                    )}
                  </span>
                </button>
              </div>
            </div>

            {/* Live Preview & Direct Test Link */}
            <div className="p-4 rounded-xl border border-border bg-[#F9F8F6] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <span className="text-xs font-bold text-foreground block">
                  Aperçu du lien direct généré :
                </span>
                <code className="text-[11px] text-[#25D366] font-mono break-all">
                  https://wa.me/{cleanedPhone}
                </code>
              </div>

              <a
                href={testWhatsAppUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white border border-border text-xs font-bold text-foreground hover:border-[#25D366] hover:text-[#25D366] transition-colors shadow-2xs self-start sm:self-auto"
              >
                <ExternalLink size={14} />
                <span>Tester le lien WhatsApp</span>
              </a>
            </div>

            {/* Actions Bar */}
            <div className="pt-4 border-t border-border flex items-center justify-between">
              <Button
                type="button"
                variant="outline"
                onClick={() => setSettings(DEFAULT_SITE_SETTINGS)}
                className="text-xs text-muted-foreground hover:text-foreground cursor-pointer"
              >
                <RotateCcw size={14} className="mr-1.5" />
                Réinitialiser par défaut
              </Button>

              <Button
                type="submit"
                disabled={isSaving}
                className="bg-brand-orange text-white hover:bg-brand-orange/90 font-bold px-6 cursor-pointer"
              >
                {isSaving ? (
                  <>
                    <LoaderCircle size={16} className="animate-spin mr-2" />
                    Enregistrement...
                  </>
                ) : (
                  <>
                    <Save size={16} className="mr-2" />
                    Enregistrer les paramètres
                  </>
                )}
              </Button>
            </div>
          </div>
        </form>
      )}
    </div>
  );
}
