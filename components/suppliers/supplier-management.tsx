"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Building2,
  Eye,
  Pencil,
  Plus,
  ShoppingBag,
  UsersRound,
} from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useDeferredValue, useMemo, useState } from "react";
import { toast } from "sonner";
import { EmptyState } from "@/components/shared/empty-state";
import { ErrorState } from "@/components/shared/error-state";
import { PageHeader } from "@/components/shared/page-header";
import {
  ListPagination,
  ListSearchInput,
  ListLoadingState,
  paginateItems,
} from "@/components/shared/list-controls";
import { SupplierDetailsDialog } from "@/components/suppliers/supplier-details-dialog";
import { SupplierFormDialog } from "@/components/suppliers/supplier-form-dialog";
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
import {
  createSupplier,
  getSuppliersPageData,
  updateSupplier,
} from "@/lib/suppliers/api";
import type { SupplierFormValues } from "@/lib/suppliers/schema";
import type { SupplierListItem } from "@/lib/suppliers/types";
import { cn } from "@/lib/utils";

const queryKey = ["suppliers"] as const;
type StatusFilter = "active" | "inactive" | "all";
type SortOption = "name" | "orders" | "value";

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : "The action could not be completed.";
}

export function SupplierManagement() {
  const queryClient = useQueryClient();
  const searchParams = useSearchParams();
  const [search, setSearch] = useState(() => searchParams.get("search") ?? "");
  const deferredSearch = useDeferredValue(search);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("active");
  const [sort, setSort] = useState<SortOption>("name");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [formOpen, setFormOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] =
    useState<SupplierListItem | null>(null);
  const [detailsSupplier, setDetailsSupplier] =
    useState<SupplierListItem | null>(null);

  const suppliersQuery = useQuery({
    queryKey,
    queryFn: getSuppliersPageData,
  });

  const supplierMutation = useMutation({
    mutationFn: (values: SupplierFormValues) => {
      const payload = {
        ...values,
        contact_person: values.contact_person || null,
        phone: values.phone || null,
        email: values.email || null,
        address: values.address || null,
        notes: values.notes || null,
      };
      return editingSupplier
        ? updateSupplier(editingSupplier.id, payload)
        : createSupplier(payload);
    },
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey }),
        queryClient.invalidateQueries({ queryKey: ["purchases"] }),
      ]);
      toast.success(editingSupplier ? "Supplier updated." : "Supplier added.");
      setFormOpen(false);
      setEditingSupplier(null);
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });

  const filteredSuppliers = useMemo(() => {
    const term = deferredSearch.trim().toLowerCase();
    const matches = (suppliersQuery.data?.suppliers ?? []).filter((supplier) => {
      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "active" && supplier.is_active) ||
        (statusFilter === "inactive" && !supplier.is_active);
      const matchesSearch =
        !term ||
        supplier.name.toLowerCase().includes(term) ||
        supplier.contact_person?.toLowerCase().includes(term) ||
        supplier.phone?.toLowerCase().includes(term) ||
        supplier.email?.toLowerCase().includes(term);
      return matchesStatus && matchesSearch;
    });
    return matches.toSorted((a, b) => {
      if (sort === "orders") return b.purchaseCount - a.purchaseCount;
      if (sort === "value") return b.totalPurchased - a.totalPurchased;
      return a.name.localeCompare(b.name);
    });
  }, [deferredSearch, sort, statusFilter, suppliersQuery.data?.suppliers]);
  const paginatedSuppliers = paginateItems(
    filteredSuppliers,
    page,
    pageSize,
  );

  if (suppliersQuery.isLoading) return <ListLoadingState />;
  if (suppliersQuery.isError || !suppliersQuery.data) {
    return (
      <ErrorState
        title="Suppliers could not be loaded"
        message={getErrorMessage(suppliersQuery.error)}
        onRetry={() => suppliersQuery.refetch()}
      />
    );
  }

  const { suppliers, currencyCode } = suppliersQuery.data;
  const activeCount = suppliers.filter((supplier) => supplier.is_active).length;
  const totalOrders = suppliers.reduce(
    (total, supplier) => total + supplier.purchaseCount,
    0,
  );

  function openAdd() {
    setEditingSupplier(null);
    setFormOpen(true);
  }

  function openEdit(supplier: SupplierListItem) {
    setEditingSupplier(supplier);
    setFormOpen(true);
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Suppliers"
        description="Manage supplier contacts and review their purchase history."
        action={
          <Button onClick={openAdd}>
            <Plus className="size-4" />
            Add supplier
          </Button>
        }
      />

      <div className="grid gap-3 sm:grid-cols-3">
        <Summary icon={UsersRound} label="Active suppliers" value={activeCount} />
        <Summary icon={ShoppingBag} label="Purchase orders" value={totalOrders} />
        <Summary
          icon={Building2}
          label="Suppliers on file"
          value={suppliers.length}
        />
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="grid gap-3 border-b p-4 md:grid-cols-[minmax(0,1fr)_11rem_12rem]">
            <ListSearchInput
              value={search}
              onChange={(value) => {
                setSearch(value);
                setPage(1);
              }}
              placeholder="Search supplier, contact, phone, or email"
              label="Search suppliers"
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
              <SelectTrigger aria-label="Sort suppliers">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="name">Name A–Z</SelectItem>
                <SelectItem value="orders">Most orders</SelectItem>
                <SelectItem value="value">Highest delivered value</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {filteredSuppliers.length === 0 ? (
            <div className="p-6">
              <EmptyState
                title={suppliers.length === 0 ? "No suppliers yet" : "No suppliers found"}
                description={
                  suppliers.length === 0
                    ? "Add a supplier before creating a purchase order."
                    : "Try another search or status filter."
                }
                action={
                  suppliers.length === 0 ? (
                    <Button onClick={openAdd}>
                      <Plus className="size-4" />
                      Add supplier
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
                      <TableHead>Supplier</TableHead>
                      <TableHead>Contact</TableHead>
                      <TableHead>Orders</TableHead>
                      <TableHead className="text-right">Delivered value</TableHead>
                      <TableHead className="w-32 text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedSuppliers.items.map((supplier) => (
                      <TableRow
                        key={supplier.id}
                        className={cn(!supplier.is_active && "opacity-60")}
                      >
                        <TableCell>
                          <button
                            type="button"
                            className="font-medium hover:text-primary"
                            onClick={() => setDetailsSupplier(supplier)}
                          >
                            {supplier.name}
                          </button>
                          <div className="mt-1">
                            <Badge
                              variant={supplier.is_active ? "secondary" : "outline"}
                            >
                              {supplier.is_active ? "Active" : "Inactive"}
                            </Badge>
                          </div>
                        </TableCell>
                        <TableCell>
                          <p>{supplier.contact_person || "No contact person"}</p>
                          <p className="text-xs text-muted-foreground">
                            {supplier.phone || supplier.email || "No contact details"}
                          </p>
                        </TableCell>
                        <TableCell>{supplier.purchaseCount}</TableCell>
                        <TableCell className="text-right font-medium">
                          {currencyCode} {supplier.totalPurchased.toFixed(2)}
                        </TableCell>
                        <TableCell>
                          <div className="flex justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              title="View supplier"
                              onClick={() => setDetailsSupplier(supplier)}
                            >
                              <Eye className="size-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              title="Edit supplier"
                              onClick={() => openEdit(supplier)}
                            >
                              <Pencil className="size-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              <div className="divide-y md:hidden">
                {paginatedSuppliers.items.map((supplier) => (
                  <button
                    type="button"
                    key={supplier.id}
                    className="w-full p-4 text-left hover:bg-muted/40"
                    onClick={() => setDetailsSupplier(supplier)}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-semibold">{supplier.name}</p>
                        <p className="mt-1 text-xs text-muted-foreground">
                          {supplier.contact_person || supplier.phone || "No contact details"}
                        </p>
                      </div>
                      <Badge variant={supplier.is_active ? "secondary" : "outline"}>
                        {supplier.is_active ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                    <div className="mt-4 flex justify-between text-sm">
                      <span className="text-muted-foreground">
                        {supplier.purchaseCount} orders
                      </span>
                      <span className="font-medium">
                        {currencyCode} {supplier.totalPurchased.toFixed(2)}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
              <ListPagination
                page={paginatedSuppliers.page}
                pageSize={pageSize}
                totalItems={filteredSuppliers.length}
                itemLabel="suppliers"
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

      <SupplierFormDialog
        open={formOpen}
        onOpenChange={(open) => {
          setFormOpen(open);
          if (!open) setEditingSupplier(null);
        }}
        supplier={editingSupplier}
        isPending={supplierMutation.isPending}
        onSubmit={(values) => supplierMutation.mutate(values)}
      />
      <SupplierDetailsDialog
        supplier={detailsSupplier}
        currencyCode={currencyCode}
        open={detailsSupplier !== null}
        onOpenChange={(open) => {
          if (!open) setDetailsSupplier(null);
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
  icon: typeof Building2;
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
