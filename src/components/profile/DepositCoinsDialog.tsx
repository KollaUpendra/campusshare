"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Coins, Loader2, Wallet } from "lucide-react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/use-toast";

export default function DepositCoinsDialog() {
    const [open, setOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();
    const { toast } = useToast();

    async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setIsLoading(true);

        const formData = new FormData(e.currentTarget);
        const data = {
            amount: formData.get("amount"),
            transactionId: formData.get("transactionId"),
            message: formData.get("message"),
            type: "DEPOSIT",
        };

        try {
            const res = await fetch("/api/user/deposits", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });

            if (!res.ok) {
                const errorText = await res.text();
                throw new Error(errorText || "Failed to submit request");
            }

            toast({
                title: "Deposit Request Sent",
                description: "Your deposit request has been submitted. Coins will be added to your account after admin verifies the transaction ID.",
            });
            setOpen(false);
            router.refresh();
        } catch (error: any) {
            toast({
                variant: "destructive",
                title: "Error",
                description: error.message || "Something went wrong. Please try again.",
            });
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className="w-full gap-2" variant="outline">
                    <Wallet className="h-4 w-4" />
                    Deposit Coins
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Coins className="h-5 w-5 text-yellow-600" />
                        Deposit Coins
                    </DialogTitle>
                    <DialogDescription>
                        Send money via UPI and enter the transaction ID here. Admin will verify and add coins to your account.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={onSubmit} className="grid gap-4 py-4">
                    <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-100 mb-2">
                        <p className="text-xs font-medium text-yellow-800 mb-1">UPI ID for Payment:</p>
                        <p className="text-sm font-bold text-yellow-900 select-all">vjstartup@okaxis</p>
                        <p className="text-[10px] text-yellow-700 mt-1">* 1 Coin = ₹1. Please make payment before submitting.</p>
                    </div>

                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="amount" className="text-right">
                            Amount (₹)
                        </Label>
                        <Input
                            id="amount"
                            name="amount"
                            type="number"
                            placeholder="Amount in INR"
                            className="col-span-3"
                            required
                            min="1"
                        />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="transactionId" className="text-right text-xs">
                            Transaction ID
                        </Label>
                        <Input
                            id="transactionId"
                            name="transactionId"
                            placeholder="UTR / Ref No."
                            className="col-span-3"
                            required
                        />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="message" className="text-right">
                            Notes
                        </Label>
                        <Textarea
                            id="message"
                            name="message"
                            placeholder="Optional message..."
                            className="col-span-3"
                        />
                    </div>
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={isLoading} className="bg-yellow-600 hover:bg-yellow-700">
                            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Submit Request"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
