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

export function DashboardNav({ items, setOpen, closeOnClick = true }: DashboardNavProps) {
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
  const navigationItems = items.filter(item => item.label !== "logout");
  const logoutItem = items.find(item => item.label === "logout");

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
                    "group flex items-center rounded-xl px-3 py-3 text-sm font-medium transition-all duration-200 ease-in-out relative",
                    isActive
                      ? "bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 shadow-sm border border-green-100 dark:border-green-800"
                      : "text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white",
                    item.disabled && "cursor-not-allowed opacity-50",
                  )}
                >
                  {/* Active indicator */}
                  {isActive && (
                    <div className="absolute left-0 top-1/2 transform -translate-y-1/2 w-1 h-6 bg-green-500 dark:bg-green-400 rounded-r-full"></div>
                  )}
                  
                  <div className={cn(
                    "flex items-center justify-center w-8 h-8 rounded-lg mr-3 transition-colors",
                    isActive 
                      ? "bg-green-100 dark:bg-green-800 text-green-600 dark:text-green-400" 
                      : "bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 group-hover:bg-gray-200 dark:group-hover:bg-gray-600 group-hover:text-gray-600 dark:group-hover:text-gray-300"
                  )}>
                    <Icon className="h-4 w-4" />
                  </div>
                  
                  <span className="flex-1 truncate">{item.title}</span>
                  
                  {isActive && (
                    <div className="w-2 h-2 bg-green-500 dark:bg-green-400 rounded-full ml-2"></div>
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
              <span className="flex-1 truncate text-left">{logoutItem.title}</span>
            </div>
          </button>
        </div>
      )}
    </div>
  );
}
