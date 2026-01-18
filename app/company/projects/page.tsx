"use client";

import { Suspense, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Plus, Search } from "lucide-react";
import Link from "next/link";
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
  applicantCount: number;
}

function ProjectsContent() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchProjects = async () => {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return;

      const { data: projectsData } = await supabase
        .from("projects")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (!projectsData) return;

      const projectIds = projectsData.map((p) => p.id);

      const { data: applications } = await supabase
        .from("applications")
        .select("project_id")
        .in("project_id", projectIds);

      const counts: Record<string, number> = {};
      applications?.forEach((a) => {
        counts[a.project_id] = (counts[a.project_id] || 0) + 1;
      });

      setProjects(
        projectsData.map((p) => ({
          ...p,
          applicantCount: counts[p.id] || 0,
        }))
      );

      setIsLoading(false);
    };

    fetchProjects();
  }, []);

  const filteredProjects = projects.filter((p) => {
    const matchesSearch =
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = !selectedStatus || p.status === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  const statusStyle = (status: string) => {
    if (status === "open")
      return "bg-emerald-500/20 text-emerald-700";
    if (status === "in-progress")
      return "bg-blue-500/20 text-blue-700";
    return "bg-gray-500/20 text-gray-700";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
      {/* HEADER */}
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
            <Link href="/company/applications">
              <Button variant="ghost">Applications</Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-10 space-y-8">
        {/* TITLE */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">My Projects</h1>
            <p className="text-muted-foreground mt-1">
              Manage and track all your posted projects
            </p>
          </div>
          <Link href="/company/create-project">
            <Button className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white">
              <Plus className="h-4 w-4 mr-2" />
              Post Project
            </Button>
          </Link>
        </div>

        {/* SEARCH + FILTERS */}
        <Card className="p-6 bg-white/80 backdrop-blur">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
              <Input
                className="pl-10"
                placeholder="Search projects..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <div className="flex gap-2 flex-wrap">
              <Button
                size="sm"
                className={!selectedStatus ? "bg-indigo-500 text-white" : ""}
                variant={!selectedStatus ? "default" : "outline"}
                onClick={() => setSelectedStatus(null)}
              >
                All ({projects.length})
              </Button>

              {["open", "in-progress", "completed"].map((status) => (
                <Button
                  key={status}
                  size="sm"
                  className={
                    selectedStatus === status
                      ? "bg-indigo-500 text-white"
                      : ""
                  }
                  variant={
                    selectedStatus === status ? "default" : "outline"
                  }
                  onClick={() => setSelectedStatus(status)}
                >
                  {status.replace("-", " ")}
                </Button>
              ))}
            </div>
          </div>
        </Card>

        {/* LIST */}
        {isLoading ? (
          <Card className="p-12 text-center text-muted-foreground">
            Loading projects…
          </Card>
        ) : filteredProjects.length === 0 ? (
          <Card className="p-12 text-center">
            <p className="text-muted-foreground mb-4">
              No projects found
            </p>
            <Link href="/company/create-project">
              <Button>Post Your First Project</Button>
            </Link>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredProjects.map((project) => (
              <Link
                key={project.id}
                href={`/company/projects/${project.id}`}
              >
                <Card className="p-6 hover:shadow-xl transition border-l-4 border-indigo-500 bg-white cursor-pointer">
                  <div className="flex justify-between gap-4">
                    <div>
                      <h3 className="font-semibold text-lg">
                        {project.title}
                      </h3>
                      <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                        {project.description}
                      </p>
                    </div>

                    <Badge className={statusStyle(project.status)}>
                      {project.status}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4 pt-4 border-t text-sm">
                    <div>
                      <p className="text-muted-foreground">Budget</p>
                      <p className="font-semibold">
                        ${project.budget.toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Applications</p>
                      <p className="font-semibold">
                        {project.applicantCount}
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Duration</p>
                      <p className="font-semibold">{project.duration}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Deadline</p>
                      <p className="font-semibold">{project.deadline}</p>
                    </div>
                  </div>

                  <div className="mt-4 flex gap-2">
                    <Button size="sm" variant="outline">
                      View Applications
                    </Button>
                    <Button size="sm" variant="outline">
                      Edit Project
                    </Button>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

export default function CompanyProjectsPage() {
  return (
    <Suspense fallback={null}>
      <ProjectsContent />
    </Suspense>
  );
}
