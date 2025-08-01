import { createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";

export const updateSession = async (request: NextRequest) => {
  try {
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
            getAll() {
              return request.cookies.getAll();
            },
            setAll(cookiesToSet) {
              cookiesToSet.forEach(({ name, value }) =>
                  request.cookies.set(name, value),
              );
              response = NextResponse.next({ request });
              cookiesToSet.forEach(({ name, value, options }) =>
                  response.cookies.set(name, value, options),
              );
            },
          },
        }
    );

    const user = await supabase.auth.getUser();

    const isUnprotectedPage = request.nextUrl.pathname.includes("/sign-in") ||
        request.nextUrl.pathname.includes("/sign-up") ||
        request.nextUrl.pathname.includes("/forgot-password") ||
        request.nextUrl.pathname.includes("/auth/callback") ||
        request.nextUrl.pathname.includes("/auth/signup");

    if (!isUnprotectedPage && user.error) {
      const redirectUrl = new URL("/sign-in", request.url);
      redirectUrl.searchParams.set("redirect", request.nextUrl.pathname);
      return NextResponse.redirect(redirectUrl);
    }

    return response;
  } catch (e) {
    return NextResponse.next({
      request: {
        headers: request.headers,
      },
    });
  }
};
