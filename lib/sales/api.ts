import { createClient } from "@/lib/supabase/client";
import { saleReceiptSchema } from "@/lib/sales/schema";
import type {
  PosBatch,
  PosMedicineOption,
  ReceiptItem,
  SaleHistoryDetail,
  SaleReceipt,
  PosData,
  SalesHistoryData,
} from "@/lib/sales/types";
import type { Json } from "@/lib/supabase/database.types";

function getSaleableBatches(batches: PosBatch[]) {
  const today = new Date();
  const date = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;

  return batches
    .filter(
      (batch) => batch.current_quantity > 0 && batch.expiry_date >= date,
    )
    .sort((a, b) => {
      const expiryComparison = a.expiry_date.localeCompare(b.expiry_date);
      if (expiryComparison !== 0) return expiryComparison;
      return a.received_at.localeCompare(b.received_at);
    });
}

export function estimateMedicineTotal(
  medicine: PosMedicineOption,
  quantity: number,
) {
  let remaining = quantity;
  let total = 0;

  for (const batch of medicine.batches) {
    if (remaining === 0) break;
    const allocated = Math.min(remaining, batch.current_quantity);
    total += allocated * batch.selling_price;
    remaining -= allocated;
  }

  return Math.round(total * 100) / 100;
}

export async function getPosData(): Promise<PosData> {
  const supabase = createClient();
  const [medicinesResult, batchesResult, settingsResult] = await Promise.all([
      supabase
        .from("medicines")
        .select(
          "id, brand_name, generic_name, strength, dosage_form, unit, barcode, sku, status",
        )
        .order("brand_name"),
      supabase
        .from("inventory_batches")
        .select(
          "id, medicine_id, batch_number, expiry_date, selling_price, current_quantity, received_at",
        )
        .gt("current_quantity", 0)
        .order("expiry_date")
        .order("received_at"),
      supabase
        .from("app_settings")
        .select(
          "pharmacy_name, phone, address, currency_code, receipt_footer",
        )
        .eq("singleton", true)
        .single(),
    ]);

  const error =
    medicinesResult.error ??
    batchesResult.error ??
    settingsResult.error;
  if (error) throw new Error(error.message);
  if (!settingsResult.data) {
    throw new Error("Application settings could not be loaded.");
  }

  const batchesByMedicine = new Map<string, PosBatch[]>();
  for (const batch of batchesResult.data ?? []) {
    const medicineBatches = batchesByMedicine.get(batch.medicine_id) ?? [];
    medicineBatches.push(batch);
    batchesByMedicine.set(batch.medicine_id, medicineBatches);
  }

  const medicines: PosMedicineOption[] = (medicinesResult.data ?? [])
    .filter((medicine) => medicine.status === "active")
    .map((medicine) => {
      const batches = getSaleableBatches(
        batchesByMedicine.get(medicine.id) ?? [],
      );
      return {
        ...medicine,
        batches,
        availableStock: batches.reduce(
          (total, batch) => total + batch.current_quantity,
          0,
        ),
        displayPrice: batches[0]?.selling_price ?? 0,
        nearestExpiryDate: batches[0]?.expiry_date ?? null,
      };
    });

  return {
    medicines,
    settings: {
      pharmacyName: settingsResult.data.pharmacy_name,
      phone: settingsResult.data.phone,
      address: settingsResult.data.address,
      currencyCode: settingsResult.data.currency_code,
      receiptFooter: settingsResult.data.receipt_footer,
    },
  };
}

export async function getSalesHistory(): Promise<SalesHistoryData> {
  const supabase = createClient();
  const [salesResult, medicinesResult, batchesResult] = await Promise.all([
    supabase
      .from("sales")
      .select(
        "id, sale_number, status, subtotal, discount_amount, total_amount, payment_method, completed_at, created_at",
      )
      .eq("status", "completed")
      .order("completed_at", { ascending: false })
      .limit(250),
    supabase.from("medicines").select("id, brand_name"),
    supabase.from("inventory_batches").select("id, batch_number"),
  ]);

  const error =
    salesResult.error ?? medicinesResult.error ?? batchesResult.error;
  if (error) throw new Error(error.message);

  const sales = salesResult.data ?? [];
  const saleIds = sales.map((sale) => sale.id);
  const saleItemsResult =
    saleIds.length > 0
      ? await supabase
          .from("sale_items")
          .select(
            "id, sale_id, medicine_id, inventory_batch_id, quantity, unit_price, line_total",
          )
          .in("sale_id", saleIds)
      : { data: [], error: null };

  if (saleItemsResult.error) throw new Error(saleItemsResult.error.message);

  const medicineMap = new Map(
    (medicinesResult.data ?? []).map((medicine) => [medicine.id, medicine]),
  );
  const batchMap = new Map(
    (batchesResult.data ?? []).map((batch) => [batch.id, batch]),
  );
  const itemsBySale = new Map<string, ReceiptItem[]>();

  for (const item of saleItemsResult.data ?? []) {
    const items = itemsBySale.get(item.sale_id) ?? [];
    items.push({
      id: item.id,
      medicine_id: item.medicine_id,
      medicine_name:
        medicineMap.get(item.medicine_id)?.brand_name ?? "Unknown medicine",
      batch_number: item.inventory_batch_id
        ? batchMap.get(item.inventory_batch_id)?.batch_number ?? "Unknown"
        : "Not recorded",
      quantity: item.quantity,
      unit_price: item.unit_price,
      line_total: item.line_total,
    });
    itemsBySale.set(item.sale_id, items);
  }

  const history: SaleHistoryDetail[] = sales.map((sale) => ({
    ...sale,
    items: itemsBySale.get(sale.id) ?? [],
  }));

  return { sales: history };
}

export async function completeSale(input: {
  items: Array<{ medicineId: string; quantity: number }>;
  discount: number;
  paymentMethod: "cash" | "card" | "other";
}): Promise<SaleReceipt> {
  const requestedItems: Json = input.items.map((item) => ({
    medicine_id: item.medicineId,
    quantity: item.quantity,
  }));

  const { data, error } = await createClient().rpc("complete_sale", {
    requested_items: requestedItems,
    requested_discount: input.discount,
    requested_payment_method: input.paymentMethod,
  });

  if (error) throw error;
  return saleReceiptSchema.parse(data);
}
