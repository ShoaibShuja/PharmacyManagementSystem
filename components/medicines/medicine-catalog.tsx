"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  AlertTriangle,
  Archive,
  CalendarClock,
  Eye,
  FilterX,
  Package,
  Pencil,
  Plus,
  RotateCcw,
  Tags,
} from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useDeferredValue, useMemo, useState } from "react";
import { toast } from "sonner";
import { CategoryDialog } from "@/components/medicines/category-dialog";
import { MedicineDetailsDialog } from "@/components/medicines/medicine-details-dialog";
import { MedicineFormDialog } from "@/components/medicines/medicine-form-dialog";
import { EmptyState } from "@/components/shared/empty-state";
import { ErrorState } from "@/components/shared/error-state";
import { PageHeader } from "@/components/shared/page-header";
import {
  ListPagination,
  ListSearchInput,
  ListLoadingState,
  paginateItems,
} from "@/components/shared/list-controls";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
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
import { getUserErrorMessage } from "@/lib/errors";
import {
  createMedicine,
  createMedicineCategory,
  getMedicineCatalog,
  setMedicineStatus,
  updateMedicine,
} from "@/lib/medicines/api";
import type {
  MedicineFormValues,
} from "@/lib/medicines/schema";
import type { MedicineCatalogItem } from "@/lib/medicines/types";
import { cn } from "@/lib/utils";

const queryKey = ["medicine-catalog"] as const;
const dateFormatter = new Intl.DateTimeFormat("en", {
  year: "numeric",
  month: "short",
  day: "numeric",
  timeZone: "UTC",
});

type MedicineCatalogProps = {
  role: AppRole;
};

type StockFilter = "all" | "low" | "expiring";
type StatusFilter = "all" | "active" | "inactive";
type SortOption = "name" | "stock-low" | "stock-high" | "expiry";

export function MedicineCatalog({ role }: MedicineCatalogProps) {
  const canManage = role === "admin" || role === "pharmacist";
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState(() => searchParams.get("search") ?? "");
  const deferredSearch = useDeferredValue(search);
  const [stockFilter, setStockFilter] = useState<StockFilter>("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("active");
  const [sort, setSort] = useState<SortOption>("name");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [formOpen, setFormOpen] = useState(false);
  const [categoryOpen, setCategoryOpen] = useState(false);
  const [editingMedicine, setEditingMedicine] =
    useState<MedicineCatalogItem | null>(null);
  const [detailsMedicine, setDetailsMedicine] =
    useState<MedicineCatalogItem | null>(null);

  const catalogQuery = useQuery({
    queryKey,
    queryFn: getMedicineCatalog,
  });

  const refreshCatalog = () =>
    Promise.all([
      queryClient.invalidateQueries({ queryKey }),
      queryClient.invalidateQueries({ queryKey: ["reports"] }),
      queryClient.invalidateQueries({ queryKey: ["global-search"] }),
    ]);

  const medicineMutation = useMutation({
    mutationFn: async (values: MedicineFormValues) => {
      const payload = {
        ...values,
        generic_name: values.generic_name || null,
        strength: values.strength || null,
        category_id: values.category_id || null,
        sku: values.sku || null,
        barcode: values.barcode || null,
      };
      if (editingMedicine) {
        return updateMedicine(editingMedicine.id, payload);
      }
      return createMedicine(payload);
    },
    onSuccess: async () => {
      await refreshCatalog();
      toast.success(editingMedicine ? "Medicine updated." : "Medicine added.");
      setFormOpen(false);
      setEditingMedicine(null);
    },
    onError: (error) => toast.error(getUserErrorMessage(error)),
  });

  const statusMutation = useMutation({
    mutationFn: ({
      id,
      status,
    }: {
      id: string;
      status: "active" | "inactive";
    }) => setMedicineStatus(id, status),
    onSuccess: async (_, variables) => {
      await refreshCatalog();
      toast.success(
        variables.status === "inactive"
          ? "Medicine deactivated."
          : "Medicine restored.",
      );
    },
    onError: (error) => toast.error(getUserErrorMessage(error)),
  });

  const categoryMutation = useMutation({
    mutationFn: (values: { name: string; description: string }) =>
      createMedicineCategory({
        name: values.name,
        description: values.description || null,
      }),
    onSuccess: async () => {
      await refreshCatalog();
      toast.success("Category added.");
      setCategoryOpen(false);
    },
    onError: (error) => toast.error(getUserErrorMessage(error)),
  });

  const filteredMedicines = useMemo(() => {
    const normalizedSearch = deferredSearch.trim().toLowerCase();
    const matches = (catalogQuery.data?.medicines ?? []).filter((medicine) => {
      const matchesSearch =
        normalizedSearch.length === 0 ||
        medicine.brand_name.toLowerCase().includes(normalizedSearch) ||
        medicine.generic_name?.toLowerCase().includes(normalizedSearch) ||
        medicine.sku?.toLowerCase().includes(normalizedSearch) ||
        medicine.barcode?.toLowerCase().includes(normalizedSearch) ||
        medicine.category?.name.toLowerCase().includes(normalizedSearch) ||
        medicine.batches.some((batch) =>
          batch.batch_number.toLowerCase().includes(normalizedSearch),
        );
      const matchesStock =
        stockFilter === "all" ||
        (stockFilter === "low" && medicine.isLowStock) ||
        (stockFilter === "expiring" &&
          (medicine.isExpiringSoon || medicine.hasExpiredStock));
      const matchesCategory =
        categoryFilter === "all" || medicine.category_id === categoryFilter;
      const matchesStatus =
        statusFilter === "all" || medicine.status === statusFilter;

      return matchesSearch && matchesStock && matchesCategory && matchesStatus;
    });
    return matches.sort((a, b) => {
      if (sort === "stock-low") return a.saleableStock - b.saleableStock;
      if (sort === "stock-high") return b.saleableStock - a.saleableStock;
      if (sort === "expiry") {
        return (a.nearestExpiryDate ?? "9999-12-31").localeCompare(
          b.nearestExpiryDate ?? "9999-12-31",
        );
      }
      return a.brand_name.localeCompare(b.brand_name);
    });
  }, [
    catalogQuery.data?.medicines,
    categoryFilter,
    deferredSearch,
    statusFilter,
    stockFilter,
    sort,
  ]);
  const paginatedMedicines = paginateItems(
    filteredMedicines,
    page,
    pageSize,
  );

  const activeFilterCount =
    Number(stockFilter !== "all") +
    Number(categoryFilter !== "all") +
    Number(statusFilter !== "active") +
    Number(sort !== "name");

  function clearFilters() {
    setSearch("");
    setStockFilter("all");
    setCategoryFilter("all");
    setStatusFilter("active");
    setSort("name");
    setPage(1);
  }

  function openAddForm() {
    setEditingMedicine(null);
    setFormOpen(true);
  }

  function openEditForm(medicine: MedicineCatalogItem) {
    setEditingMedicine(medicine);
    setFormOpen(true);
  }

  if (catalogQuery.isLoading) {
    return <ListLoadingState />;
  }

  if (catalogQuery.isError || !catalogQuery.data) {
    return (
      <ErrorState
        title="Medicines could not be loaded"
        message={getUserErrorMessage(
          catalogQuery.error,
          "Medicine data is unavailable.",
        )}
        onRetry={() => catalogQuery.refetch()}
      />
    );
  }

  const { categories, currencyCode, expiryAlertDays, medicines } =
    catalogQuery.data;
  const lowStockCount = medicines.filter((medicine) => medicine.isLowStock).length;
  const expiryCount = medicines.filter(
    (medicine) => medicine.isExpiringSoon || medicine.hasExpiredStock,
  ).length;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Medicines"
        description={
          canManage
            ? "Manage medicine details and monitor batch availability."
            : "Look up medicine availability, prices, batches, and expiry dates."
        }
        action={
          canManage ? (
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setCategoryOpen(true)}>
                <Tags className="size-4" />
                <span className="hidden sm:inline">Add category</span>
              </Button>
              <Button onClick={openAddForm}>
                <Plus className="size-4" />
                Add medicine
              </Button>
            </div>
          ) : null
        }
      />

      <div className="grid gap-3 sm:grid-cols-3">
        <SummaryCard
          icon={Package}
          label="Active medicines"
          value={medicines.filter((medicine) => medicine.status === "active").length}
          tone="neutral"
        />
        <SummaryCard
          icon={AlertTriangle}
          label="Low stock"
          value={lowStockCount}
          tone={lowStockCount > 0 ? "warning" : "neutral"}
        />
        <SummaryCard
          icon={CalendarClock}
          label={`Expiry alerts (${expiryAlertDays} days)`}
          value={expiryCount}
          tone={expiryCount > 0 ? "danger" : "neutral"}
        />
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="grid gap-3 border-b p-4 sm:grid-cols-2 xl:grid-cols-[minmax(16rem,1fr)_11rem_12rem_10rem_11rem_auto]">
            <ListSearchInput
              className="sm:col-span-2 xl:col-span-1"
              value={search}
              onChange={(value) => {
                setSearch(value);
                setPage(1);
              }}
              placeholder="Search name, category, barcode, or batch"
              label="Search medicines"
            />
            <Select
              value={stockFilter}
              onValueChange={(value: StockFilter) => {
                setStockFilter(value);
                setPage(1);
              }}
            >
              <SelectTrigger aria-label="Stock filter">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All stock</SelectItem>
                <SelectItem value="low">Low stock</SelectItem>
                <SelectItem value="expiring">Expiry alerts</SelectItem>
              </SelectContent>
            </Select>
            <Select
              value={categoryFilter}
              onValueChange={(value) => {
                setCategoryFilter(value);
                setPage(1);
              }}
            >
              <SelectTrigger aria-label="Category filter">
                <SelectValue placeholder="All categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All categories</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              value={statusFilter}
              onValueChange={(value: StatusFilter) => {
                setStatusFilter(value);
                setPage(1);
              }}
            >
              <SelectTrigger aria-label="Status filter">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
                <SelectItem value="all">All statuses</SelectItem>
              </SelectContent>
            </Select>
            <Select
              value={sort}
              onValueChange={(value: SortOption) => {
                setSort(value);
                setPage(1);
              }}
            >
              <SelectTrigger aria-label="Sort medicines">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="name">Name A–Z</SelectItem>
                <SelectItem value="stock-low">Lowest stock</SelectItem>
                <SelectItem value="stock-high">Highest stock</SelectItem>
                <SelectItem value="expiry">Nearest expiry</SelectItem>
              </SelectContent>
            </Select>
            <Button
              variant="ghost"
              className="px-3 sm:justify-self-start xl:justify-self-stretch"
              onClick={clearFilters}
              disabled={activeFilterCount === 0 && search.length === 0}
            >
              <FilterX className="size-4" />
              Clear
            </Button>
          </div>

          {filteredMedicines.length === 0 ? (
            <div className="p-6">
              <EmptyState
                title={medicines.length === 0 ? "No medicines yet" : "No matches found"}
                description={
                  medicines.length === 0
                    ? canManage
                      ? "Add the first medicine to start building the catalog."
                      : "No medicines are available yet."
                    : "Try changing the search or filters."
                }
                action={
                  medicines.length === 0 && canManage ? (
                    <Button onClick={openAddForm}>
                      <Plus className="size-4" />
                      Add medicine
                    </Button>
                  ) : medicines.length > 0 ? (
                    <Button variant="outline" onClick={clearFilters}>
                      Clear filters
                    </Button>
                  ) : null
                }
              />
            </div>
          ) : (
            <>
              <div className="hidden overflow-x-auto lg:block">
                <MedicineTable
                  medicines={paginatedMedicines.items}
                  currencyCode={currencyCode}
                  canManage={canManage}
                  onView={setDetailsMedicine}
                  onEdit={openEditForm}
                  onStatusChange={(medicine, status) =>
                    statusMutation.mutate({ id: medicine.id, status })
                  }
                />
              </div>
              <div className="divide-y lg:hidden">
                {paginatedMedicines.items.map((medicine) => (
                  <MedicineMobileCard
                    key={medicine.id}
                    medicine={medicine}
                    currencyCode={currencyCode}
                    canManage={canManage}
                    onView={() => setDetailsMedicine(medicine)}
                    onEdit={() => openEditForm(medicine)}
                    onStatusChange={(status) =>
                      statusMutation.mutate({ id: medicine.id, status })
                    }
                  />
                ))}
              </div>
              <ListPagination
                page={paginatedMedicines.page}
                pageSize={pageSize}
                totalItems={filteredMedicines.length}
                itemLabel="medicines"
                onPageChange={setPage}
                onPageSizeChange={(value) => {
                  setPageSize(value);
                  setPage(1);
                }}
              />
            </>
          )}
        </CardContent>
      </Card>

      <MedicineFormDialog
        open={formOpen}
        onOpenChange={(open) => {
          setFormOpen(open);
          if (!open) setEditingMedicine(null);
        }}
        medicine={editingMedicine}
        categories={categories}
        isPending={medicineMutation.isPending}
        onSubmit={(values) => medicineMutation.mutate(values)}
      />
      <CategoryDialog
        open={categoryOpen}
        onOpenChange={setCategoryOpen}
        isPending={categoryMutation.isPending}
        onSubmit={(values) => categoryMutation.mutate(values)}
      />
      <MedicineDetailsDialog
        medicine={detailsMedicine}
        open={detailsMedicine !== null}
        onOpenChange={(open) => {
          if (!open) setDetailsMedicine(null);
        }}
        currencyCode={currencyCode}
      />
    </div>
  );
}

function MedicineTable({
  medicines,
  currencyCode,
  canManage,
  onView,
  onEdit,
  onStatusChange,
}: {
  medicines: MedicineCatalogItem[];
  currencyCode: string;
  canManage: boolean;
  onView: (medicine: MedicineCatalogItem) => void;
  onEdit: (medicine: MedicineCatalogItem) => void;
  onStatusChange: (
    medicine: MedicineCatalogItem,
    status: "active" | "inactive",
  ) => void;
}) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Medicine</TableHead>
          <TableHead>Category</TableHead>
          <TableHead>Stock</TableHead>
          <TableHead>Nearest expiry</TableHead>
          <TableHead className="text-right">Default price</TableHead>
          <TableHead className="w-36 text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {medicines.map((medicine) => (
          <TableRow
            key={medicine.id}
            className={cn(medicine.status === "inactive" && "opacity-60")}
          >
            <TableCell>
              <button
                type="button"
                className="text-left font-medium hover:text-primary"
                onClick={() => onView(medicine)}
              >
                {medicine.brand_name}
              </button>
              <p className="mt-0.5 text-xs text-muted-foreground">
                {[medicine.generic_name, medicine.strength, medicine.dosage_form]
                  .filter(Boolean)
                  .join(" · ")}
              </p>
              <div className="mt-2 flex flex-wrap gap-1">
                <MedicineAlerts medicine={medicine} />
              </div>
            </TableCell>
            <TableCell>{medicine.category?.name ?? "Uncategorized"}</TableCell>
            <TableCell>
              <span className="font-semibold">{medicine.saleableStock}</span>
              <span className="text-muted-foreground"> {medicine.unit}</span>
              <p className="text-xs text-muted-foreground">
                Reorder at {medicine.reorder_threshold}
              </p>
            </TableCell>
            <TableCell>
              {medicine.nearestExpiryDate
                ? dateFormatter.format(
                    new Date(`${medicine.nearestExpiryDate}T00:00:00Z`),
                  )
                : "No stock"}
            </TableCell>
            <TableCell className="text-right font-medium">
              {currencyCode} {medicine.default_selling_price.toFixed(2)}
            </TableCell>
            <TableCell>
              <div className="flex justify-end gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label={`View ${medicine.brand_name}`}
                  title="View medicine"
                  onClick={() => onView(medicine)}
                >
                  <Eye className="size-4" />
                </Button>
                {canManage ? (
                  <>
                    <Button
                      variant="ghost"
                      size="icon"
                      aria-label={`Edit ${medicine.brand_name}`}
                      title="Edit medicine"
                      onClick={() => onEdit(medicine)}
                    >
                      <Pencil className="size-4" />
                    </Button>
                    <StatusAction
                      medicine={medicine}
                      onStatusChange={onStatusChange}
                    />
                  </>
                ) : null}
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

function MedicineMobileCard({
  medicine,
  currencyCode,
  canManage,
  onView,
  onEdit,
  onStatusChange,
}: {
  medicine: MedicineCatalogItem;
  currencyCode: string;
  canManage: boolean;
  onView: () => void;
  onEdit: () => void;
  onStatusChange: (status: "active" | "inactive") => void;
}) {
  return (
    <div className={cn("p-4", medicine.status === "inactive" && "opacity-60")}>
      <div className="flex items-start justify-between gap-4">
        <button type="button" className="text-left" onClick={onView}>
          <p className="font-semibold">{medicine.brand_name}</p>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {[medicine.generic_name, medicine.strength, medicine.dosage_form]
              .filter(Boolean)
              .join(" · ")}
          </p>
        </button>
        <span className="whitespace-nowrap text-sm font-semibold">
          {currencyCode} {medicine.default_selling_price.toFixed(2)}
        </span>
      </div>
      <div className="mt-3 flex flex-wrap gap-1">
        <MedicineAlerts medicine={medicine} />
      </div>
      <div className="mt-4 grid grid-cols-2 gap-3 rounded-lg bg-muted/50 p-3 text-sm">
        <div>
          <p className="text-xs text-muted-foreground">Saleable stock</p>
          <p className="font-semibold">
            {medicine.saleableStock} {medicine.unit}
          </p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">Nearest expiry</p>
          <p className="font-medium">
            {medicine.nearestExpiryDate
              ? dateFormatter.format(
                  new Date(`${medicine.nearestExpiryDate}T00:00:00Z`),
                )
              : "No stock"}
          </p>
        </div>
      </div>
      <div className="mt-3 flex justify-end gap-2">
        <Button variant="outline" size="sm" onClick={onView}>
          <Eye className="size-4" />
          View
        </Button>
        {canManage ? (
          <>
            <Button variant="outline" size="sm" onClick={onEdit}>
              <Pencil className="size-4" />
              Edit
            </Button>
            <StatusAction
              medicine={medicine}
              onStatusChange={(_, status) => onStatusChange(status)}
            />
          </>
        ) : null}
      </div>
    </div>
  );
}

function MedicineAlerts({ medicine }: { medicine: MedicineCatalogItem }) {
  return (
    <>
      {medicine.status === "inactive" ? (
        <Badge variant="secondary">Inactive</Badge>
      ) : null}
      {medicine.isLowStock ? (
        <Badge className="border-amber-200 bg-amber-50 text-amber-800 hover:bg-amber-50">
          Low stock
        </Badge>
      ) : null}
      {medicine.hasExpiredStock ? (
        <Badge variant="destructive">Expired stock</Badge>
      ) : medicine.isExpiringSoon ? (
        <Badge className="border-orange-200 bg-orange-50 text-orange-800 hover:bg-orange-50">
          Expiring soon
        </Badge>
      ) : null}
    </>
  );
}

function StatusAction({
  medicine,
  onStatusChange,
}: {
  medicine: MedicineCatalogItem;
  onStatusChange: (
    medicine: MedicineCatalogItem,
    status: "active" | "inactive",
  ) => void;
}) {
  const isActive = medicine.status === "active";
  return (
    <ConfirmDialog
      trigger={
        <Button
          variant="ghost"
          size={isActive ? "icon" : "sm"}
          aria-label={
            isActive
              ? `Deactivate ${medicine.brand_name}`
              : `Restore ${medicine.brand_name}`
          }
          title={isActive ? "Deactivate medicine" : "Restore medicine"}
        >
          {isActive ? (
            <Archive className="size-4" />
          ) : (
            <>
              <RotateCcw className="size-4" />
              Restore
            </>
          )}
        </Button>
      }
      title={isActive ? "Deactivate medicine?" : "Restore medicine?"}
      description={
        isActive
          ? "The medicine will remain in historical records but will be hidden from the active catalog."
          : "The medicine will return to the active catalog and availability lookup."
      }
      confirmLabel={isActive ? "Deactivate" : "Restore"}
      destructive={isActive}
      onConfirm={() =>
        onStatusChange(medicine, isActive ? "inactive" : "active")
      }
    />
  );
}

function SummaryCard({
  icon: Icon,
  label,
  value,
  tone,
}: {
  icon: typeof Package;
  label: string;
  value: number;
  tone: "neutral" | "warning" | "danger";
}) {
  return (
    <div
      className={cn(
        "flex items-center gap-4 rounded-xl border bg-card p-4 shadow-sm",
        tone === "warning" && "border-amber-200 bg-amber-50/60",
        tone === "danger" && "border-red-200 bg-red-50/60",
      )}
    >
      <div
        className={cn(
          "grid size-10 place-items-center rounded-lg bg-muted text-muted-foreground",
          tone === "warning" && "bg-amber-100 text-amber-700",
          tone === "danger" && "bg-red-100 text-red-700",
        )}
      >
        <Icon className="size-5" />
      </div>
      <div>
        <p className="text-2xl font-semibold tracking-tight">{value}</p>
        <p className="text-xs text-muted-foreground">{label}</p>
      </div>
    </div>
  );
}
