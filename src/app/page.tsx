import Link from "next/link";
import {
  Sparkles,
  ArrowRight,
  Database,
  ShieldCheck,
  Zap,
  Terminal,
  CheckCircle2,
  ExternalLink,
} from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col bg-[#090d16] text-slate-100 selection:bg-indigo-500 selection:text-white">
      <Navbar />

      {/* Hero Section */}
      <main className="flex-1">
        <section className="relative overflow-hidden pt-20 pb-28 md:pt-32 md:pb-36 border-b border-slate-800/60">
          {/* Subtle Ambient Glowing Gradients */}
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-indigo-600/15 rounded-full blur-[120px] pointer-events-none" />
          <div className="absolute top-1/3 left-1/3 w-[300px] h-[250px] bg-purple-600/10 rounded-full blur-[100px] pointer-events-none" />
          <div className="absolute top-1/2 right-1/4 w-[350px] h-[300px] bg-cyan-600/10 rounded-full blur-[120px] pointer-events-none" />

          <div className="container mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 relative z-10 text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-3.5 py-1 text-xs font-semibold text-indigo-300 backdrop-blur-md mb-8 animate-fade-in shadow-sm">
              <Sparkles className="h-3.5 w-3.5 text-indigo-400" />
              <span>TefLook Enterprise Boilerplate v1.0</span>
            </div>

            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white mb-6 leading-[1.1]">
              Architected for speed. <br />
              <span className="bg-gradient-to-r from-indigo-400 via-indigo-200 to-cyan-300 bg-clip-text text-transparent">
                Engineered with Supabase.
              </span>
            </h1>

            <p className="mx-auto max-w-2xl text-lg sm:text-xl text-slate-400 mb-10 leading-relaxed font-normal">
              A high-performance Next.js full-stack foundation powered by App Router,
              Tailwind CSS, and Supabase database & auth. Designed with a sleek, dark-mode-first aesthetic.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/dashboard" className="w-full sm:w-auto">
                <Button size="lg" className="w-full sm:w-auto gap-2.5 px-7">
                  Explore Live Dashboard
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <a
                href="#architecture"
                className="w-full sm:w-auto"
              >
                <Button variant="outline" size="lg" className="w-full sm:w-auto gap-2 px-6">
                  <Terminal className="h-4 w-4 text-slate-400" />
                  View Architecture
                </Button>
              </a>
            </div>

            {/* Terminal Preview Card */}
            <div className="mt-16 mx-auto max-w-4xl rounded-2xl border border-slate-800 bg-slate-950/80 p-2 shadow-2xl shadow-indigo-950/40 backdrop-blur-xl">
              <div className="flex items-center justify-between border-b border-slate-800/80 px-4 py-3 bg-slate-900/40 rounded-t-xl">
                <div className="flex items-center space-x-2">
                  <div className="h-3 w-3 rounded-full bg-rose-500/80" />
                  <div className="h-3 w-3 rounded-full bg-amber-500/80" />
                  <div className="h-3 w-3 rounded-full bg-emerald-500/80" />
                  <span className="text-xs text-slate-400 font-mono ml-2">
                    teflook-client.ts
                  </span>
                </div>
                <Badge variant="outline" className="text-[11px] text-indigo-300 border-indigo-500/30">
                  Supabase SSR Ready
                </Badge>
              </div>
              <div className="p-6 text-left font-mono text-sm leading-relaxed overflow-x-auto text-slate-300">
                <div className="text-slate-500">{"// 1. Initialize Supabase SSR Client"}</div>
                <div>
                  <span className="text-indigo-400">import</span> &#123; createClient &#125;{" "}
                  <span className="text-indigo-400">from</span>{" "}
                  <span className="text-emerald-300">&apos;@/lib/supabaseServer&apos;</span>;
                </div>
                <div className="mt-3 text-slate-500">{"// 2. Query with Row Level Security enforcement"}</div>
                <div>
                  <span className="text-indigo-400">export async function</span>{" "}
                  <span className="text-amber-300">getProjects</span>() &#123;
                </div>
                <div className="pl-4">
                  <span className="text-indigo-400">const</span> supabase ={" "}
                  <span className="text-indigo-400">await</span> createClient();
                </div>
                <div className="pl-4">
                  <span className="text-indigo-400">const</span> &#123; data, error &#125; ={" "}
                  <span className="text-indigo-400">await</span> supabase
                </div>
                <div className="pl-8 text-slate-200">
                  .from(<span className="text-emerald-300">&apos;projects&apos;</span>)
                </div>
                <div className="pl-8 text-slate-200">
                  .select(<span className="text-emerald-300">&apos;*&apos;</span>)
                </div>
                <div className="pl-8 text-slate-200">
                  .order(<span className="text-emerald-300">&apos;created_at&apos;</span>, &#123; ascending: <span className="text-purple-400">false</span> &#125;);
                </div>
                <div className="pl-4">
                  <span className="text-indigo-400">return</span> data;
                </div>
                <div>&#125;</div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Grid */}
        <section id="features" className="py-24 border-b border-slate-800/60 bg-slate-950/50">
          <div className="container mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <Badge variant="default" className="mb-3">
                Core Stack
              </Badge>
              <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
                Engineered for Modern Web Workloads
              </h2>
              <p className="mt-4 text-slate-400">
                Built-in architectural components ready for enterprise deployments with zero friction.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="hover:border-indigo-500/40 transition-colors">
                <CardHeader>
                  <div className="h-10 w-10 rounded-lg bg-indigo-600/20 text-indigo-400 flex items-center justify-center mb-2">
                    <Database className="h-5 w-5" />
                  </div>
                  <CardTitle>Supabase PostgreSQL</CardTitle>
                  <CardDescription>
                    Full schema with Row Level Security (RLS) policies, automatic profile syncing on signups, and typed schemas.
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card className="hover:border-indigo-500/40 transition-colors">
                <CardHeader>
                  <div className="h-10 w-10 rounded-lg bg-cyan-600/20 text-cyan-400 flex items-center justify-center mb-2">
                    <Zap className="h-5 w-5" />
                  </div>
                  <CardTitle>Next.js App Router</CardTitle>
                  <CardDescription>
                    Turbopack powered build speed, React Server Components (RSC), and robust server-action patterns.
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card className="hover:border-indigo-500/40 transition-colors">
                <CardHeader>
                  <div className="h-10 w-10 rounded-lg bg-purple-600/20 text-purple-400 flex items-center justify-center mb-2">
                    <ShieldCheck className="h-5 w-5" />
                  </div>
                  <CardTitle>End-to-End Type Safety</CardTitle>
                  <CardDescription>
                    Strict TypeScript compilation, Zod payload validation, and auto-generated database entity definitions.
                  </CardDescription>
                </CardHeader>
              </Card>
            </div>
          </div>
        </section>

        {/* Directory Structure & Architecture */}
        <section id="architecture" className="py-24">
          <div className="container mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <Badge variant="default" className="mb-4">
                  Structure
                </Badge>
                <h2 className="text-3xl font-bold tracking-tight text-white mb-6">
                  Clean, Modular Architecture
                </h2>
                <p className="text-slate-400 mb-8 leading-relaxed">
                  TefLook features a strict separation of concerns that scales smoothly from a single micro-service to an enterprise platform:
                </p>

                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <CheckCircle2 className="h-5 w-5 text-indigo-400 mt-0.5 shrink-0" />
                    <div>
                      <span className="font-semibold text-slate-200">src/app/</span>
                      <p className="text-sm text-slate-400">
                        Layouts, route handlers, and protected dashboard screens.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <CheckCircle2 className="h-5 w-5 text-indigo-400 mt-0.5 shrink-0" />
                    <div>
                      <span className="font-semibold text-slate-200">src/components/</span>
                      <p className="text-sm text-slate-400">
                        Atomic UI components, layout shells, and business features.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <CheckCircle2 className="h-5 w-5 text-indigo-400 mt-0.5 shrink-0" />
                    <div>
                      <span className="font-semibold text-slate-200">src/lib/</span>
                      <p className="text-sm text-slate-400">
                        Supabase client and server instances, helper utilities, and validators.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <CheckCircle2 className="h-5 w-5 text-indigo-400 mt-0.5 shrink-0" />
                    <div>
                      <span className="font-semibold text-slate-200">supabase/</span>
                      <p className="text-sm text-slate-400">
                        SQL migrations, RLS policies, triggers, and mock seeds.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-6 font-mono text-xs text-slate-300 shadow-xl">
                <div className="text-indigo-400 mb-4 font-bold">{"// TefLook Workspace Tree"}</div>
                <div className="space-y-1.5 leading-relaxed">
                  <div>📁 teflook/</div>
                  <div className="pl-4">├── 📁 src/</div>
                  <div className="pl-8">├── 📁 app/</div>
                  <div className="pl-12">├── 📄 layout.tsx <span className="text-slate-500">(Dark theme root)</span></div>
                  <div className="pl-12">├── 📄 page.tsx <span className="text-slate-500">(Landing page)</span></div>
                  <div className="pl-12">└── 📁 dashboard/</div>
                  <div className="pl-16">├── 📄 layout.tsx</div>
                  <div className="pl-16">└── 📄 page.tsx</div>
                  <div className="pl-8">├── 📁 components/</div>
                  <div className="pl-12">├── 📁 ui/ <span className="text-slate-500">(Button, Card, Badge)</span></div>
                  <div className="pl-12">├── 📁 layout/ <span className="text-slate-500">(Navbar, Sidebar)</span></div>
                  <div className="pl-12">└── 📁 features/</div>
                  <div className="pl-8">├── 📁 lib/</div>
                  <div className="pl-12">├── 📄 supabaseClient.ts <span className="text-slate-500">(Browser SSR)</span></div>
                  <div className="pl-12">├── 📄 supabaseServer.ts <span className="text-slate-500">(Cookies/RSC)</span></div>
                  <div className="pl-12">└── 📄 utils.ts <span className="text-slate-500">(clsx + twMerge)</span></div>
                  <div className="pl-8">└── 📁 types/</div>
                  <div className="pl-12">├── 📄 database.types.ts</div>
                  <div className="pl-12">└── 📄 index.ts</div>
                  <div className="pl-4">├── 📁 supabase/</div>
                  <div className="pl-8">├── 📄 schema.sql</div>
                  <div className="pl-8">├── 📄 seed.sql</div>
                  <div className="pl-8">└── 📁 migrations/</div>
                  <div className="pl-4">├── 📄 .env.example</div>
                  <div className="pl-4">├── 📄 .gitignore</div>
                  <div className="pl-4">└── 📄 package.json</div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 bg-slate-950 py-10">
        <div className="container mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div className="flex items-center space-x-2">
            <span className="font-semibold text-slate-300">TefLook</span>
            <span>&copy; 2026 All rights reserved.</span>
          </div>
          <div className="flex items-center space-x-6">
            <Link href="/dashboard" className="hover:text-slate-300 transition-colors">
              Console
            </Link>
            <a
              href="https://supabase.com/docs"
              target="_blank"
              rel="noreferrer"
              className="hover:text-slate-300 transition-colors flex items-center gap-1"
            >
              Supabase Docs <ExternalLink className="h-3 w-3" />
            </a>
            <a
              href="https://nextjs.org/docs"
              target="_blank"
              rel="noreferrer"
              className="hover:text-slate-300 transition-colors flex items-center gap-1"
            >
              Next.js Docs <ExternalLink className="h-3 w-3" />
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
