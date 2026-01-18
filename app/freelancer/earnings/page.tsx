"use client";

import { Suspense, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, DollarSign, Award, TrendingUp } from "lucide-react";
import Link from "next/link";
import { createClient } from "@/utils/supabase/client";
import type { Compensation } from "@/lib/types";

function EarningsContent() {
    const [compensations, setCompensations] = useState<Compensation[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [stats, setStats] = useState({
        total: 0,
        approved: 0,
        paid: 0,
        pending: 0,
    });

    useEffect(() => {
        fetchEarnings();
    }, []);

    const fetchEarnings = async () => {
        const supabase = createClient();

        const {
            data: { user },
        } = await supabase.auth.getUser();

        if (user) {
            const { data, error } = await supabase
                .from("compensations")
                .select(
                    `
          *,
          submission:submissions(id, title, status),
          project:projects(id, title)
        `
                )
                .eq("user_id", user.id)
                .order("created_at", { ascending: false });

            if (error) {
                console.error("Error fetching earnings:", error);
            } else if (data) {
                setCompensations(data);

                // Calculate stats
                const total = data.reduce((sum, comp) => sum + Number(comp.amount), 0);
                const approved = data
                    .filter((c) => c.status === "approved" || c.status === "paid")
                    .reduce((sum, comp) => sum + Number(comp.amount), 0);
                const paid = data
                    .filter((c) => c.status === "paid")
                    .reduce((sum, comp) => sum + Number(comp.amount), 0);
                const pending = data
                    .filter((c) => c.status === "pending")
                    .reduce((sum, comp) => sum + Number(comp.amount), 0);

                setStats({ total, approved, paid, pending });
            }
        }

        setIsLoading(false);
    };

    const getStatusColor = (status: string) => {
        const colors: Record<string, string> = {
            pending: "bg-yellow-50 text-yellow-700 border-yellow-200",
            approved: "bg-green-50 text-green-700 border-green-200",
            paid: "bg-blue-50 text-blue-700 border-blue-200",
        };
        return colors[status] || colors.pending;
    };

    const getTypeColor = (type: string) => {
        return type === "winner"
            ? "bg-purple-50 text-purple-700 border-purple-200"
            : "bg-gray-50 text-gray-700 border-gray-200";
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
                            <Link href="/freelancer/submissions">
                                <Button
                                    variant="ghost"
                                    className="text-muted-foreground hover:text-foreground"
                                >
                                    Submissions
                                </Button>
                            </Link>
                        </div>
                    </div>
                </div>
            </header>

            <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                {/* Page Title */}
                <div className="mb-8">
                    <h2 className="text-3xl font-bold text-foreground">My Earnings</h2>
                    <p className="mt-2 text-muted-foreground">
                        Track your compensation from projects
                    </p>
                </div>

                {/* Stats Cards */}
                {!isLoading && (
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                        <Card className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-muted-foreground">Total Earnings</p>
                                    <p className="text-2xl font-bold text-foreground mt-1">
                                        ${stats.total.toFixed(2)}
                                    </p>
                                </div>
                                <DollarSign className="h-8 w-8 text-muted-foreground" />
                            </div>
                        </Card>

                        <Card className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-muted-foreground">Approved</p>
                                    <p className="text-2xl font-bold text-green-600 mt-1">
                                        ${stats.approved.toFixed(2)}
                                    </p>
                                </div>
                                <TrendingUp className="h-8 w-8 text-green-600" />
                            </div>
                        </Card>

                        <Card className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-muted-foreground">Paid</p>
                                    <p className="text-2xl font-bold text-blue-600 mt-1">
                                        ${stats.paid.toFixed(2)}
                                    </p>
                                </div>
                                <Award className="h-8 w-8 text-blue-600" />
                            </div>
                        </Card>

                        <Card className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-muted-foreground">Pending</p>
                                    <p className="text-2xl font-bold text-yellow-600 mt-1">
                                        ${stats.pending.toFixed(2)}
                                    </p>
                                </div>
                                <DollarSign className="h-8 w-8 text-yellow-600" />
                            </div>
                        </Card>
                    </div>
                )}

                {/* Earnings List */}
                {isLoading ? (
                    <Card className="p-12 text-center">
                        <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-muted-foreground" />
                        <p className="text-muted-foreground">Loading earnings...</p>
                    </Card>
                ) : compensations.length > 0 ? (
                    <div className="space-y-4">
                        {compensations.map((comp) => (
                            <Card key={comp.id} className="p-6">
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-2">
                                            <h3 className="text-lg font-bold text-foreground">
                                                {comp.submission?.title || "Submission"}
                                            </h3>
                                            <Badge className={`${getTypeColor(comp.type)} capitalize`}>
                                                {comp.type === "winner" && <Award className="h-3 w-3 mr-1" />}
                                                {comp.type}
                                            </Badge>
                                            <Badge className={`${getStatusColor(comp.status)} capitalize`}>
                                                {comp.status}
                                            </Badge>
                                        </div>
                                        <p className="text-sm text-muted-foreground">
                                            Project: {comp.project?.title}
                                        </p>
                                    </div>
                                    <div className="text-right ml-4">
                                        <p className="text-2xl font-bold text-foreground">
                                            ${Number(comp.amount).toFixed(2)}
                                        </p>
                                        <p className="text-xs text-muted-foreground mt-1">
                                            {new Date(comp.created_at).toLocaleDateString()}
                                        </p>
                                    </div>
                                </div>

                                {comp.notes && (
                                    <div className="mt-4 p-3 bg-muted rounded">
                                        <p className="text-sm text-foreground">{comp.notes}</p>
                                    </div>
                                )}

                                {comp.status === "approved" && !comp.paid_at && (
                                    <div className="mt-4 p-3 bg-green-50 dark:bg-green-950 rounded border border-green-200 dark:border-green-800">
                                        <p className="text-sm text-green-900 dark:text-green-100">
                                            ✓ Approved on {new Date(comp.approved_at!).toLocaleDateString()} - Payment processing
                                        </p>
                                    </div>
                                )}

                                {comp.status === "paid" && (
                                    <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-950 rounded border border-blue-200 dark:border-blue-800">
                                        <p className="text-sm text-blue-900 dark:text-blue-100">
                                            💰 Paid on {new Date(comp.paid_at!).toLocaleDateString()}
                                        </p>
                                    </div>
                                )}
                            </Card>
                        ))}
                    </div>
                ) : (
                    <Card className="p-12 text-center">
                        <DollarSign className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                        <p className="text-muted-foreground mb-4">
                            No earnings yet. Keep submitting great designs!
                        </p>
                        <Link href="/freelancer/projects">
                            <Button>Browse Projects</Button>
                        </Link>
                    </Card>
                )}
            </div>
        </div>
    );
}

export default function FreelancerEarningsPage() {
    return (
        <Suspense fallback={null}>
            <EarningsContent />
        </Suspense>
    );
}
