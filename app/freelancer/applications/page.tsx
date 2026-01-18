"use client";

import { Suspense, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CheckCircle2, Clock, XCircle, Award, Search, Loader2, Calendar } from "lucide-react";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";

interface Application {
  id: number;
  user_id: string;
  project_id: number;
  created_at: string;
  status: string;
  submission_deadline?: string;
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
  const router = useRouter();

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    const supabase = createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) {
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
        `
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
        return <CheckCircle2 className="h-4 w-4" />;
      case "awarded":
        return <Award className="h-4 w-4" />;
      case "rejected":
        return <XCircle className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const filterApplications = (status: string | null) => {
    return applications.filter((app) => {
      const matchesStatus = !status || app.status === status;
      const matchesSearch =
        searchQuery === "" ||
        (app.project?.title.toLowerCase().includes(searchQuery.toLowerCase()) ??
          false);
      return matchesStatus && matchesSearch;
    });
  };

  const getDeadlineStatus = (deadline?: string) => {
    if (!deadline) return null;

    const deadlineDate = new Date(deadline);
    const now = new Date();
    const daysLeft = Math.ceil((deadlineDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

    if (daysLeft < 0) {
      return { text: "Deadline passed", color: "text-red-600", urgent: true };
    } else if (daysLeft === 0) {
      return { text: "Due today", color: "text-orange-600", urgent: true };
    } else if (daysLeft <= 2) {
      return { text: `${daysLeft} days left`, color: "text-orange-600", urgent: true };
    } else {
      return { text: `${daysLeft} days left`, color: "text-muted-foreground", urgent: false };
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
              <Link href="/freelancer/dashboard">
                <Button
                  variant="ghost"
                  className="text-muted-foreground hover:text-foreground"
                >
                  Dashboard
                </Button>
              </Link>
              <Link href="/freelancer/projects">
                <Button
                  variant="ghost"
                  className="text-muted-foreground hover:text-foreground"
                >
                  Browse Projects
                </Button>
              </Link>
              <Link href="/freelancer/submissions">
                <Button
                  variant="ghost"
                  className="text-muted-foreground hover:text-foreground"
                >
                  My Submissions
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
              placeholder="Search by project name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Tabs */}
        {isLoading ? (
          <Card className="p-8 text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground">Loading applications...</p>
          </Card>
        ) : (
          <Tabs defaultValue="all" className="w-full">
            <TabsList className="grid w-full grid-cols-4 mb-6">
              <TabsTrigger value="all">All ({applications.length})</TabsTrigger>
              <TabsTrigger value="submitted">
                Submitted (
                {applications.filter((a) => a.status === "submitted").length})
              </TabsTrigger>
              <TabsTrigger value="shortlisted">
                Shortlisted (
                {applications.filter((a) => a.status === "shortlisted").length})
              </TabsTrigger>
              <TabsTrigger value="awarded">
                Awarded (
                {applications.filter((a) => a.status === "awarded").length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="space-y-4">
              {filterApplications(null).length > 0 ? (
                filterApplications(null).map((app) => {
                  const deadlineStatus = getDeadlineStatus(app.submission_deadline);

                  return (
                    <Card
                      key={app.id}
                      className="p-6 hover:shadow-md transition-all"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h4 className="font-semibold text-foreground">
                              {app.project?.title || "Project"}
                            </h4>
                            <Badge
                              className={`${getStatusColor(app.status)} capitalize text-xs flex items-center gap-1`}
                            >
                              {getStatusIcon(app.status)}
                              {app.status}
                            </Badge>
                          </div>
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

                          {app.status === "shortlisted" && deadlineStatus && (
                            <div className={`mt-3 flex items-center gap-2 text-sm ${deadlineStatus.urgent ? 'font-semibold' : ''}`}>
                              <Calendar className="h-4 w-4" />
                              <span className={deadlineStatus.color}>
                                Submission deadline: {deadlineStatus.text}
                              </span>
                            </div>
                          )}
                        </div>
                        <div className="flex flex-col gap-2 ml-4">
                          <Link href={`/freelancer/projects/${app.project_id}`}>
                            <Button variant="outline" size="sm">
                              View Project
                            </Button>
                          </Link>
                          {app.status === "shortlisted" && (
                            <Link href={`/freelancer/submissions/create?applicationId=${app.id}&projectId=${app.project_id}`}>
                              <Button size="sm" className="bg-green-600 hover:bg-green-700">
                                Submit Design
                              </Button>
                            </Link>
                          )}
                        </div>
                      </div>
                    </Card>
                  );
                })
              ) : (
                <Card className="p-12 text-center">
                  <p className="text-muted-foreground">
                    No applications found.
                  </p>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="submitted" className="space-y-4">
              {filterApplications("submitted").length > 0 ? (
                filterApplications("submitted").map((app) => (
                  <Card
                    key={app.id}
                    className="p-6 hover:shadow-md transition-all"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h4 className="font-semibold text-foreground">
                            {app.project?.title || "Project"}
                          </h4>
                          <Badge
                            className={`${getStatusColor("submitted")} capitalize text-xs flex items-center gap-1`}
                          >
                            {getStatusIcon("submitted")}
                            Submitted
                          </Badge>
                        </div>
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
                    No submitted applications found.
                  </p>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="shortlisted" className="space-y-4">
              {filterApplications("shortlisted").length > 0 ? (
                filterApplications("shortlisted").map((app) => {
                  const deadlineStatus = getDeadlineStatus(app.submission_deadline);

                  return (
                    <Card
                      key={app.id}
                      className="p-6 hover:shadow-md transition-all border-green-200"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h4 className="font-semibold text-foreground">
                              {app.project?.title || "Project"}
                            </h4>
                            <Badge
                              className={`${getStatusColor("shortlisted")} capitalize text-xs flex items-center gap-1`}
                            >
                              {getStatusIcon("shortlisted")}
                              Shortlisted
                            </Badge>
                          </div>
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

                          {deadlineStatus && (
                            <div className={`mt-3 flex items-center gap-2 text-sm ${deadlineStatus.urgent ? 'font-semibold' : ''}`}>
                              <Calendar className="h-4 w-4" />
                              <span className={deadlineStatus.color}>
                                Submission deadline: {deadlineStatus.text}
                              </span>
                            </div>
                          )}
                        </div>
                        <div className="flex flex-col gap-2 ml-4">
                          <Link href={`/freelancer/projects/${app.project_id}`}>
                            <Button variant="outline" size="sm">
                              View Project
                            </Button>
                          </Link>
                          <Link href={`/freelancer/submissions/create?applicationId=${app.id}&projectId=${app.project_id}`}>
                            <Button size="sm" className="bg-green-600 hover:bg-green-700">
                              Submit Design
                            </Button>
                          </Link>
                        </div>
                      </div>
                    </Card>
                  );
                })
              ) : (
                <Card className="p-12 text-center">
                  <p className="text-muted-foreground">
                    No shortlisted applications found.
                  </p>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="awarded" className="space-y-4">
              {filterApplications("awarded").length > 0 ? (
                filterApplications("awarded").map((app) => (
                  <Card
                    key={app.id}
                    className="p-6 hover:shadow-md transition-all border-purple-200"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h4 className="font-semibold text-foreground">
                            {app.project?.title || "Project"}
                          </h4>
                          <Badge
                            className={`${getStatusColor("awarded")} capitalize text-xs flex items-center gap-1`}
                          >
                            {getStatusIcon("awarded")}
                            Awarded
                          </Badge>
                        </div>
                        <p className="text-sm text-green-600 font-semibold mt-2">
                          🎉 Congratulations! You won this project!
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
                    No awarded applications found.
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
