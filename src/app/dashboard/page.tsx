import Link from "next/link";
import {
  FolderKanban,
  Database,
  Users,
  Plus,
  ArrowUpRight,
  ShieldCheck,
  Cpu,
  Key,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ProjectCard } from "@/components/features/ProjectCard";

export default function DashboardPage() {
  const mockProjects = [
    {
      name: "TefLook Analytics Core",
      description: "Aggregating telemetry streams and generating user analytics snapshots.",
      status: "active" as const,
      updatedAt: "2h ago",
      tableCount: 6,
    },
    {
      name: "Authentication & Identity",
      description: "Supabase Auth with role-based policies and avatar storage bucket.",
      status: "active" as const,
      updatedAt: "1d ago",
      tableCount: 2,
    },
    {
      name: "Staging Pipeline v2",
      description: "Isolated environment for automated schema migrations and seed testing.",
      status: "draft" as const,
      updatedAt: "3d ago",
      tableCount: 4,
    },
  ];

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Welcome Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-800/60">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
            Overview
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Real-time status and telemetry for your Supabase-backed services.
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Button variant="outline" size="sm" className="gap-2">
            <Key className="h-4 w-4 text-indigo-400" />
            API Keys
          </Button>
          <Button size="sm" className="gap-2">
            <Plus className="h-4 w-4" />
            Create Project
          </Button>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">
              Total Projects
            </span>
            <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400">
              <FolderKanban className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-2xl font-bold text-white">12</span>
            <span className="text-xs text-emerald-400 font-medium flex items-center">
              +2 this week
            </span>
          </div>
        </Card>

        <Card className="p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">
              PostgreSQL Tables
            </span>
            <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400">
              <Database className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-2xl font-bold text-white">28</span>
            <span className="text-xs text-slate-400 font-medium">
              RLS Enabled (100%)
            </span>
          </div>
        </Card>

        <Card className="p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">
              Monthly Active Users
            </span>
            <div className="p-2 rounded-lg bg-purple-500/10 text-purple-400">
              <Users className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-2xl font-bold text-white">3,842</span>
            <span className="text-xs text-emerald-400 font-medium flex items-center">
              +14.2%
            </span>
          </div>
        </Card>

        <Card className="p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">
              Compute Health
            </span>
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
              <Cpu className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-2xl font-bold text-white">99.98%</span>
            <span className="text-xs text-emerald-400 font-medium">Optimal</span>
          </div>
        </Card>
      </div>

      {/* Projects Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <h2 className="text-lg font-semibold text-white">Projects</h2>
            <Badge variant="outline">{mockProjects.length}</Badge>
          </div>
          <Link
            href="/dashboard/projects"
            className="text-xs text-indigo-400 hover:text-indigo-300 font-medium flex items-center gap-1"
          >
            View all projects
            <ArrowUpRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {mockProjects.map((project) => (
            <ProjectCard key={project.name} {...project} />
          ))}
        </div>
      </div>

      {/* Supabase Integration Details */}
      <Card className="border-indigo-500/30 bg-gradient-to-r from-slate-900/90 to-indigo-950/20">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-lg bg-indigo-600/20 text-indigo-400">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <div>
                <CardTitle>Supabase Backend Ready</CardTitle>
                <CardDescription className="text-slate-400">
                  SQL schema, RLS policies, and server & client SDK wrappers are initialized in this repository.
                </CardDescription>
              </div>
            </div>
            <Badge variant="success">Schema v1.0.0</Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2 text-xs">
            <div className="p-3.5 rounded-lg bg-slate-950/60 border border-slate-800">
              <div className="font-semibold text-slate-200">1. Environment Variables</div>
              <p className="text-slate-400 mt-1">
                Configure your <code className="text-indigo-300">.env.local</code> with your Supabase URL & Anon Key.
              </p>
            </div>
            <div className="p-3.5 rounded-lg bg-slate-950/60 border border-slate-800">
              <div className="font-semibold text-slate-200">2. Run SQL Schema</div>
              <p className="text-slate-400 mt-1">
                Execute <code className="text-indigo-300">supabase/schema.sql</code> in the Supabase SQL Editor.
              </p>
            </div>
            <div className="p-3.5 rounded-lg bg-slate-950/60 border border-slate-800">
              <div className="font-semibold text-slate-200">3. Authentication & RLS</div>
              <p className="text-slate-400 mt-1">
                Row Level Security policies automatically isolate tenant and user data.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
