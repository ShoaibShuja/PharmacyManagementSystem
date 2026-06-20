import type { AppRole } from "@/lib/auth/types";

export function getRoleLandingPath(role: AppRole) {
  return role === "cashier" ? "/sales" : "/dashboard";
}
