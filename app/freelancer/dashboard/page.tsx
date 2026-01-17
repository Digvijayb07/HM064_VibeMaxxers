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
import { mockApplications, mockProjects } from "@/lib/mock-data";
import { signout } from "@/lib/auth-actions";
import { createClient } from "@/utils/supabase/client";

interface DashboardStats {
  totalApplications: number;
  shortlisted: number;
  pending: number;
  successRate: string;
}

export default function FreelancerDashboardPage() {
  const [applications] = useState(mockApplications);
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
    totalApplications: applications.length,
    shortlisted: applications.filter((a) => a.status === "shortlisted").length,
    pending: applications.filter((a) => a.status === "submitted").length,
    successRate: "33%",
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      submitted: "bg-blue-50 text-blue-700 border-blue-200",
      shortlisted: "bg-green-50 text-green-700 border-green-200",
      rejected: "bg-red-50 text-red-700 border-red-200",
      awarded: "bg-purple-50 text-purple-700 border-purple-200",
    };
    return colors[status] || colors.submitted;
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "shortlisted":
        return <CheckCircle2 className="h-4 w-4 text-green-600" />;
      case "submitted":
        return <Clock className="h-4 w-4 text-blue-600" />;
      case "awarded":
        return <CheckCircle2 className="h-4 w-4 text-purple-600" />;
      default:
        return <AlertCircle className="h-4 w-4 text-red-600" />;
    }
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
              <Link href="/freelancer/projects">
                <Button
                  variant="ghost"
                  className="text-muted-foreground hover:text-foreground">
                  Browse Projects
                </Button>
              </Link>
              <Link href="/freelancer/profile">
                <Button
                  variant="ghost"
                  className="text-muted-foreground hover:text-foreground">
                  Profile
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
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-foreground">Your Dashboard</h2>
          <p className="mt-2 text-muted-foreground">
            Track your applications and opportunities
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">
                  Total Applications
                </p>
                <p className="text-3xl font-bold text-foreground mt-2">
                  {stats.totalApplications}
                </p>
              </div>
              <Clock className="h-8 w-8 text-primary opacity-50" />
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Shortlisted</p>
                <p className="text-3xl font-bold text-foreground mt-2">
                  {stats.shortlisted}
                </p>
              </div>
              <CheckCircle2 className="h-8 w-8 text-green-600 opacity-50" />
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Pending Review</p>
                <p className="text-3xl font-bold text-foreground mt-2">
                  {stats.pending}
                </p>
              </div>
              <AlertCircle className="h-8 w-8 text-orange-600 opacity-50" />
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Success Rate</p>
                <p className="text-3xl font-bold text-foreground mt-2">
                  {stats.successRate}
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-accent opacity-50" />
            </div>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="mb-8 grid grid-cols-1 md:grid-cols-2 gap-4">
          <Link href="/freelancer/projects">
            <Card className="p-6 hover:shadow-lg hover:border-primary transition-all cursor-pointer">
              <h3 className="font-semibold text-foreground mb-2">
                Browse More Projects
              </h3>
              <p className="text-sm text-muted-foreground">
                Discover new opportunities that match your skills
              </p>
            </Card>
          </Link>
          <Link href="/freelancer/profile">
            <Card className="p-6 hover:shadow-lg hover:border-accent transition-all cursor-pointer">
              <h3 className="font-semibold text-foreground mb-2">
                Update Your Profile
              </h3>
              <p className="text-sm text-muted-foreground">
                Improve your visibility with a complete profile
              </p>
            </Card>
          </Link>
        </div>

        {/* Recent Applications */}
        <div>
          <h3 className="text-xl font-bold text-foreground mb-4">
            Your Recent Applications
          </h3>
          <div className="space-y-3">
            {applications.map((app) => {
              const project = mockProjects.find((p) => p.id === app.projectId);
              return (
                <Card
                  key={app.id}
                  className="p-6 hover:shadow-md transition-all">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h4 className="font-semibold text-foreground">
                          {project?.title}
                        </h4>
                        <Badge
                          className={`${getStatusColor(app.status)} capitalize text-xs`}>
                          <span className="mr-1">
                            {getStatusIcon(app.status)}
                          </span>
                          {app.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-3">
                        {app.coverLetter}
                      </p>
                      <div className="flex gap-4 text-sm">
                        <span className="text-foreground">
                          Bid:{" "}
                          <span className="font-semibold">
                            ${app.bidAmount.toLocaleString()}
                          </span>
                        </span>
                        <span className="text-muted-foreground">
                          Applied: {app.submittedAt}
                        </span>
                      </div>
                    </div>
                    <Link href={`/freelancer/projects/${app.projectId}`}>
                      <Button variant="outline" size="sm">
                        View Project
                      </Button>
                    </Link>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
