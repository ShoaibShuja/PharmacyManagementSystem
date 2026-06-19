import type {
  ExpiryReportRow,
  ExpiryWindow,
  InventoryReportRow,
  ReportBatch,
  ReportMedicine,
  ReportSaleItem,
  TopSellingMedicine,
} from "@/lib/reports/types";

const DAY_IN_MS = 86_400_000;

export function getLocalDateValue(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

export function getDefaultDateRange() {
  const end = new Date();
  const start = new Date(end);
  start.setDate(start.getDate() - 29);
  return {
    start: getLocalDateValue(start),
    end: getLocalDateValue(end),
  };
}

export function buildInventoryRows(
  medicines: ReportMedicine[],
  batches: ReportBatch[],
): InventoryReportRow[] {
  const batchTotals = new Map<
    string,
    { totalStock: number; saleableStock: number; stockValue: number }
  >();
  const today = getLocalDateValue(new Date());

  for (const batch of batches) {
    const totals = batchTotals.get(batch.medicine_id) ?? {
      totalStock: 0,
      saleableStock: 0,
      stockValue: 0,
    };
    totals.totalStock += batch.current_quantity;
    totals.stockValue += batch.current_quantity * batch.cost_price;
    if (batch.expiry_date >= today) {
      totals.saleableStock += batch.current_quantity;
    }
    batchTotals.set(batch.medicine_id, totals);
  }

  return medicines.map((medicine) => {
    const totals = batchTotals.get(medicine.id) ?? {
      totalStock: 0,
      saleableStock: 0,
      stockValue: 0,
    };
    return {
      ...medicine,
      ...totals,
      stockValue: roundMoney(totals.stockValue),
      isLowStock:
        medicine.status === "active" &&
        totals.saleableStock <= medicine.reorder_threshold,
    };
  });
}

export function buildExpiryRows(
  medicines: ReportMedicine[],
  batches: ReportBatch[],
): ExpiryReportRow[] {
  const medicineMap = new Map(
    medicines.map((medicine) => [medicine.id, medicine]),
  );
  const today = new Date();
  const startOfToday = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate(),
  );

  return batches.flatMap((batch) => {
    const expiry = new Date(`${batch.expiry_date}T00:00:00`);
    const daysUntilExpiry = Math.ceil(
      (expiry.getTime() - startOfToday.getTime()) / DAY_IN_MS,
    );
    const window = getExpiryWindow(daysUntilExpiry);
    if (!window) return [];
    const medicine = medicineMap.get(batch.medicine_id);
    return [
      {
        ...batch,
        medicineName: medicine?.brand_name ?? "Unknown medicine",
        unit: medicine?.unit ?? "units",
        daysUntilExpiry,
        window,
        stockValue: roundMoney(batch.current_quantity * batch.cost_price),
      },
    ];
  });
}

export function buildTopSellingMedicines(
  saleItems: ReportSaleItem[],
  medicines: ReportMedicine[],
  includedSaleIds: Set<string>,
): TopSellingMedicine[] {
  const medicineMap = new Map(
    medicines.map((medicine) => [medicine.id, medicine.brand_name]),
  );
  const totals = new Map<string, TopSellingMedicine>();

  for (const item of saleItems) {
    if (!includedSaleIds.has(item.sale_id)) continue;
    const current = totals.get(item.medicine_id) ?? {
      medicineId: item.medicine_id,
      medicineName: medicineMap.get(item.medicine_id) ?? "Unknown medicine",
      quantity: 0,
      salesValue: 0,
    };
    current.quantity += item.quantity;
    current.salesValue += item.line_total;
    totals.set(item.medicine_id, current);
  }

  return [...totals.values()]
    .map((item) => ({ ...item, salesValue: roundMoney(item.salesValue) }))
    .toSorted(
      (a, b) => b.quantity - a.quantity || b.salesValue - a.salesValue,
    )
    .slice(0, 10);
}

function getExpiryWindow(days: number): ExpiryWindow | null {
  if (days < 0) return "expired";
  if (days <= 30) return "30";
  if (days <= 60) return "60";
  if (days <= 90) return "90";
  return null;
}

function roundMoney(value: number) {
  return Math.round(value * 100) / 100;
}
