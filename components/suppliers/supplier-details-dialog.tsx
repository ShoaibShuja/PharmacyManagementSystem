"use client";

import { Building2, Mail, MapPin, Phone, UserRound } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { SupplierListItem } from "@/lib/suppliers/types";

const dateFormatter = new Intl.DateTimeFormat("en", {
  year: "numeric",
  month: "short",
  day: "numeric",
});

export function SupplierDetailsDialog({
  supplier,
  currencyCode,
  open,
  onOpenChange,
}: {
  supplier: SupplierListItem | null;
  currencyCode: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  if (!supplier) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-3xl">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="grid size-10 place-items-center rounded-lg bg-primary/10 text-primary">
              <Building2 className="size-5" />
            </div>
            <div>
              <DialogTitle>{supplier.name}</DialogTitle>
              <DialogDescription>
                Supplier contact details and purchase history.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="grid gap-3 sm:grid-cols-2">
          <Contact icon={UserRound} label="Contact" value={supplier.contact_person} />
          <Contact icon={Phone} label="Phone" value={supplier.phone} />
          <Contact icon={Mail} label="Email" value={supplier.email} />
          <Contact icon={MapPin} label="Address" value={supplier.address} />
        </div>

        {supplier.notes ? (
          <div className="rounded-lg border bg-muted/30 p-4">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Notes
            </p>
            <p className="mt-2 whitespace-pre-wrap text-sm">{supplier.notes}</p>
          </div>
        ) : null}

        <div>
          <div className="mb-3 flex items-center justify-between">
            <h3 className="font-semibold">Purchase history</h3>
            <Badge variant="secondary">{supplier.purchaseCount} orders</Badge>
          </div>
          {supplier.purchases.length === 0 ? (
            <div className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
              No purchase orders have been created for this supplier.
            </div>
          ) : (
            <div className="overflow-x-auto rounded-lg border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Order</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {supplier.purchases.map((purchase) => (
                    <TableRow key={purchase.id}>
                      <TableCell className="font-medium">
                        {purchase.order_number}
                      </TableCell>
                      <TableCell>
                        {dateFormatter.format(new Date(purchase.created_at))}
                      </TableCell>
                      <TableCell className="capitalize">
                        {purchase.status === "received"
                          ? "Delivered"
                          : purchase.status.replace("_", " ")}
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {currencyCode} {purchase.total_amount.toFixed(2)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

function Contact({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Phone;
  label: string;
  value: string | null;
}) {
  return (
    <div className="flex gap-3 rounded-lg border p-3">
      <Icon className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
      <div className="min-w-0">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="mt-0.5 break-words text-sm font-medium">
          {value || "Not provided"}
        </p>
      </div>
    </div>
  );
}
