import SignInButton from "./SignInButton";
import PublicGuard from "@/components/auth/PublicGuard";
import { Sparkles, ShieldCheck, Zap } from "lucide-react";

export default function SignInPage() {
    return (
        <PublicGuard>
            <div className="min-h-[100dvh] flex items-center justify-center bg-background px-4 relative overflow-hidden -mt-16 sm:-mt-20">
                {/* Background Decor */}
                <div className="absolute top-0 left-0 w-full h-96 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent -z-10" />
                <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-accent/10 blur-3xl rounded-full -z-10" />

                <div className="max-w-md w-full p-8 sm:p-10 bg-card/80 backdrop-blur-xl rounded-[2.5rem] shadow-[0_8px_30px_rgb(0,0,0,0.08)] space-y-8 text-center border ring-1 ring-border/50 relative my-16">
                    <div className="absolute -top-12 left-1/2 -translate-x-1/2">
                        <div className="h-24 w-24 bg-card rounded-3xl shadow-xl flex items-center justify-center border-4 border-background rotate-12 hover:rotate-0 transition-transform duration-500">
                            <div className="h-14 w-14 bg-primary/10 rounded-2xl flex items-center justify-center text-primary">
                                <Sparkles className="h-8 w-8" />
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col items-center gap-3 pt-10">
                        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">Welcome Back</h1>
                        <p className="text-muted-foreground font-medium">
                            Join your campus marketplace
                        </p>
                    </div>

                    <div className="space-y-4 pt-4">
                        <SignInButton />
                    </div>

                    <div className="grid grid-cols-2 gap-4 pt-8 border-t border-border/50 mt-8">
                        <div className="flex flex-col items-center gap-2 text-center">
                            <div className="h-10 w-10 rounded-full bg-green-500/10 flex items-center justify-center text-green-600">
                                <ShieldCheck className="h-5 w-5" />
                            </div>
                            <span className="text-xs text-muted-foreground font-medium">Campus Verified</span>
                        </div>
                        <div className="flex flex-col items-center gap-2 text-center">
                            <div className="h-10 w-10 rounded-full bg-accent/10 flex items-center justify-center text-accent">
                                <Zap className="h-5 w-5" />
                            </div>
                            <span className="text-xs text-muted-foreground font-medium">Instant Access</span>
                        </div>
                    </div>

                    <p className="text-[11px] text-muted-foreground/80 pt-4">
                        By signing in, you agree to our <a href="/terms" className="underline hover:text-primary">Terms</a> and <a href="/privacy" className="underline hover:text-primary">Privacy Policy</a>.
                    </p>
                </div>
            </div>
        </PublicGuard>
    )
}
