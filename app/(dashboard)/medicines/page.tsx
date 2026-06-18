import { PlaceholderPage } from "@/components/shared/placeholder-page";
import { requireAuth } from "@/lib/auth/server";

export default async function MedicinesPage() {
  const { profile } = await requireAuth();
  const description =
    profile.role === "cashier"
      ? "Look up medicine availability for sales."
      : "Manage the medicine catalog and availability.";

  return <PlaceholderPage title="Medicines" description={description} />;
}
