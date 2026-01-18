"use client";

import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import SignInWithGoogleButton from "./SignInWithGoogleButton";
import SignInWithGithubButton from "./SignInWithGithubButton";

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <Card className={cn("shadow-lg w-full mx-auto", className)} {...props}>
      <CardContent className="p-6">
        <div className="flex flex-col items-center gap-2 text-center mb-6">
          <h1 className="text-2xl font-bold">Welcome back</h1>
          <p className="text-muted-foreground text-sm">
            Continue using one of the providers below
          </p>
        </div>

        <div className="space-y-3">
          <SignInWithGoogleButton />
          <SignInWithGithubButton />
        </div>

        <div className="text-center text-sm text-muted-foreground mt-6">
          By continuing, you agree to our Terms and Privacy Policy
        </div>
      </CardContent>
    </Card>
  );
}
