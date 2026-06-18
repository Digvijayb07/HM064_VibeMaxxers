"use client";

import { useState, useMemo, useEffect, useRef, ViewTransition } from "react";
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
  X,
  SlidersHorizontal,
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

// ─── Skeleton card ────────────────────────────────────────────────────────────
function ProjectCardSkeleton() {
  return (
    <div className="p-6 rounded-[var(--radius-lg)] border border-border bg-card card-telemetry animate-pulse" aria-hidden="true">
      <div className="flex justify-between items-start mb-3">
        <div className="space-y-2 flex-1 min-w-0 pr-4">
          <div className="h-5 w-3/4 rounded bg-muted" />
          <div className="h-3 w-1/3 rounded bg-muted" />
        </div>
        <div className="h-6 w-16 rounded-full bg-muted shrink-0" />
      </div>
      <div className="space-y-2 mb-4">
        <div className="h-3 w-full rounded bg-muted" />
        <div className="h-3 w-4/5 rounded bg-muted" />
      </div>
      <div className="flex gap-2 mb-4">
        <div className="h-5 w-16 rounded bg-muted" />
        <div className="h-5 w-20 rounded bg-muted" />
        <div className="h-5 w-14 rounded bg-muted" />
      </div>
      <div className="grid grid-cols-2 gap-4 py-4 border-y border-border">
        <div className="space-y-1">
          <div className="h-3 w-12 rounded bg-muted" />
          <div className="h-4 w-20 rounded bg-muted" />
        </div>
        <div className="space-y-1">
          <div className="h-3 w-14 rounded bg-muted" />
          <div className="h-4 w-16 rounded bg-muted" />
        </div>
      </div>
      <div className="flex justify-between items-center pt-4">
        <div className="h-5 w-20 rounded-full bg-muted" />
        <div className="h-4 w-4 rounded bg-muted" />
      </div>
    </div>
  );
}

// ─── Filter chip ─────────────────────────────────────────────────────────────
function FilterChip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={[
        "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-mono uppercase tracking-wider border transition-all duration-150",
        "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary",
        active
          ? "bg-primary text-primary-foreground border-primary shadow-sm"
          : "bg-card text-muted-foreground border-border hover:border-primary/40 hover:text-foreground",
      ].join(" ")}
    >
      {children}
    </button>
  );
}

export default function FreelancerProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedLevel, setSelectedLevel] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  // ── Keyboard accelerator: "/" focuses the search field ──────────────────────
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement).tagName;
      if (e.key === "/" && tag !== "INPUT" && tag !== "TEXTAREA") {
        e.preventDefault();
        searchRef.current?.focus();
        searchRef.current?.select();
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  // ── Data fetch ────────────────────────────────────────────────────────────
  const fetchProjects = async () => {
    setIsLoading(true);
    setFetchError(null);
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("projects")
        .select("*")
        .eq("status", "open")
        .order("created_at", { ascending: false });

      if (error) throw error;
      if (data) setProjects(data);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to load projects.";
      setFetchError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const categories = ["web", "mobile", "design", "other"];
  const levels = ["beginner", "intermediate", "advanced"];

  const filteredProjects = useMemo(() => {
    return projects.filter((project) => {
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        !q ||
        project.title.toLowerCase().includes(q) ||
        project.description.toLowerCase().includes(q) ||
        project.skills_req?.some((s) => s.toLowerCase().includes(q));
      const matchesCategory = !selectedCategory || project.category === selectedCategory;
      const matchesLevel = !selectedLevel || project.exp_level === selectedLevel;
      return matchesSearch && matchesCategory && matchesLevel;
    });
  }, [projects, searchQuery, selectedCategory, selectedLevel]);

  const hasActiveFilters = !!(searchQuery || selectedCategory || selectedLevel);

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedCategory(null);
    setSelectedLevel(null);
  };

  // ── Style helpers ─────────────────────────────────────────────────────────
  const categoryStyle = (c: string) =>
    c === "web"
      ? "bg-blue-500/10 text-blue-600 border border-blue-500/20 dark:text-blue-400 font-mono"
      : c === "mobile"
      ? "bg-purple-500/10 text-purple-600 border border-purple-500/20 dark:text-purple-400 font-mono"
      : c === "design"
      ? "bg-orange-500/10 text-orange-600 border border-orange-500/20 dark:text-orange-400 font-mono"
      : "bg-slate-500/10 text-slate-600 border border-slate-500/20 dark:text-slate-400 font-mono";

  const levelStyle = (l: string) =>
    l === "beginner"
      ? "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 dark:text-emerald-400 font-mono"
      : l === "intermediate"
      ? "bg-yellow-500/10 text-yellow-600 border border-yellow-500/20 dark:text-yellow-400 font-mono"
      : "bg-red-500/10 text-red-600 border border-red-500/20 dark:text-red-400 font-mono";

  return (
    <div className="min-h-screen bg-background bg-grid-pattern bg-blueprint-glow">
      {/* ── Top nav ──────────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-50 backdrop-blur-md bg-card/75 border-b border-border">
        <div className="max-w-7xl mx-auto px-6 py-3.5 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div
              className="h-8 w-8 rounded-md bg-primary text-primary-foreground font-bold text-sm flex items-center justify-center"
              aria-label="TalentHub logo"
            >
              T
            </div>
            <span className="font-semibold tracking-tight">TalentHub</span>
          </div>
          <nav className="flex gap-1" aria-label="Main navigation">
            <Link href="/freelancer/dashboard">
              <Button variant="ghost" size="sm">Dashboard</Button>
            </Link>
            <Link href="/freelancer/applications">
              <Button variant="ghost" size="sm">Applications</Button>
            </Link>
          </nav>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-12 space-y-10">
        {/* ── Page hero ──────────────────────────────────────────────────── */}
        <div className="space-y-1.5">
          <h1 className="text-3xl font-bold font-sans tracking-tight">
            Browse <span className="font-serif italic text-primary/80">Projects</span>
          </h1>
          <p className="text-sm text-muted-foreground">
            Find work that fits your skills and experience.
            {!isLoading && !fetchError && (
              <span className="ml-1 font-mono">
                <span className="text-primary">{filteredProjects.length}</span>
                <span> / {projects.length} shown</span>
              </span>
            )}
          </p>
        </div>

        {/* ── Controls ───────────────────────────────────────────────────── */}
        <div className="space-y-4">
          {/* Search */}
          <div className="relative group">
            <Search
              className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors duration-150"
              aria-hidden="true"
            />
            <Input
              id="project-search"
              ref={searchRef}
              className="pl-10 pr-20 font-mono text-sm h-10 focus:ring-1 focus:ring-primary/50"
              placeholder="Search title, skills, or description…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              aria-label="Search projects"
            />
            {/* "/" hint badge — hidden when input is focused / has content */}
            {!searchQuery && (
              <kbd
                className="absolute right-3.5 top-1/2 -translate-y-1/2 hidden sm:flex items-center px-1.5 py-0.5 text-[10px] font-mono text-muted-foreground border border-border rounded pointer-events-none"
                aria-label="Press / to focus search"
              >
                /
              </kbd>
            )}
            {/* Clear button when input has content */}
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-muted-foreground hover:text-foreground transition-colors rounded-sm focus-visible:outline-2 focus-visible:outline-primary"
                aria-label="Clear search"
              >
                <X size={14} />
              </button>
            )}
          </div>

          {/* Filter bar */}
          <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
            <div className="flex items-center gap-2 shrink-0">
              <SlidersHorizontal size={13} className="text-muted-foreground" aria-hidden="true" />
              <span className="text-xs font-mono uppercase tracking-wider text-muted-foreground">
                Category
              </span>
              <div className="flex flex-wrap gap-1.5" role="group" aria-label="Filter by category">
                <FilterChip active={!selectedCategory} onClick={() => setSelectedCategory(null)}>
                  All
                </FilterChip>
                {categories.map((c) => (
                  <FilterChip
                    key={c}
                    active={selectedCategory === c}
                    onClick={() => setSelectedCategory(c === selectedCategory ? null : c)}
                  >
                    {c}
                  </FilterChip>
                ))}
              </div>
            </div>

            <div className="w-px h-5 bg-border hidden sm:block" aria-hidden="true" />

            <div className="flex items-center gap-2 shrink-0">
              <span className="text-xs font-mono uppercase tracking-wider text-muted-foreground">
                Level
              </span>
              <div className="flex flex-wrap gap-1.5" role="group" aria-label="Filter by experience level">
                <FilterChip active={!selectedLevel} onClick={() => setSelectedLevel(null)}>
                  All
                </FilterChip>
                {levels.map((l) => (
                  <FilterChip
                    key={l}
                    active={selectedLevel === l}
                    onClick={() => setSelectedLevel(l === selectedLevel ? null : l)}
                  >
                    {l}
                  </FilterChip>
                ))}
              </div>
            </div>

            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="ml-auto flex items-center gap-1 text-xs font-mono text-muted-foreground hover:text-destructive transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                aria-label="Clear all filters"
              >
                <X size={12} />
                Clear filters
              </button>
            )}
          </div>
        </div>

        {/* ── Project grid ───────────────────────────────────────────────── */}
        {fetchError ? (
          /* Error state */
          <div
            role="alert"
            className="rounded-[var(--radius-lg)] border border-destructive/30 bg-destructive/5 p-10 text-center space-y-4"
          >
            <p className="text-sm text-destructive font-mono">{fetchError}</p>
            <Button variant="outline" size="sm" onClick={fetchProjects}>
              Try again
            </Button>
          </div>
        ) : isLoading ? (
          /* Skeleton loaders */
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5" aria-live="polite" aria-busy="true" aria-label="Loading projects">
            {Array.from({ length: 6 }).map((_, i) => (
              <ProjectCardSkeleton key={i} />
            ))}
          </div>
        ) : filteredProjects.length === 0 ? (
          /* Empty state */
          <div className="rounded-[var(--radius-lg)] border border-border bg-card p-14 text-center space-y-4 card-telemetry">
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-muted mx-auto">
              <Search size={20} className="text-muted-foreground" aria-hidden="true" />
            </div>
            <div className="space-y-1">
              <p className="font-semibold text-foreground">No projects found</p>
              <p className="text-sm text-muted-foreground">
                {hasActiveFilters
                  ? "Try adjusting your search or removing filters."
                  : "Check back later for new opportunities."}
              </p>
            </div>
            {hasActiveFilters && (
              <Button variant="outline" size="sm" onClick={clearFilters}>
                Clear filters
              </Button>
            )}
          </div>
        ) : (
          /* Project cards */
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5" aria-live="polite">
            {filteredProjects.map((p) => (
              <Link
                key={p.id}
                href={`/freelancer/projects/${p.id}`}
                className="group block focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary rounded-[var(--radius-lg)]"
                aria-label={`View project: ${p.title}`}
              >
                <Card className="p-6 h-full flex flex-col border border-border bg-card group-hover:border-primary/40 transition-all duration-200 card-telemetry">
                  {/* Card header */}
                  <div className="flex justify-between items-start gap-3 mb-3">
                    <div className="min-w-0 flex-1">
                      <ViewTransition name={`project-title-${p.id}`} share="text-morph">
                        <h3 className="text-base font-semibold font-sans leading-snug truncate">
                          {p.title}
                        </h3>
                      </ViewTransition>
                      <p className="text-xs text-muted-foreground mt-0.5 font-mono truncate">
                        Company Project
                      </p>
                    </div>
                    <Badge className={`${categoryStyle(p.category)} shrink-0 capitalize`}>
                      {p.category}
                    </Badge>
                  </div>

                  {/* Description */}
                  <p className="text-sm text-muted-foreground line-clamp-2 mb-4 flex-1 min-h-[2.5rem]">
                    {p.description}
                  </p>

                  {/* Skills */}
                  <div className="flex flex-wrap gap-1.5 mb-4 min-h-[1.75rem]">
                    {p.skills_req?.slice(0, 3).map((s) => (
                      <Badge
                        key={s}
                        variant="outline"
                        className="bg-primary/5 text-primary border-primary/15 font-mono text-[10px] max-w-[120px] truncate"
                        title={s}
                      >
                        {s}
                      </Badge>
                    ))}
                    {p.skills_req?.length > 3 && (
                      <Badge
                        variant="outline"
                        className="bg-muted text-muted-foreground border-border font-mono text-[10px]"
                      >
                        +{p.skills_req.length - 3}
                      </Badge>
                    )}
                  </div>

                  {/* Stats row */}
                  <div className="grid grid-cols-2 gap-4 py-3.5 border-y border-border text-sm font-mono">
                    <div>
                      <p className="text-[10px] text-muted-foreground flex items-center gap-1 uppercase tracking-wider mb-0.5">
                        <DollarSign size={11} aria-hidden="true" /> Budget
                      </p>
                      <p className="font-semibold tabular-nums">
                        ${p.budget.toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] text-muted-foreground flex items-center gap-1 uppercase tracking-wider mb-0.5">
                        <Clock size={11} aria-hidden="true" /> Duration
                      </p>
                      <p className="font-semibold truncate">{p.duration}</p>
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="flex justify-between items-center pt-3.5">
                    <div className="flex items-center gap-2 min-w-0">
                      <Badge className={`${levelStyle(p.exp_level)} capitalize shrink-0`}>
                        {p.exp_level}
                      </Badge>
                      <span className="text-[11px] text-muted-foreground flex items-center gap-1 font-mono shrink-0">
                        <Users size={11} aria-hidden="true" />
                        0 applied
                      </span>
                    </div>
                    <ChevronRight
                      size={16}
                      className="text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 transition-all duration-150 shrink-0"
                      aria-hidden="true"
                    />
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
