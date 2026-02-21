import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ShieldCheck } from "lucide-react";

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
    <div className="flex min-h-[100dvh] flex-col bg-muted/20">
      <div className="border-b bg-background/80 backdrop-blur-md px-6 py-4 sticky top-14 z-30 shadow-sm border-border">
        <div className="container flex items-center gap-2 text-primary">
          <ShieldCheck className="h-5 w-5" />
          <span className="font-bold text-lg tracking-tight">Admin Console</span>
        </div>
      </div>
      <main className="flex-1 container py-8 pb-24 md:pb-8">{children}</main>
    </div>
  );
}
