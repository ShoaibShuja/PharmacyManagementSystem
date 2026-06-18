import { createClient } from "@/lib/supabase/client";
import type { Json } from "@/lib/supabase/database.types";
import type {
  PurchaseDeliveryFormValues,
  PurchaseOrderFormValues,
} from "@/lib/purchases/schema";
import type {
  PurchaseMedicine,
  PurchaseOrderDetail,
  PurchasesPageData,
} from "@/lib/purchases/types";

export async function getPurchasesPageData(): Promise<PurchasesPageData> {
  const supabase = createClient();
  const [ordersResult, itemsResult, suppliersResult, medicinesResult, settingsResult] =
    await Promise.all([
      supabase.from("purchase_orders").select("*").order("created_at", {
        ascending: false,
      }),
      supabase.from("purchase_order_items").select("*").order("created_at"),
      supabase.from("suppliers").select("*").order("name"),
      supabase
        .from("medicines")
        .select(
          "id, brand_name, generic_name, strength, unit, default_cost_price, default_selling_price, status",
        )
        .order("brand_name"),
      supabase
        .from("app_settings")
        .select("currency_code")
        .eq("singleton", true)
        .single(),
    ]);

  const error =
    ordersResult.error ??
    itemsResult.error ??
    suppliersResult.error ??
    medicinesResult.error ??
    settingsResult.error;
  if (error) throw new Error(error.message);
  if (!settingsResult.data) {
    throw new Error("Application settings could not be loaded.");
  }

  const suppliers = suppliersResult.data ?? [];
  const medicines = (medicinesResult.data ?? []) as PurchaseMedicine[];
  const supplierMap = new Map(suppliers.map((supplier) => [supplier.id, supplier]));
  const medicineMap = new Map(
    medicines.map((medicine) => [medicine.id, medicine]),
  );
  const itemsByOrder = new Map<string, PurchaseOrderDetail["items"]>();

  for (const item of itemsResult.data ?? []) {
    const orderItems = itemsByOrder.get(item.purchase_order_id) ?? [];
    orderItems.push({
      ...item,
      medicine: medicineMap.get(item.medicine_id) ?? null,
    });
    itemsByOrder.set(item.purchase_order_id, orderItems);
  }

  return {
    orders: (ordersResult.data ?? []).map((order) => {
      const items = itemsByOrder.get(order.id) ?? [];
      return {
        ...order,
        supplier: supplierMap.get(order.supplier_id) ?? null,
        items,
        totalUnits: items.reduce(
          (total, item) => total + item.ordered_quantity,
          0,
        ),
      };
    }),
    suppliers,
    medicines,
    currencyCode: settingsResult.data.currency_code,
  };
}

export async function createPurchaseOrder(values: PurchaseOrderFormValues) {
  const items: Json = values.items.map((item) => ({
    medicine_id: item.medicine_id,
    ordered_quantity: item.ordered_quantity,
    unit_cost: item.unit_cost,
    intended_selling_price: item.intended_selling_price,
  }));
  const { data, error } = await createClient().rpc("create_purchase_order", {
    requested_supplier_id: values.supplier_id,
    requested_expected_date: values.expected_date || null,
    requested_notes: values.notes,
    requested_items: items,
  });

  if (error) throw error;
  return data;
}

export async function setPurchaseOrderStatus(
  orderId: string,
  status: "ordered" | "cancelled",
) {
  const { error } = await createClient().rpc("set_purchase_order_status", {
    requested_order_id: orderId,
    requested_status: status,
  });
  if (error) throw error;
}

export async function receivePurchaseOrder(
  orderId: string,
  values: PurchaseDeliveryFormValues,
) {
  const deliveries: Json = values.deliveries.map((delivery) => ({
    purchase_order_item_id: delivery.purchase_order_item_id,
    batch_number: delivery.batch_number,
    expiry_date: delivery.expiry_date,
  }));
  const { error } = await createClient().rpc("receive_purchase_order", {
    requested_order_id: orderId,
    requested_deliveries: deliveries,
  });
  if (error) throw error;
}
