"use client";

import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { 
    Table, 
    TableBody, 
    TableCell, 
    TableHead, 
    TableHeader, 
    TableRow 
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, CheckCircle2, XCircle, Search, Filter } from "lucide-react";
import { format } from "date-fns";
import { 
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";

interface DepositRequest {
    id: string;
    userId: string;
    amount: number;
    type: string;
    upiId: string | null;
    transactionId: string | null;
    message: string | null;
    status: string;
    adminMessage: string | null;
    createdAt: string;
    user: {
        name: string | null;
        email: string | null;
    };
}

export default function DepositManagement() {
    const [deposits, setDeposits] = useState<DepositRequest[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [filterStatus, setFilterStatus] = useState<string>("ALL");
    const [filterType, setFilterType] = useState<string>("ALL");
    const [selectedRequest, setSelectedRequest] = useState<DepositRequest | null>(null);
    const [actionStatus, setActionStatus] = useState<"APPROVED" | "REJECTED" | "">("");
    const [adminMessage, setAdminMessage] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { toast } = useToast();

    const fetchDeposits = async () => {
        setIsLoading(true);
        try {
            const params = new URLSearchParams();
            if (filterStatus !== "ALL") params.append("status", filterStatus);
            if (filterType !== "ALL") params.append("type", filterType);
            
            const url = `/api/admin/deposits?${params.toString()}`;
            const res = await fetch(url);
            if (!res.ok) throw new Error("Failed to fetch");
            const data = await res.json();
            setDeposits(data);
        } catch (error) {
            toast({ variant: "destructive", title: "Error", description: "Failed to load requests" });
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchDeposits();
    }, [filterStatus, filterType]);

    const handleAction = async () => {
        if (!selectedRequest || !actionStatus) return;
        setIsSubmitting(true);
        try {
            const res = await fetch(`/api/admin/deposits/${selectedRequest.id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status: actionStatus, adminMessage }),
            });

            if (!res.ok) {
                const text = await res.text();
                throw new Error(text || "Failed to process request");
            }

            toast({ title: "Success", description: `Request ${actionStatus.toLowerCase()} successfully.` });
            setSelectedRequest(null);
            setAdminMessage("");
            setActionStatus("");
            fetchDeposits();
        } catch (error: any) {
            toast({ variant: "destructive", title: "Error", description: error.message || "Operation failed" });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="space-y-4">
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-muted/30 p-4 rounded-lg">
                <div className="flex flex-wrap items-center gap-6 w-full md:w-auto">
                    <div className="flex items-center gap-2">
                        <Filter className="h-4 w-4 text-muted-foreground" />
                        <span className="text-xs uppercase font-bold text-muted-foreground">Status:</span>
                        <select 
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value)}
                            className="bg-transparent text-sm font-medium border-none focus:ring-0 cursor-pointer"
                        >
                            <option value="ALL">All Status</option>
                            <option value="PENDING">Pending</option>
                            <option value="APPROVED">Approved</option>
                            <option value="REJECTED">Rejected</option>
                        </select>
                    </div>

                    <div className="flex items-center gap-2">
                        <span className="text-xs uppercase font-bold text-muted-foreground tracking-wider">Type:</span>
                        <select 
                            value={filterType}
                            onChange={(e) => setFilterType(e.target.value)}
                            className="bg-transparent text-sm font-medium border-none focus:ring-0 cursor-pointer"
                        >
                            <option value="ALL">All Types</option>
                            <option value="DEPOSIT">Deposits Only</option>
                            <option value="WITHDRAWAL">Withdrawals Only</option>
                        </select>
                    </div>
                </div>
                <div className="text-sm text-muted-foreground whitespace-nowrap">
                    Total: <span className="font-bold text-foreground">{deposits.length}</span> requests
                </div>
            </div>

            {isLoading ? (
                <div className="flex justify-center p-12">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
            ) : (
                <div className="border rounded-lg bg-card">
                    <div className="w-full overflow-x-auto">
                        <Table className="min-w-[800px]">
                            <TableHeader>
                                <TableRow>
                                    <TableHead>User / Date</TableHead>
                                    <TableHead>Type</TableHead>
                                    <TableHead>Amount</TableHead>
                                    <TableHead>Details</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {deposits.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={6} className="text-center py-12 text-muted-foreground">
                                            No payment requests found.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    deposits.map((deposit) => (
                                        <TableRow key={deposit.id}>
                                            <TableCell>
                                                <div className="font-medium whitespace-nowrap">{deposit.user.name || "Anonymous"}</div>
                                                <div className="text-xs text-muted-foreground">{deposit.user.email}</div>
                                                <div className="text-[10px] text-muted-foreground mt-1 whitespace-nowrap">
                                                    {format(new Date(deposit.createdAt), "dd MMM yyyy, HH:mm")}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="outline" className={deposit.type === "DEPOSIT" ? "text-blue-600 border-blue-200 bg-blue-50" : "text-orange-600 border-orange-200 bg-orange-50"}>
                                                    {deposit.type === "DEPOSIT" ? "Deposit" : "Withdrawal"}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                <div className={`text-sm font-bold whitespace-nowrap ${deposit.type === "DEPOSIT" ? "text-green-600" : "text-red-600"}`}>
                                                    {deposit.type === "DEPOSIT" ? "+" : "-"} ₹{deposit.amount}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                {deposit.type === "DEPOSIT" ? (
                                                    <div className="text-xs">
                                                        <span className="text-muted-foreground block text-[10px] uppercase font-bold">Transaction ID:</span>
                                                        <span className="font-mono bg-slate-100 px-1 rounded select-all">{deposit.transactionId}</span>
                                                    </div>
                                                ) : (
                                                    <div className="text-xs">
                                                        <span className="text-muted-foreground block text-[10px] uppercase font-bold">UPI ID:</span>
                                                        <span className="select-all">{deposit.upiId}</span>
                                                    </div>
                                                )}
                                                {deposit.message && <div className="text-[10px] italic line-clamp-1 mt-1 text-muted-foreground" title={deposit.message}>"{deposit.message}"</div>}
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant={
                                                    deposit.status === "PENDING" ? "secondary" : 
                                                    deposit.status === "APPROVED" ? "default" : "destructive"
                                                }>
                                                    {deposit.status}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                {deposit.status === "PENDING" ? (
                                                    <div className="flex justify-end gap-2">
                                                        <Button 
                                                            size="sm" 
                                                            variant="outline" 
                                                            className="h-8 text-green-600 hover:text-green-700 hover:bg-green-50"
                                                            onClick={() => {
                                                                setSelectedRequest(deposit);
                                                                setActionStatus("APPROVED");
                                                            }}
                                                        >
                                                            Approve
                                                        </Button>
                                                        <Button 
                                                            size="sm" 
                                                            variant="outline" 
                                                            className="h-8 text-destructive"
                                                            onClick={() => {
                                                                setSelectedRequest(deposit);
                                                                setActionStatus("REJECTED");
                                                            }}
                                                        >
                                                            Reject
                                                        </Button>
                                                    </div>
                                                ) : (
                                                    <span className="text-xs text-muted-foreground italic">Processed</span>
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </div>
            )}

            {/* Action Dialog */}
            <Dialog open={!!selectedRequest} onOpenChange={(open) => !open && setSelectedRequest(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{actionStatus === "APPROVED" ? "Approve" : "Reject"} {selectedRequest?.type === "DEPOSIT" ? "Coin Deposit" : "Withdrawal"}</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to {actionStatus.toLowerCase()} the request of ₹{selectedRequest?.amount} for {selectedRequest?.user.name}? 
                            {actionStatus === "APPROVED" && (
                                selectedRequest?.type === "DEPOSIT" 
                                ? " This will ADD coins to their balance." 
                                : " This will DEDUCT coins from their balance."
                            )}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label>Message for User (Optional)</Label>
                            <Textarea 
                                placeholder={actionStatus === "APPROVED" ? "Confirmation message..." : "Reason for rejection..."}
                                value={adminMessage}
                                onChange={(e) => setAdminMessage(e.target.value)}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setSelectedRequest(null)} disabled={isSubmitting}>
                            Cancel
                        </Button>
                        <Button 
                            variant={actionStatus === "APPROVED" ? "default" : "destructive"}
                            onClick={handleAction}
                            disabled={isSubmitting}
                        >
                            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Confirm {actionStatus}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
