export const dynamic = "force-dynamic";

import db from "@/lib/db";
import { Badge } from "@/components/ui/badge";
import AdminItemActions from "@/components/admin/AdminItemActions";

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

            <div className="bg-card rounded-[2rem] border-0 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="bg-muted/30 text-muted-foreground border-b">
                            <tr>
                                <th className="text-left p-4 px-6 font-semibold tracking-wide">Item</th>
                                <th className="text-left p-4 px-6 font-semibold tracking-wide">Owner</th>
                                <th className="text-left p-4 px-6 font-semibold tracking-wide">Price</th>
                                <th className="text-left p-4 px-6 font-semibold tracking-wide">Status</th>
                                <th className="text-center p-4 px-6 font-semibold tracking-wide">Bookings</th>
                                <th className="text-right p-4 px-6 font-semibold tracking-wide">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border/50">
                            {items.map((item) => (
                                <tr key={item.id} className="hover:bg-muted/30 transition-colors">
                                    <td className="p-4 px-6">
                                        <div>
                                            <p className="font-medium text-foreground">{item.title}</p>
                                            <p className="text-xs text-muted-foreground truncate max-w-[200px]">
                                                {item.description}
                                            </p>
                                        </div>
                                    </td>
                                    <td className="p-4 px-6 text-muted-foreground text-xs whitespace-nowrap">
                                        {item.owner.name || item.owner.email}
                                    </td>
                                    <td className="p-4 px-6 font-medium whitespace-nowrap">₹{item.price}</td>
                                    <td className="p-4 px-6 whitespace-nowrap">
                                        <Badge variant="secondary" className={`tracking-wide font-medium ${item.status === "active" ? 'bg-green-100 text-green-800 hover:bg-green-100' : 'bg-muted text-muted-foreground hover:bg-muted'}`}>
                                            {item.status.toUpperCase()}
                                        </Badge>
                                    </td>
                                    <td className="p-4 px-6 text-center whitespace-nowrap">
                                        <div className="inline-flex items-center justify-center bg-muted w-8 h-8 rounded-full text-xs font-semibold">
                                            {item._count.bookings}
                                        </div>
                                    </td>
                                    <td className="p-4 px-6 text-right whitespace-nowrap">
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
