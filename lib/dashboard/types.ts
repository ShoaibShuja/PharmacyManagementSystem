import type { Tables } from "@/lib/supabase/database.types";

export type DashboardSale = Pick<
  Tables<"sales">,
  "id" | "sale_number" | "total_amount" | "payment_method" | "completed_at"
>;

export type DashboardMedicine = Pick<
  Tables<"medicines">,
  | "id"
  | "brand_name"
  | "generic_name"
  | "reorder_threshold"
  | "status"
  | "unit"
>;

export type DashboardBatch = Pick<
  Tables<"inventory_batches">,
  "id" | "medicine_id" | "batch_number" | "expiry_date" | "current_quantity"
>;

export type DashboardData = {
  medicines: DashboardMedicine[];
  batches: DashboardBatch[];
  recentSales: DashboardSale[];
  trendSales: DashboardSale[];
  currencyCode: string;
};

export type LowStockAlert = {
  medicineId: string;
  brandName: string;
  genericName: string | null;
  unit: string;
  saleableStock: number;
  reorderThreshold: number;
};

export type ExpiryAlert = {
  batchId: string;
  medicineId: string;
  brandName: string;
  batchNumber: string;
  expiryDate: string;
  currentQuantity: number;
  daysUntilExpiry: number;
};

export type SalesTrendPoint = {
  date: string;
  label: string;
  total: number;
  transactions: number;
};
