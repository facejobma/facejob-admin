import { DashboardNav } from "@/components/dashboard-nav";
import { navItems } from "@/constants/data";

export default function Sidebar() {
  return (
    <aside className="hidden h-full w-64 shrink-0 border-r border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-950 lg:block">
      <div className="flex h-full flex-col">
        <div className="flex-1 overflow-y-auto px-3 py-5">
          <h2 className="mb-3 px-3 text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400 dark:text-slate-500">
            Gestion de la plateforme
          </h2>
          <DashboardNav items={navItems} />
        </div>
        <div className="border-t border-slate-100 bg-slate-50/70 px-4 py-4 dark:border-slate-800 dark:bg-slate-900/60">
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
