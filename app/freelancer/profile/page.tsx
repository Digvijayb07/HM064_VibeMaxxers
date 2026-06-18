"use client";

import type React from "react";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Loader2, Pencil } from "lucide-react";
import { createClient } from "@/utils/supabase/client";

interface ProfileFormData {
  name: string;
  title: string;
  bio: string;
  skills: string[];
  hourlyRate: string;
  availability: "available" | "available-limited" | "unavailable";
}

export default function FreelancerProfilePage() {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<ProfileFormData>({
    name: "",
    title: "",
    bio: "",
    skills: [],
    hourlyRate: "",
    availability: "available",
  });
  const [skillInput, setSkillInput] = useState("");

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setLoading(false);
      return;
    }

    const { data } = await supabase
      .from("users")
      .select("*")
      .eq("user_id", user.id)
      .single();

    if (data) {
      setProfile(data);
      setFormData({
        name: data.name || "",
        title: data.professional_title || "",
        bio: data.about || "",
        skills: data.skills || [],
        hourlyRate: data.hr_rate?.toString() || "",
        availability: data.availability || "available",
      });
    }

    setLoading(false);
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((p) => ({ ...p, [name]: value }));
  };

  const addSkill = () => {
    if (skillInput.trim() && !formData.skills.includes(skillInput.trim())) {
      setFormData((p) => ({ ...p, skills: [...p.skills, skillInput.trim()] }));
      setSkillInput("");
    }
  };

  const removeSkill = (skill: string) => {
    setFormData((p) => ({
      ...p,
      skills: p.skills.filter((s) => s !== skill),
    }));
  };

  const handleSave = async () => {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    await supabase
      .from("users")
      .update({
        name: formData.name,
        professional_title: formData.title,
        about: formData.bio,
        hr_rate: parseFloat(formData.hourlyRate),
        availability: formData.availability,
        skills: formData.skills,
      })
      .eq("user_id", user.id);

    setIsEditing(false);
    fetchProfile();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background bg-grid-pattern bg-blueprint-glow">
      <div className="mx-auto max-w-4xl px-6 py-10 space-y-6">
        <div className="flex items-center justify-between">
          <Link href="/freelancer/dashboard">
            <Button
              variant="ghost"
              className="flex items-center gap-2 text-muted-foreground"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Dashboard
            </Button>
          </Link>
        </div>

        {/* VIEW MODE */}
        {!isEditing ? (
          <>
            {/* HEADER */}
            <Card className="relative overflow-hidden border border-border bg-card card-telemetry">
              <div className="absolute inset-0 bg-primary/5 bg-grid-pattern/3" />
              <CardContent className="relative p-8 flex justify-between items-start">
                <div className="space-y-1">
                  <h1 className="text-3xl font-bold font-sans tracking-tight">
                    {profile.name}
                  </h1>
                  <p className="text-muted-foreground">
                    {profile.professional_title}
                  </p>

                  <Badge
                    className={`mt-3 font-mono border ${profile.availability === "available"
                        ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20 dark:text-emerald-400"
                        : profile.availability === "available-limited"
                          ? "bg-yellow-500/10 text-yellow-600 border-yellow-500/20 dark:text-yellow-400"
                          : "bg-red-500/10 text-red-600 border-red-500/20 dark:text-red-400"
                      }`}
                  >
                    {profile.availability.replace("-", " ")}
                  </Badge>
                </div>

                <Button
                  size="sm"
                  className="bg-primary text-primary-foreground hover:bg-primary/95"
                  onClick={() => setIsEditing(true)}
                >
                  <Pencil className="h-4 w-4 mr-2" />
                  Edit
                </Button>
              </CardContent>
            </Card>

            {/* ABOUT */}
            <Card className="border border-border bg-card hover:border-primary/30 transition-colors card-telemetry">
              <CardHeader className="pb-2">
                <h2 className="font-semibold text-primary uppercase tracking-wider text-xs font-mono">About</h2>
              </CardHeader>
              <CardContent>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {profile.about || "No description provided."}
                </p>
              </CardContent>
            </Card>

            {/* SKILLS */}
            <Card className="border border-border bg-card hover:border-primary/30 transition-colors card-telemetry">
              <CardHeader className="pb-2">
                <h2 className="font-semibold text-primary uppercase tracking-wider text-xs font-mono">Skills</h2>
              </CardHeader>
              <CardContent className="flex flex-wrap gap-2">
                {profile.skills?.length ? (
                  profile.skills.map((skill: string) => (
                    <Badge
                      key={skill}
                      variant="outline"
                      className="bg-primary/5 text-primary border-primary/10 font-mono"
                    >
                      {skill}
                    </Badge>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">
                    No skills added yet.
                  </p>
                )}
              </CardContent>
            </Card>
          </>
        ) : (
          /* EDIT MODE */
          <Card className="border border-border bg-card card-telemetry">
            <CardContent className="p-8 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label>Full Name</Label>
                  <Input name="name" value={formData.name} onChange={handleChange} className="mt-2" />
                </div>
                <div>
                  <Label>Professional Title</Label>
                  <Input name="title" value={formData.title} onChange={handleChange} className="mt-2" />
                </div>
              </div>

              <div>
                <Label>About</Label>
                <textarea
                  name="bio"
                  value={formData.bio}
                  onChange={handleChange}
                  className="mt-2 w-full min-h-[120px] rounded-md border border-input bg-card p-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]"
                />
              </div>

              <div>
                <Label>Skills</Label>
                <div className="mt-2 flex gap-2">
                  <Input
                    value={skillInput}
                    onChange={(e) => setSkillInput(e.target.value)}
                    placeholder="Add a skill"
                  />
                  <Button variant="outline" onClick={addSkill}>
                    Add
                  </Button>
                </div>

                <div className="mt-3 flex flex-wrap gap-2">
                  {formData.skills.map((skill) => (
                    <Badge
                      key={skill}
                      variant="outline"
                      className="cursor-pointer bg-primary/10 text-primary border-primary/20 hover:bg-destructive/10 hover:text-destructive hover:border-destructive/20 transition-colors font-mono"
                      onClick={() => removeSkill(skill)}
                    >
                      {skill} ×
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <Button variant="outline" onClick={() => setIsEditing(false)}>
                  Cancel
                </Button>
                <Button
                  onClick={handleSave}
                  className="bg-primary text-primary-foreground hover:bg-primary/95"
                >
                  Save Changes
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
