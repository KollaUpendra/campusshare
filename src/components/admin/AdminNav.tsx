"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { useState } from "react";
import { cn } from "@/lib/utils";

const links = [
    { href: "/admin", label: "Dashboard" },
    { href: "/admin/users", label: "Users" },
    { href: "/admin/items", label: "Items" },
    { href: "/admin/settings", label: "Settings" },
    { href: "/admin/transactions/incomplete", label: "Incomplete Txns" },
];

export function AdminNav() {
    const pathname = usePathname();
    const [open, setOpen] = useState(false);

    return (
        <>
            {/* Desktop Navigation */}
            <nav className="hidden md:flex gap-4 text-sm font-medium">
                {links.map((link) => (
                    <Link
                        key={link.href}
                        href={link.href}
                        className={cn(
                            "transition-colors hover:text-primary",
                            pathname === link.href ? "text-primary font-bold" : "text-muted-foreground"
                        )}
                    >
                        {link.label}
                    </Link>
                ))}
            </nav>

            {/* Mobile Navigation - Handled by BottomNav now */}
            <div className="md:hidden">
               {/* Hidden because BottomNav handles it */}
            </div>
        </>
    );
}
