"use client";

import { useQuery } from "@tanstack/react-query";
import {
  AlertTriangle,
  ArrowRight,
  Bell,
  CalendarClock,
  CircleDollarSign,
  Package,
  PackageX,
  ReceiptText,
  ShoppingCart,
} from "lucide-react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useMemo, useState, type ReactNode } from "react";
import { ErrorState } from "@/components/shared/error-state";
import { LoadingState } from "@/components/shared/loading-state";
import { PageHeader } from "@/components/shared/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { AppRole } from "@/lib/auth/types";
import { getDashboardData } from "@/lib/dashboard/api";
import type {
  DashboardBatch,
  DashboardMedicine,
  DashboardSale,
  ExpiryAlert,
  LowStockAlert,
  SalesTrendPoint,
} from "@/lib/dashboard/types";
import { cn } from "@/lib/utils";

const SalesTrendChart = dynamic(
  () =>
    import("@/components/dashboard/sales-trend-chart").then(
      (module) => module.SalesTrendChart,
    ),
  {
    loading: () => <div className="h-64 animate-pulse rounded-lg bg-muted" />,
    ssr: false,
  },
);

const DAY_IN_MS = 86_400_000;
const dateFormatter = new Intl.DateTimeFormat("en", {
  year: "numeric",
  month: "short",
  day: "numeric",
  timeZone: "UTC",
});
const dateTimeFormatter = new Intl.DateTimeFormat("en", {
  month: "short",
  day: "numeric",
  hour: "numeric",
  minute: "2-digit",
});

type ExpiryWindow = 30 | 60 | 90;

function startOfToday() {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate());
}

function dateKey(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function buildInventoryAlerts(
  medicines: DashboardMedicine[],
  batches: DashboardBatch[],
) {
  const today = startOfToday();
  const medicineMap = new Map(
    medicines.map((medicine) => [medicine.id, medicine]),
  );
  const saleableStock = new Map<string, number>();
  const expiryAlerts: ExpiryAlert[] = [];

  for (const batch of batches) {
    const medicine = medicineMap.get(batch.medicine_id);
    if (!medicine) continue;

    const expiry = new Date(`${batch.expiry_date}T00:00:00`);
    const daysUntilExpiry = Math.floor(
      (expiry.getTime() - today.getTime()) / DAY_IN_MS,
    );

    if (daysUntilExpiry >= 0) {
      saleableStock.set(
        medicine.id,
        (saleableStock.get(medicine.id) ?? 0) + batch.current_quantity,
      );
    }

    if (daysUntilExpiry <= 90) {
      expiryAlerts.push({
        batchId: batch.id,
        medicineId: medicine.id,
        brandName: medicine.brand_name,
        batchNumber: batch.batch_number,
        expiryDate: batch.expiry_date,
        currentQuantity: batch.current_quantity,
        daysUntilExpiry,
      });
    }
  }

  const lowStockAlerts: LowStockAlert[] = medicines
    .map((medicine) => ({
      medicineId: medicine.id,
      brandName: medicine.brand_name,
      genericName: medicine.generic_name,
      unit: medicine.unit,
      saleableStock: saleableStock.get(medicine.id) ?? 0,
      reorderThreshold: medicine.reorder_threshold,
    }))
    .filter((medicine) => medicine.saleableStock <= medicine.reorderThreshold)
    .sort(
      (a, b) =>
        a.saleableStock - a.reorderThreshold -
        (b.saleableStock - b.reorderThreshold),
    );

  expiryAlerts.sort((a, b) => a.daysUntilExpiry - b.daysUntilExpiry);
  return { lowStockAlerts, expiryAlerts };
}

function buildTrend(sales: DashboardSale[]) {
  const today = startOfToday();
  const points = new Map<string, SalesTrendPoint>();

  for (let offset = 6; offset >= 0; offset -= 1) {
    const date = new Date(today.getTime() - offset * DAY_IN_MS);
    const key = dateKey(date);
    points.set(key, {
      date: key,
      label: date.toLocaleDateString("en", { weekday: "short" }),
      total: 0,
      transactions: 0,
    });
  }

  for (const sale of sales) {
    if (!sale.completed_at) continue;
    const point = points.get(dateKey(new Date(sale.completed_at)));
    if (!point) continue;
    point.total += sale.total_amount;
    point.transactions += 1;
  }

  return Array.from(points.values());
}

export function DashboardView({ role }: { role: AppRole }) {
  const isCashier = role === "cashier";
  const [expiryWindow, setExpiryWindow] = useState<ExpiryWindow>(30);
  const dashboardQuery = useQuery({
    queryKey: ["dashboard"],
    queryFn: getDashboardData,
  });

  const derived = useMemo(() => {
    if (!dashboardQuery.data) return null;
    const inventory = buildInventoryAlerts(
      dashboardQuery.data.medicines,
      dashboardQuery.data.batches,
    );
    const trend = buildTrend(dashboardQuery.data.trendSales);
    const today = trend.at(-1);

    return {
      ...inventory,
      trend,
      todaySales: today?.total ?? 0,
      todayTransactions: today?.transactions ?? 0,
    };
  }, [dashboardQuery.data]);

  if (dashboardQuery.isLoading) return <LoadingState />;

  if (dashboardQuery.isError || !dashboardQuery.data || !derived) {
    return (
      <ErrorState
        title="Dashboard could not be loaded"
        message={
          dashboardQuery.error instanceof Error
            ? dashboardQuery.error.message
            : "The dashboard data is unavailable."
        }
        onRetry={() => dashboardQuery.refetch()}
      />
    );
  }

  const data = dashboardQuery.data;
  const expiryAlerts = derived.expiryAlerts.filter(
    (alert) => alert.daysUntilExpiry <= expiryWindow,
  );
  const hasSales = derived.trend.some((point) => point.transactions > 0);

  return (
    <div className="space-y-6">
      <PageHeader
        title={isCashier ? "Sales dashboard" : "Dashboard"}
        description={
          isCashier
            ? "Your sales activity and quick medicine availability overview."
            : "Daily sales, stock alerts, and expiry risks in one place."
        }
        action={
          <Button asChild>
            <Link href="/sales">
              <ShoppingCart className="size-4" />
              Open sales
            </Link>
          </Button>
        }
      />

      <div
        className={cn(
          "grid gap-4 sm:grid-cols-2",
          isCashier ? "xl:grid-cols-3" : "xl:grid-cols-4",
        )}
      >
        <MetricCard
          icon={CircleDollarSign}
          label="Today's sales"
          value={`${data.currencyCode} ${derived.todaySales.toFixed(2)}`}
          helper={`${derived.todayTransactions} completed transaction${derived.todayTransactions === 1 ? "" : "s"}`}
          tone="primary"
        />
        {isCashier ? (
          <MetricCard
            icon={ReceiptText}
            label="Recent sales"
            value={`${data.recentSales.length}`}
            helper="Your latest completed sales"
          />
        ) : (
          <MetricCard
            icon={Package}
            label="Total medicines"
            value={`${data.medicines.length}`}
            helper="Active catalog items"
          />
        )}
        {isCashier ? (
          <MetricCard
            icon={Package}
            label="Medicine catalog"
            value={`${data.medicines.length}`}
            helper="Active medicines available to search"
          />
        ) : (
          <>
            <MetricCard
              icon={PackageX}
              label="Low stock"
              value={`${derived.lowStockAlerts.length}`}
              helper="At or below reorder level"
              tone={derived.lowStockAlerts.length > 0 ? "warning" : "neutral"}
            />
            <MetricCard
              icon={CalendarClock}
              label="Expiring soon"
              value={`${expiryAlerts.length}`}
              helper={`Within ${expiryWindow} days`}
              tone={expiryAlerts.length > 0 ? "danger" : "neutral"}
            />
          </>
        )}
      </div>

      {!isCashier ? (
        <NotificationPanel
          lowStockCount={derived.lowStockAlerts.length}
          expiryCount={expiryAlerts.length}
        />
      ) : null}

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.45fr)_minmax(20rem,0.75fr)]">
        <SectionCard
          title="Sales trend"
          description={
            isCashier
              ? "Your completed sales over the last seven days."
              : "Completed pharmacy sales over the last seven days."
          }
        >
          {hasSales ? (
            <SalesTrendChart
              data={derived.trend}
              currencyCode={data.currencyCode}
            />
          ) : (
            <CompactEmptyState
              icon={CircleDollarSign}
              title="No completed sales yet"
              description="The sales trend will appear after the first completed sale."
            />
          )}
        </SectionCard>

        <RecentSalesCard
          sales={data.recentSales}
          currencyCode={data.currencyCode}
          isCashier={isCashier}
        />
      </div>

      {!isCashier ? (
        <div className="grid gap-6 xl:grid-cols-2">
          <LowStockCard alerts={derived.lowStockAlerts} />
          <ExpiryWarningsCard
            alerts={expiryAlerts}
            expiryWindow={expiryWindow}
            onWindowChange={setExpiryWindow}
          />
        </div>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-start justify-between gap-4 p-5 sm:flex-row sm:items-center">
            <div>
              <p className="font-semibold">Need to check availability?</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Search medicines, stock quantities, batches, and expiry dates.
              </p>
            </div>
            <Button asChild variant="outline">
              <Link href="/medicines">
                Open medicine lookup
                <ArrowRight className="size-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function MetricCard({
  icon: Icon,
  label,
  value,
  helper,
  tone = "neutral",
}: {
  icon: typeof Package;
  label: string;
  value: string;
  helper: string;
  tone?: "neutral" | "primary" | "warning" | "danger";
}) {
  return (
    <Card
      className={cn(
        "overflow-hidden",
        tone === "warning" && "border-amber-200",
        tone === "danger" && "border-red-200",
      )}
    >
      <CardContent className="relative p-5">
        <div
          className={cn(
            "absolute inset-x-0 top-0 h-0.5 bg-border",
            tone === "primary" && "bg-primary",
            tone === "warning" && "bg-amber-500",
            tone === "danger" && "bg-red-500",
          )}
        />
        <div className="flex items-center justify-between gap-4">
          <p className="text-sm font-medium text-muted-foreground">{label}</p>
          <div
            className={cn(
              "grid size-9 place-items-center rounded-lg bg-muted text-muted-foreground",
              tone === "primary" && "bg-accent text-primary",
              tone === "warning" && "bg-amber-50 text-amber-700",
              tone === "danger" && "bg-red-50 text-red-700",
            )}
          >
            <Icon className="size-4" />
          </div>
        </div>
        <p className="mt-4 text-2xl font-semibold tracking-tight">{value}</p>
        <p className="mt-1 text-xs text-muted-foreground">{helper}</p>
      </CardContent>
    </Card>
  );
}

function NotificationPanel({
  lowStockCount,
  expiryCount,
}: {
  lowStockCount: number;
  expiryCount: number;
}) {
  const total = lowStockCount + expiryCount;

  return (
    <Card
      className={cn(
        total > 0
          ? "border-amber-200 bg-amber-50/50"
          : "border-emerald-200 bg-emerald-50/40",
      )}
    >
      <CardContent className="flex gap-4 p-5">
        <div
          className={cn(
            "grid size-10 shrink-0 place-items-center rounded-full",
            total > 0
              ? "bg-amber-100 text-amber-700"
              : "bg-emerald-100 text-emerald-700",
          )}
        >
          <Bell className="size-5" />
        </div>
        <div className="flex min-w-0 flex-1 flex-wrap items-center justify-between gap-3">
          <div>
            <p className="font-semibold">
              {total > 0
                ? `${total} inventory alert${total === 1 ? "" : "s"} need attention`
                : "No inventory alerts"}
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              {total > 0
                ? `${lowStockCount} low-stock and ${expiryCount} expiry warning${expiryCount === 1 ? "" : "s"}.`
                : "Stock levels and expiry dates are within the selected limits."}
            </p>
          </div>
          <Button asChild variant="outline" size="sm">
            <Link href="/medicines">Review medicines</Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function SectionCard({
  title,
  description,
  action,
  children,
}: {
  title: string;
  description: string;
  action?: ReactNode;
  children: ReactNode;
}) {
  return (
    <Card>
      <div className="flex flex-col gap-3 border-b px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="font-semibold">{title}</h2>
          <p className="mt-1 text-xs text-muted-foreground">{description}</p>
        </div>
        {action}
      </div>
      <CardContent className="p-5">{children}</CardContent>
    </Card>
  );
}

function RecentSalesCard({
  sales,
  currencyCode,
  isCashier,
}: {
  sales: DashboardSale[];
  currencyCode: string;
  isCashier: boolean;
}) {
  return (
    <SectionCard
      title="Recent sales"
      description={
        isCashier ? "Your latest completed sales." : "Latest completed transactions."
      }
      action={
        <Button asChild variant="ghost" size="sm">
          <Link href="/sales">
            View sales
            <ArrowRight className="size-4" />
          </Link>
        </Button>
      }
    >
      {sales.length === 0 ? (
        <CompactEmptyState
          icon={ReceiptText}
          title="No recent sales"
          description="Completed transactions will appear here."
        />
      ) : (
        <div className="divide-y">
          {sales.map((sale) => (
            <div
              key={sale.id}
              className="flex items-center justify-between gap-4 py-3 first:pt-0 last:pb-0"
            >
              <div className="min-w-0">
                <p className="truncate text-sm font-medium">{sale.sale_number}</p>
                <p className="mt-0.5 text-xs capitalize text-muted-foreground">
                  {sale.payment_method}
                  {sale.completed_at
                    ? ` · ${dateTimeFormatter.format(new Date(sale.completed_at))}`
                    : ""}
                </p>
              </div>
              <p className="whitespace-nowrap text-sm font-semibold">
                {currencyCode} {sale.total_amount.toFixed(2)}
              </p>
            </div>
          ))}
        </div>
      )}
    </SectionCard>
  );
}

function LowStockCard({ alerts }: { alerts: LowStockAlert[] }) {
  return (
    <SectionCard
      title="Low-stock items"
      description="Active medicines at or below their reorder threshold."
      action={<Badge variant="secondary">{alerts.length}</Badge>}
    >
      {alerts.length === 0 ? (
        <CompactEmptyState
          icon={PackageX}
          title="Stock levels look good"
          description="No active medicines are below their reorder threshold."
        />
      ) : (
        <div className="overflow-hidden rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Medicine</TableHead>
                <TableHead className="text-right">Available</TableHead>
                <TableHead className="text-right">Reorder at</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {alerts.slice(0, 6).map((alert) => (
                <TableRow key={alert.medicineId}>
                  <TableCell>
                    <Link href="/medicines" className="font-medium hover:text-primary">
                      {alert.brandName}
                    </Link>
                    {alert.genericName ? (
                      <p className="text-xs text-muted-foreground">
                        {alert.genericName}
                      </p>
                    ) : null}
                  </TableCell>
                  <TableCell className="text-right">
                    <Badge className="border-amber-200 bg-amber-50 text-amber-800 hover:bg-amber-50">
                      {alert.saleableStock} {alert.unit}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    {alert.reorderThreshold}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </SectionCard>
  );
}

function ExpiryWarningsCard({
  alerts,
  expiryWindow,
  onWindowChange,
}: {
  alerts: ExpiryAlert[];
  expiryWindow: ExpiryWindow;
  onWindowChange: (window: ExpiryWindow) => void;
}) {
  return (
    <SectionCard
      title="Expiry warnings"
      description="Stocked batches already expired or approaching expiry."
      action={
        <Select
          value={`${expiryWindow}`}
          onValueChange={(value) => onWindowChange(Number(value) as ExpiryWindow)}
        >
          <SelectTrigger className="w-32" aria-label="Expiry warning window">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="30">30 days</SelectItem>
            <SelectItem value="60">60 days</SelectItem>
            <SelectItem value="90">90 days</SelectItem>
          </SelectContent>
        </Select>
      }
    >
      {alerts.length === 0 ? (
        <CompactEmptyState
          icon={CalendarClock}
          title={`No expiry warnings within ${expiryWindow} days`}
          description="Stocked batches within this window will appear here."
        />
      ) : (
        <div className="overflow-hidden rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Medicine / batch</TableHead>
                <TableHead>Expiry</TableHead>
                <TableHead className="text-right">Quantity</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {alerts.slice(0, 6).map((alert) => (
                <TableRow key={alert.batchId}>
                  <TableCell>
                    <p className="font-medium">{alert.brandName}</p>
                    <p className="text-xs text-muted-foreground">
                      Batch {alert.batchNumber}
                    </p>
                  </TableCell>
                  <TableCell>
                    <p>
                      {dateFormatter.format(
                        new Date(`${alert.expiryDate}T00:00:00Z`),
                      )}
                    </p>
                    <p
                      className={cn(
                        "text-xs",
                        alert.daysUntilExpiry < 0
                          ? "text-destructive"
                          : "text-muted-foreground",
                      )}
                    >
                      {getExpiryLabel(alert.daysUntilExpiry)}
                    </p>
                  </TableCell>
                  <TableCell className="text-right">
                    {alert.currentQuantity}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </SectionCard>
  );
}

function getExpiryLabel(days: number) {
  if (days < 0) return `Expired ${Math.abs(days)} days ago`;
  if (days === 0) return "Expires today";
  return `${days} days remaining`;
}

function CompactEmptyState({
  icon: Icon,
  title,
  description,
}: {
  icon: typeof AlertTriangle;
  title: string;
  description: string;
}) {
  return (
    <div className="flex min-h-52 flex-col items-center justify-center rounded-lg border border-dashed bg-muted/20 p-6 text-center">
      <div className="grid size-10 place-items-center rounded-full bg-muted text-muted-foreground">
        <Icon className="size-5" />
      </div>
      <p className="mt-3 text-sm font-semibold">{title}</p>
      <p className="mt-1 max-w-sm text-xs text-muted-foreground">
        {description}
      </p>
    </div>
  );
}
