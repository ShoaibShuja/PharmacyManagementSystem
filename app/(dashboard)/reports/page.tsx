import { PlaceholderPage } from "@/components/shared/placeholder-page";
import { requireRole } from "@/lib/auth/server";

export default async function ReportsPage() {
  await requireRole(["admin", "pharmacist"]);

  return <PlaceholderPage title="Reports" description="Review sales, inventory, purchase, and expiry information." />;
}
