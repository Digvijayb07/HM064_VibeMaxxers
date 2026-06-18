import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TelemetryGrid } from "@/components/TelemetryGrid";
import {
  FolderKanban,
  ArrowRight,
  ShieldCheck,
  Activity,
  Cpu,
  Terminal,
  Code2,
  Briefcase
} from "lucide-react";

export default async function Home() {
  const supabase = await createClient();

  // Check if user is authenticated
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // If authenticated, check their role and redirect to appropriate dashboard
  if (user) {
    const { data: userData } = await supabase
      .from("users")
      .select("role")
      .eq("user_id", user.id)
      .single();

    if (userData?.role) {
      const redirectPath =
        userData.role === "company"
          ? "/company/dashboard"
          : "/freelancer/dashboard";
      redirect(redirectPath);
    } else {
      redirect("/auth/select-role");
    }
  }

  // If unauthenticated, render the public landing page
  return (
    <div className="min-h-screen bg-background bg-grid-pattern bg-blueprint-glow text-foreground">
      {/* HEADER */}
      <header className="sticky top-0 z-50 backdrop-blur bg-card/70 border-b border-border">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-md bg-primary text-primary-foreground font-bold flex items-center justify-center">
              T
            </div>
            <span className="font-bold text-lg">TalentHub</span>
          </div>

          <div className="flex gap-4">
            <Link href="/signin">
              <Button variant="ghost">Sign In</Button>
            </Link>
            <Link href="/signup">
              <Button className="bg-primary text-primary-foreground hover:bg-primary/95">
                Get Started
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* HERO SECTION */}
      <section className="max-w-7xl mx-auto px-6 py-16 lg:py-24 space-y-12">
        <div className="text-center max-w-3xl mx-auto space-y-6">
          <Badge className="bg-cyan-500/10 text-cyan-600 border border-cyan-500/20 dark:text-cyan-400 font-mono tracking-widest text-[11px] uppercase">
            // [ system status: operational ]
          </Badge>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight font-sans tracking-tight">
            Precision Talent. <br />
            <span className="font-serif italic text-primary/80">Telemetry Verification.</span>
          </h1>
          <p className="text-muted-foreground text-lg sm:text-xl leading-relaxed max-w-2xl mx-auto">
            A modern engineering marketplace connecting companies with developers through real-time code performance telemetry and verifiable logs.
          </p>
          <div className="flex justify-center gap-4 pt-4">
            <Link href="/signup">
              <Button className="h-11 px-6 bg-primary text-primary-foreground hover:bg-primary/95 font-medium">
                Hire Talent
              </Button>
            </Link>
            <Link href="/signin">
              <Button variant="outline" className="h-11 px-6 font-medium">
                Console Login
              </Button>
            </Link>
          </div>
        </div>

        {/* INTERACTIVE TELEMETRY HUD PREVIEW */}
        <div className="max-w-5xl mx-auto border border-border/80 bg-card rounded-xl p-3 card-telemetry">
          <div className="flex items-center justify-between pb-3 px-3 border-b border-border/50 font-mono text-xs text-muted-foreground">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-cyan-400 animate-ping" />
              <span>LIVE_DEMO: TELEMETRY_GRID_SYS</span>
            </div>
            <span>STABLE_RELEASES_V2.0</span>
          </div>
          <div className="pt-3">
            <TelemetryGrid />
          </div>
        </div>
      </section>

      {/* FEATURES HUD */}
      <section className="max-w-7xl mx-auto px-6 py-16 border-t border-border/50">
        <div className="text-center max-w-xl mx-auto mb-16 space-y-2">
          <h2 className="text-2xl font-bold font-sans">
            Engineered for <span className="font-serif italic text-primary/80">Performance</span>
          </h2>
          <p className="text-muted-foreground text-sm">
            Moving beyond subjective resumes. Verify code quality deterministically.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              title: "Verifiable Benchmarks",
              desc: "Execution times, CPU footprints, and memory consumption details are logged directly on the submission pipeline.",
              icon: Cpu
            },
            {
              title: "Audit Trails",
              desc: "ZK-Proofs compile verified code histories to guarantee origin safety without exposing proprietary logic.",
              icon: ShieldCheck
            },
            {
              title: "Escrow Integration",
              desc: "Payments are safely deposited and released automatically when submission performance thresholds are satisfied.",
              icon: Activity
            }
          ].map((f, idx) => (
            <Card key={idx} className="p-6 card-telemetry hover:border-primary/50 transition-colors">
              <div className="absolute top-2 right-3 font-mono text-[10px] text-muted-foreground">
                // 0{idx + 1}
              </div>
              <f.icon className="h-8 w-8 text-primary/80 mb-4" />
              <h3 className="text-lg font-bold mb-2 font-sans">{f.title}</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">{f.desc}</p>
            </Card>
          ))}
        </div>
      </section>

      {/* ROLE CHOICES */}
      <section className="max-w-7xl mx-auto px-6 py-16 border-t border-border/50">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Company Card */}
          <Card className="p-8 border border-border bg-card card-telemetry flex flex-col justify-between">
            <div className="space-y-6">
              <div className="flex justify-between items-start">
                <Briefcase className="h-10 w-10 text-primary" />
                <Badge className="bg-primary/10 text-primary border border-primary/20 font-mono">
                  Hire
                </Badge>
              </div>
              <div>
                <h3 className="text-2xl font-bold font-sans">For Companies</h3>
                <p className="text-muted-foreground text-sm mt-1">
                  Access top developers, post projects, and track submission quality through verifiable telemetry metrics.
                </p>
              </div>
              <ul className="space-y-3 font-mono text-xs text-muted-foreground">
                <li className="flex items-center gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                  Post unlimited projects with precise constraints
                </li>
                <li className="flex items-center gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                  Review applications backed by real performance metrics
                </li>
                <li className="flex items-center gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                  Escrow-backed contracts released upon audit completion
                </li>
              </ul>
            </div>
            <Link href="/signup" className="mt-8">
              <Button className="w-full bg-primary text-primary-foreground hover:bg-primary/95 font-medium">
                Get Started as Company
              </Button>
            </Link>
          </Card>

          {/* Freelancer Card */}
          <Card className="p-8 border border-border bg-card card-telemetry flex flex-col justify-between">
            <div className="space-y-6">
              <div className="flex justify-between items-start">
                <Code2 className="h-10 w-10 text-primary" />
                <Badge className="bg-primary/10 text-primary border border-primary/20 font-mono">
                  Build
                </Badge>
              </div>
              <div>
                <h3 className="text-2xl font-bold font-sans">For Developers</h3>
                <p className="text-muted-foreground text-sm mt-1">
                  Find premium contracts, showcase your execution logs, and earn payments based on audited milestone achievements.
                </p>
              </div>
              <ul className="space-y-3 font-mono text-xs text-muted-foreground">
                <li className="flex items-center gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                  Browse vetting opportunities matching your capabilities
                </li>
                <li className="flex items-center gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                  Submit proposals with execution telemetry verification
                </li>
                <li className="flex items-center gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                  Build a public, cryptographic code portfolio
                </li>
              </ul>
            </div>
            <Link href="/signup" className="mt-8">
              <Button className="w-full bg-primary text-primary-foreground hover:bg-primary/95 font-medium">
                Start Freelancing
              </Button>
            </Link>
          </Card>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-border bg-card/50 py-8">
        <div className="max-w-7xl mx-auto px-6 text-center text-xs text-muted-foreground space-y-2">
          <p>© 2026 TalentHub. Engineering telemetry and verification console.</p>
          <p className="font-mono text-[10px] text-muted-foreground/60 uppercase">
            System uptime: 99.99% // Active nodes: 1,482
          </p>
        </div>
      </footer>
    </div>
  );
}
