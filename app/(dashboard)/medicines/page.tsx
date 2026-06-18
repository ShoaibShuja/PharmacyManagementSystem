import type { Metadata } from "next";
import { MedicineCatalog } from "@/components/medicines/medicine-catalog";
import { requireAuth } from "@/lib/auth/server";

export const metadata: Metadata = {
  title: "Medicines",
};

export default async function MedicinesPage() {
  const { profile } = await requireAuth();

  return <MedicineCatalog role={profile.role} />;
}
