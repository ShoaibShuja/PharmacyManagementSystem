import { PlaceholderPage } from "@/components/shared/placeholder-page";
import { requireRole } from "@/lib/auth/server";

export default async function SuppliersPage() {
  await requireRole(["admin", "pharmacist"]);

  return <PlaceholderPage title="Suppliers" description="Manage medicine supplier information." />;
}
