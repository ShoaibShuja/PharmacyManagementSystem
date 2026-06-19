import type { Metadata } from "next";
import { ReportsPage as ReportsView } from "@/components/reports/reports-page";
import { requireRole } from "@/lib/auth/server";

export const metadata: Metadata = {
  title: "Reports",
};

export default async function ReportsPage() {
  await requireRole(["admin", "pharmacist"]);

  return <ReportsView />;
}
