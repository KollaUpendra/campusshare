import Link from "next/link";
import { Button } from "@/components/ui/button";
import PublicGuard from "@/components/auth/PublicGuard";
import { ArrowRight, ShieldCheck, Zap, RefreshCw, Star, Users } from "lucide-react";

export default function LandingPage() {
  return (
    <PublicGuard>
      <div className="flex flex-col min-h-screen">
        {/* Hero Section */}
        <section className="flex flex-col items-center justify-center text-center px-4 pt-20 pb-16 space-y-8 max-w-4xl mx-auto">
          <div className="space-y-4">
            <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight">
              Your Campus. <br className="hidden md:block" />
              <span className="text-primary">Your Marketplace.</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
              The exclusive platform for students to rent, lend, and share items effortlessly.
              Save money, make money, and help your campus community.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
            <Button size="lg" className="w-full sm:w-auto gap-2" asChild>
              <Link href="/auth/signin">
                Get Started <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="w-full sm:w-auto" asChild>
              <Link href="/search">
                Browse Items
              </Link>
            </Button>
          </div>
        </section>

        {/* Features Section */}
        <section className="bg-muted/30 py-20 px-4">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-12 space-y-2">
              <h2 className="text-3xl font-bold tracking-tight">Why CampusShare?</h2>
              <p className="text-muted-foreground">Built specifically for the student lifestyle.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-background p-6 rounded-2xl shadow-sm border space-y-4 flex flex-col items-center text-center transition-all hover:shadow-md">
                <div className="h-12 w-12 bg-primary/10 rounded-full flex items-center justify-center text-primary">
                  <ShieldCheck className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-semibold">Campus Exclusive</h3>
                <p className="text-muted-foreground">Only verified students from your college can join. Enjoy a safe and trusted environment.</p>
              </div>
              <div className="bg-background p-6 rounded-2xl shadow-sm border space-y-4 flex flex-col items-center text-center transition-all hover:shadow-md">
                <div className="h-12 w-12 bg-primary/10 rounded-full flex items-center justify-center text-primary">
                  <RefreshCw className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-semibold">Easy Rentals</h3>
                <p className="text-muted-foreground">Need a calculator for a day? A bike for the weekend? Find it instantly from your peers.</p>
              </div>
              <div className="bg-background p-6 rounded-2xl shadow-sm border space-y-4 flex flex-col items-center text-center transition-all hover:shadow-md">
                <div className="h-12 w-12 bg-primary/10 rounded-full flex items-center justify-center text-primary">
                  <Zap className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-semibold">Earn Extra Cash</h3>
                <p className="text-muted-foreground">Don't let your unused items sit around. Rent them out and earn passive income easily.</p>
              </div>
            </div>
          </div>
        </section>

        {/* How it Works Section */}
        <section className="py-20 px-4">
          <div className="max-w-4xl mx-auto text-center space-y-12">
            <div className="space-y-2">
              <h2 className="text-3xl font-bold tracking-tight">How It Works</h2>
              <p className="text-muted-foreground">Three simple steps to start sharing.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
              {/* Connector line for desktop */}
              <div className="hidden md:block absolute top-6 left-[16%] right-[16%] h-0.5 bg-border z-0" />

              <div className="relative z-10 flex flex-col items-center space-y-4 bg-background px-4">
                <div className="h-12 w-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xl font-bold shadow-md">
                  1
                </div>
                <h3 className="text-lg font-semibold">Sign Up</h3>
                <p className="text-sm text-muted-foreground">Verify your student status using your college email address.</p>
              </div>
              <div className="relative z-10 flex flex-col items-center space-y-4 bg-background px-4">
                <div className="h-12 w-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xl font-bold shadow-md">
                  2
                </div>
                <h3 className="text-lg font-semibold">List or Search</h3>
                <p className="text-sm text-muted-foreground">Post items you want to lend, or search for items you need to borrow.</p>
              </div>
              <div className="relative z-10 flex flex-col items-center space-y-4 bg-background px-4">
                <div className="h-12 w-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xl font-bold shadow-md">
                  3
                </div>
                <h3 className="text-lg font-semibold">Meet & Exchange</h3>
                <p className="text-sm text-muted-foreground">Chat securely, agree on a campus meeting spot, and make the exchange.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <section className="bg-muted/30 py-20 px-4">
          <div className="max-w-5xl mx-auto space-y-12">
            <div className="text-center space-y-2">
              <h2 className="text-3xl font-bold tracking-tight">What Students Say</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-background p-6 rounded-2xl border flex flex-col space-y-4">
                <div className="flex gap-1 text-yellow-400">
                  <Star className="h-4 w-4 fill-current" />
                  <Star className="h-4 w-4 fill-current" />
                  <Star className="h-4 w-4 fill-current" />
                  <Star className="h-4 w-4 fill-current" />
                  <Star className="h-4 w-4 fill-current" />
                </div>
                <p className="text-muted-foreground italic flex-1">
                  "I needed a lab coat purely for one semester. Instead of buying a new one, I rented it here for a fraction of the cost. Lifesaver!"
                </p>
                <div className="flex items-center gap-3 pt-4 border-t">
                  <div className="h-10 w-10 bg-muted rounded-full flex items-center justify-center font-bold text-muted-foreground">
                    JD
                  </div>
                  <div>
                    <p className="text-sm font-semibold">Jane Doe</p>
                    <p className="text-xs text-muted-foreground">Sophomore</p>
                  </div>
                </div>
              </div>
              <div className="bg-background p-6 rounded-2xl border flex flex-col space-y-4">
                <div className="flex gap-1 text-yellow-400">
                  <Star className="h-4 w-4 fill-current" />
                  <Star className="h-4 w-4 fill-current" />
                  <Star className="h-4 w-4 fill-current" />
                  <Star className="h-4 w-4 fill-current" />
                  <Star className="h-4 w-4 fill-current" />
                </div>
                <p className="text-muted-foreground italic flex-1">
                  "I rent out my spare monitor on weekends. It basically pays for my weekly coffee budget. The process is so simple."
                </p>
                <div className="flex items-center gap-3 pt-4 border-t">
                  <div className="h-10 w-10 bg-muted rounded-full flex items-center justify-center font-bold text-muted-foreground">
                    MS
                  </div>
                  <div>
                    <p className="text-sm font-semibold">Mark Smith</p>
                    <p className="text-xs text-muted-foreground">Senior</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Pricing / CTA Section */}
        <section className="py-20 px-4 mb-10">
          <div className="max-w-3xl mx-auto bg-primary text-primary-foreground rounded-3xl p-8 md:p-12 text-center space-y-6 shadow-xl">
            <Users className="h-12 w-12 mx-auto opacity-90" />
            <h2 className="text-3xl font-bold">Ready to join your campus network?</h2>
            <p className="text-primary-foreground/80 text-lg">
              It's completely free to join and list items. Start sharing with your classmates today.
            </p>
            <div className="pt-4 flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" variant="secondary" className="w-full sm:w-auto text-primary" asChild>
                <Link href="/auth/signin">
                  Create Free Account
                </Link>
              </Button>
            </div>
          </div>
        </section>
      </div>
    </PublicGuard>
  );
}
