import { UsersRound } from "lucide-react";
import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { requireRole } from "@/lib/auth/server";
import { createClient } from "@/lib/supabase/server";

function formatRole(role: string) {
  return role.charAt(0).toUpperCase() + role.slice(1);
}

export default async function SettingsPage() {
  const { profile, email } = await requireRole(["admin"]);
  const supabase = await createClient();
  const { data: settings } = await supabase
    .from("app_settings")
    .select("pharmacy_name, currency_code, expiry_alert_days")
    .single();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Settings"
        description="Review your profile and basic pharmacy configuration."
      />
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardContent>
            <h2 className="font-semibold">Your profile</h2>
            <dl className="mt-4 space-y-3 text-sm">
              <div>
                <dt className="text-muted-foreground">Name</dt>
                <dd className="font-medium">
                  {profile.full_name.trim() || "Not provided"}
                </dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Email</dt>
                <dd className="font-medium">{email}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Role</dt>
                <dd className="font-medium">{formatRole(profile.role)}</dd>
              </div>
            </dl>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <h2 className="font-semibold">Pharmacy settings</h2>
            <dl className="mt-4 space-y-3 text-sm">
              <div>
                <dt className="text-muted-foreground">Pharmacy name</dt>
                <dd className="font-medium">
                  {settings?.pharmacy_name ?? "Not configured"}
                </dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Currency</dt>
                <dd className="font-medium">
                  {settings?.currency_code ?? "Not configured"}
                </dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Expiry warning</dt>
                <dd className="font-medium">
                  {settings
                    ? `${settings.expiry_alert_days} days`
                    : "Not configured"}
                </dd>
              </div>
            </dl>
          </CardContent>
        </Card>
      </div>
      <EmptyState
        icon={UsersRound}
        title="User management is planned"
        description="A later phase will let Admin users invite staff, change roles, and deactivate accounts safely."
      />
    </div>
  );
}
