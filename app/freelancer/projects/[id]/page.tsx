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

      const { data } = await supabase
        .from("projects")
        .select("*")
        .eq("id", parseInt(id))
        .single();

      if (!data) {
        setIsLoading(false);
        return;
      }

      setProject(data);

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
      const msg =
        err instanceof Error ? err.message : "Failed to apply to project";
      setError(msg);
      alert(msg);
    } finally {
      setIsApplying(false);
    }
  };

  if (isLoading || !project) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 flex items-center justify-center">
        <Card className="p-12 text-muted-foreground">Loading project…</Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
      <header className="sticky top-0 z-50 backdrop-blur bg-white/70 border-b">
        <div className="max-w-5xl mx-auto px-4 py-4">
          <Link
            href="/freelancer/projects"
            className="flex items-center gap-2 text-muted-foreground hover:text-indigo-600">
            <ArrowLeft className="h-4 w-4" />
            Back to Projects
          </Link>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card className="p-6 relative overflow-hidden border-0 shadow-lg">
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/10 to-purple-500/10" />
              <div className="relative">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h1 className="text-3xl font-bold">{project.title}</h1>
                    <p className="text-muted-foreground mt-1">
                      Company Project
                    </p>
                  </div>
                  <Badge className="bg-emerald-500/20 text-emerald-700 capitalize">
                    {project.status}
                  </Badge>
                </div>

                <p className="leading-relaxed text-muted-foreground mb-6">
                  {project.description}
                </p>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 py-6 border-y">
                  <div>
                    <p className="text-xs text-muted-foreground flex gap-1 items-center">
                      <DollarSign size={14} /> Budget
                    </p>
                    <p className="font-bold text-lg">
                      ${project.budget.toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground flex gap-1 items-center">
                      <Clock size={14} /> Duration
                    </p>
                    <p className="font-bold text-lg">{project.duration}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground flex gap-1 items-center">
                      <Users size={14} /> Applications
                    </p>
                    <p className="font-bold text-lg">0</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground flex gap-1 items-center">
                      <Briefcase size={14} /> Level
                    </p>
                    <p className="font-bold text-lg capitalize">
                      {project.exp_level}
                    </p>
                  </div>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <h2 className="font-bold text-xl mb-4">Required Skills</h2>
              <div className="flex flex-wrap gap-2">
                {project.skills_req.map((skill) => (
                  <Badge
                    key={skill}
                    className="bg-indigo-500/15 text-indigo-700">
                    {skill}
                  </Badge>
                ))}
              </div>
            </Card>

            <Card className="p-6">
              <h2 className="font-bold text-xl mb-4">Project Details</h2>
              <div className="space-y-3 text-sm">
                <div>
                  <p className="font-medium">Category</p>
                  <p className="text-muted-foreground capitalize">
                    {project.category}
                  </p>
                </div>
                <div>
                  <p className="font-medium">Deadline</p>
                  <p className="text-muted-foreground">
                    {new Date(project.deadline).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <p className="font-medium">Experience Level</p>
                  <p className="text-muted-foreground capitalize">
                    {project.exp_level}
                  </p>
                </div>
              </div>
            </Card>
          </div>

          <div className="space-y-6">
            <Card className="p-6 border-2 border-indigo-500 shadow-lg">
              <h3 className="font-bold text-lg mb-2">
                {hasApplied ? "Application Submitted" : "Ready to Apply?"}
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                {hasApplied
                  ? "You’ve already applied. The company will review your application."
                  : "Submit your application and show your interest."}
              </p>
              {error && (
                <div className="mb-3 text-sm text-red-600 bg-red-50 p-3 rounded-lg">
                  {error}
                </div>
              )}
              <Button
                className="w-full bg-gradient-to-r from-indigo-500 to-purple-500 text-white"
                onClick={handleApply}
                disabled={isApplying || hasApplied}>
                {isApplying
                  ? "Applying…"
                  : hasApplied
                  ? "Already Applied"
                  : "Apply Now"}
              </Button>
            </Card>

            <Card className="p-6">
              <h3 className="font-bold mb-3 flex items-center gap-2">
                <Share2 size={16} /> Share
              </h3>
              <div className="flex gap-2">
                <Button variant="outline" className="flex-1">
                  Copy Link
                </Button>
                <Button variant="outline" className="flex-1">
                  Share
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
