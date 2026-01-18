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
      ? "bg-emerald-500/20 text-emerald-700"
      : status === "in-progress"
      ? "bg-blue-500/20 text-blue-700"
      : "bg-gray-500/20 text-gray-700";

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
      <header className="sticky top-0 z-50 backdrop-blur bg-white/70 border-b">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-bold flex items-center justify-center">
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

            <div className="flex items-center gap-3 pl-4 border-l">
              <div className="h-9 w-9 rounded-full bg-indigo-500/15 text-indigo-700 flex items-center justify-center font-semibold">
                {userData?.name?.[0]?.toUpperCase() || <User size={18} />}
              </div>
              {userData && (
                <div className="hidden sm:block">
                  <p className="text-sm font-medium">{userData.name}</p>
                  <p className="text-xs text-muted-foreground">{userData.email}</p>
                </div>
              )}
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
            <h1 className="text-3xl font-bold">Company Dashboard</h1>
            <p className="text-muted-foreground mt-1">
              Manage projects and track applicants
            </p>
          </div>
          <Link href="/company/create-project">
            <Button className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white">
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
          ].map((s) => (
            <Card key={s.label} className="p-6 shadow-sm hover:shadow-md transition">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm text-muted-foreground">{s.label}</p>
                  <p className="text-3xl font-bold mt-2">{s.value}</p>
                </div>
                <s.icon className="h-8 w-8 text-indigo-500/60" />
              </div>
            </Card>
          ))}
        </div>

        <div>
          <h2 className="text-xl font-bold mb-4">Recent Projects</h2>

          {isLoading ? (
            <Card className="p-10 text-center text-muted-foreground">
              Loading projects…
            </Card>
          ) : projects.length === 0 ? (
            <Card className="p-10 text-center">
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
                  <Card className="p-6 hover:shadow-xl transition border-l-4 border-indigo-500 cursor-pointer">
                    <div className="flex justify-between gap-4">
                      <div>
                        <h3 className="font-semibold text-lg">{project.title}</h3>
                        <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                          {project.description}
                        </p>
                      </div>
                      <Badge className={statusColor(project.status)}>
                        {project.status}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t text-sm">
                      <div>
                        <p className="text-muted-foreground">Budget</p>
                        <p className="font-semibold">
                          ${project.budget.toLocaleString()}
                        </p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Applications</p>
                        <p className="font-semibold">{project.applicantCount}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Deadline</p>
                        <p className="font-semibold">{project.deadline}</p>
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
