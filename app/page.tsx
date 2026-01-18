"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Briefcase, Code2 } from "lucide-react";
import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold text-lg">
              T
            </div>
            <h1 className="text-2xl font-bold text-foreground">TalentHub</h1>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-4xl font-bold text-foreground sm:text-5xl">
            Connect with Top Talent
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
            A modern marketplace connecting companies with skilled developers and
            designers for project-based opportunities. Post projects, receive
            proposals, and build amazing things together.
          </p>
        </div>

        {/* Entry Cards */}
        <div className="mt-16 grid grid-cols-1 gap-6 md:grid-cols-2">
          {/* Company */}
          <Card className="relative overflow-hidden p-8 border-2 hover:shadow-xl transition-all">
            <Briefcase className="h-12 w-12 text-primary mb-4" />
            <h3 className="text-2xl font-bold text-foreground mb-2">
              For Companies
            </h3>
            <p className="text-muted-foreground mb-6">
              Post your project requirements and connect with talented
              professionals
            </p>
            <ul className="space-y-3 mb-8">
              <li className="text-sm text-foreground">
                • Post unlimited projects
              </li>
              <li className="text-sm text-foreground">
                • Review proposals from top talent
              </li>
              <li className="text-sm text-foreground">
                • Fair and transparent selection process
              </li>
            </ul>
            <Link href="/auth">
              <Button className="w-full bg-primary hover:bg-primary/90">
                Get Started as Company
              </Button>
            </Link>
          </Card>

          {/* Freelancer */}
          <Card className="relative overflow-hidden p-8 border-2 hover:shadow-xl transition-all">
            <Code2 className="h-12 w-12 text-accent mb-4" />
            <h3 className="text-2xl font-bold text-foreground mb-2">
              For Freelancers
            </h3>
            <p className="text-muted-foreground mb-6">
              Browse opportunities and showcase your skills to land amazing
              projects
            </p>
            <ul className="space-y-3 mb-8">
              <li className="text-sm text-foreground">
                • Browse vetted projects
              </li>
              <li className="text-sm text-foreground">
                • Submit competitive proposals
              </li>
              <li className="text-sm text-foreground">
                • Build your professional portfolio
              </li>
            </ul>
            <Link href="/auth">
              <Button className="w-full bg-accent hover:bg-accent/90">
                Start Freelancing
              </Button>
            </Link>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-card mt-20">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <p className="text-center text-sm text-muted-foreground">
            © 2025 TalentHub. Connecting talent with opportunity.
          </p>
        </div>
      </footer>
    </div>
  );
}
