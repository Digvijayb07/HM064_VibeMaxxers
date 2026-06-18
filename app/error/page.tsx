"use client";

import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { AlertTriangle, ArrowLeft } from "lucide-react";
import { Suspense } from "react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

function ErrorContent() {
  const searchParams = useSearchParams();
  const errorMsg = searchParams.get("error") || "An unexpected error occurred during authentication.";

  return (
    <div className="min-h-screen flex items-center justify-center bg-background bg-grid-pattern/5 p-6">
      <Card className="w-full max-w-md border border-border bg-card card-telemetry">
        <CardHeader className="text-center pb-2">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-500/10 text-red-600 border border-red-500/20 mb-4">
            <AlertTriangle className="h-6 w-6" />
          </div>
          <CardTitle className="text-xl font-bold font-sans tracking-tight">Authentication Error</CardTitle>
          <CardDescription className="text-muted-foreground">
            Something went wrong while processing your request
          </CardDescription>
        </CardHeader>
        <CardContent className="py-4 text-center">
          <div className="p-3 rounded-lg bg-red-500/5 border border-red-500/15 text-sm text-red-600 dark:text-red-400 break-words font-mono">
            {errorMsg}
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-2">
          <Link href="/signin" className="w-full">
            <Button className="w-full bg-primary text-primary-foreground hover:bg-primary/95">
              Back to Sign In
            </Button>
          </Link>
          <Link href="/" className="w-full">
            <Button variant="ghost" className="w-full flex items-center justify-center gap-2 text-muted-foreground hover:text-foreground">
              <ArrowLeft className="h-4 w-4" /> Go to Home
            </Button>
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}

export default function ErrorPage() {
  return (
    <Suspense fallback={null}>
      <ErrorContent />
    </Suspense>
  );
}
