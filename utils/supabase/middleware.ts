import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          request.cookies.set({ name, value, ...options });
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          });
          response.cookies.set({ name, value, ...options });
        },
        remove(name: string, options: CookieOptions) {
          request.cookies.set({ name, value: "", ...options });
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          });
          response.cookies.set({ name, value: "", ...options });
        },
      },
    },
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;

  const isProtectedRoute =
    pathname.startsWith("/company") ||
    pathname.startsWith("/freelancer");

  if (isProtectedRoute && !user) {
    return NextResponse.redirect(
      new URL("/auth", request.url),
    );
  }

  if (user && isProtectedRoute) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role, skills, experience")
      .eq("user_id", user.id)
      .maybeSingle();

    if (!profile) {
      return NextResponse.redirect(
        new URL("/auth/select-role", request.url),
      );
    }

    if (
      pathname.startsWith("/company") &&
      profile.role !== "company"
    ) {
      return NextResponse.redirect(
        new URL("/freelancer/dashboard", request.url),
      );
    }

    if (
      pathname.startsWith("/freelancer") &&
      profile.role !== "developer"
    ) {
      return NextResponse.redirect(
        new URL("/company/dashboard", request.url),
      );
    }

    const isProfileComplete =
      profile.role === "developer"
        ? Array.isArray(profile.skills) &&
          profile.skills.length > 0 &&
          Boolean(profile.experience)
        : true;

    if (
      pathname.endsWith("/dashboard") &&
      !isProfileComplete
    ) {
      const onboardingPath =
        profile.role === "developer"
          ? "/freelancer/profile"
          : "/company/profile";

      return NextResponse.redirect(
        new URL(onboardingPath, request.url),
      );
    }
  }

  return response;
}

export const config = {
  matcher: ["/company/:path*", "/freelancer/:path*"],
};
