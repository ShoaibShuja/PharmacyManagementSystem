"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import {
  CalendarDays,
  LoaderCircle,
  PackageCheck,
  Send,
  Truck,
  XCircle,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  purchaseDeliverySchema,
  type PurchaseDeliveryFormValues,
} from "@/lib/purchases/schema";
import type { PurchaseOrderDetail } from "@/lib/purchases/types";
import { cn } from "@/lib/utils";

const dateFormatter = new Intl.DateTimeFormat("en", {
  year: "numeric",
  month: "short",
  day: "numeric",
  timeZone: "UTC",
});

const dateTimeFormatter = new Intl.DateTimeFormat("en", {
  year: "numeric",
  month: "short",
  day: "numeric",
  hour: "numeric",
  minute: "2-digit",
});

export function PurchaseOrderDetailsDialog({
  order,
  currencyCode,
  open,
  onOpenChange,
  isPending,
  onStatusChange,
  onReceive,
}: {
  order: PurchaseOrderDetail | null;
  currencyCode: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  isPending: boolean;
  onStatusChange: (status: "ordered" | "cancelled") => void;
  onReceive: (values: PurchaseDeliveryFormValues) => void;
}) {
  const [deliveryOpen, setDeliveryOpen] = useState(false);
  if (!order) return null;

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-h-[92vh] overflow-y-auto sm:max-w-4xl">
          <DialogHeader>
            <div className="flex flex-wrap items-start justify-between gap-3 pr-8">
              <div>
                <DialogTitle>{order.order_number}</DialogTitle>
                <DialogDescription>
                  Created {dateTimeFormatter.format(new Date(order.created_at))}
                </DialogDescription>
              </div>
              <StatusBadge status={order.status} />
            </div>
          </DialogHeader>

          <div className="grid gap-3 sm:grid-cols-3">
            <Info
              icon={Truck}
              label="Supplier"
              value={order.supplier?.name ?? "Unknown supplier"}
            />
            <Info
              icon={CalendarDays}
              label="Expected"
              value={
                order.expected_date
                  ? dateFormatter.format(
                      new Date(`${order.expected_date}T00:00:00Z`),
                    )
                  : "Not set"
              }
            />
            <Info
              icon={PackageCheck}
              label="Units"
              value={`${order.totalUnits} ordered`}
            />
          </div>

          <div className="overflow-x-auto rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Medicine</TableHead>
                  <TableHead>Quantity</TableHead>
                  <TableHead className="text-right">Unit cost</TableHead>
                  <TableHead className="text-right">Selling price</TableHead>
                  <TableHead className="text-right">Line total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {order.items.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>
                      <p className="font-medium">
                        {item.medicine?.brand_name ?? "Unknown medicine"}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {[item.medicine?.generic_name, item.medicine?.strength]
                          .filter(Boolean)
                          .join(" · ")}
                      </p>
                    </TableCell>
                    <TableCell>
                      {item.received_quantity}/{item.ordered_quantity}{" "}
                      {item.medicine?.unit ?? "units"}
                    </TableCell>
                    <TableCell className="text-right">
                      {currencyCode} {item.unit_cost.toFixed(2)}
                    </TableCell>
                    <TableCell className="text-right">
                      {currencyCode} {item.intended_selling_price.toFixed(2)}
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {currencyCode}{" "}
                      {(item.ordered_quantity * item.unit_cost).toFixed(2)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <div className="grid gap-4 sm:grid-cols-[1fr_18rem]">
            <div className="rounded-lg border bg-muted/25 p-4">
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Notes
              </p>
              <p className="mt-2 whitespace-pre-wrap text-sm">
                {order.notes || "No notes were added."}
              </p>
            </div>
            <div className="space-y-2 rounded-lg border p-4 text-sm">
              <Row label="Subtotal" value={`${currencyCode} ${order.subtotal.toFixed(2)}`} />
              <Row label="Discount" value={`${currencyCode} ${order.discount_amount.toFixed(2)}`} />
              <Row label="Tax" value={`${currencyCode} ${order.tax_amount.toFixed(2)}`} />
              <div className="flex justify-between border-t pt-3 text-base font-semibold">
                <span>Total</span>
                <span>{currencyCode} {order.total_amount.toFixed(2)}</span>
              </div>
            </div>
          </div>

          <DialogFooter className="gap-2">
            {order.status === "draft" ? (
              <>
                <ConfirmDialog
                  trigger={
                    <Button variant="outline" disabled={isPending}>
                      <XCircle className="size-4" />
                      Cancel order
                    </Button>
                  }
                  title="Cancel this purchase order?"
                  description="The draft will be kept for history and cannot be ordered or delivered."
                  confirmLabel="Cancel order"
                  destructive
                  onConfirm={() => onStatusChange("cancelled")}
                />
                <ConfirmDialog
                  trigger={<Button disabled={isPending}><Send className="size-4" />Mark ordered</Button>}
                  title="Mark this purchase order as ordered?"
                  description="Confirm that the order has been sent to the supplier. Item details cannot be edited after this step."
                  confirmLabel="Mark ordered"
                  onConfirm={() => onStatusChange("ordered")}
                />
              </>
            ) : null}
            {order.status === "ordered" ? (
              <>
                <ConfirmDialog
                  trigger={
                    <Button variant="outline" disabled={isPending}>
                      <XCircle className="size-4" />
                      Cancel order
                    </Button>
                  }
                  title="Cancel this ordered purchase?"
                  description="Use this only if the supplier will not deliver the order."
                  confirmLabel="Cancel order"
                  destructive
                  onConfirm={() => onStatusChange("cancelled")}
                />
                <Button
                  disabled={isPending}
                  onClick={() => setDeliveryOpen(true)}
                >
                  <PackageCheck className="size-4" />
                  Confirm delivery
                </Button>
              </>
            ) : null}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <DeliveryDialog
        order={order}
        open={deliveryOpen}
        onOpenChange={setDeliveryOpen}
        isPending={isPending}
        onSubmit={onReceive}
      />
    </>
  );
}

function DeliveryDialog({
  order,
  open,
  onOpenChange,
  isPending,
  onSubmit,
}: {
  order: PurchaseOrderDetail;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  isPending: boolean;
  onSubmit: (values: PurchaseDeliveryFormValues) => void;
}) {
  const form = useForm<PurchaseDeliveryFormValues>({
    resolver: zodResolver(purchaseDeliverySchema),
    defaultValues: { deliveries: [] },
  });
  const today = new Date().toISOString().slice(0, 10);

  useEffect(() => {
    if (open) {
      form.reset({
        deliveries: order.items.map((item) => ({
          purchase_order_item_id: item.id,
          batch_number: "",
          expiry_date: "",
        })),
      });
    }
  }, [form, open, order.items]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92vh] overflow-y-auto sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>Confirm delivery</DialogTitle>
          <DialogDescription>
            Enter the physical batch number and expiry date printed on each
            delivered medicine. This action adds stock and cannot be repeated.
          </DialogDescription>
        </DialogHeader>
        <form
          className="grid gap-4"
          onSubmit={form.handleSubmit(onSubmit)}
          noValidate
        >
          {order.items.map((item, index) => (
            <div
              key={item.id}
              className="grid gap-3 rounded-lg border p-4 sm:grid-cols-[minmax(0,1fr)_12rem_11rem]"
            >
              <div>
                <p className="font-medium">
                  {item.medicine?.brand_name ?? "Unknown medicine"}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Receiving {item.ordered_quantity} {item.medicine?.unit ?? "units"}
                </p>
              </div>
              <div className="grid gap-2">
                <Label>Batch number</Label>
                <Input
                  aria-label={`Batch number for ${item.medicine?.brand_name ?? `item ${index + 1}`}`}
                  {...form.register(`deliveries.${index}.batch_number`)}
                />
                {form.formState.errors.deliveries?.[index]?.batch_number?.message ? (
                  <p className="text-xs text-destructive">
                    {form.formState.errors.deliveries[index]?.batch_number?.message}
                  </p>
                ) : null}
              </div>
              <div className="grid gap-2">
                <Label>Expiry date</Label>
                <Input
                  aria-label={`Expiry date for ${item.medicine?.brand_name ?? `item ${index + 1}`}`}
                  type="date"
                  min={today}
                  {...form.register(`deliveries.${index}.expiry_date`)}
                />
                {form.formState.errors.deliveries?.[index]?.expiry_date?.message ? (
                  <p className="text-xs text-destructive">
                    {form.formState.errors.deliveries[index]?.expiry_date?.message}
                  </p>
                ) : null}
              </div>
            </div>
          ))}
          <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
            Delivery creates inventory batches for all items and marks the order
            as delivered. Verify quantities, batch numbers, and expiry dates first.
          </div>
          <DialogFooter className="gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Go back
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? <LoaderCircle className="size-4 animate-spin" /> : null}
              Add stock and deliver
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function StatusBadge({
  status,
}: {
  status: PurchaseOrderDetail["status"];
}) {
  const label =
    status === "received"
      ? "Delivered"
      : status === "partially_received"
        ? "Partially delivered"
        : status[0].toUpperCase() + status.slice(1);
  return (
    <Badge
      variant={status === "cancelled" ? "outline" : "secondary"}
      className={cn(
        status === "ordered" && "border-blue-200 bg-blue-50 text-blue-800",
        status === "received" && "border-emerald-200 bg-emerald-50 text-emerald-800",
        status === "draft" && "border-slate-200 bg-slate-50 text-slate-700 dark:border-slate-500/30 dark:bg-slate-400/10 dark:text-slate-300",
      )}
    >
      {label}
    </Badge>
  );
}

function Info({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Truck;
  label: string;
  value: string;
}) {
  return (
    <div className="flex gap-3 rounded-lg border p-3">
      <Icon className="mt-0.5 size-4 text-muted-foreground" />
      <div>
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="mt-0.5 text-sm font-medium">{value}</p>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between">
      <span className="text-muted-foreground">{label}</span>
      <span>{value}</span>
    </div>
  );
}
