import { createClient } from "@/utils/supabase/server";
import {NextRequest, NextResponse} from "next/server";

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const errorCode = requestUrl.searchParams.get("error_code");
  const errorDescription = requestUrl.searchParams.get("error_description");
  const first_name = requestUrl.searchParams.get("first_name");
  const last_name = requestUrl.searchParams.get("last_name");
  const username = requestUrl.searchParams.get("username");
  const email = requestUrl.searchParams.get("email");
  const redirect = request.nextUrl.clone();
  const supabase = await createClient()

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

  const { data: { user }, error: userError } = await supabase.auth.getUser()

  const { error: profileError } = await supabase.from('profiles').insert([{
    id: user?.id,
    username: username,
    first_name: first_name,
    last_name: last_name,
    email: email,
    is_active: true
  } as any]);

  if (profileError) {
    console.error('Fehler beim Speichern des Profils:', profileError.message);
    return;
  }

  return NextResponse.redirect(redirect);
}
