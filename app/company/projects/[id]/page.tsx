"use client";

import { useState, use } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  Briefcase,
  Users,
  Clock,
  DollarSign,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import Link from "next/link";
import { mockProjects, mockApplications } from "@/lib/mock-data";

export default function ProjectDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  // ✅ UNWRAP PARAMS
  const { id } = use(params);

  const project = mockProjects.find((p) => p.id === id);
  const applications = mockApplications.filter(
    (a) => a.projectId === id
  );

  const [applicationStatuses, setApplicationStatuses] = useState<
    Record<string, string>
  >({});

  if (!project) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-4xl mx-auto py-20 text-center">
          <p className="text-muted-foreground">Project not found</p>
        </div>
      </div>
    );
  }

  const updateStatus = (appId: string, status: string) => {
    setApplicationStatuses((prev) => ({
      ...prev,
      [appId]: status,
    }));
  };

  const getStatus = (app: (typeof mockApplications)[0]) =>
    applicationStatuses[app.id] || app.status;

  return (
    <div className="min-h-screen bg-background bg-grid-pattern bg-blueprint-glow">
      {/* HEADER */}
      <header className="sticky top-0 z-50 backdrop-blur bg-card/70 border-b border-border">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <Link
            href="/company/dashboard"
            className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Link>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8 space-y-8">
        {/* PROJECT INFO */}
        <Card className="p-6 border border-border bg-card card-telemetry">
          <div className="flex justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold font-sans tracking-tight">{project.title}</h1>
              <p className="text-muted-foreground mt-1">
                {project.description}
              </p>
            </div>
            <Badge className="bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 dark:text-emerald-400 font-mono capitalize">
              {project.status}
            </Badge>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 border-t border-border pt-4">
            <Stat icon={DollarSign} label="Budget" value={`$${project.budget}`} />
            <Stat icon={Clock} label="Duration" value={project.duration} />
            <Stat icon={Users} label="Applicants" value={applications.length} />
            <Stat icon={Briefcase} label="Level" value={project.level} />
          </div>
        </Card>

        {/* APPLICATIONS */}
        <Card className="p-6 border border-border bg-card card-telemetry">
          <h2 className="text-2xl font-bold mb-6 font-sans tracking-tight">
            Applications ({applications.length})
          </h2>

          {applications.length === 0 ? (
            <p className="text-muted-foreground text-center py-10">
              No applications yet
            </p>
          ) : (
            <div className="space-y-4">
              {applications.map((app) => (
                <div
                  key={app.id}
                  className="p-6 border border-border bg-card rounded-lg hover:border-primary/50 transition-colors card-telemetry"
                >
                  <div className="flex justify-between mb-3">
                    <div>
                      <h4 className="font-semibold font-sans">
                        {app.freelancerName}
                      </h4>
                      <p className="text-sm text-muted-foreground font-mono">
                        Applied on {app.submittedAt}
                      </p>
                    </div>
                    <Badge className="bg-cyan-500/10 text-cyan-600 border border-cyan-500/20 dark:text-cyan-400 font-mono capitalize">{getStatus(app)}</Badge>
                  </div>

                  <p className="mb-4">{app.coverLetter}</p>

                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() =>
                        updateStatus(app.id, "shortlisted")
                      }
                    >
                      <CheckCircle2 className="h-4 w-4 mr-1" />
                      Shortlist
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() =>
                        updateStatus(app.id, "rejected")
                      }
                    >
                      <XCircle className="h-4 w-4 mr-1" />
                      Reject
                    </Button>
                    <Button
                      size="sm"
                      className="bg-primary text-primary-foreground hover:bg-primary/95 shadow-sm"
                      onClick={() =>
                        updateStatus(app.id, "awarded")
                      }
                    >
                      Award
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </main>
    </div>
  );
}

/* Small stat helper */
function Stat({
  icon: Icon,
  label,
  value,
}: {
  icon: any;
  label: string;
  value: string | number;
}) {
  return (
    <div>
      <p className="text-xs text-muted-foreground flex items-center gap-1 uppercase tracking-wider font-mono">
        <Icon className="h-4 w-4" />
        {label}
      </p>
      <p className="text-lg font-bold font-mono mt-0.5">{value}</p>
    </div>
  );
}
