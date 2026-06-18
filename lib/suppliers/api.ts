import { createClient } from "@/lib/supabase/client";
import type { TablesInsert, TablesUpdate } from "@/lib/supabase/database.types";
import type {
  SupplierListItem,
  SuppliersPageData,
} from "@/lib/suppliers/types";

export async function getSuppliersPageData(): Promise<SuppliersPageData> {
  const supabase = createClient();
  const [suppliersResult, purchasesResult, settingsResult] = await Promise.all([
    supabase.from("suppliers").select("*").order("name"),
    supabase
      .from("purchase_orders")
      .select(
        "id, supplier_id, order_number, status, total_amount, created_at, received_at",
      )
      .order("created_at", { ascending: false }),
    supabase
      .from("app_settings")
      .select("currency_code")
      .eq("singleton", true)
      .single(),
  ]);

  const error =
    suppliersResult.error ?? purchasesResult.error ?? settingsResult.error;
  if (error) throw new Error(error.message);
  if (!settingsResult.data) {
    throw new Error("Application settings could not be loaded.");
  }

  const purchasesBySupplier = new Map<
    string,
    SupplierListItem["purchases"]
  >();
  for (const purchase of purchasesResult.data ?? []) {
    const purchases = purchasesBySupplier.get(purchase.supplier_id) ?? [];
    purchases.push(purchase);
    purchasesBySupplier.set(purchase.supplier_id, purchases);
  }

  return {
    suppliers: (suppliersResult.data ?? []).map((supplier) => {
      const purchases = purchasesBySupplier.get(supplier.id) ?? [];
      const completedPurchases = purchases.filter(
        (purchase) => purchase.status === "received",
      );
      return {
        ...supplier,
        purchases,
        purchaseCount: purchases.length,
        totalPurchased: completedPurchases.reduce(
          (total, purchase) => total + purchase.total_amount,
          0,
        ),
        lastPurchaseAt: purchases[0]?.created_at ?? null,
      };
    }),
    currencyCode: settingsResult.data.currency_code,
  };
}

export async function createSupplier(
  supplier: TablesInsert<"suppliers">,
) {
  const { data, error } = await createClient()
    .from("suppliers")
    .insert(supplier)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateSupplier(
  id: string,
  supplier: TablesUpdate<"suppliers">,
) {
  const { data, error } = await createClient()
    .from("suppliers")
    .update(supplier)
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data;
}
