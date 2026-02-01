import Header from "@/components/layout/header";
import Sidebar from "@/components/layout/sidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="overflow-x-hidden">
      <Header />
      <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900 overflow-x-hidden">
        <Sidebar />
        <main className="flex-1 pt-16 bg-gray-50 dark:bg-gray-900 overflow-x-hidden min-w-0">{children}</main>
      </div>
    </div>
  );
}
