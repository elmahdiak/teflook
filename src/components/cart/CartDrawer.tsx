"use client";

import React, { useState } from "react";
import Image from "next/image";
import { X, Trash2, Plus, Minus, ShoppingBag, ArrowRight, ShieldCheck, Truck, MessageCircle } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { Button } from "@/components/ui/button";

export function CartDrawer() {
  const {
    items,
    isCartOpen,
    setIsCartOpen,
    removeFromCart,
    updateQuantity,
    totalItems,
    totalMad,
    totalEur,
    currency,
  } = useCart();

  const [promoCode, setPromoCode] = useState("");
  const [discountPercent, setDiscountPercent] = useState(0);
  const [promoMessage, setPromoMessage] = useState("");

  if (!isCartOpen) return null;

  const freeShippingThresholdMad = 500;
  const freeShippingThresholdEur = 50;

  const threshold = currency === "MAD" ? freeShippingThresholdMad : freeShippingThresholdEur;
  const currentTotal = currency === "MAD" ? totalMad : totalEur;
  const remaining = Math.max(0, threshold - currentTotal);
  const progressPercent = Math.min(100, Math.round((currentTotal / threshold) * 100));

  const applyPromo = (e: React.FormEvent) => {
    e.preventDefault();
    if (promoCode.trim().toUpperCase() === "TEFLOOK10") {
      setDiscountPercent(10);
      setPromoMessage("Code -10% appliqué avec succès !");
    } else {
      setPromoMessage("Code non valide. Utilisez TEFLOOK10");
    }
  };

  const discountAmount = (currentTotal * discountPercent) / 100;
  const finalTotal = currentTotal - discountAmount;

  // Generate WhatsApp order text
  const generateWhatsAppOrder = () => {
    const lines = items.map(
      (item) =>
        `- ${item.product.name} (Taille: ${item.selectedSize || "Standard"}, Qté: ${item.quantity}) : ${
          currency === "MAD"
            ? item.product.priceMad * item.quantity + " MAD"
            : item.product.priceEur * item.quantity + " €"
        }`
    );
    const orderText = `Bonjour TefLook,\nJe souhaite passer commande pour :\n${lines.join(
      "\n"
    )}\n\nTotal: ${finalTotal.toFixed(0)} ${currency}\nMerci de me confirmer la disponibilité et la livraison.`;
    return `https://wa.me/212600000000?text=${encodeURIComponent(orderText)}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity duration-300"
        onClick={() => setIsCartOpen(false)}
      />

      {/* Drawer */}
      <div className="relative w-full max-w-md bg-[#F9F8F6] text-[#1E293B] shadow-2xl flex flex-col h-full z-10 animate-in slide-in-from-right duration-300 border-l border-[#E8E5DF]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-[#E8E5DF] bg-white">
          <div className="flex items-center gap-3">
            <ShoppingBag className="w-5 h-5 text-[#C85A32]" />
            <h3 className="font-serif-brand text-2xl font-bold tracking-tight text-[#1E293B]">
              Votre Panier
            </h3>
            <span className="text-xs bg-[#EDF3F1] text-[#1A3C34] font-bold px-2.5 py-0.5 rounded-full border border-[#1A3C34]/30">
              {totalItems} {totalItems > 1 ? "articles" : "article"}
            </span>
          </div>
          <button
            onClick={() => setIsCartOpen(false)}
            className="p-2 rounded-full hover:bg-[#F9F8F6] text-[#64748B] hover:text-[#1E293B] transition-colors"
            aria-label="Fermer le panier"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Free Shipping Progress */}
        <div className="px-6 py-3.5 bg-[#EDF3F1] border-b border-[#E8E5DF]">
          <div className="flex items-center justify-between text-xs font-medium text-[#1E293B] mb-1.5">
            <span className="flex items-center gap-1.5">
              <Truck className="w-3.5 h-3.5 text-[#C85A32]" />
              {remaining > 0 ? (
                <>
                  Ajoutez{" "}
                  <strong className="text-[#C85A32]">
                    {remaining.toFixed(0)} {currency}
                  </strong>{" "}
                  pour la livraison offerte !
                </>
              ) : (
                <span className="text-emerald-700 font-semibold flex items-center gap-1">
                  🎉 Livraison offerte sur cette commande !
                </span>
              )}
            </span>
            <span className="text-[#1A3C34] font-bold">{progressPercent}%</span>
          </div>
          <div className="w-full bg-white h-1.5 rounded-full overflow-hidden border border-[#E8E5DF]">
            <div
              className="bg-[#C85A32] h-full rounded-full transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Items List */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
          {items.length === 0 ? (
            <div className="text-center py-16 space-y-4">
              <div className="w-20 h-20 mx-auto rounded-full bg-[#EDF3F1] border border-[#1A3C34]/30 flex items-center justify-center text-[#1A3C34]">
                <ShoppingBag className="w-10 h-10" />
              </div>
              <p className="font-serif-brand text-xl text-[#1E293B]">Votre panier est vide</p>
              <p className="text-sm text-[#64748B] max-w-xs mx-auto">
                Explorez nos outils éducatifs, jeux d&apos;éveil et kits de développement pour vos enfants.
              </p>
              <Button
                variant="orange"
                onClick={() => setIsCartOpen(false)}
                className="mt-2 text-sm shadow-xs"
              >
                Découvrir nos outils éducatifs
              </Button>
            </div>
          ) : (
            items.map((item, index) => {
              const price =
                currency === "MAD" ? item.product.priceMad : item.product.priceEur;
              return (
                <div
                  key={`${item.product.id}-${item.selectedSize || "default"}-${index}`}
                  className="flex gap-4 p-3.5 bg-white rounded-2xl border border-[#E8E5DF] shadow-xs"
                >
                  <div className="relative w-20 h-20 rounded-xl overflow-hidden bg-[#F9F8F6] shrink-0 border border-[#E8E5DF]">
                    <Image
                      src={item.product.images[0]}
                      alt={item.product.name}
                      fill
                      sizes="80px"
                      className="object-cover"
                    />
                  </div>
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="font-serif-brand font-bold text-sm text-[#1E293B] leading-snug line-clamp-1">
                          {item.product.name}
                        </h4>
                        <button
                          onClick={() => removeFromCart(item.product.id, item.selectedSize)}
                          className="text-[#94A3B8] hover:text-rose-600 p-1"
                          title="Supprimer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      {item.selectedSize && (
                        <p className="text-xs text-[#64748B] mt-0.5">
                          Pointure: <span className="font-semibold text-[#1E293B]">{item.selectedSize}</span>
                        </p>
                      )}
                      <p className="text-xs font-bold text-[#1A3C34] mt-0.5">
                        {price} {currency}
                      </p>
                    </div>

                    <div className="flex items-center justify-between pt-2">
                      <div className="flex items-center border border-[#E8E5DF] rounded-lg bg-[#F9F8F6]">
                        <button
                          onClick={() =>
                            updateQuantity(item.product.id, item.quantity - 1, item.selectedSize)
                          }
                          className="px-2 py-1 text-xs text-[#1E293B] hover:bg-[#E8E5DF]"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="px-3 py-0.5 text-xs font-semibold text-[#1E293B]">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() =>
                            updateQuantity(item.product.id, item.quantity + 1, item.selectedSize)
                          }
                          className="px-2 py-1 text-xs text-[#1E293B] hover:bg-[#E8E5DF]"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      <span className="font-bold text-sm text-[#1E293B]">
                        {(price * item.quantity).toFixed(0)} {currency}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer & Checkout */}
        {items.length > 0 && (
          <div className="p-6 bg-white border-t border-[#E8E5DF] space-y-4">
            {/* Promo Code */}
            <form onSubmit={applyPromo} className="flex gap-2">
              <input
                type="text"
                placeholder="Code privilège (ex: TEFLOOK10)"
                value={promoCode}
                onChange={(e) => setPromoCode(e.target.value)}
                className="flex-1 text-xs px-3.5 py-2.5 bg-[#F9F8F6] border border-[#E8E5DF] rounded-xl focus:outline-none focus:border-[#1A3C34] uppercase placeholder:normal-case"
              />
              <Button type="submit" variant="secondary" size="sm" className="text-xs px-3.5 font-semibold">
                Appliquer
              </Button>
            </form>
            {promoMessage && (
              <p
                className={`text-xs ${
                  discountPercent > 0 ? "text-emerald-700 font-semibold" : "text-amber-800"
                }`}
              >
                {promoMessage}
              </p>
            )}

            {/* Calculations */}
            <div className="space-y-1.5 text-xs text-[#64748B]">
              <div className="flex justify-between">
                <span>Sous-total</span>
                <span className="font-semibold text-[#1E293B]">
                  {currentTotal.toFixed(0)} {currency}
                </span>
              </div>
              {discountPercent > 0 && (
                <div className="flex justify-between text-emerald-700 font-semibold">
                  <span>Remise privilège (-{discountPercent}%)</span>
                  <span>
                    -{discountAmount.toFixed(0)} {currency}
                  </span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Livraison</span>
                <span className="font-semibold text-emerald-700">
                  {remaining === 0 ? "Offerte" : "Calculée à l'étape suivante"}
                </span>
              </div>
              <div className="flex justify-between text-base font-bold text-[#1E293B] pt-2 border-t border-[#E8E5DF]">
                <span>Total estimé</span>
                <span className="text-[#C85A32]">
                  {finalTotal.toFixed(0)} {currency}
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="space-y-2.5">
              <a
                href={generateWhatsAppOrder()}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center justify-center gap-2.5 py-3 px-4 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-sm transition-all shadow-md active:scale-[0.98]"
              >
                <MessageCircle className="w-4 h-4" />
                Commander directement via WhatsApp
              </a>
              <Button
                variant="orange"
                className="w-full py-3 justify-center text-sm gap-2"
                onClick={() => {
                  window.open(generateWhatsAppOrder(), "_blank");
                }}
              >
                Valider ma commande en ligne
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>

            {/* Guarantee badges */}
            <div className="pt-2 flex items-center justify-center gap-4 text-[11px] text-[#64748B]">
              <span className="flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-[#1A3C34]" />
                Cuir 100% garanti
              </span>
              <span>•</span>
              <span>Paiement à la livraison</span>
              <span>•</span>
              <span>Échange sous 14 jours</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
