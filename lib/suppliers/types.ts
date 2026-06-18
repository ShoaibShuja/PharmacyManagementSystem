import type { Tables } from "@/lib/supabase/database.types";

export type Supplier = Tables<"suppliers">;
export type SupplierPurchase = Pick<
  Tables<"purchase_orders">,
  | "id"
  | "order_number"
  | "status"
  | "total_amount"
  | "created_at"
  | "received_at"
>;

export type SupplierListItem = Supplier & {
  purchases: SupplierPurchase[];
  purchaseCount: number;
  totalPurchased: number;
  lastPurchaseAt: string | null;
};

export type SuppliersPageData = {
  suppliers: SupplierListItem[];
  currencyCode: string;
};
