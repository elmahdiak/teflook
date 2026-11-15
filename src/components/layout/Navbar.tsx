"use client";

import Link from "next/link";
import { Sparkles, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Navbar() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md">
      <div className="container mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center space-x-3 group">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-cyan-400 p-0.5 shadow-lg shadow-indigo-500/25 group-hover:scale-105 transition-transform duration-200">
            <div className="flex h-full w-full items-center justify-center rounded-[10px] bg-slate-950">
              <Sparkles className="h-5 w-5 text-indigo-400" />
            </div>
          </div>
          <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-white via-slate-200 to-indigo-300 bg-clip-text text-transparent">
            TefLook
          </span>
        </Link>

        <nav className="hidden md:flex items-center space-x-8 text-sm font-medium text-slate-300">
          <Link href="#features" className="hover:text-white transition-colors">
            Features
          </Link>
          <Link href="#architecture" className="hover:text-white transition-colors">
            Architecture
          </Link>
          <Link href="#database" className="hover:text-white transition-colors">
            Database
          </Link>
          <Link href="/dashboard" className="hover:text-indigo-400 transition-colors">
            Dashboard
          </Link>
        </nav>

        <div className="flex items-center space-x-3">
          <Link href="/dashboard">
            <Button variant="outline" size="sm" className="hidden sm:inline-flex">
              Sign In
            </Button>
          </Link>
          <Link href="/dashboard">
            <Button size="sm" className="gap-2">
              Launch Console
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>
    </header>
  );
}
