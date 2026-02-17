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
            
            <Card>
                <CardHeader>
                    <CardTitle>Configure Fees</CardTitle>
                    <CardDescription>
                        Set the percentage deducted from transactions as platform fees.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid gap-2">
                        <Label htmlFor="rent">Rent Service Charge (%)</Label>
                        <Input 
                            id="rent" 
                            type="number" 
                            min="0" 
                            max="100"
                            step="0.1"
                            value={rentPercent} 
                            onChange={(e) => setRentPercent(parseFloat(e.target.value))} 
                        />
                        <p className="text-xs text-muted-foreground">
                            If an item is rented for 100 coins, the owner receives {100 - rentPercent} coins.
                        </p>
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="sell">Sell Service Charge (%)</Label>
                        <Input 
                            id="sell" 
                            type="number" 
                            min="0" 
                            max="100"
                            step="0.1"
                            value={sellPercent} 
                            onChange={(e) => setSellPercent(parseFloat(e.target.value))} 
                        />
                        <p className="text-xs text-muted-foreground">
                            If an item is sold for 100 coins, the owner receives {100 - sellPercent} coins.
                        </p>
                    </div>

                    <Button onClick={handleSave} disabled={saving}>
                        {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        <Save className="mr-2 h-4 w-4" /> Save Changes
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
}
