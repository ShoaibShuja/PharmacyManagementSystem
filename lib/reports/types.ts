import type { Tables } from "@/lib/supabase/database.types";

export type ReportSale = Pick<
  Tables<"sales">,
  | "id"
  | "sale_number"
  | "subtotal"
  | "discount_amount"
  | "total_amount"
  | "payment_method"
  | "completed_at"
>;

export type ReportSaleItem = Pick<
  Tables<"sale_items">,
  "sale_id" | "medicine_id" | "quantity" | "line_total"
>;

export type ReportMedicine = Pick<
  Tables<"medicines">,
  | "id"
  | "brand_name"
  | "generic_name"
  | "strength"
  | "unit"
  | "reorder_threshold"
  | "status"
>;

export type ReportBatch = Pick<
  Tables<"inventory_batches">,
  | "id"
  | "medicine_id"
  | "batch_number"
  | "expiry_date"
  | "current_quantity"
  | "cost_price"
  | "selling_price"
>;

export type ReportPurchase = Pick<
  Tables<"purchase_orders">,
  | "id"
  | "order_number"
  | "supplier_id"
  | "status"
  | "total_amount"
  | "created_at"
  | "received_at"
>;

export type ReportSupplier = Pick<Tables<"suppliers">, "id" | "name">;

export type ReportsPageData = {
  sales: ReportSale[];
  saleItems: ReportSaleItem[];
  medicines: ReportMedicine[];
  batches: ReportBatch[];
  purchases: ReportPurchase[];
  suppliers: ReportSupplier[];
  settings: {
    pharmacyName: string;
    currencyCode: string;
  };
};

export type InventoryReportRow = ReportMedicine & {
  totalStock: number;
  saleableStock: number;
  stockValue: number;
  isLowStock: boolean;
};

export type ExpiryWindow = "expired" | "30" | "60" | "90";

export type ExpiryReportRow = ReportBatch & {
  medicineName: string;
  unit: string;
  daysUntilExpiry: number;
  window: ExpiryWindow;
  stockValue: number;
};

export type TopSellingMedicine = {
  medicineId: string;
  medicineName: string;
  quantity: number;
  salesValue: number;
};
