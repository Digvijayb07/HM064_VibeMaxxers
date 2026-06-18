"use client";

import Link from "next/link";
import { useState } from "react";
import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { login } from "@/lib/auth-actions";
import SignInWithGoogleButton from "./SignInWithGoogleButton";
import SignInWithGithubButton from "./SignInWithGithubButton";

export function SignInForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (formData: FormData) => {
    setIsLoading(true);
    setError(null);

    try {
      await login(formData);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to sign in");
      setIsLoading(false);
    }
  };

  return (
    <div className="grid gap-6">
      <form action={handleSubmit}>
        <div className="grid gap-4">
          {error ? (
            <div className="p-3 text-sm text-red-600 bg-red-50/5 border border-red-500/15 rounded-md font-mono">
              {error === "Invalid credentials" ? "Invalid email or password" : error}
            </div>
          ) : null}

          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input
              name="email"
              id="email"
              type="email"
              placeholder="m@example.com"
              required
              disabled={isLoading}
            />
          </div>

          <div className="grid gap-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password">Password</Label>
            </div>
            <Input
              name="password"
              id="password"
              type="password"
              required
              disabled={isLoading}
            />
          </div>

          <Button type="submit" className="w-full mt-2" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Signing in…
              </>
            ) : (
              "Sign In"
            )}
          </Button>
        </div>
      </form>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-card px-2 text-muted-foreground">
            Or continue with
          </span>
        </div>
      </div>

      <div className="grid gap-3">
        <SignInWithGoogleButton />
        <SignInWithGithubButton />
      </div>

      <div className="text-center text-sm text-gray-500">
        Don't have an account?{" "}
        <Link href="/signup" className="underline hover:text-primary transition-colors">
          Sign up
        </Link>
      </div>
    </div>
  );
}
