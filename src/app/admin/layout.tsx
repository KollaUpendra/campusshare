import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
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
            <span className="font-bold text-lg">Admin Panel</span>
      </div>
      <main className="flex-1 container py-6">{children}</main>
    </div>
  );
}
