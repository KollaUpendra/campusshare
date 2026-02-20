"use client";

import { Badge } from "@/components/ui/badge";
import { 
    Table, 
    TableBody, 
    TableCell, 
    TableHead, 
    TableHeader, 
    TableRow 
} from "@/components/ui/table";
import { format } from "date-fns";
import { Coins, Clock, CheckCircle2, XCircle } from "lucide-react";

interface Deposit {
    id: string;
    amount: number;
    type: string;
    upiId: string | null;
    transactionId: string | null;
    status: string;
    adminMessage: string | null;
    createdAt: string;
}

export default function DepositHistory({ deposits }: { deposits: Deposit[] }) {
    if (deposits.length === 0) {
        return (
            <div className="text-center py-8 border rounded-lg bg-muted/20">
                <Clock className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                <p className="text-muted-foreground">No payment requests yet.</p>
            </div>
        );
    }

    return (
        <div className="border rounded-lg bg-card">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Details</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Admin Message</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {deposits.map((deposit) => (
                        <TableRow key={deposit.id}>
                            <TableCell className="text-xs">
                                {format(new Date(deposit.createdAt), "dd MMM yyyy")}
                            </TableCell>
                            <TableCell>
                                <Badge variant="outline" className={deposit.type === "DEPOSIT" ? "text-blue-600 border-blue-200" : "text-orange-600 border-orange-200"}>
                                    {deposit.type === "DEPOSIT" ? "Deposit" : "Withdrawal"}
                                </Badge>
                            </TableCell>
                            <TableCell>
                                <div className="flex items-center gap-1 font-medium">
                                    <Coins className="h-3 w-3 text-yellow-600" />
                                    {deposit.amount}
                                </div>
                            </TableCell>
                            <TableCell className="text-xs">
                                {deposit.type === "DEPOSIT" ? (
                                    <span className="font-mono text-[10px] bg-slate-100 px-1 rounded">TX: {deposit.transactionId}</span>
                                ) : (
                                    <span className="text-muted-foreground">UPI: {deposit.upiId}</span>
                                )}
                            </TableCell>
                            <TableCell>
                                <div className="flex items-center gap-1">
                                    {deposit.status === "PENDING" && (
                                        <Badge variant="secondary" className="gap-1">
                                            <Clock className="h-3 w-3" /> Pending
                                        </Badge>
                                    )}
                                    {deposit.status === "APPROVED" && (
                                        <Badge variant="default" className="bg-green-600 hover:bg-green-600 gap-1 text-white border-0">
                                            <CheckCircle2 className="h-3 w-3" /> Approved
                                        </Badge>
                                    )}
                                    {deposit.status === "REJECTED" && (
                                        <Badge variant="destructive" className="gap-1">
                                            <XCircle className="h-3 w-3" /> Rejected
                                        </Badge>
                                    )}
                                </div>
                            </TableCell>
                            <TableCell className="max-w-[150px] truncate text-xs text-muted-foreground italic">
                                {deposit.adminMessage || "-"}
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
}
