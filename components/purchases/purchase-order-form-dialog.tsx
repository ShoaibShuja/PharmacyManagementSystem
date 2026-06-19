"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { LoaderCircle, Plus, Trash2 } from "lucide-react";
import { useEffect } from "react";
import {
  Controller,
  useFieldArray,
  useForm,
  useWatch,
} from "react-hook-form";
import { Button } from "@/components/ui/button";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  purchaseOrderSchema,
  type PurchaseOrderFormValues,
} from "@/lib/purchases/schema";
import type {
  PurchaseMedicine,
  PurchaseSupplier,
} from "@/lib/purchases/types";

const emptyItem = {
  medicine_id: "",
  ordered_quantity: 1,
  unit_cost: 0,
  intended_selling_price: 0,
};

const defaultValues: PurchaseOrderFormValues = {
  supplier_id: "",
  expected_date: "",
  notes: "",
  items: [{ ...emptyItem }],
};

export function PurchaseOrderFormDialog({
  open,
  onOpenChange,
  suppliers,
  medicines,
  currencyCode,
  isPending,
  onSubmit,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  suppliers: PurchaseSupplier[];
  medicines: PurchaseMedicine[];
  currencyCode: string;
  isPending: boolean;
  onSubmit: (values: PurchaseOrderFormValues) => void;
}) {
  const form = useForm<PurchaseOrderFormValues>({
    resolver: zodResolver(purchaseOrderSchema),
    defaultValues,
  });
  const items = useFieldArray({ control: form.control, name: "items" });

  useEffect(() => {
    if (open) form.reset(defaultValues);
  }, [form, open]);

  const watchedItems = useWatch({
    control: form.control,
    name: "items",
  });
  const subtotal = watchedItems.reduce((total, item) => {
    const quantity = Number.isFinite(item.ordered_quantity)
      ? item.ordered_quantity
      : 0;
    const cost = Number.isFinite(item.unit_cost) ? item.unit_cost : 0;
    return total + quantity * cost;
  }, 0);

  function selectMedicine(index: number, medicineId: string) {
    const medicine = medicines.find((item) => item.id === medicineId);
    form.setValue(`items.${index}.medicine_id`, medicineId, {
      shouldValidate: true,
    });
    if (medicine) {
      form.setValue(`items.${index}.unit_cost`, medicine.default_cost_price);
      form.setValue(
        `items.${index}.intended_selling_price`,
        medicine.default_selling_price,
      );
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92vh] overflow-y-auto sm:max-w-4xl">
        <DialogHeader>
          <DialogTitle>Create purchase order</DialogTitle>
          <DialogDescription>
            Add the medicines and expected prices for this restocking order.
          </DialogDescription>
        </DialogHeader>
        <form
          className="grid gap-5"
          onSubmit={form.handleSubmit(onSubmit)}
          noValidate
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <Field
              label="Supplier"
              error={form.formState.errors.supplier_id?.message}
            >
              <Controller
                control={form.control}
                name="supplier_id"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger aria-label="Supplier">
                      <SelectValue placeholder="Select supplier" />
                    </SelectTrigger>
                    <SelectContent>
                      {suppliers
                        .filter((supplier) => supplier.is_active)
                        .map((supplier) => (
                          <SelectItem key={supplier.id} value={supplier.id}>
                            {supplier.name}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </Field>
            <Field label="Expected date">
              <Input
                aria-label="Expected date"
                type="date"
                {...form.register("expected_date")}
              />
            </Field>
          </div>

          <div className="rounded-xl border">
            <div className="flex items-center justify-between border-b px-4 py-3">
              <div>
                <h3 className="font-semibold">Medicines</h3>
                <p className="text-xs text-muted-foreground">
                  Cost and selling prices are saved on the received batch.
                </p>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => items.append({ ...emptyItem })}
              >
                <Plus className="size-4" />
                Add item
              </Button>
            </div>
            <div className="space-y-4 p-4">
              {items.fields.map((field, index) => (
                <div
                  key={field.id}
                  className="grid gap-3 rounded-lg bg-muted/35 p-3 lg:grid-cols-[minmax(13rem,1fr)_8rem_10rem_10rem_auto]"
                >
                  <Field
                    label="Medicine"
                    error={
                      form.formState.errors.items?.[index]?.medicine_id?.message
                    }
                  >
                    <Select
                      value={watchedItems[index]?.medicine_id}
                      onValueChange={(value) => selectMedicine(index, value)}
                    >
                      <SelectTrigger aria-label={`Medicine ${index + 1}`}>
                        <SelectValue placeholder="Select medicine" />
                      </SelectTrigger>
                      <SelectContent>
                        {medicines
                          .filter((medicine) => medicine.status === "active")
                          .map((medicine) => (
                            <SelectItem key={medicine.id} value={medicine.id}>
                              {medicine.brand_name}
                              {medicine.strength ? ` ${medicine.strength}` : ""}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                  </Field>
                  <Field
                    label="Quantity"
                    error={
                      form.formState.errors.items?.[index]?.ordered_quantity
                        ?.message
                    }
                  >
                    <Input
                      aria-label={`Quantity for item ${index + 1}`}
                      type="number"
                      min="1"
                      step="1"
                      {...form.register(`items.${index}.ordered_quantity`, {
                        valueAsNumber: true,
                      })}
                    />
                  </Field>
                  <Field
                    label={`Cost (${currencyCode})`}
                    error={
                      form.formState.errors.items?.[index]?.unit_cost?.message
                    }
                  >
                    <Input
                      aria-label={`Cost for item ${index + 1}`}
                      type="number"
                      min="0"
                      step="0.01"
                      {...form.register(`items.${index}.unit_cost`, {
                        valueAsNumber: true,
                      })}
                    />
                  </Field>
                  <Field
                    label={`Selling (${currencyCode})`}
                    error={
                      form.formState.errors.items?.[index]
                        ?.intended_selling_price?.message
                    }
                  >
                    <Input
                      aria-label={`Selling price for item ${index + 1}`}
                      type="number"
                      min="0"
                      step="0.01"
                      {...form.register(
                        `items.${index}.intended_selling_price`,
                        { valueAsNumber: true },
                      )}
                    />
                  </Field>
                  <div className="flex items-end">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      aria-label={`Remove purchase item ${index + 1}`}
                      title="Remove item"
                      disabled={items.fields.length === 1}
                      onClick={() => items.remove(index)}
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </div>
                </div>
              ))}
              {form.formState.errors.items?.root?.message ? (
                <p className="text-xs text-destructive">
                  {form.formState.errors.items.root.message}
                </p>
              ) : null}
              {typeof form.formState.errors.items?.message === "string" ? (
                <p className="text-xs text-destructive">
                  {form.formState.errors.items.message}
                </p>
              ) : null}
            </div>
          </div>

          <Field label="Notes" error={form.formState.errors.notes?.message}>
            <Textarea
              aria-label="Notes"
              rows={3}
              placeholder="Optional delivery or ordering notes"
              {...form.register("notes")}
            />
          </Field>

          <div className="flex items-center justify-between rounded-lg bg-primary/5 px-4 py-3">
            <span className="text-sm text-muted-foreground">Order subtotal</span>
            <span className="text-lg font-semibold">
              {currencyCode} {subtotal.toFixed(2)}
            </span>
          </div>

          <DialogFooter className="gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={
                isPending ||
                suppliers.every((supplier) => !supplier.is_active) ||
                medicines.every((medicine) => medicine.status !== "active")
              }
            >
              {isPending ? <LoaderCircle className="size-4 animate-spin" /> : null}
              Create draft
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="grid gap-2">
      <Label>{label}</Label>
      {children}
      {error ? <p className="text-xs text-destructive">{error}</p> : null}
    </div>
  );
}
