import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import db from "@/lib/db";
import { redirect } from "next/navigation";
import Image from "next/image";
import { User, Coins, Phone, FileText } from "lucide-react";
import Link from "next/link";
import EditProfileDialog from "@/components/profile/EditProfileDialog";

export default async function ProfilePage() {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
        redirect("/");
    }

    const userData = await db.user.findUnique({
        where: { id: session.user.id },

    });

    if (!userData) {
        return <div>User not found</div>;
    }

    // Explicitly cast to any to bypass stale TS errors in editor
    const user = userData as any;



    return (
        <div className="container mx-auto px-4 py-8 max-w-4xl space-y-8">
            {/* Header / Profile Card */}
            <div className="flex flex-col md:flex-row items-center gap-6 p-6 bg-card border rounded-xl shadow-sm relative">
                <div className="absolute top-4 right-4">
                    <EditProfileDialog user={user} />
                </div>
                <div className="relative h-24 w-24 rounded-full overflow-hidden border-2 border-primary/20">
                    {user.image ? (
                        <Image src={user.image} alt={user.name || "User"} fill className="object-cover" />
                    ) : (
                        <div className="h-full w-full bg-muted flex items-center justify-center">
                            <User className="h-10 w-10 text-muted-foreground" />
                        </div>
                    )}
                </div>

                <div className="flex-1 text-center md:text-left space-y-2">
                    <h1 className="text-2xl font-bold">{user.name}</h1>
                    <p className="text-muted-foreground">{user.email}</p>
                    <div className="flex flex-wrap justify-center md:justify-start gap-4 text-sm text-muted-foreground mt-2">
                        {user.phoneNumber && (
                            <div className="flex items-center gap-1">
                                <Phone className="h-4 w-4" />
                                <span>{user.phoneNumber}</span>
                            </div>
                        )}
                        {user.bio && (
                            <div className="flex items-center gap-1">
                                <FileText className="h-4 w-4" />
                                <span>{user.bio}</span>
                            </div>
                        )}
                    </div>
                </div>

                <div className="flex flex-col items-center gap-2 min-w-[120px]">
                    <div className="flex items-center gap-2 text-2xl font-bold text-yellow-600 bg-yellow-50 px-4 py-2 rounded-lg border border-yellow-200">
                        <Coins className="h-6 w-6" />
                        <span>{user.coins.toFixed(0)}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">Available Balance</p>
                </div>
            </div>


        </div>
    );
}
