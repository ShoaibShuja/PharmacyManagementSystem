import type { Metadata } from "next";
import { PurchaseManagement } from "@/components/purchases/purchase-management";
import { requireRole } from "@/lib/auth/server";

export const metadata: Metadata = {
  title: "Purchase Orders",
};

export default async function PurchasesPage() {
  await requireRole(["admin", "pharmacist"]);

  return <PurchaseManagement />;
}
