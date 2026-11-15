"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  FolderKanban,
  Database,
  Users,
  Settings,
  Shield,
  LogOut,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navigation = [
  { name: "Overview", href: "/dashboard", icon: LayoutDashboard },
  { name: "Projects", href: "/dashboard/projects", icon: FolderKanban },
  { name: "Supabase Data", href: "/dashboard/database", icon: Database },
  { name: "Team & Access", href: "/dashboard/team", icon: Users },
  { name: "Security & RLS", href: "/dashboard/security", icon: Shield },
  { name: "Settings", href: "/dashboard/settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 border-r border-slate-800 bg-slate-950/90 flex flex-col justify-between p-4 min-h-screen">
      <div className="space-y-6">
        {/* Brand */}
        <Link href="/" className="flex items-center space-x-3 px-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-600 text-white font-bold shadow-md shadow-indigo-600/30">
            TL
          </div>
          <div className="flex flex-col">
            <span className="font-semibold text-white tracking-wide leading-none">
              TefLook
            </span>
            <span className="text-[11px] text-slate-400 mt-1">
              Cloud Console
            </span>
          </div>
        </Link>

        {/* Navigation list */}
        <nav className="space-y-1">
          {navigation.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "group flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150",
                  isActive
                    ? "bg-indigo-600/15 text-indigo-300 border border-indigo-500/20 shadow-sm"
                    : "text-slate-400 hover:text-slate-100 hover:bg-slate-900"
                )}
              >
                <div className="flex items-center space-x-3">
                  <Icon
                    className={cn(
                      "h-4 w-4 transition-colors",
                      isActive ? "text-indigo-400" : "text-slate-400 group-hover:text-slate-200"
                    )}
                  />
                  <span>{item.name}</span>
                </div>
                {isActive && (
                  <div className="h-1.5 w-1.5 rounded-full bg-indigo-400" />
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* User profile section in sidebar bottom */}
      <div className="border-t border-slate-800/80 pt-4 px-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-xs font-bold text-white">
              AD
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-medium text-slate-200">
                Alex Dev
              </span>
              <span className="text-[10px] text-slate-400 truncate max-w-[110px]">
                alex@teflook.app
              </span>
            </div>
          </div>
          <button
            title="Sign out"
            className="text-slate-400 hover:text-rose-400 transition-colors p-1"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}
