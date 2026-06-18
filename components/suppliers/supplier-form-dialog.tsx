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
import { Textarea } from "@/components/ui/textarea";
import {
  supplierSchema,
  type SupplierFormValues,
} from "@/lib/suppliers/schema";
import type { Supplier } from "@/lib/suppliers/types";

const defaultValues: SupplierFormValues = {
  name: "",
  contact_person: "",
  phone: "",
  email: "",
  address: "",
  notes: "",
  is_active: true,
};

function getValues(supplier?: Supplier | null): SupplierFormValues {
  if (!supplier) return defaultValues;
  return {
    name: supplier.name,
    contact_person: supplier.contact_person ?? "",
    phone: supplier.phone ?? "",
    email: supplier.email ?? "",
    address: supplier.address ?? "",
    notes: supplier.notes ?? "",
    is_active: supplier.is_active,
  };
}

export function SupplierFormDialog({
  open,
  onOpenChange,
  supplier,
  isPending,
  onSubmit,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  supplier?: Supplier | null;
  isPending: boolean;
  onSubmit: (values: SupplierFormValues) => void;
}) {
  const form = useForm<SupplierFormValues>({
    resolver: zodResolver(supplierSchema),
    defaultValues,
  });

  useEffect(() => {
    if (open) form.reset(getValues(supplier));
  }, [form, open, supplier]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{supplier ? "Edit supplier" : "Add supplier"}</DialogTitle>
          <DialogDescription>
            Store the contact details staff need when ordering medicine.
          </DialogDescription>
        </DialogHeader>
        <form
          className="grid gap-5"
          onSubmit={form.handleSubmit(onSubmit)}
          noValidate
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Supplier name" error={form.formState.errors.name?.message}>
              <Input autoFocus {...form.register("name")} />
            </Field>
            <Field
              label="Contact person"
              error={form.formState.errors.contact_person?.message}
            >
              <Input {...form.register("contact_person")} />
            </Field>
            <Field label="Phone" error={form.formState.errors.phone?.message}>
              <Input type="tel" {...form.register("phone")} />
            </Field>
            <Field label="Email" error={form.formState.errors.email?.message}>
              <Input type="email" {...form.register("email")} />
            </Field>
            <div className="sm:col-span-2">
              <Field label="Address" error={form.formState.errors.address?.message}>
                <Textarea rows={3} {...form.register("address")} />
              </Field>
            </div>
            <div className="sm:col-span-2">
              <Field
                label="Notes"
                error={form.formState.errors.notes?.message}
                hint="Optional ordering instructions or account references."
              >
                <Textarea rows={4} {...form.register("notes")} />
              </Field>
            </div>
            <Field label="Status">
              <Controller
                control={form.control}
                name="is_active"
                render={({ field }) => (
                  <Select
                    value={field.value ? "active" : "inactive"}
                    onValueChange={(value) => field.onChange(value === "active")}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
            </Field>
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
              {supplier ? "Save changes" : "Add supplier"}
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
