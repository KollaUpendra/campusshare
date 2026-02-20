"use client";

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { 
    User as UserIcon, 
    Mail, 
    Phone, 
    MapPin, 
    Calendar, 
    Hash, 
    Coins, 
    FileText, 
    Shield, 
    Ban,
    Clock,
    Package,
    Briefcase
} from "lucide-react";
import { Separator } from "@/components/ui/separator";

interface UserDetailsDialogProps {
    user: {
        id: string;
        name: string | null;
        email: string | null;
        image: string | null;
        role: string;
        isBlocked: boolean;
        pendingFine: number;
        coins: number;
        bio: string | null;
        phoneNumber: string | null;
        year: string | null;
        branch: string | null;
        section: string | null;
        address: string | null;
        createdAt: Date | string;
        _count?: {
            items: number;
            bookings: number;
        };
    };
}

export default function UserDetailsDialog({ user }: UserDetailsDialogProps) {
    const formattedDate = new Date(user.createdAt).toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    });

    return (
        <Dialog>
            <DialogTrigger asChild>
                <button className="text-primary hover:underline font-medium text-left">
                    {user.name || "Anonymous"}
                </button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-2xl">
                        <UserIcon className="h-6 w-6" />
                        User Details
                    </DialogTitle>
                </DialogHeader>
                
                <div className="space-y-6 py-4">
                    {/* Header Info */}
                    <div className="flex items-start gap-4">
                        <div className="h-20 w-20 rounded-full border-2 border-primary/20 overflow-hidden bg-muted flex items-center justify-center">
                            {user.image ? (
                                <img src={user.image} alt={user.name || "User"} className="h-full w-full object-cover" />
                            ) : (
                                <UserIcon className="h-10 w-10 text-muted-foreground" />
                            )}
                        </div>
                        <div className="flex-1 space-y-1">
                            <h3 className="text-xl font-bold">{user.name || "Anonymous"}</h3>
                            <div className="flex items-center gap-2 text-muted-foreground">
                                <Mail className="h-4 w-4" />
                                <span>{user.email}</span>
                            </div>
                            <div className="flex flex-wrap gap-2 mt-2">
                                <Badge variant={user.role === "admin" ? "default" : "secondary"}>
                                    <Shield className="h-3 w-3 mr-1" />
                                    {user.role}
                                </Badge>
                                <Badge variant={user.isBlocked ? "destructive" : "outline"}>
                                    {user.isBlocked ? <Ban className="h-3 w-3 mr-1" /> : <Clock className="h-3 w-3 mr-1" />}
                                    {user.isBlocked ? "Blocked" : "Active"}
                                </Badge>
                                {user.pendingFine > 0 && (
                                    <Badge variant="destructive">
                                        Fine: ₹{user.pendingFine}
                                    </Badge>
                                )}
                            </div>
                        </div>
                    </div>

                    <Separator />

                    {/* Contact & Education */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                            <h4 className="font-semibold text-primary flex items-center gap-2">
                                <Phone className="h-4 w-4" /> Contact & Location
                            </h4>
                            <div className="space-y-2 text-sm">
                                <div className="flex items-center gap-2">
                                    <span className="font-medium">Phone:</span>
                                    <span className="text-muted-foreground">{user.phoneNumber || "Not provided"}</span>
                                </div>
                                <div className="flex items-start gap-2">
                                    <MapPin className="h-4 w-4 mt-0.5 shrink-0" />
                                    <div>
                                        <span className="font-medium block">Address:</span>
                                        <span className="text-muted-foreground">{user.address || "Not provided"}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <h4 className="font-semibold text-primary flex items-center gap-2">
                                <Briefcase className="h-4 w-4" /> Education
                            </h4>
                            <div className="space-y-2 text-sm">
                                <div className="flex items-center gap-2">
                                    <span className="font-medium">Branch:</span>
                                    <span className="text-muted-foreground">{user.branch || "N/A"}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="font-medium">Year:</span>
                                    <span className="text-muted-foreground">{user.year || "N/A"}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="font-medium">Section:</span>
                                    <span className="text-muted-foreground">{user.section || "N/A"}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <Separator />

                    {/* Bio */}
                    <div className="space-y-2">
                        <h4 className="font-semibold text-primary flex items-center gap-2">
                            <FileText className="h-4 w-4" /> Biography
                        </h4>
                        <p className="text-sm text-muted-foreground bg-muted/50 p-3 rounded-md italic">
                            {user.bio || "No biography provided."}
                        </p>
                    </div>

                    <Separator />

                    {/* Stats & Account */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                            <h4 className="font-semibold text-primary flex items-center gap-2">
                                <Coins className="h-4 w-4" /> Wallet & Timing
                            </h4>
                            <div className="space-y-2 text-sm">
                                <div className="flex items-center gap-2">
                                    <span className="font-medium">Coins Balance:</span>
                                    <span className="text-green-600 font-bold flex items-center gap-1">
                                        <Coins className="h-3 w-3" /> {user.coins}
                                    </span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Calendar className="h-4 w-4" />
                                    <span className="font-medium">Joined:</span>
                                    <span className="text-muted-foreground">{formattedDate}</span>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <h4 className="font-semibold text-primary flex items-center gap-2">
                                <Hash className="h-4 w-4" /> Activity Stats
                            </h4>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-muted/50 p-3 rounded-md text-center">
                                    <Package className="h-5 w-5 mx-auto mb-1 text-blue-500" />
                                    <span className="text-xl font-bold block">{user._count?.items || 0}</span>
                                    <span className="text-xs text-muted-foreground">Items</span>
                                </div>
                                <div className="bg-muted/50 p-3 rounded-md text-center">
                                    <Briefcase className="h-5 w-5 mx-auto mb-1 text-orange-500" />
                                    <span className="text-xl font-bold block">{user._count?.bookings || 0}</span>
                                    <span className="text-xs text-muted-foreground">Bookings</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
