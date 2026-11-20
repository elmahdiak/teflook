"use client";

import React, { useState } from "react";
import Link from "next/link";
import { X, User, LogIn, ArrowRight, ShieldCheck, ShoppingBag, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";

interface AccountModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AccountModal({ isOpen, onClose }: AccountModalProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("Connexion réussie ! Bienvenue dans votre espace TefLook.");
    setTimeout(() => {
      onClose();
      setMessage(null);
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity" onClick={onClose} />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-[#E8E5DF] z-10 overflow-hidden animate-in fade-in zoom-in-95 duration-200 p-6 sm:p-8">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full text-[#64748B] hover:text-[#1E293B] hover:bg-[#F9F8F6] transition-colors"
          aria-label="Fermer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="text-center mb-6 space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-[#EBF5F5] border border-[#4C9A9C]/30 flex items-center justify-center mx-auto text-[#4C9A9C]">
            <User className="w-6 h-6" />
          </div>
          <h3 className="font-serif-brand text-2xl font-bold text-[#1E293B]">
            {isLogin ? "Espace Client TefLook" : "Créer un compte"}
          </h3>
          <p className="text-xs text-[#64748B]">
            {isLogin
              ? "Suivez vos commandes et profitez de vos privilèges exclusifs"
              : "Rejoignez le Cercle Privilège TefLook et bénéficiez de -10%"}
          </p>
        </div>

        {/* Message */}
        {message && (
          <div className="mb-4 p-3 rounded-xl bg-emerald-50 text-emerald-800 text-xs font-semibold text-center border border-emerald-200">
            {message}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[#1E293B] mb-1">
              Adresse email
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="votre.email@exemple.com"
              className="w-full text-xs sm:text-sm px-4 py-2.5 rounded-xl bg-[#F9F8F6] border border-[#E8E5DF] text-[#1E293B] focus:outline-none focus:border-[#4C9A9C]"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-semibold text-[#1E293B]">
                Mot de passe
              </label>
              {isLogin && (
                <span className="text-[11px] text-[#4C9A9C] hover:underline cursor-pointer">
                  Mot de passe oublié ?
                </span>
              )}
            </div>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full text-xs sm:text-sm px-4 py-2.5 rounded-xl bg-[#F9F8F6] border border-[#E8E5DF] text-[#1E293B] focus:outline-none focus:border-[#4C9A9C]"
            />
          </div>

          <Button type="submit" variant="teal" className="w-full py-3 text-sm font-semibold gap-2 shadow-md">
            <LogIn className="w-4 h-4" />
            {isLogin ? "Se connecter" : "S'inscrire"}
          </Button>

          {/* Switch Login / Register */}
          <div className="text-center pt-2">
            <button
              type="button"
              onClick={() => setIsLogin(!isLogin)}
              className="text-xs text-[#64748B] hover:text-[#FE7C58] transition-colors"
            >
              {isLogin
                ? "Pas encore de compte ? Créer un compte"
                : "Vous avez déjà un compte ? Se connecter"}
            </button>
          </div>
        </form>

        {/* Dashboard Link Shortcut */}
        <div className="mt-6 pt-5 border-t border-[#E8E5DF] flex items-center justify-between text-xs text-[#64748B]">
          <Link
            href="/dashboard"
            onClick={onClose}
            className="flex items-center gap-1.5 text-[#4C9A9C] hover:text-[#FE7C58] font-semibold transition-colors"
          >
            <span>Accéder au Dashboard</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
          <span className="flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-[#FE7C58]" />
            Connexion sécurisée
          </span>
        </div>
      </div>
    </div>
  );
}
