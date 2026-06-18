"use client";

import type React from "react";
import { useState, useEffect, use, ViewTransition } from "react";
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
  CheckCircle2,
  AlertCircle,
  Copy,
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

// ─── Skeleton ─────────────────────────────────────────────────────────────────
function DetailSkeleton() {
  return (
    <div
      className="min-h-screen bg-background bg-grid-pattern bg-blueprint-glow"
      aria-busy="true"
      aria-label="Loading project"
    >
      <header className="sticky top-0 z-50 backdrop-blur-md bg-card/75 border-b border-border">
        <div className="max-w-5xl mx-auto px-6 py-4">
          <div className="h-4 w-32 rounded bg-muted animate-pulse" />
        </div>
      </header>
      <main className="max-w-5xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="p-6 rounded-[var(--radius-lg)] border border-border bg-card animate-pulse space-y-4">
              <div className="h-8 w-2/3 rounded bg-muted" />
              <div className="h-4 w-1/4 rounded bg-muted" />
              <div className="grid grid-cols-4 gap-4 py-5 border-y border-border">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="space-y-1.5">
                    <div className="h-3 w-12 rounded bg-muted" />
                    <div className="h-5 w-16 rounded bg-muted" />
                  </div>
                ))}
              </div>
              <div className="space-y-2">
                <div className="h-3 w-full rounded bg-muted" />
                <div className="h-3 w-5/6 rounded bg-muted" />
                <div className="h-3 w-4/6 rounded bg-muted" />
              </div>
            </div>
            <div className="p-6 rounded-[var(--radius-lg)] border border-border bg-card animate-pulse">
              <div className="h-5 w-32 rounded bg-muted mb-4" />
              <div className="flex gap-2">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="h-6 w-20 rounded-full bg-muted" />
                ))}
              </div>
            </div>
          </div>
          <div className="space-y-6">
            <div className="p-6 rounded-[var(--radius-lg)] border border-border bg-card animate-pulse space-y-4">
              <div className="h-5 w-36 rounded bg-muted" />
              <div className="h-4 w-full rounded bg-muted" />
              <div className="h-9 w-full rounded bg-muted" />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

// ─── Inline toast notification ─────────────────────────────────────────────────
function InlineToast({
  kind,
  message,
  onDismiss,
}: {
  kind: "success" | "error";
  message: string;
  onDismiss: () => void;
}) {
  return (
    <div
      role="alert"
      className={[
        "flex items-start gap-3 p-3 rounded-md text-sm border",
        kind === "success"
          ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-700 dark:text-emerald-400"
          : "bg-red-500/10 border-red-500/20 text-red-700 dark:text-red-400",
      ].join(" ")}
    >
      {kind === "success" ? (
        <CheckCircle2 size={16} className="mt-0.5 shrink-0" aria-hidden="true" />
      ) : (
        <AlertCircle size={16} className="mt-0.5 shrink-0" aria-hidden="true" />
      )}
      <span className="flex-1 font-mono">{message}</span>
      <button
        onClick={onDismiss}
        className="shrink-0 opacity-60 hover:opacity-100 transition-opacity focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
        aria-label="Dismiss notification"
      >
        ×
      </button>
    </div>
  );
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
  const [toast, setToast] = useState<{ kind: "success" | "error"; message: string } | null>(null);
  const [copyLabel, setCopyLabel] = useState("Copy Link");
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
    setToast(null);

    try {
      await applyToProject(project.id);
      setHasApplied(true);
      setToast({ kind: "success", message: "Application submitted successfully!" });
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to apply to project.";
      setToast({ kind: "error", message: msg });
    } finally {
      setIsApplying(false);
    }
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopyLabel("Copied!");
      setTimeout(() => setCopyLabel("Copy Link"), 2000);
    } catch {
      setCopyLabel("Copy Link");
    }
  };

  const categoryStyle = (c: string) =>
    c === "web"
      ? "bg-blue-500/10 text-blue-600 border border-blue-500/20 dark:text-blue-400 font-mono"
      : c === "mobile"
      ? "bg-purple-500/10 text-purple-600 border border-purple-500/20 dark:text-purple-400 font-mono"
      : c === "design"
      ? "bg-orange-500/10 text-orange-600 border border-orange-500/20 dark:text-orange-400 font-mono"
      : "bg-slate-500/10 text-slate-600 border border-slate-500/20 dark:text-slate-400 font-mono";

  if (isLoading || !project) {
    return <DetailSkeleton />;
  }

  return (
    <div className="min-h-screen bg-background bg-grid-pattern bg-blueprint-glow">
      {/* ── Nav ──────────────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-50 backdrop-blur-md bg-card/75 border-b border-border">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link
            href="/freelancer/projects"
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary rounded-sm"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            Back to Projects
          </Link>
          <div className="flex items-center gap-3">
            <div
              className="h-7 w-7 rounded-md bg-primary text-primary-foreground font-bold text-xs flex items-center justify-center"
              aria-label="TalentHub logo"
            >
              T
            </div>
            <span className="font-semibold text-sm tracking-tight hidden sm:inline">TalentHub</span>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* ── Left column ─────────────────────────────────────────────── */}
          <div className="lg:col-span-2 space-y-5">
            {/* Hero card */}
            <Card className="p-6 relative overflow-hidden border border-border bg-card card-telemetry">
              <div className="absolute inset-0 bg-primary/[0.03] bg-grid-pattern pointer-events-none" aria-hidden="true" />
              <div className="relative space-y-5">
                {/* Header row */}
                <div className="flex justify-between items-start gap-4">
                  <div className="min-w-0 flex-1">
                    <ViewTransition name={`project-title-${project.id}`} share="text-morph">
                      <h1 className="text-2xl sm:text-3xl font-bold font-sans tracking-tight break-words">
                        {project.title}
                      </h1>
                    </ViewTransition>
                    <p className="text-sm text-muted-foreground mt-1 font-mono">
                      Company Project · <span className="capitalize">{project.category}</span>
                    </p>
                  </div>
                  <Badge className={`${categoryStyle(project.category)} shrink-0 capitalize`}>
                    {project.status}
                  </Badge>
                </div>

                {/* Stats grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 py-5 border-y border-border text-sm font-mono">
                  <div>
                    <p className="text-[10px] text-muted-foreground flex gap-1 items-center uppercase tracking-wider mb-1">
                      <DollarSign size={11} aria-hidden="true" /> Budget
                    </p>
                    <p className="font-bold text-lg tabular-nums">
                      ${project.budget.toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] text-muted-foreground flex gap-1 items-center uppercase tracking-wider mb-1">
                      <Clock size={11} aria-hidden="true" /> Duration
                    </p>
                    <p className="font-bold text-lg truncate">{project.duration}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-muted-foreground flex gap-1 items-center uppercase tracking-wider mb-1">
                      <Users size={11} aria-hidden="true" /> Applications
                    </p>
                    <p className="font-bold text-lg">—</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-muted-foreground flex gap-1 items-center uppercase tracking-wider mb-1">
                      <Briefcase size={11} aria-hidden="true" /> Level
                    </p>
                    <p className="font-bold text-lg capitalize">{project.exp_level}</p>
                  </div>
                </div>

                {/* Description */}
                <p className="text-sm leading-relaxed text-muted-foreground break-words">
                  {project.description}
                </p>
              </div>
            </Card>

            {/* Required Skills */}
            <Card className="p-6 border border-border bg-card card-telemetry">
              <h2 className="font-semibold text-base mb-4 font-sans tracking-tight">
                Required Skills
              </h2>
              <div className="flex flex-wrap gap-1.5" role="list" aria-label="Required skills">
                {project.skills_req.map((skill) => (
                  <Badge
                    key={skill}
                    role="listitem"
                    variant="outline"
                    className="bg-primary/5 text-primary border-primary/15 font-mono max-w-[180px] truncate"
                    title={skill}
                  >
                    {skill}
                  </Badge>
                ))}
              </div>
            </Card>

            {/* Project Details */}
            <Card className="p-6 border border-border bg-card card-telemetry">
              <h2 className="font-semibold text-base mb-5 font-sans tracking-tight">
                Project Details
              </h2>
              <dl className="grid grid-cols-1 sm:grid-cols-3 gap-y-5 gap-x-6 text-sm">
                <div>
                  <dt className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground mb-1">
                    Category
                  </dt>
                  <dd className="font-medium text-foreground capitalize">{project.category}</dd>
                </div>
                <div>
                  <dt className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground mb-1">
                    Deadline
                  </dt>
                  <dd className="font-medium text-foreground font-mono">
                    {new Intl.DateTimeFormat("en-US", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    }).format(new Date(project.deadline))}
                  </dd>
                </div>
                <div>
                  <dt className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground mb-1">
                    Experience Level
                  </dt>
                  <dd className="font-medium text-foreground capitalize">{project.exp_level}</dd>
                </div>
              </dl>
            </Card>
          </div>

          {/* ── Right column ─────────────────────────────────────────────── */}
          <div className="space-y-5">
            {/* Apply card */}
            <Card className="p-6 border border-primary/30 bg-card card-telemetry">
              <div className="flex items-center gap-2 mb-2">
                {hasApplied && (
                  <CheckCircle2
                    size={16}
                    className="text-emerald-500 shrink-0"
                    aria-hidden="true"
                  />
                )}
                <h3 className="font-semibold text-base font-sans tracking-tight">
                  {hasApplied ? "Application Submitted" : "Ready to Apply?"}
                </h3>
              </div>
              <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
                {hasApplied
                  ? "You've already applied. The company will review your application."
                  : "Submit your application and show your interest in this project."}
              </p>

              {toast && (
                <div className="mb-4">
                  <InlineToast
                    kind={toast.kind}
                    message={toast.message}
                    onDismiss={() => setToast(null)}
                  />
                </div>
              )}

              <Button
                className="w-full bg-primary text-primary-foreground hover:bg-primary/90 transition-all duration-150 disabled:opacity-60"
                onClick={handleApply}
                disabled={isApplying || hasApplied}
                aria-busy={isApplying}
              >
                {isApplying
                  ? "Applying…"
                  : hasApplied
                  ? "Already Applied"
                  : "Apply Now"}
              </Button>
            </Card>

            {/* Share card */}
            <Card className="p-6 border border-border bg-card card-telemetry">
              <h3 className="font-semibold text-sm mb-4 flex items-center gap-2 font-sans tracking-tight">
                <Share2 size={14} aria-hidden="true" /> Share This Project
              </h3>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 gap-1.5 font-mono text-xs transition-all duration-150"
                  onClick={handleCopyLink}
                  aria-label="Copy project link to clipboard"
                >
                  <Copy size={12} aria-hidden="true" />
                  {copyLabel}
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
