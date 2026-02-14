export const dynamic = "force-dynamic";

import db from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { Badge } from "@/components/ui/badge";
import AdminUserActions from "@/components/admin/AdminUserActions";

export default async function AdminUsersPage() {
    const session = await getServerSession(authOptions);
    const users = await db.user.findMany({
        orderBy: { createdAt: "desc" },
    });

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold">User Management</h1>
                <Badge variant="outline">{users.length} users</Badge>
            </div>

            <div className="border rounded-lg bg-card overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="bg-muted/50 border-b">
                                <th className="text-left p-3 font-medium">User</th>
                                <th className="text-left p-3 font-medium">Role</th>
                                <th className="text-left p-3 font-medium">Status</th>
                                <th className="text-left p-3 font-medium">Joined</th>
                                <th className="text-right p-3 font-medium">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.map((user) => (
                                <tr key={user.id} className="border-b last:border-0 hover:bg-muted/30">
                                    <td className="p-3">
                                        <div>
                                            <p className="font-medium">{user.name || "Unnamed"}</p>
                                            <p className="text-xs text-muted-foreground">{user.email}</p>
                                        </div>
                                    </td>
                                    <td className="p-3">
                                        <Badge variant={user.role === "admin" ? "default" : "secondary"}>
                                            {user.role}
                                        </Badge>
                                    </td>
                                    <td className="p-3">
                                        <Badge variant={user.isBlocked ? "destructive" : "outline"}>
                                            {user.isBlocked ? "Blocked" : "Active"}
                                        </Badge>
                                    </td>
                                    <td className="p-3 text-muted-foreground text-xs">
                                        {new Date(user.createdAt).toLocaleDateString()}
                                    </td>
                                    <td className="p-3 text-right">
                                        <AdminUserActions
                                            userId={user.id}
                                            currentRole={user.role}
                                            isBlocked={user.isBlocked}
                                            isSelf={user.id === session?.user?.id}
                                        />
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
