"use client";

import { DashboardNav } from "@/components/dashboard-nav";
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { navItems } from "@/constants/data";
import { MenuIcon, ShieldCheck } from "lucide-react";
import { useState } from "react";

export function MobileSidebar() {
  const [open, setOpen] = useState(false);
  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <button
          type="button"
          aria-label="Ouvrir la navigation"
          className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 text-slate-600 transition hover:bg-slate-50 dark:border-slate-800 dark:text-slate-300 dark:hover:bg-slate-900"
        >
          <MenuIcon className="h-5 w-5" />
        </button>
      </SheetTrigger>
      <SheetContent
        side="left"
        className="w-72 !px-0 border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950"
      >
        <SheetTitle className="sr-only">Navigation d’administration</SheetTitle>
        <div className="flex h-full flex-col">
          <div className="border-b border-slate-100 px-5 py-5 dark:border-slate-800">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400">
                <ShieldCheck className="h-5 w-5" />
              </span>
              <div>
                <p className="text-sm font-bold text-slate-900 dark:text-white">
                  FaceJob Admin
                </p>
                <p className="text-[11px] text-slate-500">
                  Navigation sécurisée
                </p>
              </div>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto px-3 py-5">
            <h2 className="mb-3 px-3 text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">
              Gestion de la plateforme
            </h2>
            <DashboardNav items={navItems} setOpen={setOpen} closeOnClick />
          </div>
          <div className="border-t border-slate-100 bg-slate-50/70 px-5 py-4 text-center dark:border-slate-800 dark:bg-slate-900/60">
            <p className="text-xs text-slate-400">© 2026 FaceJob</p>
            <p className="mt-1 text-[10px] text-slate-400">Interface interne</p>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
