import Header from "@/components/layout/header";
import Sidebar from "@/components/layout/sidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen flex-col overflow-hidden bg-slate-50 dark:bg-slate-950">
      <Header />
      <div className="flex min-h-0 flex-1 overflow-hidden pt-[72px]">
        <Sidebar />
        <main className="min-w-0 flex-1 overflow-x-hidden overflow-y-auto bg-slate-50/80 dark:bg-slate-950">
          {children}
        </main>
      </div>
    </div>
  );
}
