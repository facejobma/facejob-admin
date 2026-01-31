"use client";
import { DashboardNav } from "@/components/dashboard-nav";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { navItems } from "@/constants/data";
import { MenuIcon } from "lucide-react";
import { useState } from "react";

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {}

export function MobileSidebar({ className }: SidebarProps) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <MenuIcon className="h-6 w-6 cursor-pointer text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors" />
        </SheetTrigger>
        <SheetContent side="left" className="!px-0 w-72 bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
          <div className="flex flex-col h-full">
            {/* Navigation Section */}
            <div className="flex-1 px-4 py-6 space-y-6">
              <div>
                <h2 className="mb-4 px-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Navigation
                </h2>
                <DashboardNav items={navItems} setOpen={setOpen} closeOnClick={true} />
              </div>
            </div>

            {/* Footer Section */}
            <div className="px-6 py-4 border-t border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50">
              <div className="text-center">
                <p className="text-xs text-gray-400 dark:text-gray-500">
                  © 2026 FaceJob
                </p>
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                  Interface Admin
                </p>
              </div>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
