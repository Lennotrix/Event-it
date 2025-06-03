import { createClient } from "@/utils/supabase/server";
import {NextRequest, NextResponse} from "next/server";

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const errorCode = requestUrl.searchParams.get("error_code");
  const errorDescription = requestUrl.searchParams.get("error_description");
  const redirect = request.nextUrl.clone();

  redirect.searchParams.delete("code");
  redirect.searchParams.delete("error_code");
  redirect.searchParams.delete("error_description");

  if (errorCode && errorDescription) {
    redirect.pathname = '/forgot-password';
    redirect.searchParams.set("error", errorDescription);
    return NextResponse.redirect(redirect);
  }

  if (code) {
    const supabase = await createClient();

    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (error) {
      redirect.pathname = '/forgot-password';
      redirect.searchParams.set("error", error.message);
    }
    else {
      redirect.pathname = '/reset-password';
    }
  }

  return NextResponse.redirect(redirect);
}
