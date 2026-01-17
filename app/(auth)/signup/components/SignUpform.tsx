"use client";

import Link from "next/link";
import { useState } from "react";
import { Briefcase, Code, Check } from "lucide-react";

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
import { cn } from "@/lib/utils";
import { signup } from "@/lib/auth-actions";
import SignInWithGoogleButton from "../../signin/components/SignInWithGoogleButton";

type UserRole = "company" | "developer";

export function SignUpForm() {
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (formData: FormData) => {
    if (!selectedRole) {
      setError("Please select a role");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      await signup(formData);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create account");
      setIsLoading(false);
    }
  };

  const roles = [
    {
      id: "company" as const,
      label: "Company",
      description: "Post projects and hire developers",
      icon: Briefcase,
    },
    {
      id: "developer" as const,
      label: "Developer",
      description: "Find projects and submit proposals",
      icon: Code,
    },
  ];
  return (
    <Card className="mx-auto max-w-lg shadow-lg">
      <CardHeader className="px-8 pt-8 pb-6">
        <CardTitle className="text-xl">Sign Up</CardTitle>
        <CardDescription>
          Enter your information to create an account
        </CardDescription>
      </CardHeader>
      <CardContent className="px-8 pb-8">
        <form action={handleSubmit}>
          <div className="grid gap-6">
            {error && (
              <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
                {error}
              </div>
            )}
            {/* Role selection */}
            <div className="grid gap-3">
              <Label>I am a...</Label>
              <div className="grid grid-cols-2 gap-3">
                {roles.map((role) => (
                  <button
                    key={role.id}
                    type="button"
                    onClick={() => setSelectedRole(role.id)}
                    className={cn(
                      "relative flex flex-col items-center gap-2 p-4 rounded-lg border-2 transition-all text-left",
                      selectedRole === role.id
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/50",
                    )}>
                    {selectedRole === role.id && (
                      <div className="absolute top-2 right-2">
                        <Check className="h-4 w-4 text-primary" />
                      </div>
                    )}
                    <div
                      className={cn(
                        "rounded-lg p-2.5",
                        selectedRole === role.id ? "bg-primary/10" : "bg-muted",
                      )}>
                      <role.icon
                        className={cn(
                          "h-5 w-5",
                          selectedRole === role.id
                            ? "text-primary"
                            : "text-muted-foreground",
                        )}
                      />
                    </div>
                    <div className="text-center">
                      <p className="font-medium text-sm">{role.label}</p>
                      <p className="text-xs text-muted-foreground">
                        {role.description}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
              <input
                type="hidden"
                name="user-role"
                value={selectedRole || ""}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="first-name">First name</Label>
                <Input
                  name="first-name"
                  id="first-name"
                  placeholder="Max"
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="last-name">Last name</Label>
                <Input
                  name="last-name"
                  id="last-name"
                  placeholder="Robinson"
                  required
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                name="email"
                id="email"
                type="email"
                placeholder="m@example.com"
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="password">Password</Label>
              <Input name="password" id="password" type="password" />
            </div>
            <Button
              type="submit"
              className="w-full mt-2"
              disabled={!selectedRole || isLoading}>
              {isLoading ? "Creating account..." : "Create an account"}
            </Button>
            <SignInWithGoogleButton />
          </div>
        </form>
        <div className="mt-6 text-center text-sm">
          Already have an account?{" "}
          <Link href="/login" className="underline">
            Sign in
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
