"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Loader2, Save, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useToast } from "@/components/ui/use-toast";

export default function ServiceChargesPage() {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [rentPercent, setRentPercent] = useState(0);
    const [sellPercent, setSellPercent] = useState(0);
    const { toast } = useToast();

    useEffect(() => {
        fetch("/api/admin/settings")
            .then(res => res.json())
            .then(data => {
                setRentPercent(data.rentServiceChargePercent || 0);
                setSellPercent(data.sellServiceChargePercent || 0);
            })
            .finally(() => setLoading(false));
    }, []);

    const handleSave = async () => {
        setSaving(true);
        try {
            const res = await fetch("/api/admin/settings", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ rentPercent, sellPercent }),
            });

            if (!res.ok) throw new Error("Failed to save");

            toast({
                title: "Success",
                description: "System settings saved successfully.",
            });
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to save settings.",
                variant: "destructive",
            });
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="p-8"><Loader2 className="animate-spin" /></div>;

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Link href="/admin/settings">
                    <Button variant="ghost" size="icon">
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                </Link>
                <h1 className="text-3xl font-bold">Service Charges</h1>
            </div>

            <Card className="rounded-[2rem] border-0 shadow-sm mt-8">
                <CardHeader className="bg-muted/10 border-b pb-6 pt-8 px-8">
                    <CardTitle className="text-xl">Configure Fees</CardTitle>
                    <CardDescription>
                        Set the percentage deducted from transactions as platform fees.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-8 p-8 max-w-2xl">
                    <div className="grid gap-3">
                        <Label htmlFor="rent" className="text-sm font-semibold tracking-wide">Rent Service Charge (%)</Label>
                        <Input
                            id="rent"
                            type="number"
                            min="0"
                            max="100"
                            step="0.1"
                            value={rentPercent}
                            onChange={(e) => setRentPercent(parseFloat(e.target.value))}
                            className="bg-muted/30 border-muted-foreground/20 h-12 text-lg px-4"
                        />
                        <p className="text-sm text-muted-foreground mt-1">
                            If an item is rented for 100 coins, the owner receives <span className="font-bold text-foreground">{100 - rentPercent}</span> coins.
                        </p>
                    </div>

                    <div className="grid gap-3">
                        <Label htmlFor="sell" className="text-sm font-semibold tracking-wide">Sell Service Charge (%)</Label>
                        <Input
                            id="sell"
                            type="number"
                            min="0"
                            max="100"
                            step="0.1"
                            value={sellPercent}
                            onChange={(e) => setSellPercent(parseFloat(e.target.value))}
                            className="bg-muted/30 border-muted-foreground/20 h-12 text-lg px-4"
                        />
                        <p className="text-sm text-muted-foreground mt-1">
                            If an item is sold for 100 coins, the owner receives <span className="font-bold text-foreground">{100 - sellPercent}</span> coins.
                        </p>
                    </div>

                    <Button onClick={handleSave} disabled={saving} className="w-full sm:w-auto h-12 px-8 text-base">
                        {saving && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
                        <Save className="mr-2 h-5 w-5" /> Save Changes
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
}
