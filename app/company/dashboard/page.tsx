"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Briefcase,
  Plus,
  Users,
  TrendingUp,
  Clock,
  User,
  LogOut,
} from "lucide-react";
import Link from "next/link";
import { signout } from "@/lib/auth-actions";
import { createClient } from "@/utils/supabase/client";
import { TelemetryGrid } from "@/components/TelemetryGrid";

interface Project {
  id: string;
  title: string;
  description: string;
  category: string;
  budget: number;
  duration: string;
  deadline: string;
  status: string;
  exp_level: string;
  skills_req: string[];
  user_id: string;
}

interface DashboardStats {
  totalProjects: number;
  activeProjects: number;
  totalApplications: number;
  totalSpent: number;
}

interface ProjectWithApplications extends Project {
  applicantCount: number;
}

export default function CompanyDashboardPage() {
  const [projects, setProjects] = useState<ProjectWithApplications[]>([]);
  const [userData, setUserData] = useState<{ name: string; email: string } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats>({
    totalProjects: 0,
    activeProjects: 0,
    totalApplications: 0,
    totalSpent: 0,
  });

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

        const { data: projectsData } = await supabase
          .from("projects")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false });

        if (projectsData) {
          const projectIds = projectsData.map((p) => p.id);

          const { data: applicationsData } = await supabase
            .from("applications")
            .select("project_id")
            .in("project_id", projectIds);

          const counts: Record<number, number> = {};
          applicationsData?.forEach((a) => {
            counts[a.project_id] = (counts[a.project_id] || 0) + 1;
          });

          const enriched = projectsData.map((p) => ({
            ...p,
            applicantCount: counts[p.id] || 0,
          }));

          setProjects(enriched);

          setStats({
            totalProjects: projectsData.length,
            activeProjects: projectsData.filter((p) => p.status === "open").length,
            totalApplications: applicationsData?.length || 0,
            totalSpent: projectsData.reduce((sum, p) => sum + (p.budget || 0), 0),
          });
        }
      }

      setIsLoading(false);
    };

    fetchData();
  }, []);

  const statusColor = (status: string) =>
    status === "open"
      ? "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 dark:text-emerald-400 font-mono"
      : status === "in-progress"
      ? "bg-blue-500/10 text-blue-600 border border-blue-500/20 dark:text-blue-400 font-mono"
      : "bg-slate-500/10 text-slate-600 border border-slate-500/20 dark:text-slate-400 font-mono";

  return (
    <div className="min-h-screen bg-background bg-grid-pattern bg-blueprint-glow">
      <header className="sticky top-0 z-50 backdrop-blur bg-card/70 border-b border-border">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-md bg-primary text-primary-foreground font-bold flex items-center justify-center">
              T
            </div>
            <span className="font-bold text-lg">TalentHub</span>
          </div>

          <div className="flex items-center gap-4">
            <Link href="/company/projects">
              <Button variant="ghost">Projects</Button>
            </Link>
            <Link href="/company/applications">
              <Button variant="ghost">Applications</Button>
            </Link>

            <div className="flex items-center gap-3 pl-4 border-l border-border">
              <div className="h-9 w-9 rounded-full bg-primary/15 text-primary flex items-center justify-center font-semibold">
                {userData?.name?.[0]?.toUpperCase() || <User size={18} />}
              </div>
              {userData ? (
                <div className="hidden sm:block">
                  <p className="text-sm font-medium">{userData.name}</p>
                  <p className="text-xs text-muted-foreground">{userData.email}</p>
                </div>
              ) : null}
              <form action={signout}>
                <Button variant="ghost" size="sm">
                  <LogOut size={16} />
                </Button>
              </form>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-10 space-y-10">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold font-sans">
              Company <span className="font-serif italic text-primary/80">Dashboard</span>
            </h1>
            <p className="text-muted-foreground mt-1">
              Manage projects and track applicants
            </p>
          </div>
          <Link href="/company/create-project">
            <Button className="bg-primary text-primary-foreground hover:bg-primary/95">
              <Plus className="mr-2 h-4 w-4" />
              Post Project
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: "Total Projects", value: stats.totalProjects, icon: Briefcase },
            { label: "Active Projects", value: stats.activeProjects, icon: Clock },
            { label: "Applications", value: stats.totalApplications, icon: Users },
            { label: "Total Budget", value: `$${stats.totalSpent.toLocaleString()}`, icon: TrendingUp },
          ].map((s, idx) => (
            <Card key={s.label} className="p-6 border border-border bg-card hover:border-primary/50 transition-colors card-telemetry relative overflow-hidden">
              <div className="absolute top-2 right-3 font-mono text-[10px] text-muted-foreground">
                // 0{idx + 1}
              </div>
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm text-muted-foreground">{s.label}</p>
                  <p className="text-3xl font-bold mt-2 font-mono">{s.value}</p>
                </div>
                <s.icon className="h-8 w-8 text-primary/60" />
              </div>
            </Card>
          ))}
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
            Recent <span className="font-serif italic text-primary/80">Projects</span>
          </h2>

          {isLoading ? (
            <div className="space-y-3 animate-pulse" aria-busy="true" aria-label="Loading projects">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="p-6 rounded-[var(--radius-lg)] border border-border bg-card">
                  <div className="flex justify-between gap-4 mb-4">
                    <div className="space-y-2 flex-1">
                      <div className="h-5 w-2/3 rounded bg-muted" />
                      <div className="h-3 w-full rounded bg-muted" />
                      <div className="h-3 w-4/5 rounded bg-muted" />
                    </div>
                    <div className="h-6 w-16 rounded-full bg-muted shrink-0" />
                  </div>
                  <div className="grid grid-cols-3 gap-4 pt-4 border-t border-border">
                    {Array.from({ length: 3 }).map((_, j) => (
                      <div key={j} className="space-y-1">
                        <div className="h-3 w-12 rounded bg-muted" />
                        <div className="h-4 w-20 rounded bg-muted" />
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : projects.length === 0 ? (
            <Card className="p-10 text-center border border-border bg-card">
              <p className="text-muted-foreground mb-4">No projects yet</p>
              <Link href="/company/create-project">
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Create Your First Project
                </Button>
              </Link>
            </Card>
          ) : (
            <div className="space-y-4">
              {projects.map((project) => (
                <Link key={project.id} href={`/company/projects/${project.id}`}>
                  <Card className="p-6 hover:border-primary/50 transition-colors border border-border bg-card cursor-pointer card-telemetry">
                    <div className="flex justify-between gap-4">
                      <div>
                        <h3 className="font-semibold text-lg font-sans">{project.title}</h3>
                        <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                          {project.description}
                        </p>
                      </div>
                      <Badge className={statusColor(project.status)}>
                        {project.status}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t border-border text-sm font-mono">
                      <div>
                        <p className="text-xs text-muted-foreground uppercase tracking-wider">Budget</p>
                        <p className="font-semibold text-base text-primary">
                          ${project.budget.toLocaleString()}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground uppercase tracking-wider">Applications</p>
                        <p className="font-semibold text-base">{project.applicantCount}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground uppercase tracking-wider">Deadline</p>
                        <p className="font-semibold text-base">
                          {new Intl.DateTimeFormat('en-US', { year: 'numeric', month: 'short', day: 'numeric' }).format(new Date(project.deadline))}
                        </p>
                      </div>
                    </div>

                    <div className="mt-4 flex gap-2">
                      <Button variant="outline" size="sm">
                        View Applications
                      </Button>
                      <Button variant="outline" size="sm">
                        Edit Project
                      </Button>
                    </div>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
