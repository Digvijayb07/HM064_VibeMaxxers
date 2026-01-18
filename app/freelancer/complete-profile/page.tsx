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

  // Form state
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
      // Redirect is handled by the server action
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create profile");
      setIsLoading(false);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Professional Title</Label>
              <Input
                id="title"
                placeholder="e.g., Full-Stack Developer, UI/UX Designer"
                value={professionalTitle}
                onChange={(e) => setProfessionalTitle(e.target.value)}
                disabled={isLoading}
                maxLength={100}
              />
              <p className="text-sm text-muted-foreground">
                This will be displayed on your profile and in project listings
              </p>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="about">About You</Label>
              <textarea
                id="about"
                className="flex min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                placeholder="Tell companies about your experience, expertise, and what makes you stand out..."
                value={about}
                onChange={(e) => setAbout(e.target.value)}
                disabled={isLoading}
                maxLength={1000}
              />
              <p className="text-sm text-muted-foreground">
                {about.length}/1000 characters (minimum 50 characters)
              </p>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="rate">Hourly Rate (USD)</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                  $
                </span>
                <Input
                  id="rate"
                  type="number"
                  placeholder="50"
                  value={hourlyRate}
                  onChange={(e) => setHourlyRate(e.target.value)}
                  disabled={isLoading}
                  min="1"
                  step="1"
                  className="pl-7"
                />
              </div>
              <p className="text-sm text-muted-foreground">
                Set a competitive rate based on your experience and skills
              </p>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-4">
            <div className="space-y-3">
              <Label>Availability</Label>
              <div className="grid gap-3">
                {[
                  {
                    value: "available" as const,
                    label: "Available",
                    description: "Ready to take on new projects immediately",
                  },
                  {
                    value: "available-limited" as const,
                    label: "Limited Availability",
                    description: "Can take on projects with some constraints",
                  },
                  {
                    value: "unavailable" as const,
                    label: "Unavailable",
                    description: "Not looking for new projects right now",
                  },
                ].map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setAvailability(option.value)}
                    disabled={isLoading}
                    className={`relative flex flex-col items-start gap-1 p-4 rounded-lg border-2 transition-all text-left ${
                      availability === option.value
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/50"
                    }`}>
                    {availability === option.value && (
                      <div className="absolute top-3 right-3">
                        <Check className="h-5 w-5 text-primary" />
                      </div>
                    )}
                    <div className="font-medium">{option.label}</div>
                    <div className="text-sm text-muted-foreground">
                      {option.description}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="skills">Skills</Label>
              <div className="flex gap-2">
                <Input
                  id="skills"
                  placeholder="e.g., React, TypeScript, Node.js"
                  value={skillInput}
                  onChange={(e) => setSkillInput(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleAddSkill();
                    }
                  }}
                  disabled={isLoading}
                />
                <Button
                  type="button"
                  onClick={handleAddSkill}
                  disabled={isLoading || !skillInput.trim()}
                  variant="outline">
                  Add
                </Button>
              </div>
              <p className="text-sm text-muted-foreground">
                Add skills one at a time. Press Enter or click Add.
              </p>
            </div>

            {skills.length > 0 && (
              <div className="space-y-2">
                <Label>Your Skills ({skills.length})</Label>
                <div className="flex flex-wrap gap-2">
                  {skills.map((skill) => (
                    <Badge
                      key={skill}
                      variant="secondary"
                      className="px-3 py-1 cursor-pointer hover:bg-destructive hover:text-destructive-foreground"
                      onClick={() => handleRemoveSkill(skill)}>
                      {skill}
                      <span className="ml-2">×</span>
                    </Badge>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground">
                  Click on a skill to remove it
                </p>
              </div>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-background via-background to-primary/5 p-4">
      <Card className="mx-auto max-w-2xl shadow-lg w-full">
        <CardHeader className="px-8 pt-8 pb-6">
          <div className="space-y-4">
            {/* Progress indicator */}
            <div className="flex items-center justify-between mb-6">
              {steps.map((step) => (
                <div
                  key={step.id}
                  className="flex flex-col items-center flex-1">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
                      step.id < currentStep
                        ? "bg-primary text-primary-foreground"
                        : step.id === currentStep
                          ? "bg-primary text-primary-foreground ring-4 ring-primary/20"
                          : "bg-muted text-muted-foreground"
                    }`}>
                    {step.id < currentStep ? (
                      <Check className="h-4 w-4" />
                    ) : (
                      step.id
                    )}
                  </div>
                  {step.id < steps.length && (
                    <div
                      className={`h-1 w-full transition-colors ${
                        step.id < currentStep ? "bg-primary" : "bg-muted"
                      }`}
                    />
                  )}
                </div>
              ))}
            </div>

            <div>
              <CardTitle className="text-2xl">
                {steps[currentStep - 1].title}
              </CardTitle>
              <CardDescription className="mt-2">
                {steps[currentStep - 1].description}
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent className="px-8 pb-8">
          <div className="space-y-6">
            {error && (
              <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
                {error}
              </div>
            )}

            {renderStepContent()}

            {/* Navigation buttons */}
            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={handleBack}
                disabled={currentStep === 1 || isLoading}
                className="flex-1">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
              </Button>

              {currentStep < steps.length ? (
                <Button
                  type="button"
                  onClick={handleNext}
                  disabled={!canProceed() || isLoading}
                  className="flex-1">
                  Next
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              ) : (
                <Button
                  type="button"
                  onClick={handleSubmit}
                  disabled={!canProceed() || isLoading}
                  className="flex-1">
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating Profile...
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
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
