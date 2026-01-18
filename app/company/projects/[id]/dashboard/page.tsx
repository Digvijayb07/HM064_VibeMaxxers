"use client";

import { Suspense, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
    Loader2,
    Users,
    FileText,
    CheckCircle,
    Award,
    DollarSign,
    Calendar,
    ArrowLeft,
} from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";

interface ProjectStats {
    total_applications: number;
    shortlisted_count: number;
    submitted_count: number;
    rejected_count: number;
    submissions_count: number;
    winner_selected: boolean;
    avg_rating?: number;
    total_compensation: number;
}

function DashboardContent() {
    const params = useParams();
    const router = useRouter();
    const projectId = params.id as string;

    const [project, setProject] = useState<any>(null);
    const [stats, setStats] = useState<ProjectStats | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [recentApplications, setRecentApplications] = useState<any[]>([]);
    const [recentSubmissions, setRecentSubmissions] = useState<any[]>([]);

    useEffect(() => {
        fetchDashboardData();
    }, [projectId]);

    const fetchDashboardData = async () => {
        const supabase = createClient();

        // Fetch project details
        const { data: projectData } = await supabase
            .from("projects")
            .select("*")
            .eq("id", projectId)
            .single();

        if (projectData) {
            setProject(projectData);
        }

        // Fetch applications stats
        const { data: applications } = await supabase
            .from("applications")
            .select("*")
            .eq("project_id", projectId);

        // Fetch submissions stats
        const { data: submissions } = await supabase
            .from("submissions")
            .select("*")
            .eq("project_id", projectId);

        // Fetch compensations
        const { data: compensations } = await supabase
            .from("compensations")
            .select("amount")
            .eq("project_id", projectId);

        if (applications) {
            const stats: ProjectStats = {
                total_applications: applications.length,
                shortlisted_count: applications.filter((a) => a.status === "shortlisted").length,
                submitted_count: applications.filter((a) => a.status === "submitted").length,
                rejected_count: applications.filter((a) => a.status === "rejected").length,
                submissions_count: submissions?.length || 0,
                winner_selected: submissions?.some((s) => s.status === "selected") || false,
                avg_rating: submissions && submissions.length > 0
                    ? submissions.reduce((sum, s) => sum + (s.rating || 0), 0) / submissions.filter(s => s.rating).length
                    : undefined,
                total_compensation: compensations?.reduce((sum, c) => sum + Number(c.amount), 0) || 0,
            };
            setStats(stats);

            // Get recent applications
            setRecentApplications(applications.slice(0, 5));
        }

        // Get recent submissions
        if (submissions) {
            setRecentSubmissions(submissions.slice(0, 5));
        }

        setIsLoading(false);
    };

    const getStatusColor = (status: string) => {
        const colors: Record<string, string> = {
            submitted: "bg-blue-50 text-blue-700 border-blue-200",
            shortlisted: "bg-green-50 text-green-700 border-green-200",
            rejected: "bg-red-50 text-red-700 border-red-200",
            awarded: "bg-purple-50 text-purple-700 border-purple-200",
            selected: "bg-green-50 text-green-700 border-green-200",
        };
        return colors[status] || colors.submitted;
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
                                <Button variant="ghost" className="text-muted-foreground hover:text-foreground">
                                    Dashboard
                                </Button>
                            </Link>
                            <Link href="/company/projects">
                                <Button variant="ghost" className="text-muted-foreground hover:text-foreground">
                                    Projects
                                </Button>
                            </Link>
                        </div>
                    </div>
                </div>
            </header>

            <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                {/* Back Button */}
                <Button
                    variant="ghost"
                    onClick={() => router.back()}
                    className="mb-4"
                >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back
                </Button>

                {isLoading ? (
                    <Card className="p-12 text-center">
                        <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-muted-foreground" />
                        <p className="text-muted-foreground">Loading dashboard...</p>
                    </Card>
                ) : (
                    <>
                        {/* Project Header */}
                        <div className="mb-8">
                            <h2 className="text-3xl font-bold text-foreground">
                                {project?.title}
                            </h2>
                            <p className="mt-2 text-muted-foreground">
                                {project?.description}
                            </p>
                            <div className="flex gap-4 mt-4">
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <DollarSign className="h-4 w-4" />
                                    Budget: ${project?.budget?.toLocaleString()}
                                </div>
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <Calendar className="h-4 w-4" />
                                    Created: {new Date(project?.created_at).toLocaleDateString()}
                                </div>
                            </div>
                        </div>

                        {/* Stats Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                            <Card className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-muted-foreground">Total Applications</p>
                                        <p className="text-3xl font-bold text-foreground mt-1">
                                            {stats?.total_applications || 0}
                                        </p>
                                    </div>
                                    <Users className="h-8 w-8 text-muted-foreground" />
                                </div>
                            </Card>

                            <Card className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-muted-foreground">Shortlisted</p>
                                        <p className="text-3xl font-bold text-green-600 mt-1">
                                            {stats?.shortlisted_count || 0}
                                        </p>
                                    </div>
                                    <CheckCircle className="h-8 w-8 text-green-600" />
                                </div>
                            </Card>

                            <Card className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-muted-foreground">Submissions</p>
                                        <p className="text-3xl font-bold text-blue-600 mt-1">
                                            {stats?.submissions_count || 0}
                                        </p>
                                    </div>
                                    <FileText className="h-8 w-8 text-blue-600" />
                                </div>
                            </Card>

                            <Card className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-muted-foreground">Winner Selected</p>
                                        <p className="text-3xl font-bold text-purple-600 mt-1">
                                            {stats?.winner_selected ? "Yes" : "No"}
                                        </p>
                                    </div>
                                    <Award className="h-8 w-8 text-purple-600" />
                                </div>
                            </Card>
                        </div>

                        {/* Additional Stats */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                            <Card className="p-6">
                                <h3 className="text-lg font-semibold text-foreground mb-4">
                                    Application Breakdown
                                </h3>
                                <div className="space-y-3">
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-muted-foreground">Submitted</span>
                                        <Badge className={getStatusColor("submitted")}>
                                            {stats?.submitted_count || 0}
                                        </Badge>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-muted-foreground">Shortlisted</span>
                                        <Badge className={getStatusColor("shortlisted")}>
                                            {stats?.shortlisted_count || 0}
                                        </Badge>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-muted-foreground">Rejected</span>
                                        <Badge className={getStatusColor("rejected")}>
                                            {stats?.rejected_count || 0}
                                        </Badge>
                                    </div>
                                </div>
                            </Card>

                            <Card className="p-6">
                                <h3 className="text-lg font-semibold text-foreground mb-4">
                                    Financial Overview
                                </h3>
                                <div className="space-y-3">
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-muted-foreground">Project Budget</span>
                                        <span className="font-semibold text-foreground">
                                            ${project?.budget?.toLocaleString()}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-muted-foreground">Total Compensation</span>
                                        <span className="font-semibold text-foreground">
                                            ${stats?.total_compensation.toFixed(2)}
                                        </span>
                                    </div>
                                    {stats?.avg_rating && (
                                        <div className="flex justify-between items-center">
                                            <span className="text-sm text-muted-foreground">Avg Rating</span>
                                            <span className="font-semibold text-foreground">
                                                {stats.avg_rating.toFixed(1)} / 5.0
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </Card>
                        </div>

                        {/* Quick Links */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <Link href={`/company/applications?project=${projectId}`}>
                                <Card className="p-6 hover:shadow-md transition-all cursor-pointer">
                                    <div className="flex items-center gap-3">
                                        <Users className="h-6 w-6 text-primary" />
                                        <div>
                                            <h3 className="font-semibold text-foreground">View Applications</h3>
                                            <p className="text-sm text-muted-foreground">
                                                Manage all applications
                                            </p>
                                        </div>
                                    </div>
                                </Card>
                            </Link>

                            <Link href={`/company/submissions?project=${projectId}`}>
                                <Card className="p-6 hover:shadow-md transition-all cursor-pointer">
                                    <div className="flex items-center gap-3">
                                        <FileText className="h-6 w-6 text-primary" />
                                        <div>
                                            <h3 className="font-semibold text-foreground">View Submissions</h3>
                                            <p className="text-sm text-muted-foreground">
                                                Review design submissions
                                            </p>
                                        </div>
                                    </div>
                                </Card>
                            </Link>

                            <Link href="/company/compensations">
                                <Card className="p-6 hover:shadow-md transition-all cursor-pointer">
                                    <div className="flex items-center gap-3">
                                        <DollarSign className="h-6 w-6 text-primary" />
                                        <div>
                                            <h3 className="font-semibold text-foreground">Manage Payments</h3>
                                            <p className="text-sm text-muted-foreground">
                                                Handle compensations
                                            </p>
                                        </div>
                                    </div>
                                </Card>
                            </Link>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}

export default function ProjectDashboardPage() {
    return (
        <Suspense fallback={null}>
            <DashboardContent />
        </Suspense>
    );
}
