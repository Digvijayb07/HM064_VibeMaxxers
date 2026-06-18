"use client";

import { motion } from "framer-motion";
import { FolderKanban } from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { SignInForm } from "@/app/(auth)/signin/components/SignInForm";

export default function AuthPage() {
  return (
    <div className="min-h-screen flex bg-background text-foreground bg-grid-pattern/5 bg-blueprint-glow">
      {/* LEFT — AUTH */}
      <div className="flex flex-1 items-center justify-center px-6">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-md space-y-8"
        >
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary text-primary-foreground">
              <FolderKanban className="h-5 w-5" />
            </div>
            <span className="text-xl font-semibold tracking-tight">
              TalentHub
            </span>
          </div>

          {/* Header */}
          <div className="space-y-2">
            <h1 className="text-2xl font-semibold tracking-tight">
              Welcome back
            </h1>
            <p className="text-muted-foreground">
              Sign in with your email or continue with social accounts
            </p>
          </div>

          {/* Auth Card */}
          <Card className="border border-border bg-card card-telemetry">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-medium">
                Sign in to TalentHub
              </CardTitle>
              <CardDescription className="text-muted-foreground">
                Enter your credentials to access your dashboard
              </CardDescription>
            </CardHeader>

            <CardContent>
              <SignInForm />
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* RIGHT — MARKETING */}
      <div className="hidden lg:flex flex-1 items-center justify-center bg-card border-l border-border bg-grid-pattern/10 px-12 relative overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.15 }}
          className="max-w-md text-foreground space-y-6 relative z-10"
        >
          <h2 className="text-3xl font-semibold leading-tight tracking-tight font-sans">
            Connect talent <br /> with opportunity
          </h2>

          <p className="text-muted-foreground text-lg leading-relaxed">
            TalentHub helps companies collaborate with skilled developers
            through transparent, project-based workflows.
          </p>

          {/* Stats */}
          <div className="flex items-center gap-6 pt-4 font-mono">
            <div>
              <p className="text-3xl font-bold text-primary">500+</p>
              <p className="text-xs text-muted-foreground uppercase tracking-wider font-mono">Projects Posted</p>
            </div>

            <div className="w-px h-12 bg-border/20" />

            <div>
              <p className="text-3xl font-bold text-primary">2.5k+</p>
              <p className="text-xs text-muted-foreground uppercase tracking-wider font-mono">Developers</p>
            </div>

            <div className="w-px h-12 bg-border/20" />

            <div>
              <p className="text-3xl font-bold text-primary">98%</p>
              <p className="text-xs text-muted-foreground uppercase tracking-wider font-mono">Success Rate</p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
