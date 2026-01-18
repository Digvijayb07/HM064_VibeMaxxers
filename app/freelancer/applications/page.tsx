"use client";

import { Suspense, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CheckCircle2, Clock, Search } from "lucide-react";
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
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        const { data } = await supabase
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

        if (data) setApplications(data);
      }
      setIsLoading(false);
    };

    fetchApplications();
  }, []);

  const filterApplications = (status: string | null) =>
    applications.filter((app) => {
      const matchesStatus = !status || app.project?.status === status;
      const matchesSearch =
        searchQuery === "" ||
        app.project?.title
          .toLowerCase()
          .includes(searchQuery.toLowerCase());
      return matchesStatus && matchesSearch;
    });

  const StatusBadge = ({ status }: { status: string }) => {
    if (status === "open")
      return (
        <Badge className="bg-emerald-600 text-white flex items-center gap-1">
          <CheckCircle2 className="h-3 w-3" /> Open
        </Badge>
      );
    if (status === "closed")
      return <Badge className="bg-slate-600 text-white">Closed</Badge>;

    return (
      <Badge className="bg-blue-600 text-white flex items-center gap-1">
        <Clock className="h-3 w-3" /> Submitted
      </Badge>
    );
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* HEADER */}
      <header className="sticky top-0 z-50 bg-white border-b shadow-sm">
        <div className="mx-auto max-w-7xl px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-primary text-white flex items-center justify-center font-bold">
              T
            </div>
            <span className="text-xl font-bold">TalentHub</span>
          </div>
          <div className="flex gap-4">
            <Link href="/freelancer/dashboard">
              <Button variant="ghost">Dashboard</Button>
            </Link>
            <Link href="/freelancer/projects">
              <Button variant="ghost">Browse Projects</Button>
            </Link>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-5xl px-6 py-10">
        {/* TITLE */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold">My Applications</h1>
          <p className="text-muted-foreground mt-1">
            Track and manage your project applications
          </p>
        </div>

        {/* SEARCH */}
        <div className="relative mb-6">
          <Search className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
          <Input
            placeholder="Search by project title..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-white border border-slate-300"
          />
        </div>

        {isLoading ? (
          <Card className="p-12 text-center">Loading...</Card>
        ) : (
          <Tabs defaultValue="all">
            {/* TABS */}
            <TabsList className="grid grid-cols-3 bg-white shadow-md rounded-xl p-1 mb-6">
              <TabsTrigger
                value="all"
                className="data-[state=active]:bg-primary data-[state=active]:text-white rounded-lg"
              >
                All ({applications.length})
              </TabsTrigger>
              <TabsTrigger
                value="open"
                className="data-[state=active]:bg-primary data-[state=active]:text-white rounded-lg"
              >
                Open (
                {
                  applications.filter((a) => a.project?.status === "open")
                    .length
                }
                )
              </TabsTrigger>
              <TabsTrigger
                value="closed"
                className="data-[state=active]:bg-primary data-[state=active]:text-white rounded-lg"
              >
                Closed (
                {
                  applications.filter((a) => a.project?.status === "closed")
                    .length
                }
                )
              </TabsTrigger>
            </TabsList>

            {["all", "open", "closed"].map((tab) => (
              <TabsContent key={tab} value={tab} className="space-y-4">
                {filterApplications(tab === "all" ? null : tab).length ? (
                  filterApplications(tab === "all" ? null : tab).map((app) => (
                    <Card
                      key={app.id}
                      className="p-6 bg-white border-l-4 border-primary shadow-md hover:shadow-xl transition"
                    >
                      <div className="flex justify-between gap-4">
                        <div>
                          <h3 className="text-lg font-semibold">
                            {app.project?.title}
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            Company Project
                          </p>

                          <div className="flex gap-4 text-sm mt-3 text-muted-foreground">
                            <span>
                              Applied:{" "}
                              {new Date(
                                app.created_at
                              ).toLocaleDateString()}
                            </span>
                            <span>
                              Budget: $
                              {app.project?.budget.toLocaleString()}
                            </span>
                            <span className="capitalize">
                              {app.project?.category}
                            </span>
                          </div>
                        </div>

                        <div className="flex flex-col items-end gap-2">
                          {app.project && (
                            <StatusBadge status={app.project.status} />
                          )}
                          <Link
                            href={`/freelancer/projects/${app.project_id}`}
                          >
                            <Button className="bg-primary text-white hover:bg-primary/90">
                              View Project
                            </Button>
                          </Link>
                        </div>
                      </div>
                    </Card>
                  ))
                ) : (
                  <Card className="p-12 text-center text-muted-foreground">
                    No applications found
                  </Card>
                )}
              </TabsContent>
            ))}
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
