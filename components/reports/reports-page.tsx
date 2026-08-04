"use client";

import { useQuery } from "@tanstack/react-query";
import {
  CalendarClock,
  Download,
  FileDown,
  Package,
  ReceiptText,
  ShoppingCart,
  Truck,
} from "lucide-react";
import { useDeferredValue, useMemo, useState } from "react";
import { toast } from "sonner";
import {
  ExpiryReportTable,
  InventoryReportTable,
  PurchaseReportTable,
  SalesReportTable,
  TopSellingTable,
} from "@/components/reports/report-tables";
import { ErrorState } from "@/components/shared/error-state";
import { LoadingState } from "@/components/shared/loading-state";
import { ListSearchInput } from "@/components/shared/list-controls";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getUserErrorMessage } from "@/lib/errors";
import { getReportsPageData } from "@/lib/reports/api";
import {
  buildExpiryRows,
  buildInventoryRows,
  buildTopSellingMedicines,
  getDefaultDateRange,
  getLocalDateValue,
} from "@/lib/reports/derive";
import {
  downloadCsv,
  downloadPdf,
  type ReportExport,
} from "@/lib/reports/export";
import type {
  ExpiryReportRow,
  ExpiryWindow,
  InventoryReportRow,
  ReportPurchase,
  ReportSale,
  TopSellingMedicine,
} from "@/lib/reports/types";
import { cn } from "@/lib/utils";

const queryKey = ["reports"] as const;
type ReportView = "sales" | "inventory" | "expiry" | "purchases";
type InventoryFilter = "all" | "low" | "available";
type ExpiryFilter = "all" | ExpiryWindow;
type PurchaseStatusFilter = "all" | ReportPurchase["status"];

const reportViews = [
  { value: "sales", label: "Sales", icon: ShoppingCart },
  { value: "inventory", label: "Inventory", icon: Package },
  { value: "expiry", label: "Expiry", icon: CalendarClock },
  { value: "purchases", label: "Purchases", icon: Truck },
] as const;

const dateFormatter = new Intl.DateTimeFormat("en", {
  year: "numeric",
  month: "short",
  day: "numeric",
});

export function ReportsPage() {
  const defaultDates = useMemo(() => getDefaultDateRange(), []);
  const [view, setView] = useState<ReportView>("sales");
  const [reportSearch, setReportSearch] = useState("");
  const deferredReportSearch = useDeferredValue(reportSearch);
  const [startDate, setStartDate] = useState(defaultDates.start);
  const [endDate, setEndDate] = useState(defaultDates.end);
  const [inventoryFilter, setInventoryFilter] =
    useState<InventoryFilter>("all");
  const [expiryFilter, setExpiryFilter] = useState<ExpiryFilter>("all");
  const [purchaseStatus, setPurchaseStatus] =
    useState<PurchaseStatusFilter>("all");
  const [supplierId, setSupplierId] = useState("all");
  const [exporting, setExporting] = useState<"csv" | "pdf" | null>(null);

  const reportsQuery = useQuery({
    queryKey,
    queryFn: getReportsPageData,
  });

  const sales = useMemo(() => {
    const term = deferredReportSearch.trim().toLowerCase();
    return (reportsQuery.data?.sales ?? []).filter((sale) => {
      if (!sale.completed_at) return false;
      const date = getLocalDateValue(new Date(sale.completed_at));
      const matchesSearch =
        !term ||
        sale.sale_number.toLowerCase().includes(term) ||
        sale.payment_method.toLowerCase().includes(term);
      return date >= startDate && date <= endDate && matchesSearch;
    });
  }, [deferredReportSearch, endDate, reportsQuery.data?.sales, startDate]);

  const inventoryRows = useMemo(
    () =>
      buildInventoryRows(
        reportsQuery.data?.medicines ?? [],
        reportsQuery.data?.batches ?? [],
      ),
    [reportsQuery.data?.batches, reportsQuery.data?.medicines],
  );
  const visibleInventory = useMemo(() => {
    const term = deferredReportSearch.trim().toLowerCase();
    return inventoryRows.filter((row) => {
      const matchesFilter =
        inventoryFilter === "low"
          ? row.isLowStock
          : inventoryFilter === "available"
            ? row.saleableStock > 0
            : true;
      const matchesSearch =
        !term ||
        row.brand_name.toLowerCase().includes(term) ||
        row.generic_name?.toLowerCase().includes(term);
      return matchesFilter && matchesSearch;
    });
  }, [deferredReportSearch, inventoryFilter, inventoryRows]);

  const expiryRows = useMemo(
    () =>
      buildExpiryRows(
        reportsQuery.data?.medicines ?? [],
        reportsQuery.data?.batches ?? [],
      ),
    [reportsQuery.data?.batches, reportsQuery.data?.medicines],
  );
  const visibleExpiryRows = useMemo(() => {
    const term = deferredReportSearch.trim().toLowerCase();
    return expiryRows.filter(
      (row) =>
        (expiryFilter === "all" || row.window === expiryFilter) &&
        (!term ||
          row.medicineName.toLowerCase().includes(term) ||
          row.batch_number.toLowerCase().includes(term)),
    );
  }, [deferredReportSearch, expiryFilter, expiryRows]);

  const purchases = useMemo(() => {
    const term = deferredReportSearch.trim().toLowerCase();
    const supplierMap = new Map(
      (reportsQuery.data?.suppliers ?? []).map((supplier) => [
        supplier.id,
        supplier.name,
      ]),
    );
    return (reportsQuery.data?.purchases ?? []).filter((purchase) => {
        const matchesStatus =
          purchaseStatus === "all" || purchase.status === purchaseStatus;
        const matchesSupplier =
          supplierId === "all" || purchase.supplier_id === supplierId;
        const matchesSearch =
          !term ||
          purchase.order_number.toLowerCase().includes(term) ||
          supplierMap
            .get(purchase.supplier_id)
            ?.toLowerCase()
            .includes(term);
        return matchesStatus && matchesSupplier && matchesSearch;
      });
  }, [
    deferredReportSearch,
    purchaseStatus,
    reportsQuery.data?.purchases,
    reportsQuery.data?.suppliers,
    supplierId,
  ]);

  const topSelling = useMemo(
    () =>
      buildTopSellingMedicines(
        reportsQuery.data?.saleItems ?? [],
        reportsQuery.data?.medicines ?? [],
        new Set(sales.map((sale) => sale.id)),
      ),
    [reportsQuery.data?.medicines, reportsQuery.data?.saleItems, sales],
  );

  if (reportsQuery.isLoading) return <LoadingState />;
  if (reportsQuery.isError || !reportsQuery.data) {
    return (
      <ErrorState
        title="Reports could not be loaded"
        message={getUserErrorMessage(
          reportsQuery.error,
          "Reporting data is unavailable.",
        )}
        onRetry={() => reportsQuery.refetch()}
      />
    );
  }

  const { settings, suppliers } = reportsQuery.data;
  const salesTotal = sales.reduce((total, sale) => total + sale.total_amount, 0);
  const discountTotal = sales.reduce(
    (total, sale) => total + sale.discount_amount,
    0,
  );
  const stockValue = visibleInventory.reduce(
    (total, row) => total + row.stockValue,
    0,
  );
  const totalStock = visibleInventory.reduce(
    (total, row) => total + row.totalStock,
    0,
  );
  const deliveredPurchases = purchases.filter(
    (purchase) => purchase.status === "received",
  );
  const deliveredValue = deliveredPurchases.reduce(
    (total, purchase) => total + purchase.total_amount,
    0,
  );

  function getExport(): ReportExport {
    const common = {
      pharmacyName: settings.pharmacyName,
      generatedLabel: `Generated ${dateFormatter.format(new Date())}`,
    };

    if (view === "sales") {
      return {
        ...common,
        title: "Sales Report",
        filename: `sales-report-${startDate}-to-${endDate}`,
        summary: [
          { label: "Date range", value: `${startDate} to ${endDate}` },
          { label: "Transactions", value: String(sales.length) },
          {
            label: "Total sales",
            value: `${settings.currencyCode} ${salesTotal.toFixed(2)}`,
          },
          {
            label: "Discounts",
            value: `${settings.currencyCode} ${discountTotal.toFixed(2)}`,
          },
        ],
        columns: [
          { header: "Sale", key: "sale", width: 42 },
          { header: "Date", key: "date", width: 38 },
          { header: "Payment", key: "payment", width: 30 },
          { header: "Subtotal", key: "subtotal", align: "right" },
          { header: "Discount", key: "discount", align: "right" },
          { header: "Total", key: "total", align: "right" },
        ],
        rows: sales.map((sale) => ({
          sale: sale.sale_number,
          date: sale.completed_at
            ? dateFormatter.format(new Date(sale.completed_at))
            : "",
          payment: sale.payment_method,
          subtotal: sale.subtotal.toFixed(2),
          discount: sale.discount_amount.toFixed(2),
          total: sale.total_amount.toFixed(2),
        })),
      };
    }

    if (view === "inventory") {
      return {
        ...common,
        title: "Inventory Report",
        filename: `inventory-report-${inventoryFilter}-${getLocalDateValue(new Date())}`,
        summary: [
          { label: "Items", value: String(visibleInventory.length) },
          { label: "Units in stock", value: String(totalStock) },
          {
            label: "Estimated cost value",
            value: `${settings.currencyCode} ${stockValue.toFixed(2)}`,
          },
        ],
        columns: [
          { header: "Medicine", key: "medicine", width: 62 },
          { header: "Status", key: "status", width: 32 },
          { header: "Total stock", key: "totalStock", align: "right" },
          { header: "Saleable", key: "saleable", align: "right" },
          { header: "Reorder at", key: "reorder", align: "right" },
          { header: "Cost value", key: "value", align: "right" },
        ],
        rows: visibleInventory.map((row) => ({
          medicine: row.brand_name,
          status: row.isLowStock ? "Low stock" : "In stock",
          totalStock: `${row.totalStock} ${row.unit}`,
          saleable: `${row.saleableStock} ${row.unit}`,
          reorder: row.reorder_threshold,
          value: row.stockValue.toFixed(2),
        })),
      };
    }

    if (view === "expiry") {
      return {
        ...common,
        title: "Expiry Report",
        filename: `expiry-report-${expiryFilter}-${getLocalDateValue(new Date())}`,
        summary: [
          { label: "Batches", value: String(visibleExpiryRows.length) },
          {
            label: "Expired",
            value: String(
              visibleExpiryRows.filter((row) => row.window === "expired").length,
            ),
          },
          {
            label: "Within 90 days",
            value: String(
              visibleExpiryRows.filter((row) => row.window !== "expired").length,
            ),
          },
        ],
        columns: [
          { header: "Medicine", key: "medicine", width: 56 },
          { header: "Batch", key: "batch", width: 42 },
          { header: "Expiry", key: "expiry", width: 34 },
          { header: "Window", key: "window", width: 38 },
          { header: "Quantity", key: "quantity", align: "right" },
          { header: "Cost value", key: "value", align: "right" },
        ],
        rows: visibleExpiryRows.map((row) => ({
          medicine: row.medicineName,
          batch: row.batch_number,
          expiry: row.expiry_date,
          window: expiryLabel(row.window),
          quantity: `${row.current_quantity} ${row.unit}`,
          value: row.stockValue.toFixed(2),
        })),
      };
    }

    const supplierMap = new Map(
      suppliers.map((supplier) => [supplier.id, supplier.name]),
    );
    return {
      ...common,
      title: "Purchase Report",
      filename: `purchase-report-${purchaseStatus}-${getLocalDateValue(new Date())}`,
      summary: [
        { label: "Orders", value: String(purchases.length) },
        { label: "Delivered", value: String(deliveredPurchases.length) },
        {
          label: "Delivered value",
          value: `${settings.currencyCode} ${deliveredValue.toFixed(2)}`,
        },
      ],
      columns: [
        { header: "Order", key: "order", width: 48 },
        { header: "Supplier", key: "supplier", width: 62 },
        { header: "Status", key: "status", width: 38 },
        { header: "Created", key: "created", width: 36 },
        { header: "Delivered", key: "delivered", width: 36 },
        { header: "Total", key: "total", align: "right" },
      ],
      rows: purchases.map((purchase) => ({
        order: purchase.order_number,
        supplier: supplierMap.get(purchase.supplier_id) ?? "Unknown supplier",
        status: purchase.status === "received" ? "Delivered" : purchase.status,
        created: dateFormatter.format(new Date(purchase.created_at)),
        delivered: purchase.received_at
          ? dateFormatter.format(new Date(purchase.received_at))
          : "",
        total: purchase.total_amount.toFixed(2),
      })),
    };
  }

  async function exportReport(format: "csv" | "pdf") {
    const report = getExport();
    if (report.rows.length === 0) {
      toast.error("There are no visible records to export.");
      return;
    }
    setExporting(format);
    try {
      if (format === "csv") downloadCsv(report);
      else await downloadPdf(report);
      toast.success(`${format.toUpperCase()} report downloaded.`);
    } catch {
      toast.error(`The ${format.toUpperCase()} report could not be generated.`);
    } finally {
      setExporting(null);
    }
  }

  const visibleCount =
    view === "sales"
      ? sales.length
      : view === "inventory"
        ? visibleInventory.length
        : view === "expiry"
          ? visibleExpiryRows.length
          : purchases.length;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Reports"
        description="Review operational activity and export the current report."
        action={
          <div className="flex gap-2">
            <Button
              variant="outline"
              disabled={visibleCount === 0 || exporting !== null}
              onClick={() => exportReport("csv")}
            >
              <FileDown className="size-4" />
              CSV
            </Button>
            <Button
              disabled={visibleCount === 0 || exporting !== null}
              onClick={() => exportReport("pdf")}
            >
              <Download className="size-4" />
              PDF
            </Button>
          </div>
        }
      />

      <div className="grid grid-cols-2 gap-2 rounded-xl border bg-card p-2 sm:grid-cols-4">
        {reportViews.map((item) => (
          <button
            type="button"
            key={item.value}
            className={cn(
              "flex items-center justify-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium transition",
              view === item.value
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:bg-muted hover:text-foreground",
            )}
            onClick={() => {
              setView(item.value);
              setReportSearch("");
            }}
          >
            <item.icon className="size-4" />
            {item.label}
          </button>
        ))}
      </div>

      <ListSearchInput
        value={reportSearch}
        onChange={setReportSearch}
        placeholder={
          view === "sales"
            ? "Search receipt number or payment type"
            : view === "inventory"
              ? "Search medicine name"
              : view === "expiry"
                ? "Search medicine or batch number"
                : "Search order number or supplier"
        }
        label={`Search ${view} report`}
      />

      {view === "sales" ? (
        <SalesView
          startDate={startDate}
          endDate={endDate}
          onStartDateChange={setStartDate}
          onEndDateChange={setEndDate}
          sales={sales}
          total={salesTotal}
          discounts={discountTotal}
          topSelling={topSelling}
          currencyCode={settings.currencyCode}
        />
      ) : null}
      {view === "inventory" ? (
        <InventoryView
          filter={inventoryFilter}
          onFilterChange={setInventoryFilter}
          rows={visibleInventory}
          lowStockCount={inventoryRows.filter((row) => row.isLowStock).length}
          totalStock={totalStock}
          stockValue={stockValue}
          currencyCode={settings.currencyCode}
        />
      ) : null}
      {view === "expiry" ? (
        <ExpiryView
          filter={expiryFilter}
          onFilterChange={setExpiryFilter}
          rows={visibleExpiryRows}
          allRows={expiryRows}
          currencyCode={settings.currencyCode}
        />
      ) : null}
      {view === "purchases" ? (
        <PurchasesView
          status={purchaseStatus}
          supplierId={supplierId}
          onStatusChange={setPurchaseStatus}
          onSupplierChange={setSupplierId}
          purchases={purchases}
          suppliers={suppliers}
          deliveredCount={deliveredPurchases.length}
          deliveredValue={deliveredValue}
          currencyCode={settings.currencyCode}
        />
      ) : null}
    </div>
  );
}

function SalesView({
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange,
  sales,
  total,
  discounts,
  topSelling,
  currencyCode,
}: {
  startDate: string;
  endDate: string;
  onStartDateChange: (value: string) => void;
  onEndDateChange: (value: string) => void;
  sales: ReportSale[];
  total: number;
  discounts: number;
  topSelling: TopSellingMedicine[];
  currencyCode: string;
}) {
  return (
    <div className="space-y-4">
      <FilterCard>
        <DateField label="Start date" value={startDate} onChange={onStartDateChange} max={endDate} />
        <DateField label="End date" value={endDate} onChange={onEndDateChange} min={startDate} />
      </FilterCard>
      <div className="grid gap-3 sm:grid-cols-3">
        <Metric icon={ReceiptText} label="Transactions" value={String(sales.length)} />
        <Metric icon={ShoppingCart} label="Total sales" value={`${currencyCode} ${total.toFixed(2)}`} />
        <Metric icon={Download} label="Discount total" value={`${currencyCode} ${discounts.toFixed(2)}`} />
      </div>
      <Card><CardContent className="p-0"><SalesReportTable sales={sales} currencyCode={currencyCode} /></CardContent></Card>
      <TopSellingTable items={topSelling} currencyCode={currencyCode} />
    </div>
  );
}

function InventoryView({
  filter,
  onFilterChange,
  rows,
  lowStockCount,
  totalStock,
  stockValue,
  currencyCode,
}: {
  filter: InventoryFilter;
  onFilterChange: (value: InventoryFilter) => void;
  rows: InventoryReportRow[];
  lowStockCount: number;
  totalStock: number;
  stockValue: number;
  currencyCode: string;
}) {
  return (
    <div className="space-y-4">
      <FilterCard>
        <SelectField label="Stock filter">
          <Select value={filter} onValueChange={onFilterChange}>
            <SelectTrigger aria-label="Stock filter"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All medicines</SelectItem>
              <SelectItem value="low">Low stock only</SelectItem>
              <SelectItem value="available">Available stock</SelectItem>
            </SelectContent>
          </Select>
        </SelectField>
      </FilterCard>
      <div className="grid gap-3 sm:grid-cols-3">
        <Metric icon={Package} label="Visible medicines" value={String(rows.length)} />
        <Metric icon={CalendarClock} label="Low-stock items" value={String(lowStockCount)} />
        <Metric icon={ReceiptText} label="Estimated stock value" value={`${currencyCode} ${stockValue.toFixed(2)}`} hint={`${totalStock} total units`} />
      </div>
      <Card><CardContent className="p-0"><InventoryReportTable rows={rows} currencyCode={currencyCode} /></CardContent></Card>
    </div>
  );
}

function ExpiryView({
  filter,
  onFilterChange,
  rows,
  allRows,
  currencyCode,
}: {
  filter: ExpiryFilter;
  onFilterChange: (value: ExpiryFilter) => void;
  rows: ExpiryReportRow[];
  allRows: ExpiryReportRow[];
  currencyCode: string;
}) {
  return (
    <div className="space-y-4">
      <FilterCard>
        <SelectField label="Expiry window">
          <Select value={filter} onValueChange={onFilterChange}>
            <SelectTrigger aria-label="Expiry window"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All alerts through 90 days</SelectItem>
              <SelectItem value="expired">Expired</SelectItem>
              <SelectItem value="30">Within 30 days</SelectItem>
              <SelectItem value="60">31–60 days</SelectItem>
              <SelectItem value="90">61–90 days</SelectItem>
            </SelectContent>
          </Select>
        </SelectField>
      </FilterCard>
      <div className="grid gap-3 sm:grid-cols-4">
        <Metric icon={CalendarClock} label="Expired" value={String(allRows.filter((row) => row.window === "expired").length)} />
        <Metric icon={CalendarClock} label="Within 30 days" value={String(allRows.filter((row) => row.window === "30").length)} />
        <Metric icon={CalendarClock} label="31–60 days" value={String(allRows.filter((row) => row.window === "60").length)} />
        <Metric icon={CalendarClock} label="61–90 days" value={String(allRows.filter((row) => row.window === "90").length)} />
      </div>
      <Card><CardContent className="p-0"><ExpiryReportTable rows={rows} currencyCode={currencyCode} /></CardContent></Card>
    </div>
  );
}

function PurchasesView({
  status,
  supplierId,
  onStatusChange,
  onSupplierChange,
  purchases,
  suppliers,
  deliveredCount,
  deliveredValue,
  currencyCode,
}: {
  status: PurchaseStatusFilter;
  supplierId: string;
  onStatusChange: (value: PurchaseStatusFilter) => void;
  onSupplierChange: (value: string) => void;
  purchases: ReportPurchase[];
  suppliers: Array<{ id: string; name: string }>;
  deliveredCount: number;
  deliveredValue: number;
  currencyCode: string;
}) {
  return (
    <div className="space-y-4">
      <FilterCard>
        <SelectField label="Status">
          <Select value={status} onValueChange={onStatusChange}>
            <SelectTrigger aria-label="Purchase status"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="ordered">Ordered</SelectItem>
              <SelectItem value="received">Delivered</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </SelectField>
        <SelectField label="Supplier">
          <Select value={supplierId} onValueChange={onSupplierChange}>
            <SelectTrigger aria-label="Supplier filter"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All suppliers</SelectItem>
              {suppliers.map((supplier) => (
                <SelectItem key={supplier.id} value={supplier.id}>{supplier.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </SelectField>
      </FilterCard>
      <div className="grid gap-3 sm:grid-cols-3">
        <Metric icon={Truck} label="Visible orders" value={String(purchases.length)} />
        <Metric icon={Package} label="Delivered orders" value={String(deliveredCount)} />
        <Metric icon={ReceiptText} label="Delivered value" value={`${currencyCode} ${deliveredValue.toFixed(2)}`} />
      </div>
      <Card><CardContent className="p-0"><PurchaseReportTable purchases={purchases} suppliers={suppliers} currencyCode={currencyCode} /></CardContent></Card>
    </div>
  );
}

function FilterCard({ children }: { children: React.ReactNode }) {
  return <div className="flex flex-col gap-3 rounded-xl border bg-card p-4 sm:flex-row sm:items-end">{children}</div>;
}

function DateField({ label, value, onChange, min, max }: { label: string; value: string; onChange: (value: string) => void; min?: string; max?: string }) {
  return <div className="grid gap-2"><Label>{label}</Label><Input aria-label={label} type="date" value={value} min={min} max={max} onChange={(event) => onChange(event.target.value)} /></div>;
}

function SelectField({ label, children }: { label: string; children: React.ReactNode }) {
  return <div className="grid min-w-52 gap-2"><Label>{label}</Label>{children}</div>;
}

function Metric({ icon: Icon, label, value, hint }: { icon: typeof Package; label: string; value: string; hint?: string }) {
  return <div className="flex items-center gap-4 rounded-xl border bg-card p-4 shadow-sm"><div className="grid size-10 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary"><Icon className="size-5" /></div><div className="min-w-0"><p className="truncate text-xl font-semibold tracking-tight">{value}</p><p className="text-xs text-muted-foreground">{label}{hint ? ` · ${hint}` : ""}</p></div></div>;
}

function expiryLabel(window: ExpiryWindow) {
  if (window === "expired") return "Expired";
  if (window === "30") return "Within 30 days";
  if (window === "60") return "31-60 days";
  return "61-90 days";
}
