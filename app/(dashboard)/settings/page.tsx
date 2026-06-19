import type { Metadata } from "next";
import { SettingsManagement } from "@/components/settings/settings-management";
import { requireRole } from "@/lib/auth/server";

export const metadata: Metadata = {
  title: "Settings",
};

export default async function SettingsPage() {
  const { profile } = await requireRole(["admin", "pharmacist"]);
  return <SettingsManagement role={profile.role} currentUserId={profile.id} />;
}
