import db from "@/lib/db";
import { Badge } from "@/components/ui/badge";

import BlockUserButton from "@/components/admin/BlockUserButton"; // We will create this

export const dynamic = "force-dynamic";

export default async function AdminUsersPage() {
    const users = await db.user.findMany({
        orderBy: { createdAt: "desc" }
    });

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold">User Management</h1>
            <div className="border rounded-lg bg-card overflow-hidden">
                <table className="w-full text-sm text-left">
                    <thead className="bg-muted text-muted-foreground">
                        <tr>
                            <th className="p-4 font-medium">Name</th>
                            <th className="p-4 font-medium">Email</th>
                            <th className="p-4 font-medium">Role</th>
                            <th className="p-4 font-medium">Status</th>
                            <th className="p-4 font-medium">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y">
                        {users.map((user) => (
                            <tr key={user.id} className="hover:bg-muted/50">
                                <td className="p-4 font-medium">{user.name}</td>
                                <td className="p-4 text-muted-foreground">{user.email}</td>
                                <td className="p-4">
                                    <Badge variant="outline">{user.role}</Badge>
                                </td>
                                <td className="p-4">
                                     <Badge variant={user.isBlocked ? "destructive" : "secondary"}>
                                        {user.isBlocked ? "Blocked" : "Active"}
                                     </Badge>
                                </td>
                                <td className="p-4">
                                    <BlockUserButton userId={user.id} isBlocked={user.isBlocked} />
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
