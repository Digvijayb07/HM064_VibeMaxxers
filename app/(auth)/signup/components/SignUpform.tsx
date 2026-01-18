"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import SignInWithGoogleButton from "../../signin/components/SignInWithGoogleButton";
import SignInWithGithubButton from "../../signin/components/SignInWithGithubButton";

export function SignUpForm() {
  return (
    <Card className="mx-auto max-w-lg shadow-lg">
      <CardHeader className="px-8 pt-8 pb-6 text-center">
        <CardTitle className="text-xl">Create your account</CardTitle>
        <CardDescription>
          Join the platform to collaborate on real projects
        </CardDescription>
      </CardHeader>

      <CardContent className="px-8 pb-8">
        <div className="space-y-4">
          <SignInWithGoogleButton />
          <SignInWithGithubButton />

          <p className="text-xs text-center text-muted-foreground">
            By continuing, you agree to our Terms of Service and Privacy Policy
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
