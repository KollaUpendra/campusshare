import { getServerSession } from "next-auth";
import { authOptions } from "@/config/auth.config";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  if (!session || session.user?.role !== "admin") {
    redirect("/");
  }

  return (
    <div className="flex min-h-screen flex-col">
      <div className="border-b bg-muted/40 px-4 py-2">
        <div className="container flex items-center gap-4">
          <span className="font-bold text-lg">Admin Panel</span>
          <nav className="flex gap-4 text-sm font-medium">
            <Link href="/admin" className="hover:underline">Dashboard</Link>
            <Link href="/admin/users" className="hover:underline">Users</Link>
            <Link href="/admin/bookings" className="hover:underline">Bookings</Link>
            <Link href="/admin/items" className="hover:underline">Items</Link>
          </nav>
        </div>
      </div>
      <main className="flex-1 container py-6">{children}</main>
    </div>
  );
}
