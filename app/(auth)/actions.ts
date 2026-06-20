"use server";

import { redirect } from "next/navigation";
import { getRoleLandingPath } from "@/lib/auth/landing";
import { createClient } from "@/lib/supabase/server";

export type LoginState = {
  error: string | null;
};

function getFriendlyAuthError(message: string) {
  const normalized = message.toLowerCase();

  if (normalized.includes("invalid login credentials")) {
    return "The email address or password is incorrect.";
  }

  if (normalized.includes("email not confirmed")) {
    return "Your email address has not been confirmed. Ask the pharmacy administrator for help.";
  }

  if (normalized.includes("too many requests")) {
    return "Too many sign-in attempts. Wait a few minutes and try again.";
  }

  return "Sign-in could not be completed. Check your details and try again.";
}

export async function loginAction(
  _previousState: LoginState,
  formData: FormData,
): Promise<LoginState> {
  const email = formData.get("email");
  const password = formData.get("password");

  if (typeof email !== "string" || !email.trim()) {
    return { error: "Enter your email address." };
  }

  if (typeof password !== "string" || !password) {
    return { error: "Enter your password." };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithPassword({
    email: email.trim(),
    password,
  });

  if (error) {
    return { error: getFriendlyAuthError(error.message) };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", data.user.id)
    .single();

  redirect(profile ? getRoleLandingPath(profile.role) : "/dashboard");
}

export async function logoutAction() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}
