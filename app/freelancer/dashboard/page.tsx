"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  CheckCircle2,
  Clock,
  AlertCircle,
  TrendingUp,
  User,
  LogOut,
} from "lucide-react";
import Link from "next/link";
import { signout } from "@/lib/auth-actions";
import { createClient } from "@/utils/supabase/client";
import { TelemetryGrid } from "@/components/TelemetryGrid";

interface Application {
  id: number;
  user_id: string;
  project_id: number;
  created_at: string;
  project?: {
    id: number;
    title: string;
    budget: number;
    category: string;
    status: string;
  };
}

export default function FreelancerDashboardPage() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [userData, setUserData] = useState<{ name: string; email: string } | null>(
    null,
  );
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        const { data: userDataResult } = await supabase
          .from("users")
          .select("name, email")
          .eq("user_id", user.id)
          .single();

        if (userDataResult) setUserData(userDataResult);

        const { data: applicationsData } = await supabase
          .from("applications")
          .select(
            `
            *,
            project:projects (
              id,
              title,
              budget,
              category,
              status
            )
          `,
          )
          .eq("user_id", user.id)
          .order("created_at", { ascending: false });

        if (applicationsData) setApplications(applicationsData);
      }

      setIsLoading(false);
    };

    fetchData();
  }, []);

  const stats = {
    total: applications.length,
    shortlisted: 0,
    pending: applications.filter((a) => a.project?.status === "open").length,
    success:
      applications.length > 0
        ? `${Math.round(
            (applications.filter((a) => a.project?.status === "open").length /
              applications.length) *
              100,
          )}%`
        : "0%",
  };

  const statusStyle = (status: string) =>
    status === "open"
      ? "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 dark:text-emerald-400 font-mono"
      : "bg-slate-500/10 text-slate-600 border border-slate-500/20 dark:text-slate-400 font-mono";

  return (
    <div className="min-h-screen bg-background bg-grid-pattern bg-blueprint-glow">
      <header className="sticky top-0 z-50 backdrop-blur border-b border-border bg-card/70">
        <div className="mx-auto max-w-7xl px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-md bg-primary text-primary-foreground font-bold flex items-center justify-center">
              T
            </div>
            <span className="font-bold text-lg">TalentHub</span>
          </div>

          <div className="flex items-center gap-3">
            <Link href="/freelancer/projects">
              <Button variant="ghost">Projects</Button>
            </Link>
            <Link href="/freelancer/profile">
              <Button variant="ghost">Profile</Button>
            </Link>

            <div className="hidden sm:flex items-center gap-3 border-l border-border pl-4">
              <div className="h-9 w-9 rounded-full bg-primary/15 text-primary flex items-center justify-center font-semibold">
                {userData?.name.charAt(0).toUpperCase() ?? <User size={16} />}
              </div>
              <div className="text-sm leading-tight">
                <div className="font-medium">{userData?.name}</div>
                <div className="text-muted-foreground text-xs">
                  {userData?.email}
                </div>
              </div>
              <form action={signout}>
                <Button variant="ghost" size="icon">
                  <LogOut size={16} />
                </Button>
              </form>
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-10 space-y-10">
        <div>
          <h1 className="text-3xl font-bold font-sans">
            Freelancer <span className="font-serif italic text-primary/80">Dashboard</span>
          </h1>
          <p className="text-muted-foreground mt-1">
            Track your freelance journey
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: "Applications", value: stats.total, icon: Clock },
            { label: "Shortlisted", value: stats.shortlisted, icon: CheckCircle2 },
            { label: "Pending", value: stats.pending, icon: AlertCircle },
            { label: "Success Rate", value: stats.success, icon: TrendingUp },
          ].map((s, i) => (
            <Card
              key={i}
              className="p-6 relative overflow-hidden border border-border bg-card hover:border-primary/50 transition-colors card-telemetry">
              <div className="absolute top-2 right-3 font-mono text-[10px] text-muted-foreground">
                // 0{i + 1}
              </div>
              <div className="relative flex justify-between items-center">
                <div>
                  <p className="text-sm text-muted-foreground">{s.label}</p>
                  <p className="text-3xl font-bold mt-1 font-mono">{s.value}</p>
                </div>
                <s.icon className="h-8 w-8 text-primary opacity-70" />
              </div>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Link href="/freelancer/projects">
            <Card className="p-6 border border-border bg-card hover:border-primary/50 transition-colors cursor-pointer card-telemetry">
              <h3 className="font-semibold mb-1 font-sans">
                Browse <span className="font-serif italic text-primary/80">Projects</span>
              </h3>
              <p className="text-muted-foreground text-sm">
                Find work that matches your skills
              </p>
            </Card>
          </Link>
          <Link href="/freelancer/profile">
            <Card className="p-6 border border-border bg-card hover:border-primary/50 transition-colors cursor-pointer card-telemetry">
              <h3 className="font-semibold mb-1 font-sans">
                Edit <span className="font-serif italic text-primary/80">Profile</span>
              </h3>
              <p className="text-muted-foreground text-sm">
                Improve visibility and trust
              </p>
            </Card>
          </Link>
        </div>

        <div>
          <h2 className="text-xs font-mono uppercase tracking-wider text-muted-foreground mb-4 flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
            Active Submissions & Telemetry
          </h2>
          <TelemetryGrid />
        </div>

        <div>
          <h2 className="text-xl font-bold mb-4 font-sans">
            Recent <span className="font-serif italic text-primary/80">Applications</span>
          </h2>

          {isLoading ? (
            <Card className="p-8 text-center border border-border bg-card">Loading…</Card>
          ) : applications.length === 0 ? (
            <Card className="p-8 text-center space-y-3 border border-border bg-card">
              <p className="text-muted-foreground">No applications yet</p>
              <Link href="/freelancer/projects">
                <Button className="bg-primary text-primary-foreground hover:bg-primary/95">
                  Browse Projects
                </Button>
              </Link>
            </Card>
          ) : (
            <div className="space-y-3">
              {applications.slice(0, 5).map((app) => (
                <Card
                  key={app.id}
                  className="p-6 border border-border bg-card hover:border-primary/50 transition-colors card-telemetry">
                  <div className="flex flex-col sm:flex-row gap-4 sm:items-center sm:justify-between">
                    <div>
                      <div className="flex items-center gap-3 mb-1">
                        <h3 className="font-semibold font-sans">
                          {app.project?.title}
                        </h3>
                        <Badge className={statusStyle(app.project?.status ?? "")}>
                          {app.project?.status}
                        </Badge>
                      </div>
                      <div className="text-sm text-muted-foreground flex flex-wrap gap-4 font-mono">
                        <span>
                          Applied{" "}
                          {new Date(app.created_at).toLocaleDateString()}
                        </span>
                        <span className="text-primary font-semibold">
                          ${app.project?.budget.toLocaleString()}
                        </span>
                        <span className="capitalize">
                          {app.project?.category}
                        </span>
                      </div>
                    </div>
                    <Link href={`/freelancer/projects/${app.project_id}`}>
                      <Button variant="outline">View</Button>
                    </Link>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
