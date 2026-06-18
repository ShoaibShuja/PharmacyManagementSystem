import { SupplierManagement } from "@/components/suppliers/supplier-management";
import { requireRole } from "@/lib/auth/server";

export default async function SuppliersPage() {
  await requireRole(["admin", "pharmacist"]);

  return <SupplierManagement />;
}
