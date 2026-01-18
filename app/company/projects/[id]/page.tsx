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
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
      {/* HEADER */}
      <header className="sticky top-0 z-50 backdrop-blur bg-white/70 border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <Link
            href="/company/dashboard"
            className="flex items-center gap-2 text-sm font-medium"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Link>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8 space-y-8">
        {/* PROJECT INFO */}
        <Card className="p-6">
          <div className="flex justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold">{project.title}</h1>
              <p className="text-muted-foreground mt-1">
                {project.description}
              </p>
            </div>
            <Badge className="bg-emerald-500/20 text-emerald-700 capitalize">
              {project.status}
            </Badge>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 border-t pt-4">
            <Stat icon={DollarSign} label="Budget" value={`$${project.budget}`} />
            <Stat icon={Clock} label="Duration" value={project.duration} />
            <Stat icon={Users} label="Applicants" value={applications.length} />
            <Stat icon={Briefcase} label="Level" value={project.level} />
          </div>
        </Card>

        {/* APPLICATIONS */}
        <Card className="p-6">
          <h2 className="text-2xl font-bold mb-6">
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
                  className="p-6 border rounded-lg hover:shadow-md transition"
                >
                  <div className="flex justify-between mb-3">
                    <div>
                      <h4 className="font-semibold">
                        {app.freelancerName}
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        Applied on {app.submittedAt}
                      </p>
                    </div>
                    <Badge className="capitalize">{getStatus(app)}</Badge>
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
                      className="bg-purple-600 hover:bg-purple-700 text-white"
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
      <p className="text-xs text-muted-foreground flex items-center gap-1">
        <Icon className="h-4 w-4" />
        {label}
      </p>
      <p className="text-lg font-bold">{value}</p>
    </div>
  );
}
