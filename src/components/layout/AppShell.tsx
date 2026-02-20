"use client";

import { usePathname } from "next/navigation";
import Header from "@/components/layout/Header";
import BottomNav from "@/components/layout/BottomNav";

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  
  // Define routes where header and footer should be hidden
  const isAuthPage = pathname?.startsWith("/auth/signin");

  if (isAuthPage) {
    return (
      <main className="flex-1 flex items-center justify-center p-4">
        {children}
      </main>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-muted/30">
      {/* Common Header */}
      <Header />

      {/* Main Content Area */}
      <main className="flex-1 pb-24 pt-4 px-4 container mx-auto max-w-md md:max-w-2xl lg:max-w-4xl">
        {children}
      </main>

      {/* Mobile Bottom Navigation */}
      <BottomNav />

      {/* Footer */}
      <footer className="py-6 text-center text-sm text-gray-500 pb-24 md:pb-6">
        <div className="flex justify-center gap-4">
          <a href="/privacy" className="hover:underline hover:text-gray-900">Privacy Policy</a>
          <span>•</span>
          <a href="/terms" className="hover:underline hover:text-gray-900">Terms of Service</a>
        </div>
        <p className="mt-2">© {new Date().getFullYear()} CampusShare</p>
      </footer>
    </div>
  );
}
