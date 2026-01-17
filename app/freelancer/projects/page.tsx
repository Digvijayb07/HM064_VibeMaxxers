"use client";

import { useState, useMemo, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Search,
  Filter,
  Clock,
  DollarSign,
  Users,
  ChevronRight,
} from "lucide-react";
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

export default function FreelancerProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedLevel, setSelectedLevel] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchProjects = async () => {
      const supabase = createClient();

      // Fetch all open projects from any company
      const { data: projectsData, error } = await supabase
        .from("projects")
        .select("*")
        .eq("status", "open")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching projects:", error);
      } else if (projectsData) {
        setProjects(projectsData);
      }

      setIsLoading(false);
    };

    fetchProjects();
  }, []);

  const categories = ["web", "mobile", "design", "other"];
  const levels = ["beginner", "intermediate", "advanced"];

  const filteredProjects = useMemo(() => {
    return projects.filter((project) => {
      const matchesSearch =
        project.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        project.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (project.skills_req &&
          project.skills_req.some((skill: string) =>
            skill.toLowerCase().includes(searchQuery.toLowerCase()),
          ));

      const matchesCategory =
        !selectedCategory || project.category === selectedCategory;
      const matchesLevel =
        !selectedLevel || project.exp_level === selectedLevel;

      return matchesSearch && matchesCategory && matchesLevel;
    });
  }, [projects, searchQuery, selectedCategory, selectedLevel]);

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      web: "bg-blue-50 text-blue-700 border-blue-200",
      mobile: "bg-purple-50 text-purple-700 border-purple-200",
      design: "bg-orange-50 text-orange-700 border-orange-200",
      other: "bg-gray-50 text-gray-700 border-gray-200",
    };
    return colors[category] || colors.other;
  };

  const getLevelColor = (level: string) => {
    const colors: Record<string, string> = {
      beginner: "bg-green-50 text-green-700 border-green-200",
      intermediate: "bg-yellow-50 text-yellow-700 border-yellow-200",
      advanced: "bg-red-50 text-red-700 border-red-200",
    };
    return colors[level] || colors.beginner;
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
              <Link href="/freelancer/applications">
                <Button
                  variant="ghost"
                  className="text-muted-foreground hover:text-foreground">
                  My Applications
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
            Browse Projects
          </h2>
          <p className="mt-2 text-muted-foreground">
            Find and apply to projects that match your skills
          </p>
        </div>

        {/* Search and Filters */}
        <div className="mb-8 space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
            <Input
              placeholder="Search by title, skills, or company..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {/* Category Filter */}
            <div>
              <p className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                <Filter className="h-4 w-4" />
                Category
              </p>
              <div className="flex flex-wrap gap-2">
                <Button
                  variant={selectedCategory === null ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedCategory(null)}
                  className={
                    selectedCategory === null
                      ? "bg-primary hover:bg-primary/90"
                      : ""
                  }>
                  All
                </Button>
                {categories.map((cat) => (
                  <Button
                    key={cat}
                    variant={selectedCategory === cat ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedCategory(cat)}
                    className={
                      selectedCategory === cat
                        ? "bg-primary hover:bg-primary/90"
                        : ""
                    }>
                    {cat.charAt(0).toUpperCase() + cat.slice(1)}
                  </Button>
                ))}
              </div>
            </div>

            {/* Level Filter */}
            <div>
              <p className="text-sm font-semibold text-foreground mb-3">
                Experience Level
              </p>
              <div className="flex flex-wrap gap-2">
                <Button
                  variant={selectedLevel === null ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedLevel(null)}
                  className={
                    selectedLevel === null
                      ? "bg-primary hover:bg-primary/90"
                      : ""
                  }>
                  All
                </Button>
                {levels.map((level) => (
                  <Button
                    key={level}
                    variant={selectedLevel === level ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedLevel(level)}
                    className={
                      selectedLevel === level
                        ? "bg-primary hover:bg-primary/90"
                        : ""
                    }>
                    {level.charAt(0).toUpperCase() + level.slice(1)}
                  </Button>
                ))}
              </div>
            </div>

            {/* Results Count */}
            <div className="flex items-end">
              <p className="text-sm text-muted-foreground">
                Showing{" "}
                <span className="font-semibold">{filteredProjects.length}</span>{" "}
                of <span className="font-semibold">{projects.length}</span>{" "}
                projects
              </p>
            </div>
          </div>
        </div>

        {/* Project Grid */}
        {isLoading ? (
          <Card className="p-8 text-center">
            <p className="text-muted-foreground">Loading projects...</p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {filteredProjects.map((project: Project) => (
              <Link
                key={project.id}
                href={`/freelancer/projects/${project.id}`}>
                <Card className="p-6 hover:shadow-lg hover:border-primary transition-all cursor-pointer h-full flex flex-col">
                  <div className="mb-4 flex items-start justify-between">
                    <div>
                      <h3 className="text-lg font-bold text-foreground">
                        {project.title}
                      </h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        Company Project
                      </p>
                    </div>
                    <Badge
                      className={`${getCategoryColor(project.category)} capitalize`}>
                      {project.category}
                    </Badge>
                  </div>

                  <p className="text-sm text-foreground mb-4 flex-1 line-clamp-2">
                    {project.description}
                  </p>

                  {/* Skills */}
                  <div className="mb-4">
                    <div className="flex flex-wrap gap-2">
                      {project.skills_req &&
                        project.skills_req.slice(0, 3).map((skill: string) => (
                          <Badge
                            key={skill}
                            variant="secondary"
                            className="text-xs">
                            {skill}
                          </Badge>
                        ))}
                      {project.skills_req && project.skills_req.length > 3 && (
                        <Badge variant="secondary" className="text-xs">
                          +{project.skills_req.length - 3}
                        </Badge>
                      )}
                    </div>
                  </div>

                  {/* Info Row */}
                  <div className="mb-4 grid grid-cols-2 gap-4 py-4 border-t border-b border-border">
                    <div>
                      <p className="text-xs text-muted-foreground flex items-center gap-1">
                        <DollarSign className="h-3 w-3" />
                        Budget
                      </p>
                      <p className="text-sm font-bold text-foreground">
                        ${project.budget.toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        Duration
                      </p>
                      <p className="text-sm font-bold text-foreground">
                        {project.duration}
                      </p>
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Badge
                        className={`${getLevelColor(project.exp_level)} capitalize text-xs`}>
                        {project.exp_level}
                      </Badge>
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Users className="h-3 w-3" />0 applied
                      </span>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-primary hover:text-primary/90"
                      onClick={(e) => {
                        e.preventDefault();
                        // Will navigate via Link
                      }}>
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        )}

        {!isLoading && filteredProjects.length === 0 && (
          <Card className="p-12 text-center">
            <p className="text-muted-foreground">
              No projects found matching your filters.
            </p>
            <Button
              variant="outline"
              className="mt-4 bg-transparent"
              onClick={() => {
                setSearchQuery("");
                setSelectedCategory(null);
                setSelectedLevel(null);
              }}>
              Clear Filters
            </Button>
          </Card>
        )}
      </div>
    </div>
  );
}
