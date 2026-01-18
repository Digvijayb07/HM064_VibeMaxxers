"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/utils/supabase/client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function DeveloperProfilePage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [headline, setHeadline] = useState("");
  const [skills, setSkills] = useState("");
  const [experience, setExperience] = useState("");
  const [portfolio, setPortfolio] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 🔐 Guard: ensure user is authenticated
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) {
        router.replace("/auth/login");
      }
    });
  }, [router]);

  const handleSubmit = async () => {
    if (!name || !skills || !experience) {
      setError("Name, skills, and experience are required");
      return;
    }

    setLoading(true);
    setError(null);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      router.replace("/auth/login");
      return;
    }

    const { error: updateError } = await supabase
      .from("profiles")
      .update({
        name,
        headline,
        skills: skills.split(",").map((s) => s.trim()),
        experience,
        portfolio_links: portfolio
          ? portfolio.split(",").map((p) => p.trim())
          : [],
      })
      .eq("user_id", user.id);

    if (updateError) {
      console.error(updateError);
      setError("Failed to save profile. Please try again.");
      setLoading(false);
      return;
    }

    // ✅ Onboarding complete → dashboard allowed
    router.replace("/freelancer/dashboard");
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <Card className="max-w-xl w-full shadow-lg">
        <CardHeader>
          <CardTitle>Complete your developer profile</CardTitle>
          <CardDescription>
            This information helps companies evaluate your proposals
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-5">
          {error && (
            <div className="text-sm text-red-600 bg-red-50 border border-red-200 p-3 rounded-md">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <Label>Full Name</Label>
            <Input
              placeholder="Your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label>Professional Headline</Label>
            <Input
              placeholder="Full-stack developer, UI/UX designer, etc."
              value={headline}
              onChange={(e) => setHeadline(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label>Skills</Label>
            <Input
              placeholder="React, Next.js, Node, PostgreSQL"
              value={skills}
              onChange={(e) => setSkills(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              Separate skills with commas
            </p>
          </div>

          <div className="space-y-2">
            <Label>Experience</Label>
            <textarea
              placeholder="Briefly describe your development experience"
              value={experience}
              onChange={(e) => setExperience(e.target.value)}
              rows={4}
              className="mt-2 w-full rounded-lg border border-border bg-background px-3 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            />

          </div>

          <div className="space-y-2">
            <Label>Portfolio Links (optional)</Label>
            <Input
              placeholder="GitHub, Figma, personal website"
              value={portfolio}
              onChange={(e) => setPortfolio(e.target.value)}
            />
          </div>

          <Button
            className="w-full"
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading ? "Saving profile..." : "Finish setup"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
