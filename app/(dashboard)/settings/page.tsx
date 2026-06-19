import { SettingsManagement } from "@/components/settings/settings-management";
import { requireRole } from "@/lib/auth/server";

export default async function SettingsPage() {
  const { profile } = await requireRole(["admin", "pharmacist"]);
  return <SettingsManagement role={profile.role} currentUserId={profile.id} />;
}
