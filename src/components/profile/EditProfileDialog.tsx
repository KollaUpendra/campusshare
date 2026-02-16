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
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Edit } from "lucide-react";
import { CldUploadWidget } from "next-cloudinary";

interface EditProfileDialogProps {
    user: {
        name: string | null;
        image: string | null;
        bio: string | null;
        phoneNumber: string | null;
    };
}

export default function EditProfileDialog({ user }: EditProfileDialogProps) {
    const [open, setOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [bio, setBio] = useState(user.bio || "");
    const [phoneNumber, setPhoneNumber] = useState(user.phoneNumber || "");
    const [imageUrl, setImageUrl] = useState(user.image || "");
    const router = useRouter();

    const onSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const res = await fetch("/api/user/profile", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ bio, phoneNumber, image: imageUrl }),
            });

            if (!res.ok) throw new Error("Failed to update profile");

            setOpen(false);
            router.refresh();
        } catch (error) {
            alert("Something went wrong");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2">
                    <Edit className="h-4 w-4" />
                    Edit Profile
                </Button>
            </DialogTrigger>
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
