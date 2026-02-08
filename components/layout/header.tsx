import ThemeToggle from "@/components/layout/ThemeToggle/theme-toggle";
import { cn } from "@/lib/utils";
import { MobileSidebar } from "./mobile-sidebar";
import { Logo } from "@/components/ui/logo";
import Notification from "@/components/layout/Notification";

export default function Header() {
  return (
    <div className="fixed top-0 left-0 right-0 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm z-20">
      <nav className="h-16 flex items-center justify-between px-6">
        {/* Logo Section - Desktop */}
        <div className="hidden lg:flex items-center space-x-3">
          <Logo />
          <div>
            <h1 className="text-lg font-bold text-gray-900 dark:text-white">FaceJob</h1>
            <p className="text-xs text-gray-500 dark:text-gray-400">Administration</p>
          </div>
        </div>

        {/* Mobile Menu */}
        <div className={cn("block lg:!hidden")}>
          <MobileSidebar />
        </div>

        {/* Right Section */}
        <div className="flex items-center space-x-4">
          <Notification />
          <ThemeToggle />
        </div>
      </nav>
    </div>
  );
}