import { createClient } from "@/lib/supabase/client";
import type { ReportsPageData } from "@/lib/reports/types";

export async function getReportsPageData(): Promise<ReportsPageData> {
  const supabase = createClient();
  const [
    salesResult,
    saleItemsResult,
    medicinesResult,
    batchesResult,
    purchasesResult,
    suppliersResult,
    settingsResult,
  ] = await Promise.all([
    supabase
      .from("sales")
      .select(
        "id, sale_number, subtotal, discount_amount, total_amount, payment_method, completed_at",
      )
      .eq("status", "completed")
      .order("completed_at", { ascending: false }),
    supabase
      .from("sale_items")
      .select("sale_id, medicine_id, quantity, line_total"),
    supabase
      .from("medicines")
      .select(
        "id, brand_name, generic_name, strength, unit, reorder_threshold, status",
      )
      .order("brand_name"),
    supabase
      .from("inventory_batches")
      .select(
        "id, medicine_id, batch_number, expiry_date, current_quantity, cost_price, selling_price",
      )
      .gt("current_quantity", 0)
      .order("expiry_date"),
    supabase
      .from("purchase_orders")
      .select(
        "id, order_number, supplier_id, status, total_amount, created_at, received_at",
      )
      .order("created_at", { ascending: false }),
    supabase.from("suppliers").select("id, name").order("name"),
    supabase
      .from("app_settings")
      .select("pharmacy_name, currency_code")
      .eq("singleton", true)
      .single(),
  ]);

  const error =
    salesResult.error ??
    saleItemsResult.error ??
    medicinesResult.error ??
    batchesResult.error ??
    purchasesResult.error ??
    suppliersResult.error ??
    settingsResult.error;

  if (error) throw new Error(error.message);
  if (!settingsResult.data) {
    throw new Error("Application settings could not be loaded.");
  }

  return {
    sales: salesResult.data ?? [],
    saleItems: saleItemsResult.data ?? [],
    medicines: medicinesResult.data ?? [],
    batches: batchesResult.data ?? [],
    purchases: purchasesResult.data ?? [],
    suppliers: suppliersResult.data ?? [],
    settings: {
      pharmacyName: settingsResult.data.pharmacy_name,
      currencyCode: settingsResult.data.currency_code,
    },
  };
}
