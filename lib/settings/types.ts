import type { Tables } from "@/lib/supabase/database.types";

export type PharmacySettings = Pick<
  Tables<"app_settings">,
  | "pharmacy_name"
  | "address"
  | "phone"
  | "currency_code"
  | "receipt_footer"
  | "expiry_alert_days"
  | "updated_at"
>;

export type ManagedUser = Pick<
  Tables<"profiles">,
  | "id"
  | "email"
  | "full_name"
  | "role"
  | "is_active"
  | "created_at"
>;

export type SettingsPageData = {
  settings: PharmacySettings;
  users: ManagedUser[];
};
