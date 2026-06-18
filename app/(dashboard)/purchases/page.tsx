import { PlaceholderPage } from "@/components/shared/placeholder-page";
import { requireRole } from "@/lib/auth/server";

export default async function PurchasesPage() {
  await requireRole(["admin", "pharmacist"]);

  return <PlaceholderPage title="Purchases" description="Create and receive purchase orders." />;
}
