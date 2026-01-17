"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { createClient } from "@/utils/supabase/server";

export async function login(formData: FormData) {
  const supabase = await createClient();

  // type-casting here for convenience
  // in practice, you should validate your inputs
  const data = {
    email: formData.get("email") as string,
    password: formData.get("password") as string,
  };

  const { data: authData, error } =
    await supabase.auth.signInWithPassword(data);

  if (error) {
    console.error("Login error:", error);
    redirect("/signin?error=Invalid credentials");
  }

  // Check user role and redirect accordingly
  if (authData.user) {
    const { data: userData } = await supabase
      .from("users")
      .select("role")
      .eq("user_id", authData.user.id)
      .single();

    if (userData?.role) {
      const redirectPath =
        userData.role === "company"
          ? "/company/dashboard"
          : "/freelancer/dashboard";

      revalidatePath("/", "layout");
      redirect(redirectPath);
    }
  }

  revalidatePath("/", "layout");
  redirect("/");
}

export async function signup(formData: FormData) {
  try {
    const supabase = await createClient();

    // type-casting here for convenience
    // in practice, you should validate your inputs
    const firstName = formData.get("first-name") as string;
    const lastName = formData.get("last-name") as string;
    const userRole = formData.get("user-role") as string;
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const fullName = `${firstName} ${lastName}`;

    console.log("Signup attempt:", { email, fullName, userRole });

    if (!email || !password || !firstName || !lastName || !userRole) {
      console.error("Missing required fields");
      redirect("/error");
    }

    const { data: authData, error } = await supabase.auth.signUp({
      email: email,
      password: password,
      options: {
        data: {
          full_name: fullName,
          user_role: userRole,
        },
        emailRedirectTo: `${
          process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"
        }/auth/callback`,
      },
    });

    if (error) {
      console.error("Auth signup error:", error);
      redirect("/error");
    }

    console.log("Auth user created:", authData.user?.id);

    // Insert user data into the users table
    if (authData.user) {
      const { error: insertError } = await supabase.from("users").insert({
        user_id: authData.user.id,
        email: email,
        role: userRole,
        name: fullName,
      });

      if (insertError) {
        console.error("Error inserting user into database:", insertError);
        // Continue with redirect even if insert fails
      } else {
        console.log("User data inserted into users table");
      }
    }

    revalidatePath("/", "layout");

    // Redirect based on user role
    const redirectPath =
      userRole === "company" ? "/company/dashboard" : "/freelancer/dashboard";
    redirect(redirectPath);
  } catch (error) {
    console.error("Signup error:", error);
    redirect("/error");
  }
}

export async function signout() {
  const supabase = await createClient();
  const { error } = await supabase.auth.signOut();
  if (error) {
    redirect("/error");
  }

  redirect("/signin");
}

export async function updateUserRole(userRole: "company" | "developer") {
  try {
    const supabase = await createClient();

    // Get the current user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      console.error("Error getting user:", userError);
      throw new Error("User not authenticated");
    }

    console.log("Updating role for user:", user.id, "to:", userRole);

    // Check if user already exists in users table
    const { data: existingUser } = await supabase
      .from("users")
      .select("*")
      .eq("user_id", user.id)
      .single();

    if (existingUser) {
      // Update existing user
      const { error: updateError } = await supabase
        .from("users")
        .update({ role: userRole })
        .eq("user_id", user.id);

      if (updateError) {
        console.error("Error updating user role:", updateError);
        throw new Error("Failed to update user role");
      }
    } else {
      // Insert new user
      const { error: insertError } = await supabase.from("users").insert({
        user_id: user.id,
        email: user.email!,
        role: userRole,
        name:
          user.user_metadata?.full_name || user.email?.split("@")[0] || "User",
      });

      if (insertError) {
        console.error("Error inserting user:", insertError);
        throw new Error("Failed to create user profile");
      }
    }

    console.log("User role updated successfully");

    // Update user metadata
    await supabase.auth.updateUser({
      data: { user_role: userRole },
    });

    revalidatePath("/", "layout");

    // Redirect based on user role
    const redirectPath =
      userRole === "company" ? "/company/dashboard" : "/freelancer/dashboard";
    redirect(redirectPath);
  } catch (error) {
    console.error("Update user role error:", error);
    throw error;
  }
}

// const signInWith = (provider) => async () => {
//   const supabase = await createClient();

//   const auth_callback_url = `${process.env.SITE_URL}/auth/callback`;
// };

export async function signInWithGoogle() {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${
        process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"
      }/auth/callback`,
      queryParams: {
        access_type: "offline",
        prompt: "consent",
      },
    },
  });

  if (error) {
    redirect("/error");
  }

  redirect(data.url);
}

export async function signInWithGitHub() {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "github",
    options: {
      redirectTo: `${
        process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"
      }/auth/callback`,
    },
  });

  if (error) {
    console.error("GitHub sign-in error:", error);
    redirect("/auth/signin?error=Could not authenticate with GitHub");
  }

  if (data.url) {
    redirect(data.url);
  }
}

export async function createProject(formData: FormData) {
  try {
    const supabase = await createClient();

    // Get the current user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      console.error("Error getting user:", userError);
      throw new Error("User not authenticated");
    }

    // Parse form data
    const title = formData.get("title") as string;
    const description = formData.get("description") as string;
    const category = formData.get("category") as string;
    const budgetStr = formData.get("budget") as string;
    const duration = formData.get("duration") as string;
    const deadline = formData.get("deadline") as string;
    const level = formData.get("level") as string;
    const skills = formData.get("skills") as string; // JSON stringified array

    console.log("Creating project with data:", {
      title,
      category,
      budget: budgetStr,
      duration,
      deadline,
      level,
      skills: skills || "[]",
      user_id: user.id,
    });

    // Validate required fields
    if (!title || !description || !budgetStr || !deadline) {
      throw new Error("Missing required fields");
    }

    // Validate and parse budget
    const budgetNum = parseInt(budgetStr, 10);
    if (isNaN(budgetNum) || budgetNum <= 0) {
      throw new Error("Budget must be a valid positive number");
    }

    const projectData = {
      user_id: user.id,
      title,
      description,
      category,
      budget: budgetNum,
      duration,
      deadline,
      exp_level: level,
      skills_req: JSON.parse(skills || "[]"),
      status: "open",
    };

    console.log("Inserting project data:", projectData);

    // Insert project into database
    const { data, error: insertError } = await supabase
      .from("projects")
      .insert(projectData)
      .select()
      .single();

    if (insertError) {
      console.error("Error inserting project:", insertError);
      console.error("Error details:", {
        message: insertError.message,
        details: insertError.details,
        hint: insertError.hint,
        code: insertError.code,
      });
      throw new Error(`Failed to create project: ${insertError.message}`);
    }

    console.log("Project created successfully:", data);

    revalidatePath("/company/dashboard");
    revalidatePath("/company/projects");
    redirect("/company/dashboard");
  } catch (error) {
    console.error("Create project error:", error);
    throw error;
  }
}

export async function applyToProject(projectId: number) {
  try {
    const supabase = await createClient();

    // Get the current user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      console.error("Error getting user:", userError);
      throw new Error("User not authenticated");
    }

    console.log("Applying to project:", { projectId, userId: user.id });

    // Check if user already applied
    const { data: existingApplication } = await supabase
      .from("applications")
      .select("id")
      .eq("user_id", user.id)
      .eq("project_id", projectId)
      .single();

    if (existingApplication) {
      throw new Error("You have already applied to this project");
    }

    // Insert application into database
    const { data, error: insertError } = await supabase
      .from("applications")
      .insert({
        user_id: user.id,
        project_id: projectId,
      })
      .select()
      .single();

    if (insertError) {
      console.error("Error inserting application:", insertError);
      throw new Error(`Failed to apply: ${insertError.message}`);
    }

    console.log("Application submitted successfully:", data);

    revalidatePath("/freelancer/projects");
    revalidatePath(`/freelancer/projects/${projectId}`);
    revalidatePath("/freelancer/applications");

    return { success: true, data };
  } catch (error) {
    console.error("Apply to project error:", error);
    throw error;
  }
}
