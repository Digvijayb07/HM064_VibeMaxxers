import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";

export default async function Home() {
  const supabase = await createClient();

  // Check if user is authenticated
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // If not authenticated, redirect to signin
  if (!user) {
    redirect("/signin");
  }

  // If authenticated, check their role and redirect to appropriate dashboard
  const { data: userData } = await supabase
    .from("users")
    .select("role")
    .eq("user_id", user.id)
    .single();

  if (userData?.role) {
    const redirectPath =
      userData.role === "company"
        ? "/company/dashboard"
        : "/freelancer/dashboard";
    redirect(redirectPath);
  }

  // If user has no role, redirect to role selection
  redirect("/auth/select-role");
}
