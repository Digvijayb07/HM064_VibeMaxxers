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

import SignInWithGoogleButton from "./SignInWithGoogleButton";
import SignInWithGithubButton from "./SignInWithGithubButton";

export default function AuthPage() {
  return (
    <div className="min-h-screen flex">
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
            <div className="flex h-10 w-10 items-center justify-center rounded-xl gradient-primary shadow-soft">
              <FolderKanban className="h-5 w-5 text-white" />
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
              Continue with Google or GitHub to get started
            </p>
          </div>

          {/* Auth Card */}
          <Card className="shadow-soft-lg">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-medium">
                Sign in to TalentHub
              </CardTitle>
              <CardDescription>
                We’ll guide you through setup after login
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-4">
              <SignInWithGoogleButton />
              <SignInWithGithubButton />

              <p className="text-xs text-center text-muted-foreground">
                No signup forms. No passwords. Secure OAuth only.
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* RIGHT — MARKETING */}
      <div className="hidden lg:flex flex-1 items-center justify-center gradient-primary px-12">
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.15 }}
          className="max-w-md text-white space-y-6"
        >
          <h2 className="text-3xl font-semibold leading-tight">
            Connect talent <br /> with opportunity
          </h2>

          <p className="text-white/80 text-lg">
            TalentHub helps companies collaborate with skilled developers
            through transparent, project-based workflows.
          </p>

          <div className="flex items-center gap-6 pt-4">
            <div>
              <p className="text-3xl font-bold">500+</p>
              <p className="text-sm text-white/70">Projects Posted</p>
            </div>

            <div className="w-px h-12 bg-white/20" />

            <div>
              <p className="text-3xl font-bold">2.5k+</p>
              <p className="text-sm text-white/70">Developers</p>
            </div>

            <div className="w-px h-12 bg-white/20" />

            <div>
              <p className="text-3xl font-bold">98%</p>
              <p className="text-sm text-white/70">Success Rate</p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
