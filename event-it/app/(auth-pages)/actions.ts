"use server";

import { encodedRedirect } from "@/utils/utils";
import { createClient } from "@/utils/supabase/server";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export const signUpAction = async (formData: FormData) => {
  const email = formData.get("email")?.toString();
  const password = formData.get("password")?.toString();
  const redirectTo = formData.get("redirect")?.toString() || "/";
  const supabase = await createClient();
  const origin = (await headers()).get("origin");

  if (!email || !password) {
    return encodedRedirect(
        "error",
        `/sign-up`,
        "Email and password are required",
        redirectTo
    );
  }

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${origin}/auth/callback`,
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
      "Thanks for signing up! Please check your email for a verification link.",
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
  const origin = (await headers()).get("origin");

  if (!email) {
    return encodedRedirect(
        "error",
        `/forgot-password`,
        "Email is required",
        redirectTo
    );
  }

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${origin}/auth/callback?redirect_to=/reset-password`,
  });

  if (error) {
    console.error(error.message);
    return encodedRedirect(
        "error",
        `/forgot-password`,
        "Could not reset password",
        redirectTo
    );
  }

  return encodedRedirect(
      "success",
      `/forgot-password`,
      "Check your email for a link to reset your password.",
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
        "Password and confirm password are required"
    );
  }

  if (password !== confirmPassword) {
    return encodedRedirect(
        "error",
        "/reset-password",
        "Passwords do not match"
    );
  }

  const { error } = await supabase.auth.updateUser({ password });

  if (error) {
    return encodedRedirect(
        "error",
        "/reset-password",
        "Password update failed"
    );
  }

  return encodedRedirect(
      "success",
      "/",
      "Password updated"
  );
};
