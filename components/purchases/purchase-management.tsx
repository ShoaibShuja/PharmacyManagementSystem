"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ClipboardList,
  Eye,
  PackageCheck,
  Plus,
  Truck,
} from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useDeferredValue, useMemo, useState } from "react";
import { toast } from "sonner";
import { PurchaseOrderDetailsDialog, StatusBadge } from "@/components/purchases/purchase-order-details-dialog";
import { PurchaseOrderFormDialog } from "@/components/purchases/purchase-order-form-dialog";
import { EmptyState } from "@/components/shared/empty-state";
import { ErrorState } from "@/components/shared/error-state";
import { PageHeader } from "@/components/shared/page-header";
import {
  ListPagination,
  ListSearchInput,
  ListLoadingState,
  paginateItems,
} from "@/components/shared/list-controls";
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
import {
  createPurchaseOrder,
  getPurchasesPageData,
  receivePurchaseOrder,
  setPurchaseOrderStatus,
} from "@/lib/purchases/api";
import type {
  PurchaseDeliveryFormValues,
  PurchaseOrderFormValues,
} from "@/lib/purchases/schema";
import type { PurchaseOrderDetail } from "@/lib/purchases/types";

const queryKey = ["purchases"] as const;
type StatusFilter =
  | "all"
  | "draft"
  | "ordered"
  | "received"
  | "cancelled";
type SortOption = "newest" | "oldest" | "value-high" | "value-low";

const dateFormatter = new Intl.DateTimeFormat("en", {
  year: "numeric",
  month: "short",
  day: "numeric",
});

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : "The action could not be completed.";
}

export function PurchaseManagement() {
  const queryClient = useQueryClient();
  const searchParams = useSearchParams();
  const [search, setSearch] = useState(() => searchParams.get("search") ?? "");
  const deferredSearch = useDeferredValue(search);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [sort, setSort] = useState<SortOption>("newest");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [formOpen, setFormOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] =
    useState<PurchaseOrderDetail | null>(null);

  const purchasesQuery = useQuery({
    queryKey,
    queryFn: getPurchasesPageData,
  });

  const refresh = async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey }),
      queryClient.invalidateQueries({ queryKey: ["suppliers"] }),
      queryClient.invalidateQueries({ queryKey: ["medicine-catalog"] }),
      queryClient.invalidateQueries({ queryKey: ["dashboard"] }),
      queryClient.invalidateQueries({ queryKey: ["sales-page"] }),
    ]);
  };

  const createMutation = useMutation({
    mutationFn: createPurchaseOrder,
    onSuccess: async () => {
      await refresh();
      setFormOpen(false);
      toast.success("Purchase order draft created.");
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });

  const statusMutation = useMutation({
    mutationFn: ({
      orderId,
      status,
    }: {
      orderId: string;
      status: "ordered" | "cancelled";
    }) => setPurchaseOrderStatus(orderId, status),
    onSuccess: async (_, variables) => {
      await refresh();
      setSelectedOrder(null);
      toast.success(
        variables.status === "ordered"
          ? "Purchase order marked as ordered."
          : "Purchase order cancelled.",
      );
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });

  const receiveMutation = useMutation({
    mutationFn: ({
      orderId,
      values,
    }: {
      orderId: string;
      values: PurchaseDeliveryFormValues;
    }) => receivePurchaseOrder(orderId, values),
    onSuccess: async () => {
      await refresh();
      setSelectedOrder(null);
      toast.success("Delivery confirmed and inventory stock increased.");
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
      purchasesQuery.refetch();
    },
  });

  const filteredOrders = useMemo(() => {
    const term = deferredSearch.trim().toLowerCase();
    const matches = (purchasesQuery.data?.orders ?? []).filter((order) => {
      const matchesStatus =
        statusFilter === "all" || order.status === statusFilter;
      const matchesSearch =
        !term ||
        order.order_number.toLowerCase().includes(term) ||
        order.supplier?.name.toLowerCase().includes(term) ||
        order.items.some((item) =>
          item.medicine?.brand_name.toLowerCase().includes(term),
        );
      return matchesStatus && matchesSearch;
    });
    return matches.toSorted((a, b) => {
      if (sort === "oldest") return a.created_at.localeCompare(b.created_at);
      if (sort === "value-high") return b.total_amount - a.total_amount;
      if (sort === "value-low") return a.total_amount - b.total_amount;
      return b.created_at.localeCompare(a.created_at);
    });
  }, [deferredSearch, purchasesQuery.data?.orders, sort, statusFilter]);
  const paginatedOrders = paginateItems(filteredOrders, page, pageSize);

  if (purchasesQuery.isLoading) return <ListLoadingState />;
  if (purchasesQuery.isError || !purchasesQuery.data) {
    return (
      <ErrorState
        title="Purchase orders could not be loaded"
        message={getErrorMessage(purchasesQuery.error)}
        onRetry={() => purchasesQuery.refetch()}
      />
    );
  }

  const { orders, suppliers, medicines, currencyCode } = purchasesQuery.data;
  const orderedCount = orders.filter((order) => order.status === "ordered").length;
  const deliveredCount = orders.filter(
    (order) => order.status === "received",
  ).length;
  const canCreate =
    suppliers.some((supplier) => supplier.is_active) &&
    medicines.some((medicine) => medicine.status === "active");
  const actionPending =
    statusMutation.isPending || receiveMutation.isPending;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Purchase orders"
        description="Order medicine from suppliers and receive it into batch inventory."
        action={
          <Button onClick={() => setFormOpen(true)} disabled={!canCreate}>
            <Plus className="size-4" />
            Create order
          </Button>
        }
      />

      {!canCreate ? (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
          Add an active supplier and at least one active medicine before creating
          a purchase order.
        </div>
      ) : null}

      <div className="grid gap-3 sm:grid-cols-3">
        <Summary icon={ClipboardList} label="All orders" value={orders.length} />
        <Summary icon={Truck} label="Awaiting delivery" value={orderedCount} />
        <Summary icon={PackageCheck} label="Delivered" value={deliveredCount} />
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="grid gap-3 border-b p-4 md:grid-cols-[minmax(0,1fr)_12rem_12rem]">
            <ListSearchInput
              value={search}
              onChange={(value) => {
                setSearch(value);
                setPage(1);
              }}
              placeholder="Search order number, supplier, or medicine"
              label="Search purchase orders"
            />
            <Select
              value={statusFilter}
              onValueChange={(value: StatusFilter) => {
                setStatusFilter(value);
                setPage(1);
              }}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All statuses</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="ordered">Ordered</SelectItem>
                <SelectItem value="received">Delivered</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
            <Select
              value={sort}
              onValueChange={(value: SortOption) => {
                setSort(value);
                setPage(1);
              }}
            >
              <SelectTrigger aria-label="Sort purchase orders">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Newest first</SelectItem>
                <SelectItem value="oldest">Oldest first</SelectItem>
                <SelectItem value="value-high">Highest value</SelectItem>
                <SelectItem value="value-low">Lowest value</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {filteredOrders.length === 0 ? (
            <div className="p-6">
              <EmptyState
                title={orders.length === 0 ? "No purchase orders yet" : "No orders found"}
                description={
                  orders.length === 0
                    ? "Create a draft order when stock needs to be replenished."
                    : "Try another search or status filter."
                }
                action={
                  orders.length === 0 && canCreate ? (
                    <Button onClick={() => setFormOpen(true)}>
                      <Plus className="size-4" />
                      Create order
                    </Button>
                  ) : null
                }
              />
            </div>
          ) : (
            <>
              <div className="hidden overflow-x-auto md:block">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Order</TableHead>
                      <TableHead>Supplier</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead>Items</TableHead>
                      <TableHead className="text-right">Total</TableHead>
                      <TableHead className="text-right">Details</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedOrders.items.map((order) => (
                      <TableRow key={order.id}>
                        <TableCell className="font-medium">
                          {order.order_number}
                        </TableCell>
                        <TableCell>{order.supplier?.name ?? "Unknown"}</TableCell>
                        <TableCell><StatusBadge status={order.status} /></TableCell>
                        <TableCell>
                          {dateFormatter.format(new Date(order.created_at))}
                        </TableCell>
                        <TableCell>
                          {order.items.length} medicines · {order.totalUnits} units
                        </TableCell>
                        <TableCell className="text-right font-semibold">
                          {currencyCode} {order.total_amount.toFixed(2)}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setSelectedOrder(order)}
                          >
                            <Eye className="size-4" />
                            View
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              <div className="divide-y md:hidden">
                {paginatedOrders.items.map((order) => (
                  <button
                    type="button"
                    key={order.id}
                    className="w-full p-4 text-left hover:bg-muted/40"
                    onClick={() => setSelectedOrder(order)}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-semibold">{order.order_number}</p>
                        <p className="mt-1 text-xs text-muted-foreground">
                          {order.supplier?.name ?? "Unknown supplier"}
                        </p>
                      </div>
                      <StatusBadge status={order.status} />
                    </div>
                    <div className="mt-4 flex justify-between text-sm">
                      <span className="text-muted-foreground">
                        {order.totalUnits} units
                      </span>
                      <span className="font-semibold">
                        {currencyCode} {order.total_amount.toFixed(2)}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
              <ListPagination
                page={paginatedOrders.page}
                pageSize={pageSize}
                totalItems={filteredOrders.length}
                itemLabel="orders"
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

      <PurchaseOrderFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        suppliers={suppliers}
        medicines={medicines}
        currencyCode={currencyCode}
        isPending={createMutation.isPending}
        onSubmit={(values: PurchaseOrderFormValues) =>
          createMutation.mutate(values)
        }
      />
      <PurchaseOrderDetailsDialog
        order={selectedOrder}
        currencyCode={currencyCode}
        open={selectedOrder !== null}
        onOpenChange={(open) => {
          if (!open) setSelectedOrder(null);
        }}
        isPending={actionPending}
        onStatusChange={(status) => {
          if (selectedOrder) {
            statusMutation.mutate({ orderId: selectedOrder.id, status });
          }
        }}
        onReceive={(values) => {
          if (selectedOrder) {
            receiveMutation.mutate({ orderId: selectedOrder.id, values });
          }
        }}
      />
    </div>
  );
}

function Summary({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Truck;
  label: string;
  value: number;
}) {
  return (
    <div className="flex items-center gap-4 rounded-xl border bg-card p-4 shadow-sm">
      <div className="grid size-10 place-items-center rounded-lg bg-primary/10 text-primary">
        <Icon className="size-5" />
      </div>
      <div>
        <p className="text-2xl font-semibold tracking-tight">{value}</p>
        <p className="text-xs text-muted-foreground">{label}</p>
      </div>
    </div>
  );
}
