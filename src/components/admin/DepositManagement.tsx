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
    upiId: string;
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
    const [selectedRequest, setSelectedRequest] = useState<DepositRequest | null>(null);
    const [actionStatus, setActionStatus] = useState<"APPROVED" | "REJECTED" | "">("");
    const [adminMessage, setAdminMessage] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { toast } = useToast();

    const fetchDeposits = async () => {
        setIsLoading(true);
        try {
            const url = filterStatus === "ALL" 
                ? "/api/admin/deposits" 
                : `/api/admin/deposits?status=${filterStatus}`;
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
    }, [filterStatus]);

    const handleAction = async () => {
        if (!selectedRequest || !actionStatus) return;
        setIsSubmitting(true);
        try {
            const res = await fetch(`/api/admin/deposits/${selectedRequest.id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status: actionStatus, adminMessage }),
            });

            if (!res.ok) throw new Error("Failed to process request");

            toast({ title: "Success", description: `Request ${actionStatus.toLowerCase()} successfully.` });
            setSelectedRequest(null);
            setAdminMessage("");
            setActionStatus("");
            fetchDeposits();
        } catch (error) {
            toast({ variant: "destructive", title: "Error", description: "Operation failed" });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="space-y-4">
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-muted/30 p-4 rounded-lg">
                <div className="flex items-center gap-2 w-full md:w-auto">
                    <Filter className="h-4 w-4 text-muted-foreground" />
                    <select 
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                        className="bg-transparent text-sm font-medium border-none focus:ring-0 cursor-pointer"
                    >
                        <option value="ALL">All Requests</option>
                        <option value="PENDING">Pending</option>
                        <option value="APPROVED">Approved</option>
                        <option value="REJECTED">Rejected</option>
                    </select>
                </div>
                <div className="text-sm text-muted-foreground">
                    Total: {deposits.length} requests
                </div>
            </div>

            {isLoading ? (
                <div className="flex justify-center p-12">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
            ) : (
                <div className="border rounded-lg bg-card">
                    <div className="w-full overflow-x-auto">
                        <Table className="min-w-[700px]">
                            <TableHeader>
                                <TableRow>
                                    <TableHead>User / Date</TableHead>
                                    <TableHead>Details</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {deposits.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={4} className="text-center py-12 text-muted-foreground">
                                            No withdrawal requests found.
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
                                                <div className="text-sm font-bold text-red-600 whitespace-nowrap">₹{deposit.amount}</div>
                                                <div className="text-xs whitespace-nowrap">UPI: {deposit.upiId}</div>
                                                {deposit.message && <div className="text-[10px] italic line-clamp-1 mt-1">"{deposit.message}"</div>}
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
                        <DialogTitle>{actionStatus === "APPROVED" ? "Approve" : "Reject"} Withdrawal Request</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to {actionStatus.toLowerCase()} the request of ₹{selectedRequest?.amount} for {selectedRequest?.user.name}? 
                            {actionStatus === "APPROVED" && " This will DEDUCT coins from their balance."}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label>Message for User (Optional)</Label>
                            <Textarea 
                                placeholder="Example: Confirmation code 1234..."
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
