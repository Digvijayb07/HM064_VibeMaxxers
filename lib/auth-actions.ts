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

  const { error } = await supabase.auth.signInWithPassword(data);

  if (error) {
    redirect("/error");
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
