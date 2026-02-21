import db from "@/lib/db";
import { Badge } from "@/components/ui/badge";

import BlockUserButton from "@/components/admin/BlockUserButton";
import UserDetailsDialog from "@/components/admin/UserDetailsDialog";

export const dynamic = "force-dynamic";

export default async function AdminUsersPage() {
    const users = await db.user.findMany({
        orderBy: { createdAt: "desc" },
        include: {
            _count: {
                select: {
                    items: true,
                    bookings: true
                }
            }
        }
    });

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold tracking-tight">User Management</h1>
            <div className="bg-card rounded-[2rem] border-0 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-muted/30 text-muted-foreground border-b">
                            <tr>
                                <th className="p-4 px-6 font-semibold tracking-wide">Name</th>
                                <th className="p-4 px-6 font-semibold tracking-wide">Email</th>
                                <th className="p-4 px-6 font-semibold tracking-wide">Role</th>
                                <th className="p-4 px-6 font-semibold tracking-wide">Status</th>
                                <th className="p-4 px-6 font-semibold tracking-wide text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border/50">
                            {users.map((user) => (
                                <tr key={user.id} className="hover:bg-muted/30 transition-colors">
                                    <td className="p-4 px-6 font-medium whitespace-nowrap">
                                        <UserDetailsDialog user={user} />
                                    </td>
                                    <td className="p-4 px-6 text-muted-foreground whitespace-nowrap">{user.email}</td>
                                    <td className="p-4 px-6 whitespace-nowrap">
                                        <Badge variant="outline" className="bg-background text-foreground tracking-wide font-medium">
                                            {user.role}
                                        </Badge>
                                    </td>
                                    <td className="p-4 px-6 whitespace-nowrap">
                                        <Badge variant="secondary" className={`tracking-wide font-medium ${user.isBlocked ? 'bg-red-100 text-red-800 hover:bg-red-100' : 'bg-green-100 text-green-800 hover:bg-green-100'}`}>
                                            {user.isBlocked ? "Blocked" : "Active"}
                                        </Badge>
                                    </td>
                                    <td className="p-4 px-6 text-right whitespace-nowrap">
                                        <BlockUserButton userId={user.id} isBlocked={user.isBlocked} />
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
