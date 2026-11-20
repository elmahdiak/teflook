"use client";

import React, { useState } from "react";
import { Check, CheckCircle2, LoaderCircle, Package, ShieldCheck, Truck, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { saveCODOrder, type CODOrderItem } from "@/lib/cod-service";
import { useCartStore } from "@/lib/shopify-cart";

const MOROCCAN_CITIES = [
  "Casablanca",
  "Rabat",
  "Marrakech",
  "Tanger",
  "Fès",
  "Agadir",
  "Meknès",
  "Oujda",
  "Kénitra",
  "Tétouan",
  "Salé",
  "Mohammédia",
  "El Jadida",
  "Nador",
  "Béni Mellal",
  "Autre ville au Maroc",
];

interface CODCheckoutModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  directItem?: CODOrderItem;
}

export function CODCheckoutModal({
  open,
  onOpenChange,
  directItem,
}: CODCheckoutModalProps) {
  const { items } = useCartStore();

  const checkoutItems: CODOrderItem[] = directItem
    ? [directItem]
    : items.map((i) => ({
        productId: i.product.id,
        title: i.product.title,
        variantTitle: i.variantTitle,
        price: Number(i.price.amount),
        quantity: i.quantity,
        imageUrl: i.product.images.edges[0]?.node?.url,
      }));

  const totalMad = checkoutItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    city: "Casablanca",
    address: "",
    notes: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createdOrderId, setCreatedOrderId] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState("");

  if (!open) return null;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!formData.name.trim()) {
      setErrorMsg("Veuillez renseigner votre nom complet.");
      return;
    }
    if (!formData.phone.trim() || formData.phone.trim().length < 8) {
      setErrorMsg("Veuillez renseigner un numéro de téléphone valide au Maroc.");
      return;
    }
    if (!formData.address.trim()) {
      setErrorMsg("Veuillez renseigner votre adresse de livraison.");
      return;
    }

    setErrorMsg("");
    setIsSubmitting(true);

    try {
      const order = saveCODOrder({
        customerName: formData.name.trim(),
        customerPhone: formData.phone.trim(),
        customerCity: formData.city,
        customerAddress: formData.address.trim(),
        notes: formData.notes.trim() || undefined,
        items: checkoutItems,
        totalMad,
      });

      // Clear cart
      if (!directItem) {
        useCartStore.setState({ items: [] });
      }

      setCreatedOrderId(order.id);
    } catch {
      setErrorMsg("Une erreur est survenue lors de l'enregistrement de votre commande.");
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleClose() {
    setCreatedOrderId(null);
    setErrorMsg("");
    onOpenChange(false);
  }

  const whatsappMessage = createdOrderId
    ? `Bonjour TefLook, je viens de passer la commande #${createdOrderId} pour un montant de ${totalMad} MAD (Paiement à la livraison). Merci de me confirmer la livraison.`
    : "";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
        onClick={handleClose}
        aria-hidden="true"
      />

      {/* Modal Dialog */}
      <div className="relative z-10 w-full max-w-lg overflow-hidden rounded-2xl bg-card border border-border shadow-2xl my-auto animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border px-5 py-4 bg-[#FBF9F5]">
          <div className="flex items-center gap-2.5">
            <div className="grid size-9 place-items-center rounded-xl bg-brand-orange text-white">
              <Truck size={18} />
            </div>
            <div>
              <h2 className="font-display text-base sm:text-lg font-bold text-foreground">
                Paiement à la livraison (Cash on Delivery)
              </h2>
              <p className="text-[11px] text-muted-foreground">
                Réglez en espèces directement à la réception de votre colis partout au Maroc
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="grid size-8 place-items-center rounded-full text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Body */}
        {createdOrderId ? (
          /* Confirmation Success View */
          <div className="p-6 text-center space-y-4">
            <div className="mx-auto grid size-16 place-items-center rounded-full bg-emerald-100 text-emerald-600">
              <CheckCircle2 size={36} />
            </div>

            <div>
              <span className="inline-block rounded-full bg-brand-teal/10 px-3 py-1 text-xs font-bold text-brand-teal mb-2">
                Commande N° #{createdOrderId}
              </span>
              <h3 className="font-display text-2xl font-bold text-foreground">
                Commande confirmée avec succès !
              </h3>
              <p className="mt-2 text-sm text-muted-foreground max-w-md mx-auto leading-relaxed">
                Merci <strong>{formData.name}</strong> ! Votre commande a été transmise à notre atelier.
                Vous paierez <strong>{totalMad} MAD en espèces</strong> au livreur à votre porte.
              </p>
            </div>

            {/* Delivery Recap Card */}
            <div className="rounded-xl border border-border/80 bg-secondary/50 p-4 text-left text-xs space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Ville de livraison :</span>
                <span className="font-bold text-foreground">{formData.city}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Téléphone :</span>
                <span className="font-bold text-foreground">{formData.phone}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Délai estimé :</span>
                <span className="font-bold text-emerald-700">24h à 48h ouvrées</span>
              </div>
              <div className="flex justify-between border-t border-border/60 pt-2 font-bold text-sm">
                <span>Montant à régler au livreur :</span>
                <span className="text-brand-orange-deep">{totalMad} MAD</span>
              </div>
            </div>

            {/* Actions */}
            <div className="pt-2 flex flex-col gap-2.5">
              <a
                href={`https://wa.me/212600000000?text=${encodeURIComponent(whatsappMessage)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#25D366] text-white font-bold text-sm hover:bg-[#20ba59] transition-all shadow-md shadow-[#25D366]/20"
              >
                <img
                  src="https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg"
                  alt=""
                  className="size-5"
                />
                Recevoir le suivi de commande sur WhatsApp
              </a>
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                className="h-11 rounded-xl"
              >
                Continuer mes achats
              </Button>
            </div>
          </div>
        ) : (
          /* COD Form View */
          <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-4 max-h-[75vh] overflow-y-auto">
            {errorMsg && (
              <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-3 text-xs text-destructive font-medium flex items-center gap-2">
                <X size={15} className="shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Order Items Preview */}
            <div className="rounded-xl border border-border bg-[#FBF9F5] p-3">
              <div className="flex items-center justify-between text-xs font-semibold text-muted-foreground mb-2">
                <span>Articles ({checkoutItems.reduce((acc, i) => acc + i.quantity, 0)})</span>
                <span className="font-bold text-foreground">{totalMad} MAD</span>
              </div>
              <div className="max-h-24 overflow-y-auto divide-y divide-border/60 text-xs">
                {checkoutItems.map((item, idx) => (
                  <div key={idx} className="py-1.5 flex justify-between items-center gap-2">
                    <span className="truncate max-w-[260px] text-foreground">
                      {item.quantity}x {item.title}
                    </span>
                    <span className="font-bold shrink-0 text-brand-orange-deep">
                      {item.price * item.quantity} MAD
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Inputs */}
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-foreground mb-1">
                  Nom et prénom <span className="text-destructive">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Fatima Zahra Alami"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full h-10 px-3 rounded-xl border border-border bg-background text-sm outline-none focus:border-brand-teal focus:ring-2 focus:ring-brand-teal/20 transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-foreground mb-1">
                  Numéro de téléphone portable <span className="text-destructive">*</span>
                </label>
                <div className="flex rounded-xl border border-border bg-background overflow-hidden focus-within:border-brand-teal focus-within:ring-2 focus-within:ring-brand-teal/20 transition-all">
                  <span className="flex items-center gap-1 bg-secondary px-3 text-xs font-bold text-foreground border-r border-border">
                    <span>🇲🇦</span>
                    <span>+212</span>
                  </span>
                  <input
                    type="tel"
                    required
                    placeholder="06 XX XX XX XX"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="flex-1 h-10 px-3 text-sm bg-transparent outline-none"
                  />
                </div>
                <p className="mt-1 text-[11px] text-muted-foreground">
                  Le livreur vous appellera sur ce numéro avant d'arriver chez vous.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-foreground mb-1">
                    Ville de livraison <span className="text-destructive">*</span>
                  </label>
                  <select
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className="w-full h-10 px-3 rounded-xl border border-border bg-background text-sm outline-none focus:border-brand-teal focus:ring-2 focus:ring-brand-teal/20 transition-all"
                  >
                    {MOROCCAN_CITIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-foreground mb-1">
                    Quartier / Secteur
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: Maârif, Agdal..."
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        notes: e.target.value ? `Quartier: ${e.target.value}` : formData.notes,
                      })
                    }
                    className="w-full h-10 px-3 rounded-xl border border-border bg-background text-sm outline-none focus:border-brand-teal focus:ring-2 focus:ring-brand-teal/20 transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-foreground mb-1">
                  Adresse de livraison complète <span className="text-destructive">*</span>
                </label>
                <textarea
                  required
                  rows={2}
                  placeholder="Rue, numéro de porte, étage, résidence..."
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full p-3 rounded-xl border border-border bg-background text-sm outline-none focus:border-brand-teal focus:ring-2 focus:ring-brand-teal/20 transition-all resize-none"
                />
              </div>
            </div>

            {/* Trust Badges */}
            <div className="flex items-center justify-between gap-2 py-2 text-[11px] text-muted-foreground border-y border-border/60">
              <span className="flex items-center gap-1">
                <Truck size={14} className="text-brand-teal" /> Livraison 24-48h
              </span>
              <span className="flex items-center gap-1">
                <ShieldCheck size={14} className="text-brand-teal" /> Zéro paiement en ligne
              </span>
              <span className="flex items-center gap-1 font-semibold text-emerald-700">
                💵 Espèces à la livraison
              </span>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={isSubmitting || checkoutItems.length === 0}
              className="w-full h-12 rounded-xl bg-brand-orange text-white font-extrabold text-sm sm:text-base hover:bg-brand-orange/90 shadow-md shadow-brand-orange/25 transition-all cursor-pointer"
            >
              {isSubmitting ? (
                <LoaderCircle className="animate-spin size-5" />
              ) : (
                `Valider ma commande • ${totalMad} MAD (Paiement à la livraison)`
              )}
            </Button>
          </form>
        )}
      </div>
    </div>
  );
}
