"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  History,
  LoaderCircle,
  Minus,
  PackageOpen,
  Plus,
  ReceiptText,
  Search,
  ShoppingCart,
  Trash2,
} from "lucide-react";
import { useDeferredValue, useMemo, useState } from "react";
import { toast } from "sonner";
import { ReceiptDialog } from "@/components/sales/receipt-dialog";
import { ErrorState } from "@/components/shared/error-state";
import { LoadingState } from "@/components/shared/loading-state";
import { PageHeader } from "@/components/shared/page-header";
import { Badge } from "@/components/ui/badge";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  completeSale,
  estimateMedicineTotal,
  getSalesPageData,
} from "@/lib/sales/api";
import type {
  CartItem,
  PosMedicineOption,
  SaleHistoryDetail,
  SaleReceipt,
} from "@/lib/sales/types";
import { cn } from "@/lib/utils";

const salesQueryKey = ["sales-page"] as const;
const dateTimeFormatter = new Intl.DateTimeFormat("en", {
  year: "numeric",
  month: "short",
  day: "numeric",
  hour: "numeric",
  minute: "2-digit",
});

type View = "pos" | "history";

export function PosPage() {
  const queryClient = useQueryClient();
  const [view, setView] = useState<View>("pos");
  const [search, setSearch] = useState("");
  const deferredSearch = useDeferredValue(search);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [discount, setDiscount] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState<
    "cash" | "card" | "other"
  >("cash");
  const [receipt, setReceipt] = useState<SaleReceipt | null>(null);

  const salesQuery = useQuery({
    queryKey: salesQueryKey,
    queryFn: getSalesPageData,
  });

  const completionMutation = useMutation({
    mutationFn: completeSale,
    onSuccess: async (completedReceipt) => {
      setReceipt(completedReceipt);
      setCart([]);
      setDiscount(0);
      setPaymentMethod("cash");
      setSearch("");
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: salesQueryKey }),
        queryClient.invalidateQueries({ queryKey: ["dashboard"] }),
        queryClient.invalidateQueries({ queryKey: ["medicine-catalog"] }),
      ]);
      toast.success(`Sale ${completedReceipt.sale_number} completed.`);
    },
    onError: (error) => {
      toast.error(
        error instanceof Error
          ? error.message
          : "The sale could not be completed.",
      );
      salesQuery.refetch();
    },
  });

  const medicines = useMemo(
    () => salesQuery.data?.medicines ?? [],
    [salesQuery.data?.medicines],
  );
  const medicineMap = useMemo(
    () => new Map(medicines.map((medicine) => [medicine.id, medicine])),
    [medicines],
  );
  const filteredMedicines = useMemo(() => {
    const term = deferredSearch.trim().toLowerCase();
    if (!term) return medicines.filter((medicine) => medicine.availableStock > 0);

    return medicines.filter(
      (medicine) =>
        medicine.availableStock > 0 &&
        (medicine.brand_name.toLowerCase().includes(term) ||
          medicine.generic_name?.toLowerCase().includes(term) ||
          medicine.barcode?.toLowerCase().includes(term) ||
          medicine.sku?.toLowerCase().includes(term)),
    );
  }, [deferredSearch, medicines]);

  const subtotal = useMemo(
    () => cart.reduce((total, item) => total + item.estimatedLineTotal, 0),
    [cart],
  );
  const safeDiscount = Math.min(Math.max(discount, 0), subtotal);
  const total = Math.round((subtotal - safeDiscount) * 100) / 100;

  function addMedicine(medicine: PosMedicineOption) {
    setCart((currentCart) => {
      const existing = currentCart.find(
        (item) => item.medicineId === medicine.id,
      );
      const nextQuantity = (existing?.quantity ?? 0) + 1;

      if (nextQuantity > medicine.availableStock) {
        toast.error(`Only ${medicine.availableStock} ${medicine.unit} available.`);
        return currentCart;
      }

      const estimatedLineTotal = estimateMedicineTotal(
        medicine,
        nextQuantity,
      );
      if (existing) {
        return currentCart.map((item) =>
          item.medicineId === medicine.id
            ? {
                ...item,
                quantity: nextQuantity,
                estimatedLineTotal,
                estimatedUnitPrice: estimatedLineTotal / nextQuantity,
              }
            : item,
        );
      }

      return [
        ...currentCart,
        {
          medicineId: medicine.id,
          brandName: medicine.brand_name,
          genericName: medicine.generic_name,
          unit: medicine.unit,
          quantity: 1,
          availableStock: medicine.availableStock,
          estimatedUnitPrice: estimatedLineTotal,
          estimatedLineTotal,
        },
      ];
    });
  }

  function updateQuantity(medicineId: string, quantity: number) {
    const medicine = medicineMap.get(medicineId);
    if (!medicine) return;
    if (quantity <= 0) {
      setCart((current) =>
        current.filter((item) => item.medicineId !== medicineId),
      );
      return;
    }
    if (quantity > medicine.availableStock) {
      toast.error(`Only ${medicine.availableStock} ${medicine.unit} available.`);
      return;
    }

    const estimatedLineTotal = estimateMedicineTotal(medicine, quantity);
    setCart((current) =>
      current.map((item) =>
        item.medicineId === medicineId
          ? {
              ...item,
              quantity,
              availableStock: medicine.availableStock,
              estimatedLineTotal,
              estimatedUnitPrice: estimatedLineTotal / quantity,
            }
          : item,
      ),
    );
  }

  function handleDiscount(value: string) {
    const parsed = Number(value);
    setDiscount(Number.isFinite(parsed) ? Math.max(parsed, 0) : 0);
  }

  function submitSale() {
    if (cart.length === 0) {
      toast.error("Add at least one medicine to the cart.");
      return;
    }
    if (discount > subtotal) {
      toast.error("Discount cannot be greater than the subtotal.");
      return;
    }

    completionMutation.mutate({
      items: cart.map((item) => ({
        medicineId: item.medicineId,
        quantity: item.quantity,
      })),
      discount: safeDiscount,
      paymentMethod,
    });
  }

  if (salesQuery.isLoading) return <LoadingState />;
  if (salesQuery.isError || !salesQuery.data) {
    return (
      <ErrorState
        title="Sales could not be loaded"
        message={
          salesQuery.error instanceof Error
            ? salesQuery.error.message
            : "The POS is unavailable."
        }
        onRetry={() => salesQuery.refetch()}
      />
    );
  }

  const { settings, sales } = salesQuery.data;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Sales & POS"
        description="Search medicines, build a cart, and complete a sale."
        action={
          <div className="flex rounded-lg border bg-card p-1">
            <ViewButton
              active={view === "pos"}
              onClick={() => setView("pos")}
              icon={ShoppingCart}
              label="New sale"
            />
            <ViewButton
              active={view === "history"}
              onClick={() => setView("history")}
              icon={History}
              label="History"
            />
          </div>
        }
      />

      {view === "pos" ? (
        <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1.35fr)_minmax(22rem,0.65fr)]">
          <Card>
            <CardContent className="p-0">
              <div className="border-b p-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    autoFocus
                    className="h-11 pl-9"
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder="Search medicine, barcode, or SKU"
                  />
                </div>
              </div>

              {filteredMedicines.length === 0 ? (
                <div className="flex min-h-80 flex-col items-center justify-center p-8 text-center">
                  <PackageOpen className="size-9 text-muted-foreground" />
                  <p className="mt-4 font-semibold">
                    {medicines.length === 0
                      ? "No medicines in the catalog"
                      : "No saleable medicine found"}
                  </p>
                  <p className="mt-1 max-w-sm text-sm text-muted-foreground">
                    {medicines.length === 0
                      ? "Add medicines and receive inventory before creating a sale."
                      : "Try another search or confirm that stock is available and not expired."}
                  </p>
                </div>
              ) : (
                <div className="grid gap-3 p-4 sm:grid-cols-2 2xl:grid-cols-3">
                  {filteredMedicines.map((medicine) => {
                    const cartQuantity =
                      cart.find((item) => item.medicineId === medicine.id)
                        ?.quantity ?? 0;
                    return (
                      <button
                        type="button"
                        key={medicine.id}
                        className="rounded-xl border bg-background p-4 text-left transition hover:border-primary/50 hover:shadow-sm disabled:cursor-not-allowed disabled:opacity-50"
                        onClick={() => addMedicine(medicine)}
                        disabled={cartQuantity >= medicine.availableStock}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <p className="truncate font-semibold">
                              {medicine.brand_name}
                            </p>
                            <p className="mt-1 truncate text-xs text-muted-foreground">
                              {[medicine.generic_name, medicine.strength]
                                .filter(Boolean)
                                .join(" · ") || medicine.dosage_form}
                            </p>
                          </div>
                          {cartQuantity > 0 ? (
                            <Badge>{cartQuantity} in cart</Badge>
                          ) : null}
                        </div>
                        <div className="mt-5 flex items-end justify-between gap-3">
                          <div>
                            <p className="text-xs text-muted-foreground">
                              Available
                            </p>
                            <p className="text-sm font-medium">
                              {medicine.availableStock} {medicine.unit}
                            </p>
                          </div>
                          <p className="font-semibold text-primary">
                            {settings.currencyCode}{" "}
                            {medicine.displayPrice.toFixed(2)}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          <CartPanel
            cart={cart}
            currencyCode={settings.currencyCode}
            subtotal={subtotal}
            discount={discount}
            total={total}
            paymentMethod={paymentMethod}
            isPending={completionMutation.isPending}
            onQuantityChange={updateQuantity}
            onRemove={(medicineId) =>
              setCart((current) =>
                current.filter((item) => item.medicineId !== medicineId),
              )
            }
            onDiscountChange={handleDiscount}
            onPaymentMethodChange={setPaymentMethod}
            onComplete={submitSale}
          />
        </div>
      ) : (
        <SalesHistory
          sales={sales}
          currencyCode={settings.currencyCode}
          onView={(sale) => setReceipt(historyToReceipt(sale))}
        />
      )}

      <ReceiptDialog
        receipt={receipt}
        settings={settings}
        open={receipt !== null}
        onOpenChange={(open) => {
          if (!open) setReceipt(null);
        }}
      />
    </div>
  );
}

function CartPanel({
  cart,
  currencyCode,
  subtotal,
  discount,
  total,
  paymentMethod,
  isPending,
  onQuantityChange,
  onRemove,
  onDiscountChange,
  onPaymentMethodChange,
  onComplete,
}: {
  cart: CartItem[];
  currencyCode: string;
  subtotal: number;
  discount: number;
  total: number;
  paymentMethod: "cash" | "card" | "other";
  isPending: boolean;
  onQuantityChange: (medicineId: string, quantity: number) => void;
  onRemove: (medicineId: string) => void;
  onDiscountChange: (value: string) => void;
  onPaymentMethodChange: (method: "cash" | "card" | "other") => void;
  onComplete: () => void;
}) {
  return (
    <Card className="xl:sticky xl:top-24">
      <div className="flex items-center justify-between border-b px-5 py-4">
        <div>
          <h2 className="font-semibold">Current sale</h2>
          <p className="mt-1 text-xs text-muted-foreground">
            {cart.length} medicine{cart.length === 1 ? "" : "s"}
          </p>
        </div>
        <ShoppingCart className="size-5 text-primary" />
      </div>
      <CardContent className="p-5">
        {cart.length === 0 ? (
          <div className="flex min-h-48 flex-col items-center justify-center rounded-lg border border-dashed text-center">
            <ShoppingCart className="size-8 text-muted-foreground" />
            <p className="mt-3 text-sm font-semibold">Cart is empty</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Select a medicine to add it.
            </p>
          </div>
        ) : (
          <div className="max-h-[42vh] space-y-4 overflow-y-auto pr-1">
            {cart.map((item) => (
              <div key={item.medicineId} className="rounded-lg border p-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold">
                      {item.brandName}
                    </p>
                    <p className="truncate text-xs text-muted-foreground">
                      {item.genericName ?? `${item.availableStock} ${item.unit} available`}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-8 text-muted-foreground hover:text-destructive"
                    onClick={() => onRemove(item.medicineId)}
                    title="Remove item"
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </div>
                <div className="mt-3 flex items-center justify-between gap-3">
                  <div className="flex items-center rounded-md border">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-8 rounded-r-none"
                      onClick={() =>
                        onQuantityChange(item.medicineId, item.quantity - 1)
                      }
                    >
                      <Minus className="size-3.5" />
                    </Button>
                    <Input
                      className="h-8 w-12 rounded-none border-y-0 text-center shadow-none"
                      type="number"
                      min="1"
                      max={item.availableStock}
                      value={item.quantity}
                      onChange={(event) =>
                        onQuantityChange(
                          item.medicineId,
                          Number(event.target.value),
                        )
                      }
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-8 rounded-l-none"
                      onClick={() =>
                        onQuantityChange(item.medicineId, item.quantity + 1)
                      }
                      disabled={item.quantity >= item.availableStock}
                    >
                      <Plus className="size-3.5" />
                    </Button>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold">
                      {currencyCode} {item.estimatedLineTotal.toFixed(2)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Avg. {item.estimatedUnitPrice.toFixed(2)} each
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="mt-5 grid gap-4 border-t pt-5">
          <div className="grid grid-cols-2 gap-3">
            <div className="grid gap-2">
              <Label htmlFor="sale-discount">Discount</Label>
              <Input
                id="sale-discount"
                type="number"
                min="0"
                max={subtotal}
                step="0.01"
                value={discount}
                onChange={(event) => onDiscountChange(event.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label>Payment</Label>
              <Select
                value={paymentMethod}
                onValueChange={onPaymentMethodChange}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cash">Cash</SelectItem>
                  <SelectItem value="card">Card</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2 rounded-lg bg-muted/50 p-4 text-sm">
            <SummaryRow
              label="Subtotal"
              value={`${currencyCode} ${subtotal.toFixed(2)}`}
            />
            <SummaryRow
              label="Discount"
              value={`-${currencyCode} ${Math.min(discount, subtotal).toFixed(2)}`}
            />
            <div className="flex justify-between border-t pt-3 text-lg font-bold">
              <span>Total</span>
              <span>
                {currencyCode} {total.toFixed(2)}
              </span>
            </div>
          </div>

          <Button
            className="h-12 text-base"
            disabled={cart.length === 0 || isPending || discount > subtotal}
            onClick={onComplete}
          >
            {isPending ? (
              <LoaderCircle className="size-5 animate-spin" />
            ) : (
              <ReceiptText className="size-5" />
            )}
            {isPending ? "Completing sale..." : "Complete sale"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function SalesHistory({
  sales,
  currencyCode,
  onView,
}: {
  sales: SaleHistoryDetail[];
  currencyCode: string;
  onView: (sale: SaleHistoryDetail) => void;
}) {
  return (
    <Card>
      <CardContent className="p-0">
        {sales.length === 0 ? (
          <div className="flex min-h-80 flex-col items-center justify-center p-8 text-center">
            <History className="size-9 text-muted-foreground" />
            <p className="mt-4 font-semibold">No completed sales yet</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Completed sales and receipts will appear here.
            </p>
          </div>
        ) : (
          <>
            <div className="hidden overflow-x-auto md:block">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Sale</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Payment</TableHead>
                    <TableHead>Items</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                    <TableHead className="text-right">Receipt</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sales.map((sale) => (
                    <TableRow key={sale.id}>
                      <TableCell className="font-medium">
                        {sale.sale_number}
                      </TableCell>
                      <TableCell>
                        {dateTimeFormatter.format(
                          new Date(sale.completed_at ?? sale.created_at),
                        )}
                      </TableCell>
                      <TableCell className="capitalize">
                        {sale.payment_method}
                      </TableCell>
                      <TableCell>
                        {sale.items.reduce(
                          (total, item) => total + item.quantity,
                          0,
                        )}
                      </TableCell>
                      <TableCell className="text-right font-semibold">
                        {currencyCode} {sale.total_amount.toFixed(2)}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onView(sale)}
                        >
                          <ReceiptText className="size-4" />
                          View
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            <div className="divide-y md:hidden">
              {sales.map((sale) => (
                <button
                  type="button"
                  key={sale.id}
                  className="flex w-full items-center justify-between gap-4 p-4 text-left hover:bg-muted/40"
                  onClick={() => onView(sale)}
                >
                  <div>
                    <p className="font-medium">{sale.sale_number}</p>
                    <p className="mt-1 text-xs capitalize text-muted-foreground">
                      {dateTimeFormatter.format(
                        new Date(sale.completed_at ?? sale.created_at),
                      )}{" "}
                      · {sale.payment_method}
                    </p>
                  </div>
                  <p className="font-semibold">
                    {currencyCode} {sale.total_amount.toFixed(2)}
                  </p>
                </button>
              ))}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}

function ViewButton({
  active,
  onClick,
  icon: Icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon: typeof ShoppingCart;
  label: string;
}) {
  return (
    <button
      type="button"
      className={cn(
        "inline-flex h-8 items-center gap-2 rounded-md px-3 text-sm font-medium transition",
        active
          ? "bg-primary text-primary-foreground shadow-sm"
          : "text-muted-foreground hover:text-foreground",
      )}
      onClick={onClick}
    >
      <Icon className="size-4" />
      {label}
    </button>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between">
      <span className="text-muted-foreground">{label}</span>
      <span>{value}</span>
    </div>
  );
}

function historyToReceipt(sale: SaleHistoryDetail): SaleReceipt {
  return {
    id: sale.id,
    sale_number: sale.sale_number,
    subtotal: sale.subtotal,
    discount_amount: sale.discount_amount,
    total_amount: sale.total_amount,
    payment_method: sale.payment_method,
    completed_at: sale.completed_at ?? sale.created_at,
    items: sale.items,
  };
}
