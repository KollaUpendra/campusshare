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

      <Card className="rounded-[2rem] border-0 shadow-sm overflow-hidden">
        <CardHeader className="bg-muted/10 border-b">
          <CardTitle>Transaction History</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="w-full overflow-x-auto">
            <table className="w-full text-sm text-left min-w-[800px]">
              <thead className="bg-muted/30 text-muted-foreground border-b">
                <tr>
                  <th className="h-12 px-6 font-semibold tracking-wide">Date</th>
                  <th className="h-12 px-6 font-semibold tracking-wide">Type</th>
                  <th className="h-12 px-6 font-semibold tracking-wide">From</th>
                  <th className="h-12 px-6 font-semibold tracking-wide">To</th>
                  <th className="h-12 px-6 font-semibold tracking-wide">Item</th>
                  <th className="h-12 px-6 font-semibold tracking-wide">Amount</th>
                  <th className="h-12 px-6 font-semibold tracking-wide">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {transactions.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-muted-foreground font-medium">
                      No transactions found.
                    </td>
                  </tr>
                ) : (
                  transactions.map((txn) => (
                    <tr key={txn.id} className="hover:bg-muted/30 transition-colors">
                      <td className="p-4 px-6 whitespace-nowrap text-muted-foreground">
                        {format(new Date(txn.createdAt), "PP p")}
                      </td>
                      <td className="p-4 px-6">
                        <Badge variant="outline" className="bg-background text-foreground tracking-wide font-medium">
                          {txn.type}
                        </Badge>
                      </td>
                      <td className="p-4 px-6">
                        <div className="flex flex-col">
                          <span className="font-medium whitespace-nowrap text-foreground">
                            {txn.fromUser?.name || "System"}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {txn.fromUser?.email}
                          </span>
                        </div>
                      </td>
                      <td className="p-4 px-6">
                        <div className="flex flex-col">
                          <span className="font-medium whitespace-nowrap text-foreground">
                            {txn.toUser?.name || "System"}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {txn.toUser?.email}
                          </span>
                        </div>
                      </td>
                      <td className="p-4 px-6 whitespace-nowrap font-medium">{txn.item?.title || "-"}</td>
                      <td className="p-4 px-6 font-bold text-foreground">
                        ₹{txn.amount.toFixed(2)}
                      </td>
                      <td className="p-4 px-6">
                        <Badge
                          variant="secondary"
                          className={`tracking-wide font-medium ${txn.status === "COMPLETED"
                              ? "bg-green-100 text-green-800 hover:bg-green-100"
                              : txn.status === "FAILED"
                                ? "bg-red-100 text-red-800 hover:bg-red-100"
                                : "bg-muted text-muted-foreground hover:bg-muted"
                            }`}
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
        </CardContent>
      </Card>
    </div>
  );
}
