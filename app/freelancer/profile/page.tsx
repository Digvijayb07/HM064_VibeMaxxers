"use client";

import type React from "react";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Star, LinkIcon, Loader2 } from "lucide-react";
import Link from "next/link";
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
    try {
      const supabase = createClient();

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        console.error("No user found");
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from("users")
        .select("*")
        .eq("user_id", user.id)
        .single();

      if (error) {
        console.error("Error fetching profile:", error);
        setLoading(false);
        return;
      }

      setProfile(data);
      setFormData({
        name: data.name || "",
        title: data.professional_title || "",
        bio: data.about || "",
        skills: data.skills || [],
        hourlyRate: data.hr_rate?.toString() || "",
        availability: data.availability || "available",
      });
      setLoading(false);
    } catch (error) {
      console.error("Error:", error);
      setLoading(false);
    }
  };

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

  const handleSave = async () => {
    try {
      const supabase = createClient();

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        alert("User not authenticated");
        return;
      }

      const { error } = await supabase
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

      if (error) {
        console.error("Error updating profile:", error);
        alert("Failed to update profile");
        return;
      }

      alert("Profile updated successfully!");
      setIsEditing(false);
      fetchProfile();
    } catch (error) {
      console.error("Error:", error);
      alert("Failed to update profile");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="p-8 text-center">
          <p className="text-muted-foreground mb-4">
            No profile found. Please complete your profile first.
          </p>
          <Link href="/freelancer/complete-profile">
            <Button>Complete Profile</Button>
          </Link>
        </Card>
      </div>
    );
  }

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
              <Link href="/freelancer/projects">
                <Button
                  variant="ghost"
                  className="text-muted-foreground hover:text-foreground">
                  Browse Projects
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        {!isEditing ? (
          <>
            {/* Profile View */}
            <Card className="p-8 mb-8">
              <div className="mb-6 flex items-start justify-between">
                <div>
                  <h1 className="text-3xl font-bold text-foreground">
                    {profile.name}
                  </h1>
                  <p className="text-lg text-accent mt-1">
                    {profile.professional_title || "No title set"}
                  </p>
                </div>
                <Button
                  onClick={() => setIsEditing(true)}
                  className="bg-primary hover:bg-primary/90">
                  Edit Profile
                </Button>
              </div>

              <p className="text-foreground leading-relaxed mb-6">
                {profile.about || "No bio available"}
              </p>

              {/* Stats */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 py-6 border-t border-b border-border mb-6">
                <div>
                  <p className="text-xs text-muted-foreground">Hourly Rate</p>
                  <p className="text-2xl font-bold text-foreground mt-2">
                    ${profile.hr_rate || 0}/hr
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Availability</p>
                  <p className="text-2xl font-bold text-foreground mt-2 capitalize">
                    {profile.availability?.replace("-", " ") || "Not set"}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Email</p>
                  <p className="text-sm font-medium text-foreground mt-2 break-all">
                    {profile.email}
                  </p>
                </div>
              </div>

              {/* Skills */}
              <div className="mb-6">
                <h2 className="text-lg font-bold text-foreground mb-3">
                  Skills
                </h2>
                <div className="flex flex-wrap gap-2">
                  {profile.skills && profile.skills.length > 0 ? (
                    profile.skills.map((skill: string) => (
                      <Badge key={skill} variant="secondary">
                        {skill}
                      </Badge>
                    ))
                  ) : (
                    <p className="text-muted-foreground">No skills added yet</p>
                  )}
                </div>
              </div>
            </Card>
          </>
        ) : (
          <>
            {/* Profile Edit Form */}
            <Card className="p-8">
              <h2 className="text-2xl font-bold text-foreground mb-6">
                Edit Your Profile
              </h2>

              <form className="space-y-6">
                <div>
                  <Label
                    htmlFor="name"
                    className="text-foreground font-semibold">
                    Full Name
                  </Label>
                  <Input
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="mt-2"
                  />
                </div>

                <div>
                  <Label
                    htmlFor="title"
                    className="text-foreground font-semibold">
                    Professional Title
                  </Label>
                  <Input
                    id="title"
                    name="title"
                    placeholder="e.g., Full-Stack Developer"
                    value={formData.title}
                    onChange={handleChange}
                    className="mt-2"
                  />
                </div>

                <div>
                  <Label
                    htmlFor="bio"
                    className="text-foreground font-semibold">
                    About You
                  </Label>
                  <textarea
                    id="bio"
                    name="bio"
                    rows={4}
                    value={formData.bio}
                    onChange={handleChange}
                    className="mt-2 w-full px-3 py-2 border border-border rounded-lg text-foreground bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label
                      htmlFor="hourlyRate"
                      className="text-foreground font-semibold">
                      Hourly Rate ($)
                    </Label>
                    <Input
                      id="hourlyRate"
                      name="hourlyRate"
                      type="number"
                      value={formData.hourlyRate}
                      onChange={handleChange}
                      className="mt-2"
                    />
                  </div>

                  <div>
                    <Label
                      htmlFor="availability"
                      className="text-foreground font-semibold">
                      Availability
                    </Label>
                    <select
                      id="availability"
                      name="availability"
                      value={formData.availability}
                      onChange={handleChange}
                      className="mt-2 w-full px-3 py-2 border border-border rounded-lg text-foreground bg-background focus:outline-none focus:ring-2 focus:ring-primary">
                      <option value="available">Available Now</option>
                      <option value="available-limited">
                        Available (Limited)
                      </option>
                      <option value="unavailable">Unavailable</option>
                    </select>
                  </div>
                </div>

                <div>
                  <Label className="text-foreground font-semibold">
                    Skills
                  </Label>
                  <div className="mt-2 flex gap-2">
                    <Input
                      placeholder="Add a skill"
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
                </div>

                <div className="flex gap-4 pt-4">
                  <Button
                    onClick={handleSave}
                    className="flex-1 bg-primary hover:bg-primary/90">
                    Save Changes
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    className="flex-1 bg-transparent"
                    onClick={() => setIsEditing(false)}>
                    Cancel
                  </Button>
                </div>
              </form>
            </Card>
          </>
        )}
      </div>
    </div>
  );
}
