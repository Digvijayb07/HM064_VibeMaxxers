"use client";

import { Suspense, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, ExternalLink, Star, Calendar, Award } from "lucide-react";
import Link from "next/link";
import { createClient } from "@/utils/supabase/client";
import type { Submission } from "@/lib/types";

function SubmissionsContent() {
    const [submissions, setSubmissions] = useState<Submission[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchSubmissions();
    }, []);

    const fetchSubmissions = async () => {
        const supabase = createClient();

        const {
            data: { user },
        } = await supabase.auth.getUser();

        if (user) {
            const { data, error } = await supabase
                .from("submissions")
                .select(
                    `
          *,
          project:projects(id, title, company_id)
        `
                )
                .eq("user_id", user.id)
                .order("created_at", { ascending: false });

            if (error) {
                console.error("Error fetching submissions:", error);
            } else if (data) {
                setSubmissions(data);
            }
        }

        setIsLoading(false);
    };

    const getStatusColor = (status: string) => {
        const colors: Record<string, string> = {
            submitted: "bg-blue-50 text-blue-700 border-blue-200",
            selected: "bg-green-50 text-green-700 border-green-200",
            rejected: "bg-red-50 text-red-700 border-red-200",
        };
        return colors[status] || colors.submitted;
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case "selected":
                return <Award className="h-4 w-4" />;
            default:
                return null;
        }
    };

    const getLinkIcon = (type: string) => {
        return <ExternalLink className="h-3 w-3" />;
    };

    return (
        <div className="min-h-screen bg-background">
            {/* Header */}
            <header className="border-b border-border bg-card sticky top-0 z-50">
                <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold">
                                T
                            </div>
                            <h1 className="text-xl font-bold text-foreground">TalentHub</h1>
                        </div>
                        <div className="flex items-center gap-4">
                            <Link href="/freelancer/dashboard">
                                <Button
                                    variant="ghost"
                                    className="text-muted-foreground hover:text-foreground"
                                >
                                    Dashboard
                                </Button>
                            </Link>
                            <Link href="/freelancer/applications">
                                <Button
                                    variant="ghost"
                                    className="text-muted-foreground hover:text-foreground"
                                >
                                    Applications
                                </Button>
                            </Link>
                            <Link href="/freelancer/projects">
                                <Button
                                    variant="ghost"
                                    className="text-muted-foreground hover:text-foreground"
                                >
                                    Browse Projects
                                </Button>
                            </Link>
                        </div>
                    </div>
                </div>
            </header>

            <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                {/* Page Title */}
                <div className="mb-8">
                    <h2 className="text-3xl font-bold text-foreground">My Submissions</h2>
                    <p className="mt-2 text-muted-foreground">
                        View and manage your design submissions
                    </p>
                </div>

                {/* Submissions List */}
                {isLoading ? (
                    <Card className="p-12 text-center">
                        <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-muted-foreground" />
                        <p className="text-muted-foreground">Loading submissions...</p>
                    </Card>
                ) : submissions.length > 0 ? (
                    <div className="space-y-6">
                        {submissions.map((submission) => (
                            <Card
                                key={submission.id}
                                className={`p-6 hover:shadow-md transition-all ${submission.status === "selected" ? "border-green-300" : ""
                                    }`}
                            >
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-2">
                                            <h3 className="text-xl font-bold text-foreground">
                                                {submission.title}
                                            </h3>
                                            <Badge
                                                className={`${getStatusColor(submission.status)} capitalize text-xs flex items-center gap-1`}
                                            >
                                                {getStatusIcon(submission.status)}
                                                {submission.status}
                                            </Badge>
                                        </div>
                                        <p className="text-sm text-muted-foreground">
                                            {submission.project?.title}
                                        </p>
                                    </div>
                                </div>

                                {submission.description && (
                                    <p className="text-foreground mb-4">{submission.description}</p>
                                )}

                                {/* Submission Links */}
                                <div className="mb-4">
                                    <p className="text-sm font-semibold text-foreground mb-2">
                                        Design Links:
                                    </p>
                                    <div className="space-y-2">
                                        {submission.submission_links.map((link, index) => (
                                            <div
                                                key={index}
                                                className="flex items-center gap-2 p-2 bg-muted rounded"
                                            >
                                                <span className="text-xs font-semibold uppercase text-muted-foreground px-2 py-1 bg-background rounded">
                                                    {link.type}
                                                </span>
                                                <span className="text-sm font-medium flex-1">
                                                    {link.label}
                                                </span>
                                                <a
                                                    href={link.url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-blue-600 hover:text-blue-700 flex items-center gap-1 text-sm"
                                                >
                                                    Open
                                                    {getLinkIcon(link.type)}
                                                </a>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Metadata */}
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 py-4 border-t border-b border-border">
                                    <div>
                                        <p className="text-xs text-muted-foreground">Submitted</p>
                                        <p className="font-semibold text-foreground text-sm">
                                            {new Date(submission.submitted_at).toLocaleDateString()}
                                        </p>
                                    </div>
                                    {submission.deadline && (
                                        <div>
                                            <p className="text-xs text-muted-foreground flex items-center gap-1">
                                                <Calendar className="h-3 w-3" />
                                                Deadline
                                            </p>
                                            <p className="font-semibold text-foreground text-sm">
                                                {new Date(submission.deadline).toLocaleDateString()}
                                            </p>
                                        </div>
                                    )}
                                    {submission.rating && (
                                        <div>
                                            <p className="text-xs text-muted-foreground flex items-center gap-1">
                                                <Star className="h-3 w-3" />
                                                Rating
                                            </p>
                                            <div className="flex items-center gap-1">
                                                <span className="font-semibold text-foreground text-sm">
                                                    {submission.rating}
                                                </span>
                                                <span className="text-xs text-muted-foreground">/5</span>
                                            </div>
                                        </div>
                                    )}
                                    <div>
                                        <p className="text-xs text-muted-foreground">Status</p>
                                        <p className="font-semibold text-foreground text-sm capitalize">
                                            {submission.status}
                                        </p>
                                    </div>
                                </div>

                                {/* Feedback */}
                                {submission.feedback && (
                                    <div className="mt-4 p-4 bg-muted rounded-lg">
                                        <p className="text-sm font-semibold text-foreground mb-2">
                                            Company Feedback:
                                        </p>
                                        <p className="text-sm text-foreground">{submission.feedback}</p>
                                    </div>
                                )}

                                {/* Winner Message */}
                                {submission.status === "selected" && (
                                    <div className="mt-4 p-4 bg-green-50 dark:bg-green-950 rounded-lg border border-green-200 dark:border-green-800">
                                        <p className="text-sm font-semibold text-green-900 dark:text-green-100 flex items-center gap-2">
                                            <Award className="h-5 w-5" />
                                            🎉 Congratulations! Your submission was selected as the winner!
                                        </p>
                                    </div>
                                )}
                            </Card>
                        ))}
                    </div>
                ) : (
                    <Card className="p-12 text-center">
                        <p className="text-muted-foreground mb-4">
                            You haven't submitted any designs yet.
                        </p>
                        <Link href="/freelancer/applications">
                            <Button>View Applications</Button>
                        </Link>
                    </Card>
                )}
            </div>
        </div>
    );
}

export default function FreelancerSubmissionsPage() {
    return (
        <Suspense fallback={null}>
            <SubmissionsContent />
        </Suspense>
    );
}
