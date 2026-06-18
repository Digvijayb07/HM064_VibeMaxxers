"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, ArrowLeft, ArrowRight, Check } from "lucide-react";
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
import { Badge } from "@/components/ui/badge";
import { createFreelancerProfile } from "@/lib/auth-actions";

type Step = {
  id: number;
  title: string;
  description: string;
};

const steps: Step[] = [
  { id: 1, title: "Professional Title", description: "What do you do?" },
  { id: 2, title: "About You", description: "Tell us about yourself" },
  { id: 3, title: "Hourly Rate", description: "Set your pricing" },
  { id: 4, title: "Availability", description: "When can you work?" },
  { id: 5, title: "Skills", description: "What are your expertise areas?" },
];

export default function CompleteProfilePage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const [professionalTitle, setProfessionalTitle] = useState("");
  const [about, setAbout] = useState("");
  const [hourlyRate, setHourlyRate] = useState("");
  const [availability, setAvailability] = useState<
    "available" | "available-limited" | "unavailable" | ""
  >("");
  const [skillInput, setSkillInput] = useState("");
  const [skills, setSkills] = useState<string[]>([]);

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return professionalTitle.trim().length > 0;
      case 2:
        return about.trim().length >= 50;
      case 3:
        return hourlyRate && parseFloat(hourlyRate) > 0;
      case 4:
        return availability !== "";
      case 5:
        return skills.length > 0;
      default:
        return false;
    }
  };

  const handleNext = () => {
    if (canProceed() && currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
      setError(null);
    } else if (!canProceed()) {
      setError(getStepError());
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      setError(null);
    }
  };

  const getStepError = () => {
    switch (currentStep) {
      case 1:
        return "Please enter your professional title";
      case 2:
        return "Please write at least 50 characters about yourself";
      case 3:
        return "Please enter a valid hourly rate";
      case 4:
        return "Please select your availability";
      case 5:
        return "Please add at least one skill";
      default:
        return "Please complete this step";
    }
  };

  const handleAddSkill = () => {
    const trimmedSkill = skillInput.trim();
    if (trimmedSkill && !skills.includes(trimmedSkill)) {
      setSkills([...skills, trimmedSkill]);
      setSkillInput("");
    }
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    setSkills(skills.filter((skill) => skill !== skillToRemove));
  };

  const handleSubmit = async () => {
    if (!canProceed()) {
      setError(getStepError());
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("professional_title", professionalTitle);
      formData.append("about", about);
      formData.append("hourly_rate", hourlyRate);
      formData.append("availability", availability);
      formData.append("skills", JSON.stringify(skills));
      await createFreelancerProfile(formData);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create profile");
      setIsLoading(false);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-2">
            <Label>Professional Title</Label>
            <Input
              value={professionalTitle}
              onChange={(e) => setProfessionalTitle(e.target.value)}
              placeholder="Full-Stack Developer"
              disabled={isLoading}
            />
          </div>
        );
      case 2:
        return (
          <div className="space-y-2">
            <Label>About You</Label>
            <textarea
              className="min-h-[130px] w-full rounded-md border border-input bg-card p-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]"
              value={about}
              onChange={(e) => setAbout(e.target.value)}
              disabled={isLoading}
            />
            <p className="text-xs text-muted-foreground font-mono">
              {about.length}/1000 characters
            </p>
          </div>
        );
      case 3:
        return (
          <div className="space-y-2">
            <Label>Hourly Rate</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2">$</span>
              <Input
                className="pl-7"
                type="number"
                value={hourlyRate}
                onChange={(e) => setHourlyRate(e.target.value)}
                disabled={isLoading}
              />
            </div>
          </div>
        );
      case 4:
        return (
          <div className="grid gap-3">
            {[
              { value: "available", label: "Available" },
              { value: "available-limited", label: "Limited Availability" },
              { value: "unavailable", label: "Unavailable" },
            ].map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setAvailability(opt.value as any)}
                className={`p-4 rounded-md border text-left transition-colors cursor-pointer ${
                  availability === opt.value
                    ? "border-primary bg-primary/10 text-primary"
                    : "hover:border-primary/50 border-border bg-card"
                }`}>
                <div className="font-medium">{opt.label}</div>
              </button>
            ))}
          </div>
        );
      case 5:
        return (
          <div className="space-y-3">
            <div className="flex gap-2">
              <Input
                value={skillInput}
                onChange={(e) => setSkillInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddSkill();
                  }
                }}
                disabled={isLoading}
              />
              <Button variant="outline" onClick={handleAddSkill}>
                Add
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {skills.map((skill) => (
                <Badge
                  key={skill}
                  variant="outline"
                  className="cursor-pointer bg-primary/10 text-primary border-primary/20 hover:bg-destructive/10 hover:text-destructive hover:border-destructive/20 transition-colors font-mono"
                  onClick={() => handleRemoveSkill(skill)}>
                  {skill} ×
                </Badge>
              ))}
            </div>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background bg-grid-pattern bg-blueprint-glow px-4 py-8">
      <Card className="max-w-2xl w-full border border-border bg-card card-telemetry">
        <CardHeader className="pb-4">
          <div className="flex justify-between mb-6">
            {steps.map((s) => (
              <div key={s.id} className="flex-1 flex flex-col items-center">
                <div
                  className={`h-8 w-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    s.id <= currentStep
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground"
                  }`}>
                  {s.id < currentStep ? <Check size={14} /> : s.id}
                </div>
                {s.id < steps.length && (
                  <div
                    className={`h-1 w-full mt-1 ${
                      s.id < currentStep ? "bg-primary" : "bg-muted"
                    }`}
                  />
                )}
              </div>
            ))}
          </div>

          <CardTitle className="text-2xl font-sans tracking-tight">
            {steps[currentStep - 1].title}
          </CardTitle>
          <CardDescription>
            {steps[currentStep - 1].description}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {error && (
            <div className="p-3 rounded-lg text-sm bg-red-50 text-red-700 border border-red-200">
              {error}
            </div>
          )}

          {renderStepContent()}

          <div className="flex gap-3 pt-4">
            <Button
              variant="outline"
              onClick={handleBack}
              disabled={currentStep === 1 || isLoading}
              className="flex-1">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>

            {currentStep < steps.length ? (
              <Button
                onClick={handleNext}
                disabled={!canProceed() || isLoading}
                className="flex-1 bg-primary text-primary-foreground hover:bg-primary/95">
                Next
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            ) : (
              <Button
                onClick={handleSubmit}
                disabled={!canProceed() || isLoading}
                className="flex-1 bg-primary text-primary-foreground hover:bg-primary/95">
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating…
                  </>
                ) : (
                  <>
                    Complete Profile
                    <Check className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
