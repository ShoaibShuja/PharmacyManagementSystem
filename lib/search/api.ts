import type { AppRole } from "@/lib/auth/types";
import type { GlobalSearchResult } from "@/lib/search/types";
import { createClient } from "@/lib/supabase/client";

export async function getGlobalSearchData(
  role: AppRole,
): Promise<GlobalSearchResult[]> {
  const supabase = createClient();
  const staff = role === "admin" || role === "pharmacist";
  const [medicinesResult, salesResult, suppliersResult, purchasesResult] =
    await Promise.all([
      supabase
        .from("medicines")
        .select("id, brand_name, generic_name, strength, sku, barcode, status")
        .order("brand_name")
        .limit(250),
      supabase
        .from("sales")
        .select("id, sale_number, total_amount, payment_method, completed_at")
        .eq("status", "completed")
        .order("completed_at", { ascending: false })
        .limit(100),
      staff
        ? supabase
            .from("suppliers")
            .select("id, name, contact_person, phone, email, is_active")
            .order("name")
            .limit(150)
        : Promise.resolve({ data: [], error: null }),
      staff
        ? supabase
            .from("purchase_orders")
            .select("id, order_number, status, total_amount, created_at")
            .order("created_at", { ascending: false })
            .limit(100)
        : Promise.resolve({ data: [], error: null }),
    ]);

  const error =
    medicinesResult.error ??
    salesResult.error ??
    suppliersResult.error ??
    purchasesResult.error;
  if (error) throw new Error(error.message);

  return [
    ...(medicinesResult.data ?? []).map((medicine) => ({
      id: medicine.id,
      type: "medicine" as const,
      title: medicine.brand_name,
      description:
        [medicine.generic_name, medicine.strength].filter(Boolean).join(" · ") ||
        (medicine.status === "active" ? "Active medicine" : "Inactive medicine"),
      href: "/medicines",
      keywords: [
        medicine.brand_name,
        medicine.generic_name,
        medicine.strength,
        medicine.sku,
        medicine.barcode,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase(),
    })),
    ...(salesResult.data ?? []).map((sale) => ({
      id: sale.id,
      type: "sale" as const,
      title: sale.sale_number,
      description: `${sale.payment_method} · ${sale.total_amount.toFixed(2)} · ${
        sale.completed_at
          ? new Date(sale.completed_at).toLocaleDateString()
          : "Date unavailable"
      }`,
      href: "/sales",
      keywords: `${sale.sale_number} ${sale.payment_method}`.toLowerCase(),
    })),
    ...(suppliersResult.data ?? []).map((supplier) => ({
      id: supplier.id,
      type: "supplier" as const,
      title: supplier.name,
      description:
        supplier.contact_person ||
        supplier.phone ||
        supplier.email ||
        (supplier.is_active ? "Active supplier" : "Inactive supplier"),
      href: "/suppliers",
      keywords: [
        supplier.name,
        supplier.contact_person,
        supplier.phone,
        supplier.email,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase(),
    })),
    ...(purchasesResult.data ?? []).map((purchase) => ({
      id: purchase.id,
      type: "purchase" as const,
      title: purchase.order_number,
      description: `${purchase.status === "received" ? "Delivered" : purchase.status} · ${purchase.total_amount.toFixed(2)}`,
      href: "/purchases",
      keywords: `${purchase.order_number} ${purchase.status}`.toLowerCase(),
    })),
  ];
}
