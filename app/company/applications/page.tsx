"use client";

import { Suspense, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Search, DollarSign, Loader2 } from "lucide-react";
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
        setLoading(false);
        return;
      }

      const { data: userProjects } = await supabase
        .from("projects")
        .select("id")
        .eq("user_id", user.id);

      const projectIds = userProjects?.map((p) => p.id) || [];

      if (projectIds.length === 0) {
        setApplications([]);
        setLoading(false);
        return;
      }

      const { data } = await supabase
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

      setApplications(data || []);
      setLoading(false);
    } catch {
      setLoading(false);
    }
  };

  const filteredApplications = applications.filter((app) => {
    if (!searchQuery) return true;
    return (
      app.users.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.projects.title.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
      </div>
    );
  }

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
          <div className="flex gap-3">
            <Link href="/company/dashboard">
              <Button variant="ghost">Dashboard</Button>
            </Link>
            <Link href="/company/projects">
              <Button variant="ghost">Projects</Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-10 space-y-8">
        <div>
          <h1 className="text-3xl font-bold">All Applications</h1>
          <p className="text-muted-foreground mt-1">
            Review freelancers who applied to your projects
          </p>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="relative max-w-md w-full">
            <Search className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
            <Input
              className="pl-10"
              placeholder="Search by freelancer or project"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Badge className="bg-indigo-500/20 text-indigo-700">
            Total Applications: {applications.length}
          </Badge>
        </div>

        {filteredApplications.length === 0 ? (
          <Card className="p-12 text-center text-muted-foreground">
            No applications found
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredApplications.map((app) => (
              <Card
                key={app.id}
                className="p-6 hover:shadow-xl transition border-l-4 border-indigo-500">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className="text-lg font-bold">
                        {app.users.name}
                      </h3>
                      <Badge className="bg-blue-500/20 text-blue-700">
                        Applied
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {app.users.professional_title || "Freelancer"}
                    </p>
                    <p className="text-sm text-indigo-600 mt-1">
                      Applied to: {app.projects.title}
                    </p>

                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-4 text-sm">
                      <div>
                        <p className="text-muted-foreground flex items-center gap-1">
                          <DollarSign size={14} /> Hourly Rate
                        </p>
                        <p className="font-semibold">
                          ${app.users.hr_rate || 0}/hr
                        </p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Applied On</p>
                        <p className="font-semibold">
                          {formatDate(app.created_at)}
                        </p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">
                          Project Budget
                        </p>
                        <p className="font-semibold">
                          ${app.projects.budget.toLocaleString()}
                        </p>
                      </div>
                    </div>

                    {app.users.skills?.length > 0 && (
                      <div className="mt-4 flex flex-wrap gap-2">
                        {app.users.skills.slice(0, 5).map((skill) => (
                          <Badge
                            key={skill}
                            className="bg-indigo-500/15 text-indigo-700">
                            {skill}
                          </Badge>
                        ))}
                        {app.users.skills.length > 5 && (
                          <Badge className="bg-gray-500/15 text-gray-700">
                            +{app.users.skills.length - 5} more
                          </Badge>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <Link href={`/company/projects/${app.project_id}`}>
                      <Button variant="outline">View Project</Button>
                    </Link>
                    <Button className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white">
                      Contact
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </main>
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
