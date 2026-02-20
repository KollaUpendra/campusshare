import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { FileText, Coins, ArrowRight } from "lucide-react";

export default function AdminSettingsPage() {
    return (
        <div className="space-y-8">
            <h1 className="text-3xl font-bold">Settings & Tools</h1>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Link href="/admin/transactions" className="group">
                    <Card className="h-full transition-all hover:border-primary cursor-pointer">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <FileText className="h-5 w-5 text-primary" />
                                Transactions
                            </CardTitle>
                            <CardDescription>
                                View all completed and pending transactions.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center text-sm font-medium text-primary opacity-0 transition-opacity group-hover:opacity-100">
                                View History <ArrowRight className="ml-1 h-4 w-4" />
                            </div>
                        </CardContent>
                    </Card>
                </Link>

                <Link href="/admin/settings/service-charges" className="group">
                    <Card className="h-full transition-all hover:border-primary cursor-pointer">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Coins className="h-5 w-5 text-primary" />
                                Service Charges
                            </CardTitle>
                            <CardDescription>
                                Configure platform fees for rentals and sales.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center text-sm font-medium text-primary opacity-0 transition-opacity group-hover:opacity-100">
                                Configure Fees <ArrowRight className="ml-1 h-4 w-4" />
                            </div>
                        </CardContent>
                    </Card>
                </Link>

                <Link href="/admin/settings/deposits" className="group">
                    <Card className="h-full transition-all hover:border-primary cursor-pointer">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Coins className="h-5 w-5 text-primary" />
                                Payment Requests
                            </CardTitle>
                            <CardDescription>
                                Approve or reject user cash deposit requests.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center text-sm font-medium text-primary opacity-0 transition-opacity group-hover:opacity-100">
                                Manage Requests <ArrowRight className="ml-1 h-4 w-4" />
                            </div>
                        </CardContent>
                    </Card>
                </Link>
            </div>
        </div>
    );
}
