"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

export interface CompensationResult {
    success: boolean;
    error?: string;
    data?: any;
}

/**
 * Create participation compensations for rejected submissions
 */
export async function createParticipationCompensations(
    projectId: number,
    participationAmount: number
): Promise<CompensationResult> {
    try {
        const supabase = await createClient();

        const {
            data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
            return { success: false, error: "Not authenticated" };
        }

        // Get all rejected submissions for this project
        const { data: submissions, error: fetchError } = await supabase
            .from("submissions")
            .select("*")
            .eq("project_id", projectId)
            .eq("status", "rejected");

        if (fetchError) {
            return { success: false, error: fetchError.message };
        }

        if (!submissions || submissions.length === 0) {
            return { success: true, data: [] };
        }

        // Create compensations for each rejected submission
        const compensations = submissions.map((sub) => ({
            submission_id: sub.id,
            user_id: sub.user_id,
            project_id: projectId,
            amount: participationAmount,
            type: "participation" as const,
            status: "pending" as const,
        }));

        const { data, error } = await supabase
            .from("compensations")
            .insert(compensations)
            .select();

        if (error) {
            return { success: false, error: error.message };
        }

        // Update submissions with compensation info
        await supabase
            .from("submissions")
            .update({
                compensation_amount: participationAmount,
                compensation_type: "participation",
                compensation_status: "pending",
            })
            .eq("project_id", projectId)
            .eq("status", "rejected");

        revalidatePath("/company/compensations");
        revalidatePath("/freelancer/earnings");

        return { success: true, data };
    } catch (error) {
        console.error("Error creating participation compensations:", error);
        return {
            success: false,
            error: error instanceof Error ? error.message : "Unknown error",
        };
    }
}

/**
 * Create winner compensation
 */
export async function createWinnerCompensation(
    submissionId: string,
    amount: number
): Promise<CompensationResult> {
    try {
        const supabase = await createClient();

        const {
            data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
            return { success: false, error: "Not authenticated" };
        }

        // Get submission details
        const { data: submission, error: fetchError } = await supabase
            .from("submissions")
            .select("*")
            .eq("id", submissionId)
            .single();

        if (fetchError || !submission) {
            return { success: false, error: "Submission not found" };
        }

        // Create winner compensation
        const { data, error } = await supabase
            .from("compensations")
            .insert({
                submission_id: submissionId,
                user_id: submission.user_id,
                project_id: submission.project_id,
                amount: amount,
                type: "winner",
                status: "approved", // Winner compensation auto-approved
                approved_by: user.id,
                approved_at: new Date().toISOString(),
            })
            .select()
            .single();

        if (error) {
            return { success: false, error: error.message };
        }

        // Update submission with compensation info
        await supabase
            .from("submissions")
            .update({
                compensation_amount: amount,
                compensation_type: "winner",
                compensation_status: "approved",
            })
            .eq("id", submissionId);

        revalidatePath("/company/compensations");
        revalidatePath("/freelancer/earnings");

        return { success: true, data };
    } catch (error) {
        console.error("Error creating winner compensation:", error);
        return {
            success: false,
            error: error instanceof Error ? error.message : "Unknown error",
        };
    }
}

/**
 * Approve compensations
 */
export async function approveCompensations(
    compensationIds: string[]
): Promise<CompensationResult> {
    try {
        const supabase = await createClient();

        const {
            data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
            return { success: false, error: "Not authenticated" };
        }

        const { data, error } = await supabase
            .from("compensations")
            .update({
                status: "approved",
                approved_by: user.id,
                approved_at: new Date().toISOString(),
            })
            .in("id", compensationIds)
            .select();

        if (error) {
            return { success: false, error: error.message };
        }

        // Update corresponding submissions
        const { data: compensations } = await supabase
            .from("compensations")
            .select("submission_id")
            .in("id", compensationIds);

        if (compensations) {
            const submissionIds = compensations.map((c) => c.submission_id);
            await supabase
                .from("submissions")
                .update({ compensation_status: "approved" })
                .in("id", submissionIds);
        }

        revalidatePath("/company/compensations");
        revalidatePath("/freelancer/earnings");

        return { success: true, data };
    } catch (error) {
        console.error("Error approving compensations:", error);
        return {
            success: false,
            error: error instanceof Error ? error.message : "Unknown error",
        };
    }
}

/**
 * Mark compensation as paid
 */
export async function markAsPaid(
    compensationId: string
): Promise<CompensationResult> {
    try {
        const supabase = await createClient();

        const {
            data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
            return { success: false, error: "Not authenticated" };
        }

        const { data, error } = await supabase
            .from("compensations")
            .update({
                status: "paid",
                paid_at: new Date().toISOString(),
            })
            .eq("id", compensationId)
            .select()
            .single();

        if (error) {
            return { success: false, error: error.message };
        }

        // Update corresponding submission
        if (data) {
            await supabase
                .from("submissions")
                .update({ compensation_status: "paid" })
                .eq("id", data.submission_id);
        }

        revalidatePath("/company/compensations");
        revalidatePath("/freelancer/earnings");

        return { success: true, data };
    } catch (error) {
        console.error("Error marking as paid:", error);
        return {
            success: false,
            error: error instanceof Error ? error.message : "Unknown error",
        };
    }
}

/**
 * Get compensations by project
 */
export async function getCompensationsByProject(projectId: number) {
    try {
        const supabase = await createClient();

        const { data, error } = await supabase
            .from("compensations")
            .select(
                `
        *,
        submission:submissions(id, title, status),
        user:auth.users(id, email, user_metadata)
      `
            )
            .eq("project_id", projectId)
            .order("created_at", { ascending: false });

        if (error) {
            return { success: false, error: error.message };
        }

        return { success: true, data };
    } catch (error) {
        console.error("Error fetching compensations:", error);
        return {
            success: false,
            error: error instanceof Error ? error.message : "Unknown error",
        };
    }
}

/**
 * Get compensations by user (freelancer earnings)
 */
export async function getCompensationsByUser(userId: string) {
    try {
        const supabase = await createClient();

        const { data, error } = await supabase
            .from("compensations")
            .select(
                `
        *,
        submission:submissions(id, title, status),
        project:projects(id, title)
      `
            )
            .eq("user_id", userId)
            .order("created_at", { ascending: false });

        if (error) {
            return { success: false, error: error.message };
        }

        return { success: true, data };
    } catch (error) {
        console.error("Error fetching user compensations:", error);
        return {
            success: false,
            error: error instanceof Error ? error.message : "Unknown error",
        };
    }
}

/**
 * Get or create project settings
 */
export async function getProjectSettings(projectId: number) {
    try {
        const supabase = await createClient();

        let { data, error } = await supabase
            .from("project_settings")
            .select("*")
            .eq("project_id", projectId)
            .single();

        // If no settings exist, create default
        if (error && error.code === "PGRST116") {
            const { data: newSettings, error: createError } = await supabase
                .from("project_settings")
                .insert({
                    project_id: projectId,
                    participation_compensation: 50.0,
                    auto_approve_participation: false,
                })
                .select()
                .single();

            if (createError) {
                return { success: false, error: createError.message };
            }

            data = newSettings;
        } else if (error) {
            return { success: false, error: error.message };
        }

        return { success: true, data };
    } catch (error) {
        console.error("Error fetching project settings:", error);
        return {
            success: false,
            error: error instanceof Error ? error.message : "Unknown error",
        };
    }
}

/**
 * Update project settings
 */
export async function updateProjectSettings(
    projectId: number,
    settings: {
        participation_compensation?: number;
        winner_compensation?: number;
        auto_approve_participation?: boolean;
    }
): Promise<CompensationResult> {
    try {
        const supabase = await createClient();

        const { data, error } = await supabase
            .from("project_settings")
            .upsert({
                project_id: projectId,
                ...settings,
            })
            .select()
            .single();

        if (error) {
            return { success: false, error: error.message };
        }

        revalidatePath(`/company/projects/${projectId}`);

        return { success: true, data };
    } catch (error) {
        console.error("Error updating project settings:", error);
        return {
            success: false,
            error: error instanceof Error ? error.message : "Unknown error",
        };
    }
}
