import SignInButton from "./SignInButton";
import PublicGuard from "@/components/auth/PublicGuard";

export default function SignInPage() {
    return (
        <PublicGuard>
            <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
                <div className="max-w-md w-full p-8 bg-white rounded-xl shadow-lg space-y-8 text-center border border-gray-100">
                    <div className="flex flex-col items-center gap-4">
                        <div className="h-16 w-16 bg-primary/10 rounded-full flex items-center justify-center">
                            <span className="text-2xl font-bold text-primary">CS</span>
                        </div>

                        <h1 className="text-3xl font-bold tracking-tight text-gray-900">Welcome Back</h1>
                        <p className="text-muted-foreground">
                            Sign in to continue to CampusShare
                        </p>
                    </div>

                    <div className="space-y-4 pt-4">
                        <SignInButton />
                    </div>

                    <p className="text-xs text-muted-foreground mt-8">
                        By signing in, you agree to our Terms of Service and Privacy Policy.
                    </p>
                </div>
            </div>
        </PublicGuard>
    )
}
