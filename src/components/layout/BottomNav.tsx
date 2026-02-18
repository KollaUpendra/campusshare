/**
 * @file BottomNav.tsx
 * @description Mobile-responsive bottom navigation bar.
 * @module Components/Layout/BottomNav
 * 
 * Functionality:
 * - Provides quick access to main routes (Home, Search, Bookings, Profile).
 * - Highlights the active route.
 * - Features a prominent "Post Item" button.
 * - Hidden on larger screens (md+), visible on mobile.
 */

'use client'

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, PlusCircle, CalendarCheck, User, Package, Settings, AlertCircle } from "lucide-react"
import { cn } from "@/lib/utils"

/**
 * BottomNav Component
 * Renders a fixed bottom navigation bar for mobile users.
 */
export default function BottomNav() {
    const pathname = usePathname()

    // Admin Navigation Items
    const adminNavItems = [
        {
            label: "Dashboard",
            href: "/admin",
            icon: Home,
        },
        {
            label: "Users",
            href: "/admin/users",
            icon: User,
        },
        {
            label: "Items",
            href: "/admin/items", // Using Package icon for items
            icon: Package,
        },

        {
            label: "Settings",
            href: "/admin/settings",
            icon: Settings,
        },
        {
            label: "Incomplete",
            href: "/admin/transactions/incomplete",
            icon: AlertCircle, 
        },
    ];

    const isAdmin = pathname?.startsWith("/admin");
    const itemsToShow = isAdmin ? adminNavItems : [
        {
            label: "Home",
            href: "/",
            icon: Home,
        },
        {
            label: "My Items",
            href: "/my-items",
            icon: Package,
        },
        {
            label: "Post",
            href: "/post-item",
            icon: PlusCircle,
            primary: true,
        },
        {
            label: "Bookings",
            href: "/dashboard/bookings",
            icon: CalendarCheck,
        },
        {
            label: "Profile",
            href: "/dashboard/profile",
            icon: User,
        },
    ];

    return (
        <nav className="fixed bottom-0 left-0 right-0 z-50 border-t bg-background pb-safe">
            <div className="container flex h-16 items-center px-2 justify-around">
                {itemsToShow.map((item) => {
                    const isActive = pathname === item.href

                    if (item.primary) {
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className="flex flex-col items-center justify-center -mt-6"
                            >
                                <div className="rounded-full bg-primary p-3 text-primary-foreground shadow-lg transition-transform active:scale-95">
                                    <item.icon className="h-6 w-6" />
                                </div>
                                <span className="text-xs font-medium mt-1 text-foreground/80">{item.label}</span>
                            </Link>
                        )
                    }

                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                "flex flex-col items-center justify-center w-16 h-full space-y-1 text-muted-foreground transition-colors hover:text-foreground",
                                isActive && "text-primary"
                            )}
                        >
                            <item.icon className={cn("h-5 w-5", isActive && "fill-current")} />
                            <span className="text-[10px] font-medium">{item.label}</span>
                        </Link>
                    )
                })}
            </div>
        </nav>
    )
}
