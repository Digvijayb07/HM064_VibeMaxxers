"use client";

import type React from "react";

import { useState, useEffect, use } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  DollarSign,
  Clock,
  Users,
  Briefcase,
  Share2,
} from "lucide-react";
import Link from "next/link";
import { createClient } from "@/utils/supabase/client";
import { applyToProject } from "@/lib/auth-actions";
import { useRouter } from "next/navigation";

interface Project {
  id: number;
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

export default function ProjectDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [project, setProject] = useState<Project | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isApplying, setIsApplying] = useState(false);
  const [hasApplied, setHasApplied] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchProject = async () => {
      const supabase = createClient();

      console.log("Fetching project with ID:", id);

      // Fetch project details
      const { data: projectData, error: projectError } = await supabase
        .from("projects")
        .select("*")
        .eq("id", parseInt(id))
        .single();

      if (projectError) {
        console.error("Error fetching project:", projectError);
        setIsLoading(false);
        return;
      }

      console.log("Project data fetched:", projectData);
      setProject(projectData);

      // Check if user has already applied
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        const { data: applicationData } = await supabase
          .from("applications")
          .select("id")
          .eq("user_id", user.id)
          .eq("project_id", parseInt(id))
          .single();

        setHasApplied(!!applicationData);
        console.log("Has applied:", !!applicationData);
      }

      setIsLoading(false);
    };

    fetchProject();
  }, [id]);

  const handleApply = async () => {
    if (!project) return;

    setIsApplying(true);
    setError(null);

    try {
      await applyToProject(project.id);
      setHasApplied(true);
      alert("Application submitted successfully!");
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to apply to project";
      setError(errorMessage);
      alert(errorMessage);
    } finally {
      setIsApplying(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <header className="border-b border-border bg-card">
          <div className="mx-auto max-w-4xl px-4 py-4 sm:px-6 lg:px-8">
            <Link
              href="/freelancer/projects"
              className="flex items-center gap-2 hover:opacity-80 transition-opacity">
              <ArrowLeft className="h-5 w-5" />
              <span className="text-foreground">Back to Projects</span>
            </Link>
          </div>
        </header>
        <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
          <Card className="p-12 text-center">
            <p className="text-muted-foreground">Loading project...</p>
          </Card>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-background">
        <header className="border-b border-border bg-card">
          <div className="mx-auto max-w-4xl px-4 py-4 sm:px-6 lg:px-8">
            <Link
              href="/freelancer/projects"
              className="flex items-center gap-2 hover:opacity-80 transition-opacity">
              <ArrowLeft className="h-5 w-5" />
              <span className="text-foreground">Back to Projects</span>
            </Link>
          </div>
        </header>
        <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
          <Card className="p-12 text-center">
            <p className="text-muted-foreground">Project not found.</p>
          </Card>
        </div>
      </div>
    );
  }

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
        <div className="mx-auto max-w-4xl px-4 py-4 sm:px-6 lg:px-8">
          <Link
            href="/freelancer/projects"
            className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <ArrowLeft className="h-5 w-5 text-muted-foreground" />
            <span className="text-foreground">Back to Projects</span>
          </Link>
        </div>
      </header>

      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Project Header */}
            <Card className="p-6">
              <div className="mb-4 flex items-start justify-between">
                <div className="flex-1">
                  <h1 className="text-3xl font-bold text-foreground">
                    {project.title}
                  </h1>
                  <p className="text-lg text-muted-foreground mt-1">
                    Company Project
                  </p>
                </div>
                <Badge className="bg-green-50 text-green-700 border-green-200 capitalize">
                  {project.status}
                </Badge>
              </div>

              <p className="text-foreground leading-relaxed mb-6">
                {project.description}
              </p>

              {/* Key Info */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 py-6 border-t border-b border-border">
                <div>
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <DollarSign className="h-4 w-4" />
                    Budget
                  </p>
                  <p className="text-lg font-bold text-foreground mt-1">
                    ${project.budget.toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    Duration
                  </p>
                  <p className="text-lg font-bold text-foreground mt-1">
                    {project.duration}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <Users className="h-4 w-4" />
                    Applications
                  </p>
                  <p className="text-lg font-bold text-foreground mt-1">0</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <Briefcase className="h-4 w-4" />
                    Level
                  </p>
                  <p className="text-lg font-bold text-foreground mt-1 capitalize">
                    {project.exp_level}
                  </p>
                </div>
              </div>
            </Card>

            {/* Skills Required */}
            <Card className="p-6">
              <h2 className="text-xl font-bold text-foreground mb-4">
                Required Skills
              </h2>
              <div className="flex flex-wrap gap-2">
                {project.skills_req &&
                  project.skills_req.map((skill: string) => (
                    <Badge key={skill} variant="secondary">
                      {skill}
                    </Badge>
                  ))}
              </div>
            </Card>

            {/* Project Details */}
            <Card className="p-6">
              <h2 className="text-xl font-bold text-foreground mb-4">
                Project Details
              </h2>
              <div className="space-y-4 text-foreground">
                <div>
                  <p className="font-semibold mb-1">Category</p>
                  <p className="text-sm capitalize text-muted-foreground">
                    {project.category}
                  </p>
                </div>
                <div>
                  <p className="font-semibold mb-1">Deadline</p>
                  <p className="text-sm text-muted-foreground">
                    {new Date(project.deadline).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <p className="font-semibold mb-1">
                    Experience Level Required
                  </p>
                  <p className="text-sm capitalize text-muted-foreground">
                    {project.exp_level}
                  </p>
                </div>
              </div>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* CTA Card */}
            <Card className="p-6 border-2 border-primary">
              <h3 className="text-lg font-bold text-foreground mb-4">
                {hasApplied ? "Application Submitted" : "Ready to Apply?"}
              </h3>
              <p className="text-sm text-muted-foreground mb-6">
                {hasApplied
                  ? "You have already applied to this project. The company will review your application."
                  : "Submit your application and let the company know you're interested in this project."}
              </p>
              {error && (
                <div className="mb-4 p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
                  {error}
                </div>
              )}
              <Button
                className="w-full bg-primary hover:bg-primary/90"
                onClick={handleApply}
                disabled={isApplying || hasApplied}>
                {isApplying
                  ? "Applying..."
                  : hasApplied
                    ? "Already Applied"
                    : "Apply Now"}
              </Button>
            </Card>

            {/* Share Card */}
            <Card className="p-6">
              <h3 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
                <Share2 className="h-5 w-5" />
                Share
              </h3>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 bg-transparent">
                  Copy Link
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 bg-transparent">
                  Share
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
