"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { LoaderCircle } from "lucide-react";
import { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
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
import {
  medicineSchema,
  type MedicineFormValues,
} from "@/lib/medicines/schema";
import type {
  Medicine,
  MedicineCategory,
} from "@/lib/medicines/types";

type MedicineFormDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  medicine?: Medicine | null;
  categories: MedicineCategory[];
  isPending: boolean;
  onSubmit: (values: MedicineFormValues) => void;
};

const defaultValues: MedicineFormValues = {
  brand_name: "",
  generic_name: "",
  dosage_form: "Tablet",
  strength: "",
  category_id: "",
  sku: "",
  barcode: "",
  unit: "unit",
  default_selling_price: 0,
  default_cost_price: 0,
  reorder_threshold: 10,
  status: "active",
};

function getMedicineValues(medicine?: Medicine | null): MedicineFormValues {
  if (!medicine) return defaultValues;

  return {
    brand_name: medicine.brand_name,
    generic_name: medicine.generic_name ?? "",
    dosage_form: medicine.dosage_form,
    strength: medicine.strength ?? "",
    category_id: medicine.category_id ?? "",
    sku: medicine.sku ?? "",
    barcode: medicine.barcode ?? "",
    unit: medicine.unit,
    default_selling_price: medicine.default_selling_price,
    default_cost_price: medicine.default_cost_price,
    reorder_threshold: medicine.reorder_threshold,
    status: medicine.status,
  };
}

export function MedicineFormDialog({
  open,
  onOpenChange,
  medicine,
  categories,
  isPending,
  onSubmit,
}: MedicineFormDialogProps) {
  const form = useForm<MedicineFormValues>({
    resolver: zodResolver(medicineSchema),
    defaultValues,
  });

  useEffect(() => {
    if (open) {
      form.reset(getMedicineValues(medicine));
    }
  }, [form, medicine, open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{medicine ? "Edit medicine" : "Add medicine"}</DialogTitle>
          <DialogDescription>
            Save the catalog details and default prices. Stock is received in
            batches through inventory workflows.
          </DialogDescription>
        </DialogHeader>

        <form
          className="grid gap-5"
          onSubmit={form.handleSubmit(onSubmit)}
          noValidate
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField
              label="Brand name"
              error={form.formState.errors.brand_name?.message}
            >
              <Input
                autoFocus
                aria-label="Brand name"
                placeholder="Example: Panadol"
                {...form.register("brand_name")}
              />
            </FormField>
            <FormField
              label="Generic name"
              error={form.formState.errors.generic_name?.message}
            >
              <Input
                aria-label="Generic name"
                placeholder="Example: Paracetamol"
                {...form.register("generic_name")}
              />
            </FormField>
            <FormField
              label="Dosage form"
              error={form.formState.errors.dosage_form?.message}
            >
              <Input
                aria-label="Dosage form"
                placeholder="Tablet, syrup, cream"
                {...form.register("dosage_form")}
              />
            </FormField>
            <FormField
              label="Strength"
              error={form.formState.errors.strength?.message}
            >
              <Input
                aria-label="Strength"
                placeholder="Example: 500 mg"
                {...form.register("strength")}
              />
            </FormField>
            <FormField label="Category">
              <Controller
                control={form.control}
                name="category_id"
                render={({ field }) => (
                  <Select
                    value={field.value || "none"}
                    onValueChange={(value) =>
                      field.onChange(value === "none" ? "" : value)
                    }
                  >
                    <SelectTrigger aria-label="Category">
                      <SelectValue placeholder="No category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">No category</SelectItem>
                      {categories
                        .filter((category) => category.is_active)
                        .map((category) => (
                          <SelectItem key={category.id} value={category.id}>
                            {category.name}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </FormField>
            <FormField label="Unit" error={form.formState.errors.unit?.message}>
              <Input
                aria-label="Unit"
                placeholder="unit, box, bottle"
                {...form.register("unit")}
              />
            </FormField>
            <FormField label="SKU" error={form.formState.errors.sku?.message}>
              <Input
                aria-label="SKU"
                placeholder="Optional internal code"
                {...form.register("sku")}
              />
            </FormField>
            <FormField
              label="Barcode"
              error={form.formState.errors.barcode?.message}
            >
              <Input
                aria-label="Barcode"
                placeholder="Optional barcode"
                {...form.register("barcode")}
              />
            </FormField>
            <FormField
              label="Default cost price"
              error={form.formState.errors.default_cost_price?.message}
            >
              <Input
                aria-label="Default cost price"
                type="number"
                min="0"
                step="0.01"
                {...form.register("default_cost_price", { valueAsNumber: true })}
              />
            </FormField>
            <FormField
              label="Default selling price"
              error={form.formState.errors.default_selling_price?.message}
            >
              <Input
                aria-label="Default selling price"
                type="number"
                min="0"
                step="0.01"
                {...form.register("default_selling_price", { valueAsNumber: true })}
              />
            </FormField>
            <FormField
              label="Reorder threshold"
              error={form.formState.errors.reorder_threshold?.message}
              hint="Low-stock warnings appear at or below this quantity."
            >
              <Input
                aria-label="Reorder threshold"
                type="number"
                min="0"
                step="1"
                {...form.register("reorder_threshold", { valueAsNumber: true })}
              />
            </FormField>
            <FormField label="Status">
              <Controller
                control={form.control}
                name="status"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger aria-label="Status">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
            </FormField>
          </div>

          <DialogFooter className="gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? <LoaderCircle className="size-4 animate-spin" /> : null}
              {medicine ? "Save changes" : "Add medicine"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function FormField({
  label,
  error,
  hint,
  children,
}: {
  label: string;
  error?: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="grid gap-2">
      <Label>{label}</Label>
      {children}
      {error ? (
        <p className="text-xs text-destructive">{error}</p>
      ) : hint ? (
        <p className="text-xs text-muted-foreground">{hint}</p>
      ) : null}
    </div>
  );
}
