import { redirect } from "next/navigation";
import { getRoleLandingPath } from "@/lib/auth/landing";
import { requireAuth } from "@/lib/auth/server";

export default async function Home() {
  const { profile } = await requireAuth();
  redirect(getRoleLandingPath(profile.role));
}
