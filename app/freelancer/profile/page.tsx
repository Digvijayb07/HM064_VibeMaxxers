"use client";

import type React from "react";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
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
      console.error(error);
      setLoading(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
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
        alert("Failed to update profile");
        return;
      }

      setIsEditing(false);
      fetchProfile();
    } catch {
      alert("Failed to update profile");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="p-8 text-center">
          <p className="mb-4">No profile found.</p>
          <Link href="/freelancer/complete-profile">
            <Button>Complete Profile</Button>
          </Link>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="mx-auto max-w-4xl px-4 py-8">
        {!isEditing ? (
          <Card className="p-8">
            <div className="mb-6 flex justify-between">
              <div>
                <h1 className="text-3xl font-bold">{profile.name}</h1>
                <p className="text-muted-foreground">
                  {profile.professional_title}
                </p>
              </div>
              <Button onClick={() => setIsEditing(true)}>Edit</Button>
            </div>

            <p className="mb-6">{profile.about}</p>

            <div className="flex flex-wrap gap-2">
              {profile.skills?.map((skill: string) => (
                <Badge key={skill}>{skill}</Badge>
              ))}
            </div>
          </Card>
        ) : (
          <Card className="p-8">
            <form className="space-y-4">
              <div>
                <Label>Full Name</Label>
                <Input name="name" value={formData.name} onChange={handleChange} />
              </div>

              <div>
                <Label>Professional Title</Label>
                <Input
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                />
              </div>

              <div>
                <Label>About</Label>
                <textarea
                  name="bio"
                  value={formData.bio}
                  onChange={handleChange}
                  className="w-full border rounded p-2"
                />
              </div>

              <div>
                <Label>Skills</Label>
                <div className="flex gap-2">
                  <Input
                    value={skillInput}
                    onChange={(e) => setSkillInput(e.target.value)}
                  />
                  <Button type="button" onClick={addSkill}>
                    Add
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {formData.skills.map((skill) => (
                    <Badge key={skill} onClick={() => removeSkill(skill)}>
                      {skill} ×
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="flex gap-4">
                <Button onClick={handleSave}>Save</Button>
                <Button variant="outline" onClick={() => setIsEditing(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          </Card>
        )}
      </div>
    </div>
  );
}
