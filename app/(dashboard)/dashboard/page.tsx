import type { Metadata } from "next";
import { DashboardView } from "@/components/dashboard/dashboard-view";
import { requireAuth } from "@/lib/auth/server";

export const metadata: Metadata = {
  title: "Dashboard",
};

export default async function DashboardPage() {
  const { profile } = await requireAuth();

  return <DashboardView role={profile.role} />;
}
