"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, KeyRound, LoaderCircle, Lock, ShieldCheck, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { loginAdmin } from "@/lib/admin-auth";

export default function AdminLoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    setTimeout(() => {
      const success = loginAdmin(username, password);
      if (success) {
        router.push("/admin");
      } else {
        setError("Identifiant ou mot de passe incorrect. (Par défaut: admin / teflook2026)");
        setLoading(false);
      }
    }, 400);
  }

  return (
    <div className="min-h-screen bg-[#F9F8F6] flex flex-col justify-center items-center p-4">
      <div className="w-full max-w-md">
        {/* Back Link */}
        <div className="mb-6">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs font-semibold text-muted-foreground hover:text-brand-teal transition-colors"
          >
            <ArrowLeft size={15} />
            Retour à la boutique
          </Link>
        </div>

        {/* Login Box */}
        <div className="rounded-3xl border border-border bg-card p-7 sm:p-9 shadow-xl shadow-black/5">
          {/* Logo & Header */}
          <div className="text-center mb-8">
            <div className="mx-auto mb-4 grid size-14 place-items-center rounded-2xl bg-brand-mist border border-brand-teal/20 text-brand-teal shadow-xs">
              <ShieldCheck size={28} />
            </div>
            <h1 className="font-display text-2xl font-black tracking-tight text-foreground">
              <span className="text-brand-teal">Tef</span>
              <span className="text-brand-orange">Look</span>{" "}
              <span className="text-foreground/90">Admin</span>
            </h1>
            <p className="mt-1 text-xs text-muted-foreground">
              Portail sécurisé de gestion des commandes COD & du catalogue
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-3 text-xs font-medium text-destructive leading-relaxed">
                {error}
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-foreground mb-1.5">
                Nom d'utilisateur ou Email
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-muted-foreground">
                  <User size={16} />
                </span>
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="admin@teflook.com"
                  className="w-full h-11 pl-10 pr-3 rounded-xl border border-border bg-background text-sm outline-none focus:border-brand-teal focus:ring-2 focus:ring-brand-teal/20 transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-foreground mb-1.5">
                Mot de passe
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-muted-foreground">
                  <Lock size={16} />
                </span>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full h-11 pl-10 pr-3 rounded-xl border border-border bg-background text-sm outline-none focus:border-brand-teal focus:ring-2 focus:ring-brand-teal/20 transition-all"
                />
              </div>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full h-12 rounded-xl bg-brand-teal text-white font-bold text-sm hover:bg-brand-teal/90 shadow-md shadow-brand-teal/20 transition-all cursor-pointer mt-2"
            >
              {loading ? (
                <LoaderCircle className="animate-spin size-5" />
              ) : (
                <span className="flex items-center justify-center gap-2">
                  <KeyRound size={17} />
                  Se connecter à l'espace Admin
                </span>
              )}
            </Button>
          </form>

          {/* Helper hint */}
          <div className="mt-6 pt-5 border-t border-border/60 text-center text-[11px] text-muted-foreground">
            <span>Accès réservé à l'équipe TefLook Maroc</span>
            <p className="mt-1 font-mono text-[10px] text-muted-foreground/75">
              Identifiants par défaut : <strong>admin</strong> / <strong>teflook2026</strong>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
