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
    setFormData((prev) => ({ ...prev, [name]: value }));
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
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create project");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
      <header className="sticky top-0 z-50 backdrop-blur bg-white/70 border-b">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center gap-4">
          <Link
            href="/company/dashboard"
            className="p-2 rounded-lg hover:bg-indigo-50 transition">
            <ArrowLeft className="h-5 w-5 text-muted-foreground" />
          </Link>
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-bold flex items-center justify-center">
              T
            </div>
            <span className="font-bold text-lg">TalentHub</span>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-10">
        <Card className="p-8 shadow-xl border-0">
          <h1 className="text-3xl font-bold mb-2">Post a New Project</h1>
          <p className="text-muted-foreground mb-6">
            Describe your project clearly to attract the best freelancers
          </p>

          {error && (
            <div className="mb-4 p-3 rounded-lg text-sm bg-red-50 text-red-700 border border-red-200">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <Label className="font-semibold">Project Title</Label>
              <Input
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="Website redesign, Mobile app development"
                className="mt-2"
                required
              />
            </div>

            <div>
              <Label className="font-semibold">Project Description</Label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={6}
                className="mt-2 w-full rounded-lg border bg-background p-3 text-sm focus:ring-2 focus:ring-indigo-500"
                required
              />
            </div>

            <div>
              <Label className="font-semibold">Category</Label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="mt-2 w-full rounded-lg border bg-background p-2 focus:ring-2 focus:ring-indigo-500">
                <option value="web">Web Development</option>
                <option value="mobile">Mobile Development</option>
                <option value="design">Design</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label className="font-semibold">Budget ($)</Label>
                <Input
                  name="budget"
                  type="number"
                  value={formData.budget}
                  onChange={handleChange}
                  className="mt-2"
                  required
                />
              </div>

              <div>
                <Label className="font-semibold">Duration</Label>
                <Input
                  name="duration"
                  value={formData.duration}
                  onChange={handleChange}
                  className="mt-2"
                  required
                />
              </div>

              <div>
                <Label className="font-semibold">Experience Level</Label>
                <select
                  name="level"
                  value={formData.level}
                  onChange={handleChange}
                  className="mt-2 w-full rounded-lg border bg-background p-2 focus:ring-2 focus:ring-indigo-500">
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                </select>
              </div>
            </div>

            <div>
              <Label className="font-semibold">Application Deadline</Label>
              <Input
                name="deadline"
                type="date"
                value={formData.deadline}
                onChange={handleChange}
                className="mt-2"
                required
              />
            </div>

            <div>
              <Label className="font-semibold">Required Skills</Label>
              <div className="mt-2 flex gap-2">
                <Input
                  value={skillInput}
                  onChange={(e) => setSkillInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addSkill();
                    }
                  }}
                  placeholder="React, Node.js, UI Design"
                />
                <Button type="button" variant="outline" onClick={addSkill}>
                  Add
                </Button>
              </div>

              {formData.skills.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {formData.skills.map((skill) => (
                    <Badge
                      key={skill}
                      className="bg-indigo-500/15 text-indigo-700 cursor-pointer hover:bg-red-500/20 hover:text-red-700"
                      onClick={() => removeSkill(skill)}>
                      {skill} ×
                    </Badge>
                  ))}
                </div>
              )}

              <input
                type="hidden"
                name="skills"
                value={JSON.stringify(formData.skills)}
              />
            </div>

            <div className="flex gap-4 pt-4">
              <Button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 bg-gradient-to-r from-indigo-500 to-purple-500 text-white">
                {isSubmitting ? "Posting…" : "Post Project"}
              </Button>
              <Link href="/company/dashboard" className="flex-1">
                <Button variant="outline" className="w-full">
                  Cancel
                </Button>
              </Link>
            </div>
          </form>
        </Card>
      </main>
    </div>
  );
}
