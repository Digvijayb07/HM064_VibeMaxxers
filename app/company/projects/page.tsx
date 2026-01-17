"use client";

import { Suspense, useEffect } from "react";
import { useState } from "react";
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

      if (user) {
        const { data: projectsData, error } = await supabase
          .from("projects")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false });

        if (error) {
          console.error("Error fetching projects:", error);
        } else if (projectsData) {
          setProjects(projectsData);
        }
      }

      setIsLoading(false);
    };

    fetchProjects();
  }, []);

  const filteredProjects = projects.filter((project) => {
    const matchesSearch =
      project.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = !selectedStatus || project.status === selectedStatus;
    return matchesSearch && matchesStatus;
  });

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
              <Link href="/company/dashboard">
                <Button
                  variant="ghost"
                  className="text-muted-foreground hover:text-foreground">
                  Dashboard
                </Button>
              </Link>
              <Link href="/company/applications">
                <Button
                  variant="ghost"
                  className="text-muted-foreground hover:text-foreground">
                  Applications
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Page Title */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold text-foreground">My Projects</h2>
            <p className="mt-2 text-muted-foreground">
              Manage all your posted projects
            </p>
          </div>
          <Link href="/company/create-project">
            <Button className="bg-primary hover:bg-primary/90 flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Post Project
            </Button>
          </Link>
        </div>

        {/* Search and Filters */}
        <div className="mb-8 space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
            <Input
              placeholder="Search projects..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          <div className="flex gap-2 flex-wrap">
            <Button
              variant={selectedStatus === null ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedStatus(null)}
              className={
                selectedStatus === null ? "bg-primary hover:bg-primary/90" : ""
              }>
              All ({projects.length})
            </Button>
            {["open", "in-progress", "completed"].map((status) => (
              <Button
                key={status}
                variant={selectedStatus === status ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedStatus(status)}
                className={
                  selectedStatus === status
                    ? "bg-primary hover:bg-primary/90"
                    : ""
                }>
                {status.charAt(0).toUpperCase() + status.slice(1)} (
                {projects.filter((p) => p.status === status).length})
              </Button>
            ))}
          </div>
        </div>

        {/* Projects Grid */}
        {isLoading ? (
          <Card className="p-8 text-center">
            <p className="text-muted-foreground">Loading projects...</p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {filteredProjects.map((project) => (
              <Link key={project.id} href={`/company/projects/${project.id}`}>
                <Card className="p-6 hover:shadow-lg hover:border-primary transition-all cursor-pointer">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-foreground">
                        {project.title}
                      </h3>
                      <p className="text-sm text-muted-foreground mt-1 line-clamp-1">
                        {project.description}
                      </p>
                    </div>
                    <Badge
                      className={`${getStatusColor(project.status)} capitalize ml-4`}>
                      {project.status}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 py-4 border-t border-b border-border">
                    <div>
                      <p className="text-xs text-muted-foreground">Budget</p>
                      <p className="font-bold text-foreground">
                        ${project.budget.toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">
                        Applications
                      </p>
                      <p className="font-bold text-foreground">
                        {project.applicantCount}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Duration</p>
                      <p className="font-bold text-foreground">
                        {project.duration}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Deadline</p>
                      <p className="font-bold text-foreground">
                        {project.deadline}
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="bg-transparent">
                      View Applications
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="bg-transparent">
                      Edit
                    </Button>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        )}

        {!isLoading && filteredProjects.length === 0 && (
          <Card className="p-12 text-center">
            <p className="text-muted-foreground mb-4">No projects found.</p>
            <Link href="/company/create-project">
              <Button className="bg-primary hover:bg-primary/90">
                Post Your First Project
              </Button>
            </Link>
          </Card>
        )}
      </div>
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
