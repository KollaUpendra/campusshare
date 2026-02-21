"use client";

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
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Edit } from "lucide-react";
import { CldUploadWidget } from "next-cloudinary";
import { useToast } from "@/components/ui/use-toast";

export interface EditProfileDialogProps {
    user: {
        name: string | null;
        image: string | null;
        bio: string | null;
        phoneNumber: string | null;
        year: string | null;
        branch: string | null;
        section: string | null;
        address: string | null;
    };
    forceOpen?: boolean;
}

import { useSession, signOut } from "next-auth/react";

export default function EditProfileDialog({ user, forceOpen = false }: EditProfileDialogProps) {
    const { update } = useSession();
    const [open, setOpen] = useState(forceOpen);
    const { toast } = useToast();

    useEffect(() => {
        if (forceOpen) {
            setOpen(true);
        }
    }, [forceOpen]);

    const [isLoading, setIsLoading] = useState(false);
    const [name, setName] = useState(user.name || "");
    const [bio, setBio] = useState(user.bio || "");
    const [phoneNumber, setPhoneNumber] = useState(user.phoneNumber || "");
    const [year, setYear] = useState(user.year || "");
    const [branch, setBranch] = useState(user.branch || "");
    const [section, setSection] = useState(user.section || "");
    const [address, setAddress] = useState(user.address || "");

    const [imageUrl, setImageUrl] = useState(user.image || "");
    const router = useRouter();

    const onSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const res = await fetch("/api/user/profile", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name,
                    bio,
                    phoneNumber,
                    image: imageUrl,
                    year,
                    branch,
                    section,
                    address
                }),
            });

            if (!res.ok) {
                const errorText = await res.text();
                if (res.status === 404 && errorText.includes("User record not found")) {
                    toast({
                        variant: "destructive",
                        title: "Session Expired",
                        description: "Your account could not be found. Signing you out...",
                    });
                    await signOut({ callbackUrl: "/" });
                    return;
                }
                throw new Error(errorText || "Failed to update profile");
            }

            // Refresh session data on client
            await update();

            if (!forceOpen) {
                setOpen(false);
            }
            router.refresh();
        } catch (error: any) {
            toast({
                variant: "destructive",
                title: "Error Updating Profile",
                description: error.message || "Something went wrong while updating your profile.",
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={(val) => {
            if (forceOpen && !val) return;
            setOpen(val);
        }}>
            {!forceOpen && (
                <DialogTrigger asChild>
                    <Button variant="outline" size="sm" className="gap-2">
                        <Edit className="h-4 w-4" />
                        Edit Profile
                    </Button>
                </DialogTrigger>
            )}
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Edit Profile</DialogTitle>
                    <DialogDescription>
                        Make changes to your profile here. Click save when you're done.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={onSubmit} className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="image" className="text-right">
                            Profile Image
                        </Label>
                        <div className="col-span-3">
                            {/* Minimal Cloudinary Upload Widget */}
                            <CldUploadWidget
                                signatureEndpoint="/api/sign-cloudinary" // Fix: match actual API route path
                                onSuccess={(result: any) => {
                                    setImageUrl(result.info.secure_url);
                                }}
                            >
                                {({ open }) => (
                                    <Button type="button" variant="secondary" onClick={() => open()}>
                                        Upload New Image
                                    </Button>
                                )}
                            </CldUploadWidget>
                        </div>
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="bio" className="text-right">
                            Bio
                        </Label>
                        <Textarea
                            id="bio"
                            value={bio}
                            onChange={(e) => setBio(e.target.value)}
                            className="col-span-3"
                        />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="name" className="text-right">
                            Name
                        </Label>
                        <Input
                            id="name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="col-span-3"
                        />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="phone" className="text-right">
                            Phone
                        </Label>
                        <Input
                            id="phone"
                            value={phoneNumber}
                            onChange={(e) => setPhoneNumber(e.target.value)}
                            className="col-span-3"
                        />
                    </div>
                    {/* New Fields */}
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="year" className="text-right">Year</Label>
                        <Input id="year" value={year} onChange={(e) => setYear(e.target.value)} className="col-span-3" placeholder="e.g. 3rd Year" />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="branch" className="text-right">Branch</Label>
                        <Input id="branch" value={branch} onChange={(e) => setBranch(e.target.value)} className="col-span-3" placeholder="e.g. CSE" />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="section" className="text-right">Section</Label>
                        <Input id="section" value={section} onChange={(e) => setSection(e.target.value)} className="col-span-3" placeholder="e.g. A" />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="address" className="text-right">Address</Label>
                        <Textarea id="address" value={address} onChange={(e) => setAddress(e.target.value)} className="col-span-3" placeholder="Hostel/Room No." />
                    </div>
                    <DialogFooter>
                        <Button type="submit" disabled={isLoading}>
                            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Save changes"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
