
"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, AlertTriangle } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

type IncompleteBooking = {
    id: string;
    status: string;
    createdAt: string;
    itemTitle: string;
    ownerName: string;
    borrowerName: string;
};

export default function IncompleteTransactionsPage() {
    const [transactions, setTransactions] = useState<IncompleteBooking[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchTransactions();
    }, []);

    const fetchTransactions = async () => {
        try {
            const res = await fetch("/api/admin/transactions/incomplete");
            if (res.ok) {
                const data = await res.json();
                setTransactions(data);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="p-8 flex justify-center"><Loader2 className="animate-spin" /></div>;

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold flex items-center gap-2">
                <AlertTriangle className="text-amber-500" />
                Incomplete Transactions
            </h1>
            <p className="text-muted-foreground">
                Transactions stalled in "Pending Confirmation" state.
            </p>

            {transactions.length === 0 ? (
                <Card>
                    <CardContent className="p-8 text-center text-muted-foreground">
                        No incomplete transactions found.
                    </CardContent>
                </Card>
            ) : (
                <div className="grid gap-4">
                    {transactions.map((txn) => (
                        <Card key={txn.id} className="border-l-4 border-l-amber-500">
                            <CardHeader className="pb-2">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <CardTitle className="text-base">{txn.itemTitle}</CardTitle>
                                        <div className="text-sm text-muted-foreground mt-1">
                                            ID: {txn.id}
                                        </div>
                                    </div>
                                    <Badge variant="outline" className="text-amber-600 border-amber-200 bg-amber-50">
                                        {txn.status === "PENDING_OWNER_CONFIRMATION" ? "Waiting for Owner" : "Waiting for Borrower"}
                                    </Badge>
                                </div>
                            </CardHeader>
                            <CardContent className="text-sm space-y-2">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <span className="font-semibold block">Owner</span>
                                        {txn.ownerName}
                                    </div>
                                    <div>
                                        <span className="font-semibold block">Borrower</span>
                                        {txn.borrowerName}
                                    </div>
                                </div>
                                <div className="pt-2 border-t mt-2">
                                    <span className="text-muted-foreground">Stuck for: </span>
                                    <span className="font-medium text-red-500">
                                        {formatDistanceToNow(new Date(txn.createdAt))}
                                    </span>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
