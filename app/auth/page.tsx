"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import SignInWithGoogleButton from "@/app/(auth)/signin/components/SignInWithGoogleButton";
import SignInWithGithubButton from "@/app/(auth)/signin/components/SignInWithGithubButton";

export default function AuthPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">
            Welcome to TalentHub
          </CardTitle>
          <CardDescription className="mt-1">
            Continue with Google or GitHub to get started
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          <SignInWithGoogleButton />
          <SignInWithGithubButton />

          <p className="text-xs text-center text-muted-foreground">
            No signup required. We’ll guide you after login.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
