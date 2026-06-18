import type { Tables } from "@/lib/supabase/database.types";

export type PurchaseSupplier = Tables<"suppliers">;
export type PurchaseMedicine = Pick<
  Tables<"medicines">,
  | "id"
  | "brand_name"
  | "generic_name"
  | "strength"
  | "unit"
  | "default_cost_price"
  | "default_selling_price"
  | "status"
>;

export type PurchaseOrderItemDetail = Tables<"purchase_order_items"> & {
  medicine: PurchaseMedicine | null;
};

export type PurchaseOrderDetail = Tables<"purchase_orders"> & {
  supplier: PurchaseSupplier | null;
  items: PurchaseOrderItemDetail[];
  totalUnits: number;
};

export type PurchasesPageData = {
  orders: PurchaseOrderDetail[];
  suppliers: PurchaseSupplier[];
  medicines: PurchaseMedicine[];
  currencyCode: string;
};
