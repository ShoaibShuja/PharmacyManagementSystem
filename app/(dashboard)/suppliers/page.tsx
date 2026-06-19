import type { Metadata } from "next";
import { SupplierManagement } from "@/components/suppliers/supplier-management";
import { requireRole } from "@/lib/auth/server";

export const metadata: Metadata = {
  title: "Suppliers",
};

export default async function SuppliersPage() {
  await requireRole(["admin", "pharmacist"]);

  return <SupplierManagement />;
}
