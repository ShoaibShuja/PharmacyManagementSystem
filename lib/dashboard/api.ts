import { createClient } from "@/lib/supabase/client";
import type { DashboardData } from "@/lib/dashboard/types";

const DAY_IN_MS = 86_400_000;

function startOfLocalDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

export async function getDashboardData(): Promise<DashboardData> {
  const supabase = createClient();
  const trendStart = startOfLocalDay(
    new Date(Date.now() - 6 * DAY_IN_MS),
  ).toISOString();

  const [
    medicinesResult,
    batchesResult,
    settingsResult,
    recentSalesResult,
    trendSalesResult,
  ] = await Promise.all([
    supabase
      .from("medicines")
      .select(
        "id, brand_name, generic_name, reorder_threshold, status, unit",
      )
      .eq("status", "active")
      .order("brand_name"),
    supabase
      .from("inventory_batches")
      .select(
        "id, medicine_id, batch_number, expiry_date, current_quantity",
      )
      .gt("current_quantity", 0)
      .order("expiry_date"),
    supabase
      .from("app_settings")
      .select("currency_code")
      .eq("singleton", true)
      .single(),
    supabase
      .from("sales")
      .select(
        "id, sale_number, total_amount, payment_method, completed_at",
      )
      .eq("status", "completed")
      .not("completed_at", "is", null)
      .order("completed_at", { ascending: false })
      .limit(5),
    supabase
      .from("sales")
      .select(
        "id, sale_number, total_amount, payment_method, completed_at",
      )
      .eq("status", "completed")
      .not("completed_at", "is", null)
      .gte("completed_at", trendStart)
      .order("completed_at"),
  ]);

  const error =
    medicinesResult.error ??
    batchesResult.error ??
    settingsResult.error ??
    recentSalesResult.error ??
    trendSalesResult.error;

  if (error) throw new Error(error.message);
  if (!settingsResult.data) {
    throw new Error("Application settings could not be loaded.");
  }

  return {
    medicines: medicinesResult.data ?? [],
    batches: batchesResult.data ?? [],
    recentSales: recentSalesResult.data ?? [],
    trendSales: trendSalesResult.data ?? [],
    currencyCode: settingsResult.data.currency_code,
  };
}
