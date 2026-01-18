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
      ? "bg-emerald-500/20 text-emerald-700"
      : "bg-gray-500/20 text-gray-700";

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
      <header className="sticky top-0 z-50 backdrop-blur border-b bg-white/70">
        <div className="mx-auto max-w-7xl px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-bold flex items-center justify-center">
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

            <div className="hidden sm:flex items-center gap-3 border-l pl-4">
              <div className="h-9 w-9 rounded-full bg-indigo-500/15 text-indigo-700 flex items-center justify-center font-semibold">
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
          <h1 className="text-3xl font-bold">Dashboard</h1>
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
              className="p-6 relative overflow-hidden border-0 shadow-md">
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/10 to-purple-500/10" />
              <div className="relative flex justify-between items-center">
                <div>
                  <p className="text-sm text-muted-foreground">{s.label}</p>
                  <p className="text-3xl font-bold mt-1">{s.value}</p>
                </div>
                <s.icon className="h-8 w-8 text-indigo-500 opacity-70" />
              </div>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Link href="/freelancer/projects">
            <Card className="p-6 hover:shadow-xl transition border-indigo-500/30">
              <h3 className="font-semibold mb-1">Browse Projects</h3>
              <p className="text-sm text-muted-foreground">
                Find work that matches your skills
              </p>
            </Card>
          </Link>
          <Link href="/freelancer/profile">
            <Card className="p-6 hover:shadow-xl transition border-purple-500/30">
              <h3 className="font-semibold mb-1">Edit Profile</h3>
              <p className="text-sm text-muted-foreground">
                Improve visibility and trust
              </p>
            </Card>
          </Link>
        </div>

        <div>
          <h2 className="text-xl font-bold mb-4">Recent Applications</h2>

          {isLoading ? (
            <Card className="p-8 text-center">Loading…</Card>
          ) : applications.length === 0 ? (
            <Card className="p-8 text-center space-y-3">
              <p className="text-muted-foreground">No applications yet</p>
              <Link href="/freelancer/projects">
                <Button className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white">
                  Browse Projects
                </Button>
              </Link>
            </Card>
          ) : (
            <div className="space-y-3">
              {applications.slice(0, 5).map((app) => (
                <Card
                  key={app.id}
                  className="p-6 hover:shadow-lg transition border-l-4 border-indigo-500">
                  <div className="flex flex-col sm:flex-row gap-4 sm:items-center sm:justify-between">
                    <div>
                      <div className="flex items-center gap-3 mb-1">
                        <h3 className="font-semibold">
                          {app.project?.title}
                        </h3>
                        <Badge className={statusStyle(app.project?.status ?? "")}>
                          {app.project?.status}
                        </Badge>
                      </div>
                      <div className="text-sm text-muted-foreground flex flex-wrap gap-4">
                        <span>
                          Applied{" "}
                          {new Date(app.created_at).toLocaleDateString()}
                        </span>
                        <span>
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
