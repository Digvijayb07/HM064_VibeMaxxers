"use client";

import { Suspense, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
    Loader2,
    ExternalLink,
    Star,
    Award,
    MessageSquare,
    Calendar,
} from "lucide-react";
import Link from "next/link";
import { createClient } from "@/utils/supabase/client";
import { rateSubmission, selectWinner } from "@/lib/submission-actions";
import { toast } from "sonner";
import type { Submission } from "@/lib/types";

function SubmissionsContent() {
    const [submissions, setSubmissions] = useState<Submission[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [processingId, setProcessingId] = useState<string | null>(null);
    const [ratingData, setRatingData] = useState<{
        [key: string]: { rating: number; feedback: string };
    }>({});

    useEffect(() => {
        fetchSubmissions();
    }, []);

    const fetchSubmissions = async () => {
        const supabase = createClient();

        const {
            data: { user },
        } = await supabase.auth.getUser();

        if (user) {
            // Get all submissions for projects owned by this company
            const { data, error } = await supabase
                .from("submissions")
                .select(
                    `
          *,
          project:projects!inner(id, title, company_id)
        `
                )
                .eq("project.company_id", user.id)
                .order("created_at", { ascending: false });

            if (error) {
                console.error("Error fetching submissions:", error);
                toast.error("Failed to load submissions");
            } else if (data) {
                setSubmissions(data);

                // Initialize rating data
                const initialRatings: { [key: string]: { rating: number; feedback: string } } = {};
                data.forEach((sub) => {
                    initialRatings[sub.id] = {
                        rating: sub.rating || 0,
                        feedback: sub.feedback || "",
                    };
                });
                setRatingData(initialRatings);
            }
        }

        setIsLoading(false);
    };

    const handleRateSubmission = async (submissionId: string) => {
        const data = ratingData[submissionId];

        if (!data || data.rating === 0) {
            toast.error("Please select a rating");
            return;
        }

        setProcessingId(submissionId);

        const result = await rateSubmission(
            submissionId,
            data.rating,
            data.feedback
        );

        if (result.success) {
            toast.success("Rating submitted successfully!");
            await fetchSubmissions();
        } else {
            toast.error(result.error || "Failed to submit rating");
        }

        setProcessingId(null);
    };

    const handleSelectWinner = async (submissionId: string) => {
        if (!confirm("Are you sure you want to select this submission as the winner? This will reject all other submissions for this project.")) {
            return;
        }

        setProcessingId(submissionId);

        const result = await selectWinner(submissionId);

        if (result.success) {
            toast.success("Winner selected successfully!");
            await fetchSubmissions();
        } else {
            toast.error(result.error || "Failed to select winner");
        }

        setProcessingId(null);
    };

    const getStatusColor = (status: string) => {
        const colors: Record<string, string> = {
            submitted: "bg-blue-50 text-blue-700 border-blue-200",
            selected: "bg-green-50 text-green-700 border-green-200",
            rejected: "bg-red-50 text-red-700 border-red-200",
        };
        return colors[status] || colors.submitted;
    };

    const renderStarRating = (submissionId: string) => {
        const currentRating = ratingData[submissionId]?.rating || 0;

        return (
            <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                    <button
                        key={star}
                        type="button"
                        onClick={() =>
                            setRatingData({
                                ...ratingData,
                                [submissionId]: {
                                    ...ratingData[submissionId],
                                    rating: star,
                                },
                            })
                        }
                        className="focus:outline-none"
                    >
                        <Star
                            className={`h-6 w-6 ${star <= currentRating
                                    ? "fill-yellow-400 text-yellow-400"
                                    : "text-gray-300"
                                }`}
                        />
                    </button>
                ))}
            </div>
        );
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
                            <Link href="/company/dashboard">
                                <Button
                                    variant="ghost"
                                    className="text-muted-foreground hover:text-foreground"
                                >
                                    Dashboard
                                </Button>
                            </Link>
                            <Link href="/company/projects">
                                <Button
                                    variant="ghost"
                                    className="text-muted-foreground hover:text-foreground"
                                >
                                    Projects
                                </Button>
                            </Link>
                            <Link href="/company/applications">
                                <Button
                                    variant="ghost"
                                    className="text-muted-foreground hover:text-foreground"
                                >
                                    Applications
                                </Button>
                            </Link>
                        </div>
                    </div>
                </div>
            </header>

            <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                {/* Page Title */}
                <div className="mb-8">
                    <h2 className="text-3xl font-bold text-foreground">
                        Design Submissions
                    </h2>
                    <p className="mt-2 text-muted-foreground">
                        Review and rate submissions from shortlisted developers
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
                        {submissions.map((submission) => {
                            const isProcessing = processingId === submission.id;

                            return (
                                <Card
                                    key={submission.id}
                                    className={`p-6 ${submission.status === "selected"
                                            ? "border-green-300 bg-green-50/50"
                                            : ""
                                        }`}
                                >
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3 mb-2">
                                                <h3 className="text-xl font-bold text-foreground">
                                                    {submission.title}
                                                </h3>
                                                <Badge
                                                    className={`${getStatusColor(submission.status)} capitalize`}
                                                >
                                                    {submission.status === "selected" && (
                                                        <Award className="h-3 w-3 mr-1" />
                                                    )}
                                                    {submission.status}
                                                </Badge>
                                            </div>
                                            <p className="text-sm text-muted-foreground">
                                                Project: {submission.project?.title}
                                            </p>
                                            <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                                                <Calendar className="h-3 w-3" />
                                                Submitted: {new Date(submission.submitted_at).toLocaleDateString()}
                                            </p>
                                        </div>
                                    </div>

                                    {submission.description && (
                                        <div className="mb-4">
                                            <p className="text-sm font-semibold text-foreground mb-1">
                                                Description:
                                            </p>
                                            <p className="text-foreground">{submission.description}</p>
                                        </div>
                                    )}

                                    {/* Submission Links */}
                                    <div className="mb-4">
                                        <p className="text-sm font-semibold text-foreground mb-2">
                                            Design Links:
                                        </p>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                            {submission.submission_links.map((link, index) => (
                                                <a
                                                    key={index}
                                                    href={link.url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="flex items-center gap-2 p-3 bg-muted hover:bg-muted/80 rounded transition-colors"
                                                >
                                                    <span className="text-xs font-semibold uppercase text-muted-foreground px-2 py-1 bg-background rounded">
                                                        {link.type}
                                                    </span>
                                                    <span className="text-sm font-medium flex-1">
                                                        {link.label}
                                                    </span>
                                                    <ExternalLink className="h-4 w-4 text-blue-600" />
                                                </a>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Rating Section */}
                                    {submission.status !== "selected" && (
                                        <div className="border-t border-border pt-4 mt-4">
                                            <div className="space-y-4">
                                                <div>
                                                    <Label className="text-sm font-semibold mb-2 flex items-center gap-2">
                                                        <Star className="h-4 w-4" />
                                                        Rate this submission
                                                    </Label>
                                                    {renderStarRating(submission.id)}
                                                </div>

                                                <div>
                                                    <Label htmlFor={`feedback-${submission.id}`} className="text-sm font-semibold mb-2 flex items-center gap-2">
                                                        <MessageSquare className="h-4 w-4" />
                                                        Feedback (optional)
                                                    </Label>
                                                    <Textarea
                                                        id={`feedback-${submission.id}`}
                                                        placeholder="Provide feedback to the developer..."
                                                        value={ratingData[submission.id]?.feedback || ""}
                                                        onChange={(e) =>
                                                            setRatingData({
                                                                ...ratingData,
                                                                [submission.id]: {
                                                                    ...ratingData[submission.id],
                                                                    rating: ratingData[submission.id]?.rating || 0,
                                                                    feedback: e.target.value,
                                                                },
                                                            })
                                                        }
                                                        rows={3}
                                                        className="resize-none"
                                                    />
                                                </div>

                                                <div className="flex gap-2">
                                                    <Button
                                                        onClick={() => handleRateSubmission(submission.id)}
                                                        disabled={isProcessing || !ratingData[submission.id]?.rating}
                                                        size="sm"
                                                        variant="outline"
                                                    >
                                                        {isProcessing ? (
                                                            <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                                        ) : (
                                                            <Star className="h-4 w-4 mr-2" />
                                                        )}
                                                        Submit Rating
                                                    </Button>
                                                    <Button
                                                        onClick={() => handleSelectWinner(submission.id)}
                                                        disabled={isProcessing}
                                                        size="sm"
                                                        className="bg-green-600 hover:bg-green-700"
                                                    >
                                                        {isProcessing ? (
                                                            <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                                        ) : (
                                                            <Award className="h-4 w-4 mr-2" />
                                                        )}
                                                        Select as Winner
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Display existing rating and feedback */}
                                    {(submission.rating || submission.feedback) && (
                                        <div className="border-t border-border pt-4 mt-4">
                                            <div className="space-y-2">
                                                {submission.rating && (
                                                    <div>
                                                        <p className="text-sm font-semibold text-foreground mb-1">
                                                            Your Rating:
                                                        </p>
                                                        <div className="flex gap-1">
                                                            {[1, 2, 3, 4, 5].map((star) => (
                                                                <Star
                                                                    key={star}
                                                                    className={`h-5 w-5 ${star <= submission.rating!
                                                                            ? "fill-yellow-400 text-yellow-400"
                                                                            : "text-gray-300"
                                                                        }`}
                                                                />
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}
                                                {submission.feedback && (
                                                    <div>
                                                        <p className="text-sm font-semibold text-foreground mb-1">
                                                            Your Feedback:
                                                        </p>
                                                        <p className="text-sm text-foreground p-3 bg-muted rounded">
                                                            {submission.feedback}
                                                        </p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}

                                    {/* Winner Badge */}
                                    {submission.status === "selected" && (
                                        <div className="mt-4 p-4 bg-green-100 dark:bg-green-950 rounded-lg border border-green-300 dark:border-green-800">
                                            <p className="text-sm font-semibold text-green-900 dark:text-green-100 flex items-center gap-2">
                                                <Award className="h-5 w-5" />
                                                Selected as Winner
                                            </p>
                                        </div>
                                    )}
                                </Card>
                            );
                        })}
                    </div>
                ) : (
                    <Card className="p-12 text-center">
                        <p className="text-muted-foreground mb-4">
                            No submissions yet. Shortlist developers to receive submissions.
                        </p>
                        <Link href="/company/applications">
                            <Button>View Applications</Button>
                        </Link>
                    </Card>
                )}
            </div>
        </div>
    );
}

export default function CompanySubmissionsPage() {
    return (
        <Suspense fallback={null}>
            <SubmissionsContent />
        </Suspense>
    );
}
