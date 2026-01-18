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
      const { data } = await supabase
        .from("projects")
        .select("*")
        .eq("status", "open")
        .order("created_at", { ascending: false });

      if (data) setProjects(data);
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
        project.skills_req?.some((s) =>
          s.toLowerCase().includes(searchQuery.toLowerCase()),
        );

      const matchesCategory =
        !selectedCategory || project.category === selectedCategory;
      const matchesLevel =
        !selectedLevel || project.exp_level === selectedLevel;

      return matchesSearch && matchesCategory && matchesLevel;
    });
  }, [projects, searchQuery, selectedCategory, selectedLevel]);

  const categoryStyle = (c: string) =>
    c === "web"
      ? "bg-blue-500/15 text-blue-700"
      : c === "mobile"
      ? "bg-purple-500/15 text-purple-700"
      : c === "design"
      ? "bg-orange-500/15 text-orange-700"
      : "bg-gray-500/15 text-gray-700";

  const levelStyle = (l: string) =>
    l === "beginner"
      ? "bg-emerald-500/20 text-emerald-700"
      : l === "intermediate"
      ? "bg-yellow-500/20 text-yellow-700"
      : "bg-red-500/20 text-red-700";

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
            <Link href="/freelancer/dashboard">
              <Button variant="ghost">Dashboard</Button>
            </Link>
            <Link href="/freelancer/applications">
              <Button variant="ghost">Applications</Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-10 space-y-10">
        <div>
          <h1 className="text-3xl font-bold">Browse Projects</h1>
          <p className="text-muted-foreground mt-1">
            Find work that fits your skills and experience
          </p>
        </div>

        <div className="space-y-6">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
            <Input
              className="pl-10"
              placeholder="Search by title, skills, or description"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div>
              <p className="font-semibold mb-3 flex items-center gap-2">
                <Filter size={14} /> Category
              </p>
              <div className="flex flex-wrap gap-2">
                <Button
                  size="sm"
                  variant={!selectedCategory ? "default" : "outline"}
                  className={!selectedCategory ? "bg-indigo-500" : ""}
                  onClick={() => setSelectedCategory(null)}>
                  All
                </Button>
                {categories.map((c) => (
                  <Button
                    key={c}
                    size="sm"
                    variant={selectedCategory === c ? "default" : "outline"}
                    className={
                      selectedCategory === c ? "bg-indigo-500" : ""
                    }
                    onClick={() => setSelectedCategory(c)}>
                    {c}
                  </Button>
                ))}
              </div>
            </div>

            <div>
              <p className="font-semibold mb-3">Experience</p>
              <div className="flex flex-wrap gap-2">
                <Button
                  size="sm"
                  variant={!selectedLevel ? "default" : "outline"}
                  className={!selectedLevel ? "bg-indigo-500" : ""}
                  onClick={() => setSelectedLevel(null)}>
                  All
                </Button>
                {levels.map((l) => (
                  <Button
                    key={l}
                    size="sm"
                    variant={selectedLevel === l ? "default" : "outline"}
                    className={selectedLevel === l ? "bg-indigo-500" : ""}
                    onClick={() => setSelectedLevel(l)}>
                    {l}
                  </Button>
                ))}
              </div>
            </div>

            <div className="flex items-end">
              <p className="text-sm text-muted-foreground">
                Showing{" "}
                <span className="font-semibold">
                  {filteredProjects.length}
                </span>{" "}
                of <span className="font-semibold">{projects.length}</span>
              </p>
            </div>
          </div>
        </div>

        {isLoading ? (
          <Card className="p-12 text-center">Loading projects…</Card>
        ) : filteredProjects.length === 0 ? (
          <Card className="p-12 text-center space-y-3">
            <p className="text-muted-foreground">No projects found</p>
            <Button
              variant="outline"
              onClick={() => {
                setSearchQuery("");
                setSelectedCategory(null);
                setSelectedLevel(null);
              }}>
              Clear Filters
            </Button>
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredProjects.map((p) => (
              <Link key={p.id} href={`/freelancer/projects/${p.id}`}>
                <Card className="p-6 h-full flex flex-col hover:shadow-xl transition border-l-4 border-indigo-500">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="text-lg font-bold">{p.title}</h3>
                      <p className="text-sm text-muted-foreground">
                        Company Project
                      </p>
                    </div>
                    <Badge className={categoryStyle(p.category)}>
                      {p.category}
                    </Badge>
                  </div>

                  <p className="text-sm text-muted-foreground line-clamp-2 mb-4 flex-1">
                    {p.description}
                  </p>

                  <div className="flex flex-wrap gap-2 mb-4">
                    {p.skills_req?.slice(0, 3).map((s) => (
                      <Badge key={s} variant="secondary">
                        {s}
                      </Badge>
                    ))}
                    {p.skills_req?.length > 3 && (
                      <Badge variant="secondary">
                        +{p.skills_req.length - 3}
                      </Badge>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4 py-4 border-y text-sm">
                    <div>
                      <p className="text-muted-foreground flex items-center gap-1">
                        <DollarSign size={14} /> Budget
                      </p>
                      <p className="font-semibold">
                        ${p.budget.toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground flex items-center gap-1">
                        <Clock size={14} /> Duration
                      </p>
                      <p className="font-semibold">{p.duration}</p>
                    </div>
                  </div>

                  <div className="flex justify-between items-center pt-4">
                    <div className="flex items-center gap-2">
                      <Badge className={levelStyle(p.exp_level)}>
                        {p.exp_level}
                      </Badge>
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Users size={12} />0 applied
                      </span>
                    </div>
                    <ChevronRight className="text-indigo-500" />
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
