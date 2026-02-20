import db from "@/lib/db";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

export const dynamic = "force-dynamic";

export default async function AdminTransactionsPage() {
  const transactions = await db.transaction.findMany({
    orderBy: {
      createdAt: "desc",
    },
    include: {
      fromUser: {
        select: {
          name: true,
          email: true,
        },
      },
      toUser: {
        select: {
          name: true,
          email: true,
        },
      },
      item: {
        select: {
          title: true,
        },
      },
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">All Transactions</h1>
        <Badge variant="outline">{transactions.length} Total</Badge>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Transaction History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <div className="w-full overflow-x-auto">
              <table className="w-full caption-bottom text-sm text-left min-w-[800px]">
                <thead className="[&_tr]:border-b">
                  <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                    <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Date</th>
                    <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Type</th>
                    <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">From</th>
                    <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">To</th>
                    <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Item</th>
                    <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Amount</th>
                    <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Status</th>
                  </tr>
                </thead>
                <tbody className="[&_tr:last-child]:border-0">
                  {transactions.length === 0 ? (
                    <tr className="border-b transition-colors hover:bg-muted/50">
                      <td colSpan={7} className="p-4 align-middle h-24 text-center">
                        No transactions found.
                      </td>
                    </tr>
                  ) : (
                    transactions.map((txn) => (
                      <tr key={txn.id} className="border-b transition-colors hover:bg-muted/50">
                        <td className="p-4 align-middle whitespace-nowrap">
                          {format(new Date(txn.createdAt), "PP p")}
                        </td>
                        <td className="p-4 align-middle">
                          <Badge variant="secondary">{txn.type}</Badge>
                        </td>
                        <td className="p-4 align-middle">
                          <div className="flex flex-col">
                            <span className="font-medium whitespace-nowrap">
                              {txn.fromUser?.name || "System"}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {txn.fromUser?.email}
                            </span>
                          </div>
                        </td>
                        <td className="p-4 align-middle">
                          <div className="flex flex-col">
                            <span className="font-medium whitespace-nowrap">
                              {txn.toUser?.name || "System"}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {txn.toUser?.email}
                            </span>
                          </div>
                        </td>
                        <td className="p-4 align-middle whitespace-nowrap">{txn.item?.title || "-"}</td>
                        <td className="p-4 align-middle font-bold">
                          ₹{txn.amount.toFixed(2)}
                        </td>
                        <td className="p-4 align-middle">
                          <Badge
                            variant={
                              txn.status === "COMPLETED"
                                ? "default"
                                : txn.status === "FAILED"
                                ? "destructive"
                                : "outline"
                            }
                          >
                            {txn.status}
                          </Badge>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
