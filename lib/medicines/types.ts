import type { Tables } from "@/lib/supabase/database.types";

export type Medicine = Tables<"medicines">;
export type MedicineCategory = Tables<"medicine_categories">;
export type InventoryBatch = Tables<"inventory_batches">;

export type MedicineCatalogItem = Medicine & {
  category: MedicineCategory | null;
  batches: InventoryBatch[];
  totalStock: number;
  saleableStock: number;
  nearestExpiryDate: string | null;
  hasExpiredStock: boolean;
  isExpiringSoon: boolean;
  isLowStock: boolean;
};

export type MedicineCatalogData = {
  medicines: MedicineCatalogItem[];
  categories: MedicineCategory[];
  expiryAlertDays: number;
  currencyCode: string;
};
