"use client";

import { CalendarClock, Package, Tag } from "lucide-react";
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
import type { MedicineCatalogItem } from "@/lib/medicines/types";

type MedicineDetailsDialogProps = {
  medicine: MedicineCatalogItem | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currencyCode: string;
};

const dateFormatter = new Intl.DateTimeFormat("en", {
  year: "numeric",
  month: "short",
  day: "numeric",
  timeZone: "UTC",
});

export function MedicineDetailsDialog({
  medicine,
  open,
  onOpenChange,
  currencyCode,
}: MedicineDetailsDialogProps) {
  if (!medicine) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-3xl">
        <DialogHeader>
          <div className="flex flex-wrap items-center gap-2 pr-8">
            <DialogTitle>{medicine.brand_name}</DialogTitle>
            <Badge variant={medicine.status === "active" ? "default" : "secondary"}>
              {medicine.status}
            </Badge>
          </div>
          <DialogDescription>
            {[medicine.generic_name, medicine.strength, medicine.dosage_form]
              .filter(Boolean)
              .join(" · ")}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-3 sm:grid-cols-3">
          <DetailStat
            icon={Package}
            label="Saleable stock"
            value={`${medicine.saleableStock} ${medicine.unit}`}
          />
          <DetailStat
            icon={Tag}
            label="Default price"
            value={`${currencyCode} ${medicine.default_selling_price.toFixed(2)}`}
          />
          <DetailStat
            icon={CalendarClock}
            label="Nearest expiry"
            value={
              medicine.nearestExpiryDate
                ? dateFormatter.format(
                    new Date(`${medicine.nearestExpiryDate}T00:00:00Z`),
                  )
                : "No stocked batch"
            }
          />
        </div>

        <div className="grid gap-3 rounded-lg border bg-muted/30 p-4 text-sm sm:grid-cols-2">
          <Detail label="Category" value={medicine.category?.name ?? "Uncategorized"} />
          <Detail label="Reorder threshold" value={`${medicine.reorder_threshold}`} />
          <Detail label="SKU" value={medicine.sku ?? "Not set"} />
          <Detail label="Barcode" value={medicine.barcode ?? "Not set"} />
        </div>

        <div>
          <h3 className="mb-3 text-sm font-semibold">Inventory batches</h3>
          {medicine.batches.length === 0 ? (
            <div className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
              No inventory batches have been received for this medicine.
            </div>
          ) : (
            <div className="overflow-hidden rounded-lg border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Batch</TableHead>
                    <TableHead>Expiry</TableHead>
                    <TableHead className="text-right">Quantity</TableHead>
                    <TableHead className="text-right">Selling price</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {medicine.batches.map((batch) => (
                    <TableRow key={batch.id}>
                      <TableCell className="font-medium">
                        {batch.batch_number}
                      </TableCell>
                      <TableCell>
                        {dateFormatter.format(
                          new Date(`${batch.expiry_date}T00:00:00Z`),
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        {batch.current_quantity}
                      </TableCell>
                      <TableCell className="text-right">
                        {currencyCode} {batch.selling_price.toFixed(2)}
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

function DetailStat({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Package;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-lg border bg-card p-4">
      <Icon className="mb-3 size-4 text-primary" />
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-1 text-sm font-semibold">{value}</p>
    </div>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <span className="text-muted-foreground">{label}: </span>
      <span className="font-medium">{value}</span>
    </div>
  );
}
