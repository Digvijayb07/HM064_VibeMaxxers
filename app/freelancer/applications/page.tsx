"use client";

import { Suspense, useEffect } from "react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CheckCircle2, Clock, XCircle, Award, Search } from "lucide-react";
import Link from "next/link";
import { Input } from "@/components/ui/input";
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

function ApplicationsContent() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchApplications = async () => {
      const supabase = createClient();

      // Get current user
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        // Fetch user's applications with project details
        const { data, error } = await supabase
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

        if (error) {
          console.error("Error fetching applications:", error);
        } else if (data) {
          setApplications(data);
        }
      }

      setIsLoading(false);
    };

    fetchApplications();
  }, []);

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      submitted: "bg-blue-50 text-blue-700 border-blue-200",
      open: "bg-green-50 text-green-700 border-green-200",
      closed: "bg-gray-50 text-gray-700 border-gray-200",
    };
    return colors[status] || colors.submitted;
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "open":
        return <CheckCircle2 className="h-4 w-4" />;
      case "submitted":
        return <Clock className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const filterApplications = (status: string | null) => {
    return applications.filter((app) => {
      const matchesStatus = !status || app.project?.status === status;
      const matchesSearch =
        searchQuery === "" ||
        (app.project?.title.toLowerCase().includes(searchQuery.toLowerCase()) ??
          false);
      return matchesStatus && matchesSearch;
    });
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
              <Link href="/freelancer/dashboard">
                <Button
                  variant="ghost"
                  className="text-muted-foreground hover:text-foreground">
                  Dashboard
                </Button>
              </Link>
              <Link href="/freelancer/projects">
                <Button
                  variant="ghost"
                  className="text-muted-foreground hover:text-foreground">
                  Browse Projects
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
            My Applications
          </h2>
          <p className="mt-2 text-muted-foreground">
            Track the status of your project applications
          </p>
        </div>

        {/* Search */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
            <Input
              placeholder="Search by project name or company..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Tabs */}
        {isLoading ? (
          <Card className="p-8 text-center">
            <p className="text-muted-foreground">Loading applications...</p>
          </Card>
        ) : (
          <Tabs defaultValue="all" className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-6">
              <TabsTrigger value="all">All ({applications.length})</TabsTrigger>
              <TabsTrigger value="open">
                Open (
                {
                  applications.filter((a) => a.project?.status === "open")
                    .length
                }
                )
              </TabsTrigger>
              <TabsTrigger value="closed">
                Closed (
                {
                  applications.filter((a) => a.project?.status === "closed")
                    .length
                }
                )
              </TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="space-y-4">
              {filterApplications(null).length > 0 ? (
                filterApplications(null).map((app) => (
                  <Card
                    key={app.id}
                    className="p-6 hover:shadow-md transition-all">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h4 className="font-semibold text-foreground">
                            {app.project?.title || "Project"}
                          </h4>
                          <Badge
                            className={`${getStatusColor(app.project?.status || "submitted")} capitalize text-xs flex items-center gap-1`}>
                            {getStatusIcon(app.project?.status || "submitted")}
                            {app.project?.status || "Pending"}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">
                          Company Project
                        </p>
                        <div className="flex gap-4 text-sm flex-wrap mt-3">
                          <span className="text-muted-foreground">
                            Applied:{" "}
                            {new Date(app.created_at).toLocaleDateString()}
                          </span>
                          {app.project && (
                            <>
                              <span className="text-muted-foreground">
                                Budget: ${app.project.budget.toLocaleString()}
                              </span>
                              <span className="text-muted-foreground capitalize">
                                Category: {app.project.category}
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                      <div className="flex flex-col gap-2 ml-4">
                        <Link href={`/freelancer/projects/${app.project_id}`}>
                          <Button variant="outline" size="sm">
                            View Project
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </Card>
                ))
              ) : (
                <Card className="p-12 text-center">
                  <p className="text-muted-foreground">
                    No applications found.
                  </p>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="open" className="space-y-4">
              {filterApplications("open").length > 0 ? (
                filterApplications("open").map((app) => (
                  <Card
                    key={app.id}
                    className="p-6 hover:shadow-md transition-all">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h4 className="font-semibold text-foreground">
                            {app.project?.title || "Project"}
                          </h4>
                          <Badge
                            className={`${getStatusColor("open")} capitalize text-xs flex items-center gap-1`}>
                            {getStatusIcon("open")}
                            Open
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">
                          Company Project
                        </p>
                        <div className="flex gap-4 text-sm flex-wrap mt-3">
                          <span className="text-muted-foreground">
                            Applied:{" "}
                            {new Date(app.created_at).toLocaleDateString()}
                          </span>
                          {app.project && (
                            <>
                              <span className="text-muted-foreground">
                                Budget: ${app.project.budget.toLocaleString()}
                              </span>
                              <span className="text-muted-foreground capitalize">
                                Category: {app.project.category}
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                      <div className="flex flex-col gap-2 ml-4">
                        <Link href={`/freelancer/projects/${app.project_id}`}>
                          <Button variant="outline" size="sm">
                            View Project
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </Card>
                ))
              ) : (
                <Card className="p-12 text-center">
                  <p className="text-muted-foreground">
                    No open applications found.
                  </p>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="closed" className="space-y-4">
              {filterApplications("closed").length > 0 ? (
                filterApplications("closed").map((app) => (
                  <Card
                    key={app.id}
                    className="p-6 hover:shadow-md transition-all">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h4 className="font-semibold text-foreground">
                            {app.project?.title || "Project"}
                          </h4>
                          <Badge
                            className={`${getStatusColor("closed")} capitalize text-xs flex items-center gap-1`}>
                            Closed
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">
                          Company Project
                        </p>
                        <div className="flex gap-4 text-sm flex-wrap mt-3">
                          <span className="text-muted-foreground">
                            Applied:{" "}
                            {new Date(app.created_at).toLocaleDateString()}
                          </span>
                          {app.project && (
                            <>
                              <span className="text-muted-foreground">
                                Budget: ${app.project.budget.toLocaleString()}
                              </span>
                              <span className="text-muted-foreground capitalize">
                                Category: {app.project.category}
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                      <div className="flex flex-col gap-2 ml-4">
                        <Link href={`/freelancer/projects/${app.project_id}`}>
                          <Button variant="outline" size="sm">
                            View Project
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </Card>
                ))
              ) : (
                <Card className="p-12 text-center">
                  <p className="text-muted-foreground">
                    No closed applications found.
                  </p>
                </Card>
              )}
            </TabsContent>
          </Tabs>
        )}
      </div>
    </div>
  );
}

export default function FreelancerApplicationsPage() {
  return (
    <Suspense fallback={null}>
      <ApplicationsContent />
    </Suspense>
  );
}
