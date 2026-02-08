import Header from "@/components/layout/header";
import Sidebar from "@/components/layout/sidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="h-screen overflow-hidden flex flex-col">
      <Header />
      <div className="flex flex-1 bg-gray-50 dark:bg-gray-900 overflow-hidden">
        <Sidebar />
        <main className="flex-1 pt-16 bg-gray-50 dark:bg-gray-900 overflow-y-auto overflow-x-hidden min-w-0">{children}</main>
      </div>
    </div>
  );
}
