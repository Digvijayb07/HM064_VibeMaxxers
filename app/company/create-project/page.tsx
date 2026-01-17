"use client";

import type React from "react";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { createProject } from "@/lib/auth-actions";

interface ProjectForm {
  title: string;
  description: string;
  category: "web" | "mobile" | "design" | "other";
  budget: string;
  duration: string;
  skills: string[];
  deadline: string;
  level: "beginner" | "intermediate" | "advanced";
}

export default function CreateProjectPage() {
  const [formData, setFormData] = useState<ProjectForm>({
    title: "",
    description: "",
    category: "web",
    budget: "",
    duration: "",
    skills: [],
    deadline: "",
    level: "intermediate",
  });
  const [skillInput, setSkillInput] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const addSkill = () => {
    if (skillInput.trim() && !formData.skills.includes(skillInput.trim())) {
      setFormData((prev) => ({
        ...prev,
        skills: [...prev.skills, skillInput.trim()],
      }));
      setSkillInput("");
    }
  };

  const removeSkill = (skill: string) => {
    setFormData((prev) => ({
      ...prev,
      skills: prev.skills.filter((s) => s !== skill),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const form = e.target as HTMLFormElement;
      const formData = new FormData(form);

      await createProject(formData);
      // Redirect is handled by the server action
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create project");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card sticky top-0 z-50">
        <div className="mx-auto max-w-4xl px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4">
            <Link
              href="/company/dashboard"
              className="p-1 hover:bg-muted rounded-lg transition-colors">
              <ArrowLeft className="h-5 w-5 text-muted-foreground" />
            </Link>
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold">
                T
              </div>
              <h1 className="text-xl font-bold text-foreground">TalentHub</h1>
            </div>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        <Card className="p-8">
          <h2 className="text-2xl font-bold text-foreground mb-6">
            Post a New Project
          </h2>

          {error && (
            <div className="mb-4 p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Title */}
            <div>
              <Label htmlFor="title" className="text-foreground font-semibold">
                Project Title
              </Label>
              <Input
                id="title"
                name="title"
                placeholder="e.g., Website Redesign, Mobile App Development"
                value={formData.title}
                onChange={handleChange}
                className="mt-2"
                required
              />
            </div>

            {/* Description */}
            <div>
              <Label
                htmlFor="description"
                className="text-foreground font-semibold">
                Project Description
              </Label>
              <textarea
                id="description"
                name="description"
                placeholder="Describe your project in detail, including requirements, goals, and deliverables..."
                value={formData.description}
                onChange={handleChange}
                rows={6}
                className="mt-2 w-full px-3 py-2 border border-border rounded-lg text-foreground bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                required
              />
            </div>

            {/* Category */}
            <div>
              <Label
                htmlFor="category"
                className="text-foreground font-semibold">
                Category
              </Label>
              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="mt-2 w-full px-3 py-2 border border-border rounded-lg text-foreground bg-background focus:outline-none focus:ring-2 focus:ring-primary">
                <option value="web">Web Development</option>
                <option value="mobile">Mobile Development</option>
                <option value="design">Design</option>
                <option value="other">Other</option>
              </select>
            </div>

            {/* Grid: Budget, Duration, Level */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label
                  htmlFor="budget"
                  className="text-foreground font-semibold">
                  Budget ($)
                </Label>
                <Input
                  id="budget"
                  name="budget"
                  type="number"
                  placeholder="e.g., 5000"
                  value={formData.budget}
                  onChange={handleChange}
                  className="mt-2"
                  required
                />
              </div>

              <div>
                <Label
                  htmlFor="duration"
                  className="text-foreground font-semibold">
                  Duration
                </Label>
                <Input
                  id="duration"
                  name="duration"
                  placeholder="e.g., 4-6 weeks"
                  value={formData.duration}
                  onChange={handleChange}
                  className="mt-2"
                  required
                />
              </div>

              <div>
                <Label
                  htmlFor="level"
                  className="text-foreground font-semibold">
                  Experience Level
                </Label>
                <select
                  id="level"
                  name="level"
                  value={formData.level}
                  onChange={handleChange}
                  className="mt-2 w-full px-3 py-2 border border-border rounded-lg text-foreground bg-background focus:outline-none focus:ring-2 focus:ring-primary">
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                </select>
              </div>
            </div>

            {/* Deadline */}
            <div>
              <Label
                htmlFor="deadline"
                className="text-foreground font-semibold">
                Application Deadline
              </Label>
              <Input
                id="deadline"
                name="deadline"
                type="date"
                value={formData.deadline}
                onChange={handleChange}
                className="mt-2"
                required
              />
            </div>

            {/* Skills */}
            <div>
              <Label className="text-foreground font-semibold">
                Required Skills
              </Label>
              <div className="mt-2 flex gap-2">
                <Input
                  placeholder="e.g., React, TypeScript"
                  value={skillInput}
                  onChange={(e) => setSkillInput(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addSkill();
                    }
                  }}
                />
                <Button type="button" onClick={addSkill} variant="outline">
                  Add
                </Button>
              </div>

              {formData.skills.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {formData.skills.map((skill) => (
                    <Badge
                      key={skill}
                      variant="secondary"
                      className="cursor-pointer">
                      {skill}
                      <button
                        type="button"
                        onClick={() => removeSkill(skill)}
                        className="ml-2 text-xs opacity-70 hover:opacity-100">
                        ×
                      </button>
                    </Badge>
                  ))}
                </div>
              )}

              {/* Hidden input for skills */}
              <input
                type="hidden"
                name="skills"
                value={JSON.stringify(formData.skills)}
              />
            </div>

            {/* Buttons */}
            <div className="flex gap-4 pt-4">
              <Button
                type="submit"
                disabled={isSubmitting}
                className="bg-primary hover:bg-primary/90 flex-1">
                {isSubmitting ? "Posting..." : "Post Project"}
              </Button>
              <Link href="/company/dashboard" className="flex-1">
                <Button
                  type="button"
                  variant="outline"
                  className="w-full bg-transparent">
                  Cancel
                </Button>
              </Link>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
}
