"use client";

import { DashboardNav } from "@/components/dashboard-nav";
import { navItems } from "@/constants/data";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useState } from "react";

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    setCollapsed(localStorage.getItem("admin:sidebar-collapsed") === "true");
  }, []);

  const toggleSidebar = () => {
    setCollapsed((current) => {
      localStorage.setItem("admin:sidebar-collapsed", String(!current));
      return !current;
    });
  };

  return (
    <aside
      className={cn(
        "relative hidden h-full shrink-0 border-r border-slate-200 bg-white shadow-sm transition-[width] duration-300 dark:border-slate-800 dark:bg-slate-950 lg:block",
        collapsed ? "w-20" : "w-64",
      )}
    >
      <Button
        type="button"
        variant="outline"
        size="icon"
        onClick={toggleSidebar}
        aria-label={
          collapsed ? "Ouvrir la barre latérale" : "Fermer la barre latérale"
        }
        title={
          collapsed ? "Ouvrir la barre latérale" : "Fermer la barre latérale"
        }
        className="absolute -right-4 top-4 z-20 h-8 w-8 rounded-full bg-background shadow-sm"
      >
        {collapsed ? (
          <ChevronRight className="h-4 w-4" />
        ) : (
          <ChevronLeft className="h-4 w-4" />
        )}
      </Button>
      <div className="flex h-full flex-col">
        <div className="flex-1 overflow-y-auto px-3 py-5">
          {!collapsed && (
            <h2 className="mb-3 px-3 text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400 dark:text-slate-500">
              Gestion de la plateforme
            </h2>
          )}
          <DashboardNav items={navItems} compact={collapsed} />
        </div>
        <div
          className={cn(
            "border-t border-slate-100 bg-slate-50/70 px-4 py-4 dark:border-slate-800 dark:bg-slate-900/60",
            collapsed && "hidden",
          )}
        >
          <div className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 dark:border-slate-800 dark:bg-slate-950">
            <p className="text-xs font-semibold text-slate-700 dark:text-slate-200">
              FaceJob Administration
            </p>
            <p className="mt-0.5 text-[10px] text-slate-400">
              © 2026 · Interface interne
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
}
