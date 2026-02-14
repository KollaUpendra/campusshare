import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { LayoutDashboard, Users, Package, CalendarCheck } from "lucide-react";

const navItems = [
    { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/admin/users", label: "Users", icon: Users },
    { href: "/admin/items", label: "Items", icon: Package },
    { href: "/admin/bookings", label: "Bookings", icon: CalendarCheck },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
    const session = await getServerSession(authOptions);

    if (!session || session.user?.role !== "admin") {
        redirect("/");
    }

    return (
        <div className="flex flex-col md:flex-row gap-6">
            {/* Sidebar */}
            <aside className="md:w-56 shrink-0">
                <nav className="flex md:flex-col gap-1 overflow-x-auto md:overflow-visible p-1 md:sticky md:top-20">
                    {navItems.map((item) => (
                        <Link
                            key={item.href}
                            href={item.href}
                            className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium hover:bg-accent transition-colors whitespace-nowrap"
                        >
                            <item.icon className="h-4 w-4" />
                            {item.label}
                        </Link>
                    ))}
                </nav>
            </aside>

            {/* Main Content */}
            <main className="flex-1 min-w-0">
                {children}
            </main>
        </div>
    );
}
