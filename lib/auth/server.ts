import { cache } from "react";
import { redirect } from "next/navigation";
import type { AppRole, AuthContext } from "@/lib/auth/types";
import { createClient } from "@/lib/supabase/server";

export const getCurrentAuthContext = cache(
  async (): Promise<AuthContext | null> => {
    const supabase = await createClient();
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError) {
      if (
        userError.name === "AuthSessionMissingError" ||
        userError.message.toLowerCase().includes("session missing")
      ) {
        return null;
      }

      throw new Error("The current session could not be verified.");
    }

    if (!user) {
      return null;
    }

    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();

    if (profileError) {
      if (profileError.code === "PGRST116") {
        redirect("/unauthorized?reason=profile");
      }

      throw new Error("The staff profile could not be loaded.");
    }

    if (!profile) {
      redirect("/unauthorized?reason=profile");
    }

    return {
      userId: user.id,
      email: user.email ?? profile.email,
      profile,
    };
  },
);

export async function requireAuth() {
  const context = await getCurrentAuthContext();

  if (!context) {
    redirect("/login");
  }

  if (!context.profile.is_active) {
    redirect("/unauthorized?reason=inactive");
  }

  return context;
}

export async function requireRole(allowedRoles: readonly AppRole[]) {
  const context = await requireAuth();

  if (!allowedRoles.includes(context.profile.role)) {
    redirect("/unauthorized?reason=role");
  }

  return context;
}
