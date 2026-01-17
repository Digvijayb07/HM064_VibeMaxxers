import { NextResponse } from "next/server";
// The client you created from the Server-Side Auth instructions
import { createClient } from "@/utils/supabase/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const error_description = searchParams.get("error_description");

  let next = searchParams.get("next") ?? "/";
  if (!next.startsWith("/")) {
    next = "/";
  }

  if (code) {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (error) {
      console.error("Error exchanging code for session:", error.message);
      return NextResponse.redirect(
        `${origin}/login?error=${encodeURIComponent(error.message)}`,
      );
    }

    // Check if user exists in users table
    if (data.user) {
      const { data: userData } = await supabase
        .from("users")
        .select("role")
        .eq("user_id", data.user.id)
        .single();

      // If user doesn't have a role, redirect to role selection
      if (!userData || !userData.role) {
        console.log("New user detected, redirecting to role selection");
        return NextResponse.redirect(`${origin}/auth/select-role`);
      }

      // User has a role, redirect to their dashboard
      const redirectPath =
        userData.role === "company"
          ? "/company/dashboard"
          : "/freelancer/dashboard";
      return NextResponse.redirect(`${origin}${redirectPath}`);
    }

    const forwardedHost = request.headers.get("x-forwarded-host");
    const isLocalEnv = process.env.NODE_ENV === "development";

    if (isLocalEnv) {
      return NextResponse.redirect(`${origin}${next}`);
    } else if (forwardedHost) {
      return NextResponse.redirect(`https://${forwardedHost}${next}`);
    } else {
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  console.error("No authorization code received");
  return NextResponse.redirect(
    `${origin}/login?error=${encodeURIComponent(
      error_description || "No authorization code received",
    )}`,
  );
}
