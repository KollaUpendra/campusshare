export const dynamic = "force-dynamic";

import db from "@/infrastructure/db/client";
import { Badge } from "@/components/ui/badge";
import AdminItemActions from "@/features/admin/components/AdminItemActions";

export default async function AdminItemsPage() {
    const items = await db.item.findMany({
        include: {
            owner: { select: { name: true, email: true } },
            _count: { select: { bookings: true } },
        },
        orderBy: { createdAt: "desc" },
    });

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold">Item Management</h1>
                <Badge variant="outline">{items.length} items</Badge>
            </div>

            <div className="border rounded-lg bg-card overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="bg-muted/50 border-b">
                                <th className="text-left p-3 font-medium">Item</th>
                                <th className="text-left p-3 font-medium">Owner</th>
                                <th className="text-left p-3 font-medium">Price</th>
                                <th className="text-left p-3 font-medium">Status</th>
                                <th className="text-left p-3 font-medium">Bookings</th>
                                <th className="text-right p-3 font-medium">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {items.map((item) => (
                                <tr key={item.id} className="border-b last:border-0 hover:bg-muted/30">
                                    <td className="p-3">
                                        <div>
                                            <p className="font-medium">{item.title}</p>
                                            <p className="text-xs text-muted-foreground truncate max-w-[200px]">
                                                {item.description}
                                            </p>
                                        </div>
                                    </td>
                                    <td className="p-3 text-muted-foreground text-xs">
                                        {item.owner.name || item.owner.email}
                                    </td>
                                    <td className="p-3">₹{item.price}</td>
                                    <td className="p-3">
                                        <Badge variant={item.status === "active" ? "default" : "secondary"}>
                                            {item.status}
                                        </Badge>
                                    </td>
                                    <td className="p-3 text-center">{item._count.bookings}</td>
                                    <td className="p-3 text-right">
                                        <AdminItemActions
                                            itemId={item.id}
                                            currentStatus={item.status}
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
