"use client";

import { Suspense, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, DollarSign, CheckCircle, Award, TrendingUp } from "lucide-react";
import Link from "next/link";
import { createClient } from "@/utils/supabase/client";
import { approveCompensations, markAsPaid } from "@/lib/compensation-actions";
import { toast } from "sonner";
import type { Compensation } from "@/lib/types";

function CompensationsContent() {
    const [compensations, setCompensations] = useState<Compensation[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [processingId, setProcessingId] = useState<string | null>(null);
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [stats, setStats] = useState({
        total: 0,
        pending: 0,
        approved: 0,
        paid: 0,
    });

    useEffect(() => {
        fetchCompensations();
    }, []);

    const fetchCompensations = async () => {
        const supabase = createClient();

        const {
            data: { user },
        } = await supabase.auth.getUser();

        if (user) {
            // Get all projects owned by this company
            const { data: projects } = await supabase
                .from("projects")
                .select("id")
                .eq("company_id", user.id);

            if (projects && projects.length > 0) {
                const projectIds = projects.map((p) => p.id);

                const { data, error } = await supabase
                    .from("compensations")
                    .select(
                        `
            *,
            submission:submissions(id, title, status),
            project:projects(id, title),
            user:auth.users(id, email, user_metadata)
          `
                    )
                    .in("project_id", projectIds)
                    .order("created_at", { ascending: false });

                if (error) {
                    console.error("Error fetching compensations:", error);
                    toast.error("Failed to load compensations");
                } else if (data) {
                    setCompensations(data);

                    // Calculate stats
                    const total = data.reduce((sum, comp) => sum + Number(comp.amount), 0);
                    const pending = data
                        .filter((c) => c.status === "pending")
                        .reduce((sum, comp) => sum + Number(comp.amount), 0);
                    const approved = data
                        .filter((c) => c.status === "approved")
                        .reduce((sum, comp) => sum + Number(comp.amount), 0);
                    const paid = data
                        .filter((c) => c.status === "paid")
                        .reduce((sum, comp) => sum + Number(comp.amount), 0);

                    setStats({ total, pending, approved, paid });
                }
            }
        }

        setIsLoading(false);
    };

    const handleApprove = async (compensationId: string) => {
        setProcessingId(compensationId);

        const result = await approveCompensations([compensationId]);

        if (result.success) {
            toast.success("Compensation approved!");
            await fetchCompensations();
        } else {
            toast.error(result.error || "Failed to approve");
        }

        setProcessingId(null);
    };

    const handleBulkApprove = async () => {
        if (selectedIds.length === 0) {
            toast.error("Please select compensations to approve");
            return;
        }

        setProcessingId("bulk");

        const result = await approveCompensations(selectedIds);

        if (result.success) {
            toast.success(`${selectedIds.length} compensations approved!`);
            setSelectedIds([]);
            await fetchCompensations();
        } else {
            toast.error(result.error || "Failed to approve");
        }

        setProcessingId(null);
    };

    const handleMarkPaid = async (compensationId: string) => {
        setProcessingId(compensationId);

        const result = await markAsPaid(compensationId);

        if (result.success) {
            toast.success("Marked as paid!");
            await fetchCompensations();
        } else {
            toast.error(result.error || "Failed to mark as paid");
        }

        setProcessingId(null);
    };

    const toggleSelection = (id: string) => {
        setSelectedIds((prev) =>
            prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
        );
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

    const filterCompensations = (status: string | null) => {
        return status
            ? compensations.filter((c) => c.status === status)
            : compensations;
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
                            <Link href="/company/submissions">
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
                    <h2 className="text-3xl font-bold text-foreground">
                        Compensation Management
                    </h2>
                    <p className="mt-2 text-muted-foreground">
                        Manage payments to developers for their contributions
                    </p>
                </div>

                {/* Stats Cards */}
                {!isLoading && (
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                        <Card className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-muted-foreground">Total Owed</p>
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
                                    <p className="text-sm text-muted-foreground">Pending Approval</p>
                                    <p className="text-2xl font-bold text-yellow-600 mt-1">
                                        ${stats.pending.toFixed(2)}
                                    </p>
                                </div>
                                <TrendingUp className="h-8 w-8 text-yellow-600" />
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
                                <CheckCircle className="h-8 w-8 text-green-600" />
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
                    </div>
                )}

                {/* Bulk Actions */}
                {selectedIds.length > 0 && (
                    <Card className="p-4 mb-6 bg-blue-50 dark:bg-blue-950 border-blue-200">
                        <div className="flex items-center justify-between">
                            <p className="text-sm font-semibold text-blue-900 dark:text-blue-100">
                                {selectedIds.length} compensation{selectedIds.length > 1 ? "s" : ""} selected
                            </p>
                            <div className="flex gap-2">
                                <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => setSelectedIds([])}
                                >
                                    Clear Selection
                                </Button>
                                <Button
                                    size="sm"
                                    onClick={handleBulkApprove}
                                    disabled={processingId === "bulk"}
                                    className="bg-green-600 hover:bg-green-700"
                                >
                                    {processingId === "bulk" ? (
                                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                    ) : (
                                        <CheckCircle className="h-4 w-4 mr-2" />
                                    )}
                                    Approve Selected
                                </Button>
                            </div>
                        </div>
                    </Card>
                )}

                {/* Compensations List */}
                {isLoading ? (
                    <Card className="p-12 text-center">
                        <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-muted-foreground" />
                        <p className="text-muted-foreground">Loading compensations...</p>
                    </Card>
                ) : (
                    <Tabs defaultValue="all" className="w-full">
                        <TabsList className="grid w-full grid-cols-4 mb-6">
                            <TabsTrigger value="all">
                                All ({compensations.length})
                            </TabsTrigger>
                            <TabsTrigger value="pending">
                                Pending ({compensations.filter((c) => c.status === "pending").length})
                            </TabsTrigger>
                            <TabsTrigger value="approved">
                                Approved ({compensations.filter((c) => c.status === "approved").length})
                            </TabsTrigger>
                            <TabsTrigger value="paid">
                                Paid ({compensations.filter((c) => c.status === "paid").length})
                            </TabsTrigger>
                        </TabsList>

                        {["all", "pending", "approved", "paid"].map((tab) => (
                            <TabsContent key={tab} value={tab} className="space-y-4">
                                {filterCompensations(tab === "all" ? null : tab).length > 0 ? (
                                    filterCompensations(tab === "all" ? null : tab).map((comp) => {
                                        const isProcessing = processingId === comp.id;
                                        const isSelected = selectedIds.includes(comp.id);

                                        return (
                                            <Card key={comp.id} className={`p-6 ${isSelected ? "border-blue-500 border-2" : ""}`}>
                                                <div className="flex items-start justify-between">
                                                    <div className="flex items-start gap-4 flex-1">
                                                        {comp.status === "pending" && (
                                                            <input
                                                                type="checkbox"
                                                                checked={isSelected}
                                                                onChange={() => toggleSelection(comp.id)}
                                                                className="mt-1 h-4 w-4 rounded border-gray-300"
                                                            />
                                                        )}
                                                        <div className="flex-1">
                                                            <div className="flex items-center gap-3 mb-2">
                                                                <h3 className="text-lg font-bold text-foreground">
                                                                    {comp.user?.user_metadata?.name || comp.user?.email || "Developer"}
                                                                </h3>
                                                                <Badge className={`${getTypeColor(comp.type)} capitalize`}>
                                                                    {comp.type === "winner" && <Award className="h-3 w-3 mr-1" />}
                                                                    {comp.type}
                                                                </Badge>
                                                                <Badge className={`${getStatusColor(comp.status)} capitalize`}>
                                                                    {comp.status}
                                                                </Badge>
                                                            </div>
                                                            <p className="text-sm text-muted-foreground mb-1">
                                                                Project: {comp.project?.title}
                                                            </p>
                                                            <p className="text-sm text-muted-foreground">
                                                                Submission: {comp.submission?.title}
                                                            </p>
                                                            <p className="text-xs text-muted-foreground mt-2">
                                                                Created: {new Date(comp.created_at).toLocaleDateString()}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <div className="flex flex-col items-end gap-2 ml-4">
                                                        <p className="text-2xl font-bold text-foreground">
                                                            ${Number(comp.amount).toFixed(2)}
                                                        </p>
                                                        {comp.status === "pending" && (
                                                            <Button
                                                                size="sm"
                                                                onClick={() => handleApprove(comp.id)}
                                                                disabled={isProcessing}
                                                                className="bg-green-600 hover:bg-green-700"
                                                            >
                                                                {isProcessing ? (
                                                                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                                                ) : (
                                                                    <CheckCircle className="h-4 w-4 mr-2" />
                                                                )}
                                                                Approve
                                                            </Button>
                                                        )}
                                                        {comp.status === "approved" && (
                                                            <Button
                                                                size="sm"
                                                                onClick={() => handleMarkPaid(comp.id)}
                                                                disabled={isProcessing}
                                                                className="bg-blue-600 hover:bg-blue-700"
                                                            >
                                                                {isProcessing ? (
                                                                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                                                ) : (
                                                                    <DollarSign className="h-4 w-4 mr-2" />
                                                                )}
                                                                Mark as Paid
                                                            </Button>
                                                        )}
                                                    </div>
                                                </div>

                                                {comp.status === "paid" && comp.paid_at && (
                                                    <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-950 rounded border border-blue-200 dark:border-blue-800">
                                                        <p className="text-sm text-blue-900 dark:text-blue-100">
                                                            💰 Paid on {new Date(comp.paid_at).toLocaleDateString()}
                                                        </p>
                                                    </div>
                                                )}
                                            </Card>
                                        );
                                    })
                                ) : (
                                    <Card className="p-12 text-center">
                                        <p className="text-muted-foreground">
                                            No {tab !== "all" ? tab : ""} compensations found.
                                        </p>
                                    </Card>
                                )}
                            </TabsContent>
                        ))}
                    </Tabs>
                )}
            </div>
        </div>
    );
}

export default function CompanyCompensationsPage() {
    return (
        <Suspense fallback={null}>
            <CompensationsContent />
        </Suspense>
    );
}
