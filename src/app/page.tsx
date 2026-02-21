import Link from "next/link";
import { Button } from "@/components/ui/button";
import PublicGuard from "@/components/auth/PublicGuard";
import { ArrowRight, ShieldCheck, Zap, RefreshCw, Star, Users } from "lucide-react";

export default function LandingPage() {
  return (
    <PublicGuard>
      <div className="flex flex-col min-h-screen">
        {/* Hero Section */}
        <section className="relative overflow-hidden pt-24 pb-20 lg:pt-32 lg:pb-28 px-4">
          {/* Decorative Background Elements */}
          <div className="absolute top-0 right-0 -mr-20 -mt-20 w-[40rem] h-[40rem] bg-primary/10 rounded-full blur-3xl -z-10" />
          <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-[30rem] h-[30rem] bg-accent/10 rounded-full blur-3xl -z-10" />

          <div className="max-w-6xl mx-auto flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
            {/* Left Content */}
            <div className="flex-1 space-y-8 text-center lg:text-left z-10">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-semibold tracking-wide border border-primary/20">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                </span>
                Now live on your campus
              </div>
              <h1 className="text-5xl lg:text-7xl font-extrabold tracking-tight text-foreground leading-[1.1]">
                Your Campus. <br className="hidden lg:block" />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-primary/70">
                  Your Marketplace.
                </span>
              </h1>
              <p className="text-lg lg:text-xl text-muted-foreground max-w-2xl mx-auto lg:mx-0 leading-relaxed">
                The exclusive platform for students to rent, lend, and share items effortlessly.
                Save money, make money, and join thousands of students reshaping campus commerce.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto justify-center lg:justify-start pt-4">
                <Button size="lg" className="h-14 px-8 text-base rounded-2xl shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 transition-all hover:-translate-y-1 gap-2 bg-primary text-primary-foreground" asChild>
                  <Link href="/auth/signin">
                    Start Sharing <ArrowRight className="h-5 w-5" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" className="h-14 px-8 text-base rounded-2xl font-semibold border-2 hover:bg-muted transition-all" asChild>
                  <Link href="/search">
                    Explore Items
                  </Link>
                </Button>
              </div>
              <div className="pt-8 flex items-center justify-center lg:justify-start gap-6 text-sm text-muted-foreground font-medium">
                <div className="flex -space-x-3">
                  <div className="h-10 w-10 rounded-full border-2 border-background bg-muted flex items-center justify-center text-xs overflow-hidden">
                    <img src="https://api.dicebear.com/7.x/notionists/svg?seed=Felix" alt="User" />
                  </div>
                  <div className="h-10 w-10 rounded-full border-2 border-background bg-muted flex items-center justify-center text-xs overflow-hidden">
                    <img src="https://api.dicebear.com/7.x/notionists/svg?seed=Aneka" alt="User" />
                  </div>
                  <div className="h-10 w-10 rounded-full border-2 border-background bg-muted flex items-center justify-center text-xs overflow-hidden">
                    <img src="https://api.dicebear.com/7.x/notionists/svg?seed=Nala" alt="User" />
                  </div>
                </div>
                <div>
                  <p className="text-foreground font-bold">1,000+ students</p>
                  <p>already joined</p>
                </div>
              </div>
            </div>

            {/* Right Visual (Abstract Representation) */}
            <div className="flex-1 relative w-full max-w-lg lg:max-w-none hidden md:block">
              <div className="relative w-full aspect-square">
                {/* Floating Cards Simulation */}
                <div className="absolute top-[10%] left-[5%] w-[60%] bg-card rounded-3xl p-5 shadow-[0_20px_50px_rgba(0,0,0,0.1)] border animate-in fade-in slide-in-from-bottom-10 duration-1000 z-20">
                  <div className="w-full aspect-video bg-muted rounded-xl mb-4 overflow-hidden">
                    <div className="w-full h-full bg-gradient-to-tr from-indigo-100 to-blue-50" />
                  </div>
                  <div className="space-y-2">
                    <div className="h-5 w-3/4 bg-muted rounded animate-pulse" />
                    <div className="h-4 w-1/4 bg-primary/20 rounded animate-pulse" />
                  </div>
                </div>
                <div className="absolute top-[35%] right-[0%] w-[55%] bg-card rounded-3xl p-5 shadow-[0_20px_50px_rgba(0,0,0,0.1)] border animate-in fade-in slide-in-from-bottom-16 duration-1000 delay-300 z-10 translate-y-10">
                  <div className="w-full aspect-square bg-muted rounded-xl mb-4 overflow-hidden">
                    <div className="w-full h-full bg-gradient-to-br from-amber-100 to-orange-50" />
                  </div>
                  <div className="space-y-2">
                    <div className="h-5 w-full bg-muted rounded animate-pulse" />
                    <div className="h-4 w-1/3 bg-accent/40 rounded animate-pulse" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-24 px-4 bg-white relative">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16 space-y-4 max-w-2xl mx-auto">
              <h2 className="text-4xl font-bold tracking-tight text-foreground">Smarter Student Living</h2>
              <p className="text-lg text-muted-foreground">Built specifically for the dynamic lifestyle of college students. Rent what you need, earn from what you own.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-background p-8 rounded-[2rem] border-0 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all duration-300 group hover:-translate-y-2">
                <div className="h-16 w-16 bg-primary/10 rounded-2xl flex items-center justify-center text-primary mb-6 group-hover:bg-primary group-hover:text-primary-foreground transition-colors duration-300 shadow-sm">
                  <ShieldCheck className="h-8 w-8" />
                </div>
                <h3 className="text-2xl font-bold mb-3 text-foreground">Verified & Safe</h3>
                <p className="text-muted-foreground leading-relaxed">Exclusive to your campus. Every user is verified with a student email, ensuring a trusted environment for all exchanges.</p>
              </div>
              <div className="bg-background p-8 rounded-[2rem] border-0 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all duration-300 group hover:-translate-y-2">
                <div className="h-16 w-16 bg-accent/10 rounded-2xl flex items-center justify-center text-accent mb-6 group-hover:bg-accent group-hover:text-accent-foreground transition-colors duration-300 shadow-sm">
                  <RefreshCw className="h-8 w-8" />
                </div>
                <h3 className="text-2xl font-bold mb-3 text-foreground">Instant Rentals</h3>
                <p className="text-muted-foreground leading-relaxed">From graphing calculators to weekend camping gear, find exactly what you need in seconds from peers right down the hall.</p>
              </div>
              <div className="bg-background p-8 rounded-[2rem] border-0 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all duration-300 group hover:-translate-y-2">
                <div className="h-16 w-16 bg-green-500/10 rounded-2xl flex items-center justify-center text-green-600 mb-6 group-hover:bg-green-500 group-hover:text-white transition-colors duration-300 shadow-sm">
                  <Zap className="h-8 w-8" />
                </div>
                <h3 className="text-2xl font-bold mb-3 text-foreground">Passive Income</h3>
                <p className="text-muted-foreground leading-relaxed">Turn your idle possessions into cash. List items easily, set your price, and start earning money while you study.</p>
              </div>
            </div>
          </div>
        </section>

        {/* How it Works Section */}
        <section className="py-24 px-4 bg-muted/30">
          <div className="max-w-6xl mx-auto space-y-16">
            <div className="text-center space-y-4">
              <h2 className="text-4xl font-bold tracking-tight text-foreground">Share seamlessly in 3 steps</h2>
              <p className="text-lg text-muted-foreground">Minimal friction, maximum convenience.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative">
              {/* Abstract Connector line for desktop */}
              <div className="hidden md:block absolute top-10 left-[20%] right-[20%] h-1 bg-gradient-to-r from-transparent via-primary/20 to-transparent z-0 rounded-full" />

              {[
                { step: "1", title: "Sign Up", desc: "Use your college email to instantly verify your student identity.", delay: "0" },
                { step: "2", title: "Browse or List", desc: "Find what you need or snap a photo to list your own items.", delay: "150" },
                { step: "3", title: "Meet & Swap", desc: "Chat securely and arrange a convenient on-campus meeting point.", delay: "300" },
              ].map((item, i) => (
                <div key={i} className="relative z-10 flex flex-col items-center text-center space-y-6">
                  <div className="h-20 w-20 rounded-3xl bg-card border shadow-xl flex items-center justify-center text-3xl font-black text-primary rotate-3 hover:rotate-0 transition-all duration-300">
                    {item.step}
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold mb-3">{item.title}</h3>
                    <p className="text-muted-foreground leading-relaxed max-w-xs">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Minimal Pricing / CTA Section */}
        <section className="py-24 px-4 bg-white relative overflow-hidden">
          <div className="absolute inset-0 bg-primary/5 pattern-dots pattern-primary pattern-bg-transparent pattern-size-4 pattern-opacity-10" />
          <div className="max-w-4xl mx-auto bg-primary text-primary-foreground rounded-[2.5rem] p-10 md:p-16 text-center space-y-8 shadow-2xl relative z-10 overflow-hidden">
            {/* Glossy highlight effect */}
            <div className="absolute top-0 left-0 right-0 h-1/2 bg-gradient-to-b from-white/10 to-transparent" />

            <Users className="h-16 w-16 mx-auto opacity-90 drop-shadow-md" />
            <div className="space-y-4">
              <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight">Ready to join the network?</h2>
              <p className="text-primary-foreground/90 text-xl font-medium max-w-2xl mx-auto">
                No hidden fees. Free to join and list. Start sharing with your classmates today.
              </p>
            </div>
            <div className="pt-6 flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" variant="secondary" className="h-14 px-8 text-base rounded-2xl w-full sm:w-auto text-primary font-bold shadow-lg hover:shadow-xl transition-all hover:scale-105" asChild>
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
