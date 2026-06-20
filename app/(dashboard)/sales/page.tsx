import type { Metadata } from "next";
import { PosPage } from "@/components/sales/pos-page";
import { requireRole } from "@/lib/auth/server";

export const metadata: Metadata = {
  title: "Sales & POS",
};

export default async function SalesPage() {
  const { profile } = await requireRole(["admin", "pharmacist", "cashier"]);

  return <PosPage role={profile.role} />;
}
