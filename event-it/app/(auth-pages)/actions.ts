"use server";

import {baseUrl, encodedRedirect} from "@/utils/utils";
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";

export const signUpAction = async (formData: FormData) => {
  const supabase = await createClient();
  const email = formData.get("email")?.toString();
  const password = formData.get("password")?.toString();
  const redirectTo = formData.get("redirect")?.toString() || "/";
  const first_name = formData.get("name")?.toString();
  const last_name = formData.get("lastname")?.toString();
  const username = formData.get("username")?.toString();


  if (!email || !password) {
    return encodedRedirect(
        "error",
        `/sign-up`,
        "E-Mail und Passwort sind erforderlich",
        redirectTo
    );
  }

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${baseUrl}/auth/signup?username=${username}&first_name=${first_name}&last_name=${last_name}&email=${email}`,
    },
  });



  if (error) {
    console.error(error.code + " " + error.message);
    return encodedRedirect(
        "error",
        `/sign-up`,
        error.message,
        redirectTo
    );
  }

  return encodedRedirect(
      "success",
      `/sign-up`,
      "Danke fürs Anmelden! Schau in dein Postfach und bestätige deine EMail.",
      redirectTo
  );
};

export const signInAction = async (formData: FormData) => {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const redirectTo = formData.get("redirect")?.toString() || "/";
  const supabase = await createClient();

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return encodedRedirect(
        "error",
        `/sign-in`,
        error.message,
        redirectTo,
    );
  }

  return redirect(redirectTo);
};

export const forgotPasswordAction = async (formData: FormData) => {
  const email = formData.get("email")?.toString();
  const redirectTo = formData.get("redirect")?.toString() || "/";
  const supabase = await createClient();

  if (!email) {
    return encodedRedirect(
        "error",
        `/forgot-password`,
        "EMail ist erforderlich",
        redirectTo
    );
  }

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${baseUrl}/auth/callback`,
  });

  if (error) {
    console.error(error.message);
    return encodedRedirect(
        "error",
        `/forgot-password`,
        "Passwort konnte nicht zurückgesetzt werden",
        redirectTo
    );
  }

  return encodedRedirect(
      "success",
      `/forgot-password`,
      "Schau in dein Postfach, um dein Passwort zurückzusetzen.",
      redirectTo
  );
};

export const resetPasswordAction = async (formData: FormData) => {
  const supabase = await createClient();

  const password = formData.get("password") as string;
  const confirmPassword = formData.get("confirmPassword") as string;

  if (!password || !confirmPassword) {
    return encodedRedirect(
        "error",
        "/reset-password",
        "Passwort und Bestätigung dürfen nicht leer sein"
    );
  }

  if (password !== confirmPassword) {
    return encodedRedirect(
        "error",
        "/reset-password",
        "Passwörter stimmen nicht überein"
    );
  }

  const { error } = await supabase.auth.updateUser({ password });

  if (error) {
    return encodedRedirect(
        "error",
        "/reset-password",
        "Aktualisierung des Passworts ist fehlgeschlagen"
    );
  }

  return encodedRedirect(
      "success",
      "/",
      "Passwort aktualisiert"
  );
};
