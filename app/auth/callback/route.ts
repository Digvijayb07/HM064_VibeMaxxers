import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const error_description = searchParams.get("error_description");

  if (!code) {
    return NextResponse.redirect(
      `${origin}/auth?error=${encodeURIComponent(
        error_description || "Authentication failed",
      )}`,
    );
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.exchangeCodeForSession(code);

  if (error || !data.user) {
    return NextResponse.redirect(
      `${origin}/auth?error=${encodeURIComponent(
        error?.message || "Authentication failed",
      )}`,
    );
  }

  const userId = data.user.id;

 
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("user_id", userId)
    .maybeSingle();

  
  if (!profile) {
    return NextResponse.redirect(`${origin}/select-role`);
  }

  const redirectPath =
    profile.role === "company"
      ? "/company/dashboard"
      : "/freelancer/dashboard";

  return NextResponse.redirect(`${origin}${redirectPath}`);
}
