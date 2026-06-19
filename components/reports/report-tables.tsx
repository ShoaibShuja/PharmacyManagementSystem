"use client";

import { EmptyState } from "@/components/shared/empty-state";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type {
  ExpiryReportRow,
  InventoryReportRow,
  ReportPurchase,
  ReportSale,
  ReportSupplier,
  TopSellingMedicine,
} from "@/lib/reports/types";
import { cn } from "@/lib/utils";

const dateFormatter = new Intl.DateTimeFormat("en", {
  year: "numeric",
  month: "short",
  day: "numeric",
  timeZone: "UTC",
});

export function SalesReportTable({
  sales,
  currencyCode,
}: {
  sales: ReportSale[];
  currencyCode: string;
}) {
  if (sales.length === 0) {
    return (
      <EmptyState
        title="No sales in this date range"
        description="Change the start or end date to include completed sales."
      />
    );
  }

  return (
    <ReportTable>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Sale</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Payment</TableHead>
            <TableHead className="text-right">Subtotal</TableHead>
            <TableHead className="text-right">Discount</TableHead>
            <TableHead className="text-right">Total</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sales.map((sale) => (
            <TableRow key={sale.id}>
              <TableCell className="font-medium">{sale.sale_number}</TableCell>
              <TableCell>
                {sale.completed_at
                  ? dateFormatter.format(new Date(sale.completed_at))
                  : "Not recorded"}
              </TableCell>
              <TableCell className="capitalize">{sale.payment_method}</TableCell>
              <MoneyCell value={sale.subtotal} currencyCode={currencyCode} />
              <MoneyCell value={sale.discount_amount} currencyCode={currencyCode} />
              <MoneyCell value={sale.total_amount} currencyCode={currencyCode} strong />
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </ReportTable>
  );
}

export function TopSellingTable({
  items,
  currencyCode,
}: {
  items: TopSellingMedicine[];
  currencyCode: string;
}) {
  if (items.length === 0) return null;
  return (
    <div className="rounded-xl border bg-card">
      <div className="border-b px-4 py-3">
        <h3 className="font-semibold">Top-selling medicines</h3>
        <p className="text-xs text-muted-foreground">
          Ranked by units sold in the selected date range.
        </p>
      </div>
      <ReportTable>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Medicine</TableHead>
              <TableHead className="text-right">Units sold</TableHead>
              <TableHead className="text-right">Sales value</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((item) => (
              <TableRow key={item.medicineId}>
                <TableCell className="font-medium">{item.medicineName}</TableCell>
                <TableCell className="text-right">{item.quantity}</TableCell>
                <MoneyCell value={item.salesValue} currencyCode={currencyCode} strong />
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </ReportTable>
    </div>
  );
}

export function InventoryReportTable({
  rows,
  currencyCode,
}: {
  rows: InventoryReportRow[];
  currencyCode: string;
}) {
  if (rows.length === 0) {
    return (
      <EmptyState
        title="No inventory items found"
        description="Change the stock filter or add medicines to the catalog."
      />
    );
  }
  return (
    <ReportTable>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Medicine</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Total stock</TableHead>
            <TableHead className="text-right">Saleable stock</TableHead>
            <TableHead className="text-right">Reorder at</TableHead>
            <TableHead className="text-right">Stock value</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((row) => (
            <TableRow key={row.id}>
              <TableCell>
                <p className="font-medium">{row.brand_name}</p>
                <p className="text-xs text-muted-foreground">
                  {[row.generic_name, row.strength].filter(Boolean).join(" · ")}
                </p>
              </TableCell>
              <TableCell>
                {row.isLowStock ? (
                  <Badge className="border-amber-200 bg-amber-50 text-amber-800">
                    Low stock
                  </Badge>
                ) : (
                  <Badge variant="secondary">In stock</Badge>
                )}
              </TableCell>
              <TableCell className="text-right">
                {row.totalStock} {row.unit}
              </TableCell>
              <TableCell className="text-right font-medium">
                {row.saleableStock} {row.unit}
              </TableCell>
              <TableCell className="text-right">{row.reorder_threshold}</TableCell>
              <MoneyCell value={row.stockValue} currencyCode={currencyCode} strong />
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </ReportTable>
  );
}

export function ExpiryReportTable({
  rows,
  currencyCode,
}: {
  rows: ExpiryReportRow[];
  currencyCode: string;
}) {
  if (rows.length === 0) {
    return (
      <EmptyState
        title="No batches in this expiry window"
        description="There is no stocked inventory matching the selected expiry filter."
      />
    );
  }
  return (
    <ReportTable>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Medicine</TableHead>
            <TableHead>Batch</TableHead>
            <TableHead>Expiry date</TableHead>
            <TableHead>Window</TableHead>
            <TableHead className="text-right">Quantity</TableHead>
            <TableHead className="text-right">Cost value</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((row) => (
            <TableRow key={row.id}>
              <TableCell className="font-medium">{row.medicineName}</TableCell>
              <TableCell>{row.batch_number}</TableCell>
              <TableCell>
                {dateFormatter.format(new Date(`${row.expiry_date}T00:00:00Z`))}
              </TableCell>
              <TableCell><ExpiryBadge window={row.window} /></TableCell>
              <TableCell className="text-right">
                {row.current_quantity} {row.unit}
              </TableCell>
              <MoneyCell value={row.stockValue} currencyCode={currencyCode} strong />
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </ReportTable>
  );
}

export function PurchaseReportTable({
  purchases,
  suppliers,
  currencyCode,
}: {
  purchases: ReportPurchase[];
  suppliers: ReportSupplier[];
  currencyCode: string;
}) {
  const supplierMap = new Map(
    suppliers.map((supplier) => [supplier.id, supplier.name]),
  );
  if (purchases.length === 0) {
    return (
      <EmptyState
        title="No purchase orders found"
        description="Change the status or supplier filter to see other purchases."
      />
    );
  }
  return (
    <ReportTable>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Order</TableHead>
            <TableHead>Supplier</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Created</TableHead>
            <TableHead>Delivered</TableHead>
            <TableHead className="text-right">Total</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {purchases.map((purchase) => (
            <TableRow key={purchase.id}>
              <TableCell className="font-medium">{purchase.order_number}</TableCell>
              <TableCell>
                {supplierMap.get(purchase.supplier_id) ?? "Unknown supplier"}
              </TableCell>
              <TableCell>
                <PurchaseStatus status={purchase.status} />
              </TableCell>
              <TableCell>
                {dateFormatter.format(new Date(purchase.created_at))}
              </TableCell>
              <TableCell>
                {purchase.received_at
                  ? dateFormatter.format(new Date(purchase.received_at))
                  : "Not delivered"}
              </TableCell>
              <MoneyCell value={purchase.total_amount} currencyCode={currencyCode} strong />
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </ReportTable>
  );
}

function ReportTable({ children }: { children: React.ReactNode }) {
  return <div className="overflow-x-auto">{children}</div>;
}

function MoneyCell({
  value,
  currencyCode,
  strong = false,
}: {
  value: number;
  currencyCode: string;
  strong?: boolean;
}) {
  return (
    <TableCell className={cn("text-right", strong && "font-semibold")}>
      {currencyCode} {value.toFixed(2)}
    </TableCell>
  );
}

function ExpiryBadge({ window }: { window: ExpiryReportRow["window"] }) {
  const labels = {
    expired: "Expired",
    "30": "Within 30 days",
    "60": "31–60 days",
    "90": "61–90 days",
  };
  return (
    <Badge
      variant={window === "expired" ? "destructive" : "secondary"}
      className={cn(
        window === "30" && "border-orange-200 bg-orange-50 text-orange-800",
        window === "60" && "border-amber-200 bg-amber-50 text-amber-800",
      )}
    >
      {labels[window]}
    </Badge>
  );
}

function PurchaseStatus({ status }: { status: ReportPurchase["status"] }) {
  const label =
    status === "received"
      ? "Delivered"
      : status === "partially_received"
        ? "Partially delivered"
        : status[0].toUpperCase() + status.slice(1);
  return <Badge variant={status === "cancelled" ? "outline" : "secondary"}>{label}</Badge>;
}
