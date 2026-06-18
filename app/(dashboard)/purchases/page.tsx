import { PurchaseManagement } from "@/components/purchases/purchase-management";
import { requireRole } from "@/lib/auth/server";

export default async function PurchasesPage() {
  await requireRole(["admin", "pharmacist"]);

  return <PurchaseManagement />;
}
