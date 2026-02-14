/**
 * @file layout.tsx
 * @description The Root Layout component for the CampusShare application.
 * @module App/Layout
 * 
 * Purpose:
 * - Defines the global HTML structure (html, body).
 * - Applies global styles and fonts (Inter).
 * - Wraps the application with necessary context providers (NextAuth, etc.).
 * - Implements the common application shell (Header, Main Content, BottomNav).
 * 
 * Components:
 * - Providers: Wraps app with SessionProvider.
 * - Header: Top navigation bar.
 * - BottomNav: Mobile-responsive bottom navigation.
 */

import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Header from "@/components/layout/Header";
import BottomNav from "@/components/layout/BottomNav";
import Providers from "@/components/auth/Providers";

const inter = Inter({ subsets: ["latin"] });

/**
 * Global Metadata Configuration
 * Used by Next.js to generate <head> elements.
 */
export const metadata: Metadata = {
  title: "CampusShare",
  description: "Campus Rental & Lending Platform",
};

/**
 * Viewport Configuration
 * Optimization for mobile devices.
 */
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#ffffff", // Good practice to define theme color
};

/**
 * RootLayout Component
 * 
 * @param {object} props - Component props.
 * @param {React.ReactNode} props.children - The page content to be rendered.
 * @returns {JSX.Element} The root html structure.
 */
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers>
          <div className="flex min-h-screen flex-col bg-muted/30">
            {/* Common Header across all pages */}
            <Header />

            {/* Main Content Area - Responsive Container */}
            <main className="flex-1 pb-24 pt-4 px-4 container mx-auto max-w-md md:max-w-2xl lg:max-w-4xl">
              {children}
            </main>

            {/* Mobile Bottom Navigation */}
            <BottomNav />
          </div>
        </Providers>
      </body>
    </html>
  );
}

