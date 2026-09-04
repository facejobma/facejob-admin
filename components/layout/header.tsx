import ThemeToggle from "@/components/layout/ThemeToggle/theme-toggle";
import { MobileSidebar } from "./mobile-sidebar";
import { Logo } from "@/components/ui/logo";
import Notification from "@/components/layout/Notification";
import { ShieldCheck } from "lucide-react";

export default function Header() {
  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-slate-200/80 bg-white/95 shadow-sm backdrop-blur-xl dark:border-slate-800 dark:bg-slate-950/95">
      <nav
        className="flex h-[72px] items-center justify-between gap-4 px-4 sm:px-6"
        aria-label="Navigation d’administration"
      >
        <div className="flex items-center gap-3">
          <div className="lg:hidden">
            <MobileSidebar />
          </div>
          <div className="hidden h-11 items-center border-r border-slate-200 pr-4 dark:border-slate-800 lg:flex [&_img]:h-9 [&_img]:w-auto">
            <Logo />
          </div>
          <div className="flex items-center gap-2.5">
            <span className="hidden h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400 sm:flex">
              <ShieldCheck className="h-[18px] w-[18px]" />
            </span>
            <div>
              <h1 className="text-sm font-bold text-slate-900 dark:text-white">
                Centre d’administration
              </h1>
              <p className="hidden text-[11px] text-slate-500 dark:text-slate-400 sm:block">
                FaceJob · Accès sécurisé
              </p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Notification />
          <ThemeToggle />
          <div className="ml-1 hidden items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 p-1.5 pr-3 dark:border-slate-800 dark:bg-slate-900 sm:flex">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-600 to-teal-600 text-xs font-bold text-white">
              AD
            </span>
            <span>
              <span className="block text-xs font-semibold text-slate-800 dark:text-slate-100">
                Administrateur
              </span>
              <span className="block text-[10px] text-slate-500">
                Compte sécurisé
              </span>
            </span>
          </div>
        </div>
      </nav>
    </header>
  );
}
