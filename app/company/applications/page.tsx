"use client";

import { Suspense, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Search, Star, DollarSign, Loader2 } from "lucide-react";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { createClient } from "@/utils/supabase/client";
import {
  shortlistApplication,
  rejectApplication,
} from "@/lib/application-actions";
import { toast } from "sonner";

interface Application {
  id: number;
  user_id: string;
  project_id: number;
  status: string;
  created_at: string;
  submission_deadline?: string;
  project?: {
    id: number;
    title: string;
    budget: number;
    category: string;
  };
}

function ApplicationsContent() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [processingIds, setProcessingIds] = useState<Set<number>>(new Set());

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    const supabase = createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setIsLoading(false);
      return;
    }

    // Get all applications for projects owned by this company
    const { data, error } = await supabase
      .from("applications")
      .select(
        `
        *,
        project:projects!inner(id, title, budget, category, company_id)
      `
      )
      .eq("project.company_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching applications:", error);
      toast.error("Failed to load applications");
    } else if (data) {
      setApplications(data);
    }

    setIsLoading(false);
  };

  const handleShortlist = async (applicationId: number) => {
    setProcessingIds((prev) => new Set(prev).add(applicationId));

    // Set deadline to 7 days from now
    const deadline = new Date();
    deadline.setDate(deadline.getDate() + 7);

    const result = await shortlistApplication(
      applicationId,
      deadline.toISOString()
    );

    if (result.success) {
      toast.success("Application shortlisted successfully!");
      await fetchApplications();
    } else {
      toast.error(result.error || "Failed to shortlist application");
    }

    setProcessingIds((prev) => {
      const newSet = new Set(prev);
      newSet.delete(applicationId);
      return newSet;
    });
  };

  const handleReject = async (applicationId: number) => {
    setProcessingIds((prev) => new Set(prev).add(applicationId));

    const result = await rejectApplication(applicationId);

    if (result.success) {
      toast.success("Application rejected");
      await fetchApplications();
    } else {
      toast.error(result.error || "Failed to reject application");
    }

    setProcessingIds((prev) => {
      const newSet = new Set(prev);
      newSet.delete(applicationId);
      return newSet;
    });
  };

  const filteredApplications = applications.filter((app) => {
    const matchesStatus = !filterStatus || app.status === filterStatus;
    // For now, search is disabled until we add user metadata
    return matchesStatus;
  });

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      submitted: "bg-blue-50 text-blue-700 border-blue-200",
      shortlisted: "bg-green-50 text-green-700 border-green-200",
      rejected: "bg-red-50 text-red-700 border-red-200",
      awarded: "bg-purple-50 text-purple-700 border-purple-200",
    };
    return colors[status] || colors.submitted;
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
              <Link href="/company/dashboard">
                <Button
                  variant="ghost"
                  className="text-muted-foreground hover:text-foreground"
                >
                  Dashboard
                </Button>
              </Link>
              <Link href="/company/projects">
                <Button
                  variant="ghost"
                  className="text-muted-foreground hover:text-foreground"
                >
                  Projects
                </Button>
              </Link>
              <Link href="/company/submissions">
                <Button
                  variant="ghost"
                  className="text-muted-foreground hover:text-foreground"
                >
                  Submissions
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
          <div className="flex gap-2 flex-wrap">
            <Button
              variant={filterStatus === null ? "default" : "outline"}
              size="sm"
              onClick={() => setFilterStatus(null)}
              className={
                filterStatus === null ? "bg-primary hover:bg-primary/90" : ""
              }
            >
              All ({applications.length})
            </Button>
            {["submitted", "shortlisted", "awarded", "rejected"].map(
              (status) => (
                <Button
                  key={status}
                  variant={filterStatus === status ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFilterStatus(status)}
                  className={
                    filterStatus === status
                      ? "bg-primary hover:bg-primary/90"
                      : ""
                  }
                >
                  {status.charAt(0).toUpperCase() + status.slice(1)} (
                  {applications.filter((a) => a.status === status).length})
                </Button>
              )
            )}
          </div>
        </div>

        {/* Applications List */}
        {isLoading ? (
          <Card className="p-12 text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground">Loading applications...</p>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredApplications.map((app) => {
              const isProcessing = processingIds.has(app.id);

              return (
                <Card key={app.id} className="p-6 hover:shadow-md transition-all">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-bold text-foreground">
                        Application #{app.id}
                      </h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        {app.project?.title}
                      </p>
                    </div>
                    <Badge
                      className={`${getStatusColor(app.status)} capitalize`}
                    >
                      {app.status}
                    </Badge>
                  </div>

                  {/* Application Details */}
                  <div className="mb-4 grid grid-cols-2 md:grid-cols-3 gap-4 py-4 border-t border-b border-border">
                    <div>
                      <p className="text-xs text-muted-foreground">Applied</p>
                      <p className="font-semibold text-foreground">
                        {new Date(app.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Budget</p>
                      <p className="font-semibold text-foreground">
                        ${app.project?.budget.toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Category</p>
                      <p className="font-semibold text-foreground capitalize">
                        {app.project?.category}
                      </p>
                    </div>
                  </div>

                  {app.submission_deadline && (
                    <div className="mb-4 p-3 bg-muted rounded-lg">
                      <p className="text-sm text-muted-foreground">
                        Submission Deadline:{" "}
                        <span className="font-semibold text-foreground">
                          {new Date(app.submission_deadline).toLocaleDateString()}
                        </span>
                      </p>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex gap-2">
                    <Link href={`/company/projects/${app.project_id}`}>
                      <Button
                        variant="outline"
                        size="sm"
                        className="bg-transparent"
                      >
                        View Project
                      </Button>
                    </Link>
                    {app.status === "submitted" && (
                      <>
                        <Button
                          size="sm"
                          className="bg-green-600 hover:bg-green-700 flex-1"
                          onClick={() => handleShortlist(app.id)}
                          disabled={isProcessing}
                        >
                          {isProcessing ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            "Shortlist"
                          )}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="bg-transparent"
                          onClick={() => handleReject(app.id)}
                          disabled={isProcessing}
                        >
                          {isProcessing ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            "Reject"
                          )}
                        </Button>
                      </>
                    )}
                  </div>
                </Card>
              );
            })}
          </div>
        )}

        {!isLoading && filteredApplications.length === 0 && (
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
