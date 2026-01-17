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
import { mockProjects } from "@/lib/mock-data";
import { signout } from "@/lib/auth-actions";
import { createClient } from "@/utils/supabase/client";

interface DashboardStats {
  totalProjects: number;
  activeProjects: number;
  totalApplications: number;
  totalSpent: number;
}

export default function CompanyDashboardPage() {
  const [projects] = useState(
    mockProjects.filter((p) => ["comp-001", "comp-002"].includes(p.companyId)),
  );
  const [userData, setUserData] = useState<{
    name: string;
    email: string;
  } | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        const { data } = await supabase
          .from("users")
          .select("name, email")
          .eq("user_id", user.id)
          .single();

        if (data) {
          setUserData(data);
        }
      }
    };

    fetchUser();
  }, []);

  const stats: DashboardStats = {
    totalProjects: projects.length,
    activeProjects: projects.filter((p) => p.status === "open").length,
    totalApplications: projects.reduce((sum, p) => sum + p.applicantCount, 0),
    totalSpent: projects.reduce((sum, p) => sum + p.budget, 0),
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      open: "bg-green-50 text-green-700 border-green-200",
      "in-progress": "bg-blue-50 text-blue-700 border-blue-200",
      completed: "bg-gray-50 text-gray-700 border-gray-200",
    };
    return colors[status] || colors.open;
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card sticky top-0 z-50">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold">
                T
              </div>
              <h1 className="text-xl font-bold text-foreground">TalentHub</h1>
            </div>
            <div className="flex items-center gap-4">
              <Link href="/company/projects">
                <Button
                  variant="ghost"
                  className="text-muted-foreground hover:text-foreground">
                  Projects
                </Button>
              </Link>
              <Link href="/company/applications">
                <Button
                  variant="ghost"
                  className="text-muted-foreground hover:text-foreground">
                  Applications
                </Button>
              </Link>
              <div className="flex items-center gap-3 ml-2 pl-4 border-l border-border">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-primary font-semibold text-sm">
                  {userData ? (
                    userData.name.charAt(0).toUpperCase()
                  ) : (
                    <User className="h-5 w-5" />
                  )}
                </div>
                {userData && (
                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-foreground">
                      {userData.name}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {userData.email}
                    </span>
                  </div>
                )}
                <form action={signout}>
                  <Button
                    type="submit"
                    variant="ghost"
                    size="sm"
                    className="text-muted-foreground hover:text-foreground flex items-center gap-2">
                    <LogOut className="h-4 w-4" />
                    Logout
                  </Button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Page Title */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold text-foreground">
              Company Dashboard
            </h2>
            <p className="mt-2 text-muted-foreground">
              Manage your projects and find talented professionals
            </p>
          </div>
          <Link href="/company/create-project">
            <Button className="bg-primary hover:bg-primary/90 flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Post Project
            </Button>
          </Link>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Projects</p>
                <p className="text-3xl font-bold text-foreground mt-2">
                  {stats.totalProjects}
                </p>
              </div>
              <Briefcase className="h-8 w-8 text-primary opacity-50" />
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active Now</p>
                <p className="text-3xl font-bold text-foreground mt-2">
                  {stats.activeProjects}
                </p>
              </div>
              <Clock className="h-8 w-8 text-accent opacity-50" />
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Applications</p>
                <p className="text-3xl font-bold text-foreground mt-2">
                  {stats.totalApplications}
                </p>
              </div>
              <Users className="h-8 w-8 text-primary opacity-50" />
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">
                  Total Budget Used
                </p>
                <p className="text-3xl font-bold text-foreground mt-2">
                  ${stats.totalSpent.toLocaleString()}
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-accent opacity-50" />
            </div>
          </Card>
        </div>

        {/* Recent Projects */}
        <div>
          <h3 className="text-xl font-bold text-foreground mb-4">
            Recent Projects
          </h3>
          <div className="grid grid-cols-1 gap-4">
            {projects.map((project) => (
              <Link key={project.id} href={`/company/projects/${project.id}`}>
                <Card className="p-6 hover:shadow-lg hover:border-primary transition-all cursor-pointer">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h4 className="font-semibold text-foreground">
                        {project.title}
                      </h4>
                      <p className="text-sm text-muted-foreground mt-1">
                        {project.description.substring(0, 100)}...
                      </p>
                    </div>
                    <Badge
                      className={`${getStatusColor(project.status)} capitalize`}>
                      {project.status}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-3 gap-4 py-4 border-t border-border">
                    <div>
                      <p className="text-xs text-muted-foreground">Budget</p>
                      <p className="text-sm font-bold text-foreground">
                        ${project.budget.toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">
                        Applications
                      </p>
                      <p className="text-sm font-bold text-foreground">
                        {project.applicantCount}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Deadline</p>
                      <p className="text-sm font-bold text-foreground">
                        {project.deadline}
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
        </div>
      </div>
    </div>
  );
}
