"use client";

import { Suspense, useEffect } from "react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Search, Star, DollarSign, Loader2 } from "lucide-react";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { createClient } from "@/utils/supabase/client";

interface Application {
  id: number;
  user_id: string;
  project_id: number;
  created_at: string;
  users: {
    name: string;
    email: string;
    professional_title: string;
    hr_rate: number;
    skills: string[];
  };
  projects: {
    title: string;
    budget: number;
  };
}

function ApplicationsContent() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      const supabase = createClient();

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        console.error("No user found");
        setLoading(false);
        return;
      }

      // First get all projects owned by this company
      const { data: userProjects, error: projectsError } = await supabase
        .from("projects")
        .select("id")
        .eq("user_id", user.id);

      if (projectsError) {
        console.error("Error fetching projects:", projectsError);
        setLoading(false);
        return;
      }

      const projectIds = userProjects?.map((p) => p.id) || [];

      if (projectIds.length === 0) {
        setApplications([]);
        setLoading(false);
        return;
      }

      // Now get all applications for these projects with user and project details
      const { data, error } = await supabase
        .from("applications")
        .select(
          `
          id,
          user_id,
          project_id,
          created_at,
          users!inner (
            name,
            email,
            professional_title,
            hr_rate,
            skills
          ),
          projects!inner (
            title,
            budget
          )
        `,
        )
        .in("project_id", projectIds)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching applications:", error);
        setLoading(false);
        return;
      }

      setApplications(data || []);
      setLoading(false);
    } catch (error) {
      console.error("Error:", error);
      setLoading(false);
    }
  };

  const filteredApplications = applications.filter((app) => {
    const matchesSearch =
      searchQuery === "" ||
      app.users.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.projects.title.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

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
              <Link href="/company/dashboard">
                <Button
                  variant="ghost"
                  className="text-muted-foreground hover:text-foreground">
                  Dashboard
                </Button>
              </Link>
              <Link href="/company/projects">
                <Button
                  variant="ghost"
                  className="text-muted-foreground hover:text-foreground">
                  Projects
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Page Title */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-foreground">
            All Applications
          </h2>
          <p className="mt-2 text-muted-foreground">
            Review and manage all project applications
          </p>
        </div>

        {/* Search and Filters */}
        <div className="mb-6 space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
            <Input
              placeholder="Search by freelancer name or project..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          <div className="flex items-center gap-2">
            <Badge variant="secondary">
              Total Applications: {applications.length}
            </Badge>
          </div>
        </div>

        {/* Applications List */}
        <div className="space-y-4">
          {filteredApplications.map((app) => (
            <Card key={app.id} className="p-6 hover:shadow-md transition-all">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-lg font-bold text-foreground">
                    {app.users.name}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {app.users.professional_title || "Developer"}
                  </p>
                  <p className="text-sm text-accent mt-1">
                    Applied to: {app.projects.title}
                  </p>
                </div>
                <Badge variant="secondary" className="capitalize">
                  Applied
                </Badge>
              </div>

              {/* Freelancer Details */}
              <div className="mb-4 grid grid-cols-2 md:grid-cols-3 gap-4 py-4 border-t border-b border-border">
                <div>
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <DollarSign className="h-3 w-3" />
                    Hourly Rate
                  </p>
                  <p className="font-semibold text-foreground">
                    ${app.users.hr_rate || 0}/hr
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Applied On</p>
                  <p className="font-semibold text-foreground">
                    {formatDate(app.created_at)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">
                    Project Budget
                  </p>
                  <p className="font-semibold text-foreground">
                    ${app.projects.budget.toLocaleString()}
                  </p>
                </div>
              </div>

              {/* Skills */}
              {app.users.skills && app.users.skills.length > 0 && (
                <div className="mb-4">
                  <p className="text-xs text-muted-foreground mb-2">Skills</p>
                  <div className="flex flex-wrap gap-2">
                    {app.users.skills.slice(0, 5).map((skill: string) => (
                      <Badge key={skill} variant="outline" className="text-xs">
                        {skill}
                      </Badge>
                    ))}
                    {app.users.skills.length > 5 && (
                      <Badge variant="outline" className="text-xs">
                        +{app.users.skills.length - 5} more
                      </Badge>
                    )}
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-2">
                <Link href={`/company/projects/${app.project_id}`}>
                  <Button
                    variant="outline"
                    size="sm"
                    className="bg-transparent">
                    View Project
                  </Button>
                </Link>
                <Button size="sm" className="bg-primary hover:bg-primary/90">
                  Contact Freelancer
                </Button>
              </div>
            </Card>
          ))}
        </div>

        {filteredApplications.length === 0 && (
          <Card className="p-12 text-center">
            <p className="text-muted-foreground">No applications found.</p>
          </Card>
        )}
      </div>
    </div>
  );
}

export default function CompanyApplicationsPage() {
  return (
    <Suspense fallback={null}>
      <ApplicationsContent />
    </Suspense>
  );
}
