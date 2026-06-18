import type { Tables } from "@/lib/supabase/database.types";

export type PosMedicine = Pick<
  Tables<"medicines">,
  | "id"
  | "brand_name"
  | "generic_name"
  | "strength"
  | "dosage_form"
  | "unit"
  | "barcode"
  | "sku"
  | "status"
>;

export type PosBatch = Pick<
  Tables<"inventory_batches">,
  | "id"
  | "medicine_id"
  | "batch_number"
  | "expiry_date"
  | "selling_price"
  | "current_quantity"
  | "received_at"
>;

export type PosMedicineOption = PosMedicine & {
  batches: PosBatch[];
  availableStock: number;
  displayPrice: number;
  nearestExpiryDate: string | null;
};

export type CartItem = {
  medicineId: string;
  brandName: string;
  genericName: string | null;
  unit: string;
  quantity: number;
  availableStock: number;
  estimatedUnitPrice: number;
  estimatedLineTotal: number;
};

export type ReceiptItem = {
  id: string;
  medicine_id: string;
  medicine_name: string;
  batch_number: string;
  quantity: number;
  unit_price: number;
  line_total: number;
};

export type SaleReceipt = {
  id: string;
  sale_number: string;
  subtotal: number;
  discount_amount: number;
  total_amount: number;
  payment_method: "cash" | "card" | "other";
  completed_at: string;
  items: ReceiptItem[];
};

export type SaleHistoryItem = Pick<
  Tables<"sales">,
  | "id"
  | "sale_number"
  | "status"
  | "subtotal"
  | "discount_amount"
  | "total_amount"
  | "payment_method"
  | "completed_at"
  | "created_at"
>;

export type SaleHistoryDetail = SaleHistoryItem & {
  items: ReceiptItem[];
};

export type SalesPageData = {
  medicines: PosMedicineOption[];
  sales: SaleHistoryDetail[];
  settings: {
    pharmacyName: string;
    phone: string | null;
    address: string | null;
    currencyCode: string;
    receiptFooter: string | null;
  };
};
