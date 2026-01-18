"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

export interface ShortlistResult {
    success: boolean;
    error?: string;
    data?: any;
}

/**
 * Shortlist an application
 */
export async function shortlistApplication(
    applicationId: number,
    submissionDeadline?: string
): Promise<ShortlistResult> {
    try {
        const supabase = await createClient();

        // Get current user
        const {
            data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
            return { success: false, error: "Not authenticated" };
        }

        // Verify the application belongs to a project owned by this company
        const { data: application, error: appError } = await supabase
            .from("applications")
            .select("*, project:projects(company_id)")
            .eq("id", applicationId)
            .single();

        if (appError || !application) {
            return { success: false, error: "Application not found" };
        }

        if (application.project?.company_id !== user.id) {
            return { success: false, error: "Unauthorized" };
        }

        // Update application status to shortlisted
        const updateData: any = {
            status: "shortlisted",
        };

        if (submissionDeadline) {
            updateData.submission_deadline = submissionDeadline;
        }

        const { data, error } = await supabase
            .from("applications")
            .update(updateData)
            .eq("id", applicationId)
            .select()
            .single();

        if (error) {
            return { success: false, error: error.message };
        }

        revalidatePath("/company/applications");
        revalidatePath("/freelancer/applications");

        return { success: true, data };
    } catch (error) {
        console.error("Error shortlisting application:", error);
        return {
            success: false,
            error: error instanceof Error ? error.message : "Unknown error",
        };
    }
}

/**
 * Reject an application
 */
export async function rejectApplication(
    applicationId: number
): Promise<ShortlistResult> {
    try {
        const supabase = await createClient();

        // Get current user
        const {
            data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
            return { success: false, error: "Not authenticated" };
        }

        // Verify the application belongs to a project owned by this company
        const { data: application, error: appError } = await supabase
            .from("applications")
            .select("*, project:projects(company_id)")
            .eq("id", applicationId)
            .single();

        if (appError || !application) {
            return { success: false, error: "Application not found" };
        }

        if (application.project?.company_id !== user.id) {
            return { success: false, error: "Unauthorized" };
        }

        // Update application status to rejected
        const { data, error } = await supabase
            .from("applications")
            .update({ status: "rejected" })
            .eq("id", applicationId)
            .select()
            .single();

        if (error) {
            return { success: false, error: error.message };
        }

        revalidatePath("/company/applications");
        revalidatePath("/freelancer/applications");

        return { success: true, data };
    } catch (error) {
        console.error("Error rejecting application:", error);
        return {
            success: false,
            error: error instanceof Error ? error.message : "Unknown error",
        };
    }
}

/**
 * Bulk shortlist applications
 */
export async function bulkShortlist(
    applicationIds: number[],
    submissionDeadline?: string
): Promise<ShortlistResult> {
    try {
        const supabase = await createClient();

        const {
            data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
            return { success: false, error: "Not authenticated" };
        }

        const updateData: any = {
            status: "shortlisted",
        };

        if (submissionDeadline) {
            updateData.submission_deadline = submissionDeadline;
        }

        const { data, error } = await supabase
            .from("applications")
            .update(updateData)
            .in("id", applicationIds)
            .select();

        if (error) {
            return { success: false, error: error.message };
        }

        revalidatePath("/company/applications");
        revalidatePath("/freelancer/applications");

        return { success: true, data };
    } catch (error) {
        console.error("Error bulk shortlisting:", error);
        return {
            success: false,
            error: error instanceof Error ? error.message : "Unknown error",
        };
    }
}

/**
 * Bulk reject applications
 */
export async function bulkReject(
    applicationIds: number[]
): Promise<ShortlistResult> {
    try {
        const supabase = await createClient();

        const {
            data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
            return { success: false, error: "Not authenticated" };
        }

        const { data, error } = await supabase
            .from("applications")
            .update({ status: "rejected" })
            .in("id", applicationIds)
            .select();

        if (error) {
            return { success: false, error: error.message };
        }

        revalidatePath("/company/applications");
        revalidatePath("/freelancer/applications");

        return { success: true, data };
    } catch (error) {
        console.error("Error bulk rejecting:", error);
        return {
            success: false,
            error: error instanceof Error ? error.message : "Unknown error",
        };
    }
}

/**
 * Get applications by project
 */
export async function getApplicationsByProject(projectId: number) {
    try {
        const supabase = await createClient();

        const { data, error } = await supabase
            .from("applications")
            .select(
                `
        *,
        project:projects(id, title, budget, category, status, company_id),
        user:auth.users(id, email, user_metadata)
      `
            )
            .eq("project_id", projectId)
            .order("created_at", { ascending: false });

        if (error) {
            console.error("Error fetching applications:", error);
            return { success: false, error: error.message };
        }

        return { success: true, data };
    } catch (error) {
        console.error("Error fetching applications:", error);
        return {
            success: false,
            error: error instanceof Error ? error.message : "Unknown error",
        };
    }
}

/**
 * Get applications by freelancer
 */
export async function getApplicationsByFreelancer(userId: string) {
    try {
        const supabase = await createClient();

        const { data, error } = await supabase
            .from("applications")
            .select(
                `
        *,
        project:projects(id, title, budget, category, status, company_id)
      `
            )
            .eq("user_id", userId)
            .order("created_at", { ascending: false });

        if (error) {
            console.error("Error fetching applications:", error);
            return { success: false, error: error.message };
        }

        return { success: true, data };
    } catch (error) {
        console.error("Error fetching applications:", error);
        return {
            success: false,
            error: error instanceof Error ? error.message : "Unknown error",
        };
    }
}
