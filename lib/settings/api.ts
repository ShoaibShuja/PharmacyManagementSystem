import type { AppRole } from "@/lib/auth/types";
import type { PharmacySettingsFormValues } from "@/lib/settings/schema";
import type { SettingsPageData } from "@/lib/settings/types";
import { createClient } from "@/lib/supabase/client";

export async function getSettingsPageData(
  role: AppRole,
): Promise<SettingsPageData> {
  const supabase = createClient();
  const settingsPromise = supabase
    .from("app_settings")
    .select(
      "pharmacy_name, address, phone, currency_code, receipt_footer, expiry_alert_days, updated_at",
    )
    .eq("singleton", true)
    .single();
  const usersPromise =
    role === "admin"
      ? supabase
          .from("profiles")
          .select("id, email, full_name, role, is_active, created_at")
          .order("full_name")
          .order("email")
      : Promise.resolve({ data: [], error: null });
  const [settingsResult, usersResult] = await Promise.all([
    settingsPromise,
    usersPromise,
  ]);

  const error = settingsResult.error ?? usersResult.error;
  if (error) throw new Error(error.message);
  if (!settingsResult.data) {
    throw new Error("Pharmacy settings could not be loaded.");
  }

  return {
    settings: settingsResult.data,
    users: usersResult.data ?? [],
  };
}

export async function updatePharmacySettings(
  values: PharmacySettingsFormValues,
  userId: string,
) {
  const { data, error } = await createClient()
    .from("app_settings")
    .update({
      pharmacy_name: values.pharmacy_name,
      address: values.address || null,
      phone: values.phone || null,
      currency_code: values.currency_code,
      receipt_footer: values.receipt_footer || null,
      expiry_alert_days: values.expiry_alert_days,
      updated_by: userId,
    })
    .eq("singleton", true)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function changeUserRole(
  userId: string,
  role: AppRole,
) {
  const { error } = await createClient().rpc("change_user_role", {
    requested_user_id: userId,
    requested_role: role,
  });
  if (error) throw error;
}
