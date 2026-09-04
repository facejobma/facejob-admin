"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { Icons } from "@/components/icons";
import { cn } from "@/lib/utils";
import { NavItem } from "@/types";
import { Dispatch, SetStateAction } from "react";
import { performLogout } from "@/lib/auth";

interface DashboardNavProps {
  items: NavItem[];
  setOpen?: Dispatch<SetStateAction<boolean>>;
  closeOnClick?: boolean;
}

export function DashboardNav({
  items,
  setOpen,
  closeOnClick = true,
}: DashboardNavProps) {
  const path = usePathname();

  const handleItemClick = (item: NavItem) => {
    if (item.label === "logout") {
      performLogout();
      return;
    }

    if (setOpen && closeOnClick) {
      setOpen(false);
    }
  };

  if (!items?.length) {
    return null;
  }

  // Séparer les éléments de navigation et le logout
  const navigationItems = items.filter((item) => item.label !== "logout");
  const logoutItem = items.find((item) => item.label === "logout");

  return (
    <div className="space-y-2">
      {/* Navigation Items */}
      <nav className="space-y-1">
        {navigationItems.map((item, index) => {
          const Icon = Icons[item.icon || "arrowRight"];
          const isActive = path === item.href;

          return (
            item.href && (
              <Link
                key={index}
                href={item.disabled ? "/" : item.href}
                onClick={() => handleItemClick(item)}
                className="block"
              >
                <div
                  className={cn(
                    "group relative flex items-center rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200",
                    isActive
                      ? "bg-emerald-50 text-emerald-800 shadow-sm ring-1 ring-inset ring-emerald-100 dark:bg-emerald-950/60 dark:text-emerald-300 dark:ring-emerald-900"
                      : "text-slate-600 hover:bg-slate-50 hover:text-slate-950 dark:text-slate-300 dark:hover:bg-slate-900 dark:hover:text-white",
                    item.disabled && "cursor-not-allowed opacity-50",
                  )}
                >
                  {/* Active indicator */}
                  {isActive && (
                    <div className="absolute left-0 top-1/2 h-6 w-1 -translate-y-1/2 rounded-r-full bg-emerald-600 dark:bg-emerald-400" />
                  )}

                  <div
                    className={cn(
                      "mr-3 flex h-8 w-8 items-center justify-center rounded-lg transition-colors",
                      isActive
                        ? "bg-white text-emerald-700 shadow-sm dark:bg-emerald-900 dark:text-emerald-300"
                        : "bg-slate-100 text-slate-500 group-hover:bg-white group-hover:text-slate-700 dark:bg-slate-800 dark:text-slate-400 dark:group-hover:bg-slate-700",
                    )}
                  >
                    <Icon className="h-4 w-4" />
                  </div>

                  <span className="flex-1 truncate">{item.title}</span>

                  {isActive && (
                    <div className="ml-2 h-1.5 w-1.5 rounded-full bg-emerald-500" />
                  )}
                </div>
              </Link>
            )
          );
        })}
      </nav>

      {/* Logout Section */}
      {logoutItem && (
        <div className="pt-4 mt-4 border-t border-gray-100 dark:border-gray-700">
          <button
            onClick={() => handleItemClick(logoutItem)}
            className="w-full text-left"
          >
            <div className="group flex items-center rounded-xl px-3 py-3 text-sm font-medium transition-all duration-200 ease-in-out text-gray-600 dark:text-gray-300 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 dark:hover:text-red-400">
              <div className="flex items-center justify-center w-8 h-8 rounded-lg mr-3 transition-colors bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 group-hover:bg-red-100 dark:group-hover:bg-red-800 group-hover:text-red-600 dark:group-hover:text-red-400">
                <Icons.logout className="h-4 w-4" />
              </div>
              <span className="flex-1 truncate text-left">
                {logoutItem.title}
              </span>
            </div>
          </button>
        </div>
      )}
    </div>
  );
}
