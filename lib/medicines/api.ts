import { createClient } from "@/lib/supabase/client";
import type { TablesInsert, TablesUpdate } from "@/lib/supabase/database.types";
import type {
  MedicineCatalogData,
  MedicineCatalogItem,
} from "@/lib/medicines/types";

const DAY_IN_MS = 86_400_000;

function parseDateOnly(value: string) {
  return new Date(`${value}T00:00:00`);
}

function startOfToday() {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate());
}

export async function getMedicineCatalog(): Promise<MedicineCatalogData> {
  const supabase = createClient();
  const [medicinesResult, categoriesResult, batchesResult, settingsResult] =
    await Promise.all([
      supabase.from("medicines").select("*").order("brand_name"),
      supabase.from("medicine_categories").select("*").order("name"),
      supabase
        .from("inventory_batches")
        .select("*")
        .order("expiry_date")
        .order("received_at"),
      supabase
        .from("app_settings")
        .select("expiry_alert_days, currency_code")
        .eq("singleton", true)
        .single(),
    ]);

  const error =
    medicinesResult.error ??
    categoriesResult.error ??
    batchesResult.error ??
    settingsResult.error;

  if (error) {
    throw new Error(error.message);
  }

  if (!settingsResult.data) {
    throw new Error("Application settings could not be loaded.");
  }

  const categories = categoriesResult.data ?? [];
  const batches = batchesResult.data ?? [];
  const categoryMap = new Map(categories.map((category) => [category.id, category]));
  const batchesByMedicine = new Map<string, typeof batches>();

  for (const batch of batches) {
    const medicineBatches = batchesByMedicine.get(batch.medicine_id) ?? [];
    medicineBatches.push(batch);
    batchesByMedicine.set(batch.medicine_id, medicineBatches);
  }

  const today = startOfToday();
  const expiryAlertDays = settingsResult.data.expiry_alert_days;
  const warningDate = new Date(today.getTime() + expiryAlertDays * DAY_IN_MS);

  const medicines: MedicineCatalogItem[] = (medicinesResult.data ?? []).map(
    (medicine) => {
      const medicineBatches = batchesByMedicine.get(medicine.id) ?? [];
      let totalStock = 0;
      let saleableStock = 0;
      let nearestExpiryDate: string | null = null;
      let hasExpiredStock = false;
      let isExpiringSoon = false;

      for (const batch of medicineBatches) {
        totalStock += batch.current_quantity;

        if (batch.current_quantity === 0) {
          continue;
        }

        const expiryDate = parseDateOnly(batch.expiry_date);
        if (
          nearestExpiryDate === null ||
          batch.expiry_date < nearestExpiryDate
        ) {
          nearestExpiryDate = batch.expiry_date;
        }

        if (expiryDate < today) {
          hasExpiredStock = true;
          continue;
        }

        saleableStock += batch.current_quantity;
        if (expiryDate <= warningDate) {
          isExpiringSoon = true;
        }
      }

      return {
        ...medicine,
        category: medicine.category_id
          ? categoryMap.get(medicine.category_id) ?? null
          : null,
        batches: medicineBatches,
        totalStock,
        saleableStock,
        nearestExpiryDate,
        hasExpiredStock,
        isExpiringSoon,
        isLowStock:
          medicine.status === "active" &&
          saleableStock <= medicine.reorder_threshold,
      };
    },
  );

  return {
    medicines,
    categories,
    expiryAlertDays,
    currencyCode: settingsResult.data.currency_code,
  };
}

export async function createMedicine(
  medicine: TablesInsert<"medicines">,
) {
  const { data, error } = await createClient()
    .from("medicines")
    .insert(medicine)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateMedicine(
  id: string,
  medicine: TablesUpdate<"medicines">,
) {
  const { data, error } = await createClient()
    .from("medicines")
    .update(medicine)
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function setMedicineStatus(
  id: string,
  status: "active" | "inactive",
) {
  return updateMedicine(id, { status });
}

export async function createMedicineCategory(
  category: TablesInsert<"medicine_categories">,
) {
  const { data, error } = await createClient()
    .from("medicine_categories")
    .insert(category)
    .select()
    .single();

  if (error) throw error;
  return data;
}
