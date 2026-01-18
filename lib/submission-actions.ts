"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";
import type { SubmissionLink } from "./types";

export interface SubmissionResult {
    success: boolean;
    error?: string;
    data?: any;
}

export interface CreateSubmissionData {
    application_id: number;
    project_id: number;
    title: string;
    description: string;
    submission_links: SubmissionLink[];
    deadline?: string;
}

export interface UpdateSubmissionData {
    title?: string;
    description?: string;
    submission_links?: SubmissionLink[];
}

/**
 * Create a new submission
 */
export async function createSubmission(
    data: CreateSubmissionData
): Promise<SubmissionResult> {
    try {
        const supabase = await createClient();

        const {
            data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
            return { success: false, error: "Not authenticated" };
        }

        // Verify the application is shortlisted and belongs to the user
        const { data: application, error: appError } = await supabase
            .from("applications")
            .select("*")
            .eq("id", data.application_id)
            .eq("user_id", user.id)
            .single();

        if (appError || !application) {
            return { success: false, error: "Application not found" };
        }

        if (application.status !== "shortlisted") {
            return {
                success: false,
                error: "Only shortlisted applications can submit designs",
            };
        }

        // Check if submission already exists
        const { data: existingSubmission } = await supabase
            .from("submissions")
            .select("id")
            .eq("application_id", data.application_id)
            .single();

        if (existingSubmission) {
            return {
                success: false,
                error: "Submission already exists for this application",
            };
        }

        // Create submission
        const { data: submission, error } = await supabase
            .from("submissions")
            .insert({
                application_id: data.application_id,
                user_id: user.id,
                project_id: data.project_id,
                title: data.title,
                description: data.description,
                submission_links: data.submission_links,
                deadline: data.deadline || application.submission_deadline,
                status: "submitted",
            })
            .select()
            .single();

        if (error) {
            return { success: false, error: error.message };
        }

        revalidatePath("/freelancer/submissions");
        revalidatePath("/company/submissions");

        return { success: true, data: submission };
    } catch (error) {
        console.error("Error creating submission:", error);
        return {
            success: false,
            error: error instanceof Error ? error.message : "Unknown error",
        };
    }
}

/**
 * Update an existing submission
 */
export async function updateSubmission(
    submissionId: string,
    data: UpdateSubmissionData
): Promise<SubmissionResult> {
    try {
        const supabase = await createClient();

        const {
            data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
            return { success: false, error: "Not authenticated" };
        }

        // Get submission and check ownership
        const { data: submission, error: fetchError } = await supabase
            .from("submissions")
            .select("*")
            .eq("id", submissionId)
            .eq("user_id", user.id)
            .single();

        if (fetchError || !submission) {
            return { success: false, error: "Submission not found" };
        }

        // Check if deadline has passed
        if (submission.deadline && new Date(submission.deadline) < new Date()) {
            return { success: false, error: "Submission deadline has passed" };
        }

        // Update submission
        const { data: updated, error } = await supabase
            .from("submissions")
            .update(data)
            .eq("id", submissionId)
            .select()
            .single();

        if (error) {
            return { success: false, error: error.message };
        }

        revalidatePath("/freelancer/submissions");
        revalidatePath("/company/submissions");

        return { success: true, data: updated };
    } catch (error) {
        console.error("Error updating submission:", error);
        return {
            success: false,
            error: error instanceof Error ? error.message : "Unknown error",
        };
    }
}

/**
 * Delete a submission
 */
export async function deleteSubmission(
    submissionId: string
): Promise<SubmissionResult> {
    try {
        const supabase = await createClient();

        const {
            data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
            return { success: false, error: "Not authenticated" };
        }

        // Get submission and check ownership
        const { data: submission, error: fetchError } = await supabase
            .from("submissions")
            .select("*")
            .eq("id", submissionId)
            .eq("user_id", user.id)
            .single();

        if (fetchError || !submission) {
            return { success: false, error: "Submission not found" };
        }

        // Check if deadline has passed
        if (submission.deadline && new Date(submission.deadline) < new Date()) {
            return {
                success: false,
                error: "Cannot delete submission after deadline",
            };
        }

        // Delete submission
        const { error } = await supabase
            .from("submissions")
            .delete()
            .eq("id", submissionId);

        if (error) {
            return { success: false, error: error.message };
        }

        revalidatePath("/freelancer/submissions");
        revalidatePath("/company/submissions");

        return { success: true };
    } catch (error) {
        console.error("Error deleting submission:", error);
        return {
            success: false,
            error: error instanceof Error ? error.message : "Unknown error",
        };
    }
}

/**
 * Get submissions by freelancer
 */
export async function getSubmissionsByFreelancer(userId: string) {
    try {
        const supabase = await createClient();

        const { data, error } = await supabase
            .from("submissions")
            .select(
                `
        *,
        project:projects(id, title, company_id),
        application:applications(id, status)
      `
            )
            .eq("user_id", userId)
            .order("created_at", { ascending: false });

        if (error) {
            return { success: false, error: error.message };
        }

        return { success: true, data };
    } catch (error) {
        console.error("Error fetching submissions:", error);
        return {
            success: false,
            error: error instanceof Error ? error.message : "Unknown error",
        };
    }
}

/**
 * Get submissions by project
 */
export async function getSubmissionsByProject(projectId: number) {
    try {
        const supabase = await createClient();

        const {
            data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
            return { success: false, error: "Not authenticated" };
        }

        // Verify project ownership
        const { data: project } = await supabase
            .from("projects")
            .select("company_id")
            .eq("id", projectId)
            .single();

        if (!project || project.company_id !== user.id) {
            return { success: false, error: "Unauthorized" };
        }

        const { data, error } = await supabase
            .from("submissions")
            .select(
                `
        *,
        user:auth.users(id, email, user_metadata),
        application:applications(id, status)
      `
            )
            .eq("project_id", projectId)
            .order("created_at", { ascending: false });

        if (error) {
            return { success: false, error: error.message };
        }

        return { success: true, data };
    } catch (error) {
        console.error("Error fetching submissions:", error);
        return {
            success: false,
            error: error instanceof Error ? error.message : "Unknown error",
        };
    }
}

/**
 * Rate a submission (company only)
 */
export async function rateSubmission(
    submissionId: string,
    rating: number,
    feedback?: string
): Promise<SubmissionResult> {
    try {
        const supabase = await createClient();

        const {
            data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
            return { success: false, error: "Not authenticated" };
        }

        // Verify submission belongs to company's project
        const { data: submission, error: fetchError } = await supabase
            .from("submissions")
            .select("*, project:projects(company_id)")
            .eq("id", submissionId)
            .single();

        if (fetchError || !submission) {
            return { success: false, error: "Submission not found" };
        }

        if (submission.project?.company_id !== user.id) {
            return { success: false, error: "Unauthorized" };
        }

        // Validate rating
        if (rating < 1 || rating > 5) {
            return { success: false, error: "Rating must be between 1 and 5" };
        }

        // Update submission with rating and feedback
        const { data, error } = await supabase
            .from("submissions")
            .update({ rating, feedback })
            .eq("id", submissionId)
            .select()
            .single();

        if (error) {
            return { success: false, error: error.message };
        }

        revalidatePath("/company/submissions");
        revalidatePath("/freelancer/submissions");

        return { success: true, data };
    } catch (error) {
        console.error("Error rating submission:", error);
        return {
            success: false,
            error: error instanceof Error ? error.message : "Unknown error",
        };
    }
}

/**
 * Select a submission as winner
 */
export async function selectWinner(
    submissionId: string
): Promise<SubmissionResult> {
    try {
        const supabase = await createClient();

        const {
            data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
            return { success: false, error: "Not authenticated" };
        }

        // Verify submission belongs to company's project
        const { data: submission, error: fetchError } = await supabase
            .from("submissions")
            .select("*, project:projects(company_id), application:applications(id)")
            .eq("id", submissionId)
            .single();

        if (fetchError || !submission) {
            return { success: false, error: "Submission not found" };
        }

        if (submission.project?.company_id !== user.id) {
            return { success: false, error: "Unauthorized" };
        }

        // Get project settings for compensation amounts
        const { data: settings } = await supabase
            .from("project_settings")
            .select("*")
            .eq("project_id", submission.project_id)
            .single();

        const winnerAmount = settings?.winner_compensation || 0;
        const participationAmount = settings?.participation_compensation || 50;

        // Update submission status to selected
        const { data: updated, error: updateError } = await supabase
            .from("submissions")
            .update({
                status: "selected",
                compensation_amount: winnerAmount,
                compensation_type: "winner",
                compensation_status: "approved"
            })
            .eq("id", submissionId)
            .select()
            .single();

        if (updateError) {
            return { success: false, error: updateError.message };
        }

        // Create winner compensation if amount is set
        if (winnerAmount > 0) {
            await supabase.from("compensations").insert({
                submission_id: submissionId,
                user_id: submission.user_id,
                project_id: submission.project_id,
                amount: winnerAmount,
                type: "winner",
                status: "approved",
                approved_by: user.id,
                approved_at: new Date().toISOString(),
            });
        }

        // Update application status to awarded
        if (submission.application) {
            await supabase
                .from("applications")
                .update({ status: "awarded" })
                .eq("id", submission.application.id);
        }

        // Reject other submissions for the same project
        await supabase
            .from("submissions")
            .update({
                status: "rejected",
                compensation_amount: participationAmount,
                compensation_type: "participation",
                compensation_status: "pending"
            })
            .eq("project_id", submission.project_id)
            .neq("id", submissionId);

        // Create participation compensations for rejected submissions if amount is set
        if (participationAmount > 0) {
            const { data: rejectedSubmissions } = await supabase
                .from("submissions")
                .select("id, user_id")
                .eq("project_id", submission.project_id)
                .eq("status", "rejected");

            if (rejectedSubmissions && rejectedSubmissions.length > 0) {
                const participationCompensations = rejectedSubmissions.map((sub) => ({
                    submission_id: sub.id,
                    user_id: sub.user_id,
                    project_id: submission.project_id,
                    amount: participationAmount,
                    type: "participation" as const,
                    status: "pending" as const,
                }));

                await supabase.from("compensations").insert(participationCompensations);
            }
        }

        revalidatePath("/company/submissions");
        revalidatePath("/freelancer/submissions");
        revalidatePath("/company/applications");
        revalidatePath("/freelancer/applications");
        revalidatePath("/company/compensations");
        revalidatePath("/freelancer/earnings");

        return { success: true, data: updated };
    } catch (error) {
        console.error("Error selecting winner:", error);
        return {
            success: false,
            error: error instanceof Error ? error.message : "Unknown error",
        };
    }
}

/**
 * Check if submission deadline has passed
 */
export async function checkDeadline(applicationId: number) {
    try {
        const supabase = await createClient();

        const { data: application, error } = await supabase
            .from("applications")
            .select("submission_deadline")
            .eq("id", applicationId)
            .single();

        if (error || !application) {
            return { success: false, error: "Application not found" };
        }

        const deadline = application.submission_deadline;
        if (!deadline) {
            return { success: true, deadlinePassed: false };
        }

        const deadlinePassed = new Date(deadline) < new Date();

        return { success: true, deadlinePassed, deadline };
    } catch (error) {
        console.error("Error checking deadline:", error);
        return {
            success: false,
            error: error instanceof Error ? error.message : "Unknown error",
        };
    }
}
