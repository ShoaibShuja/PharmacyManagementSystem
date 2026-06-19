"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Building2, LoaderCircle, LockKeyhole } from "lucide-react";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  pharmacySettingsSchema,
  type PharmacySettingsFormValues,
} from "@/lib/settings/schema";
import type { PharmacySettings } from "@/lib/settings/types";

function getValues(settings: PharmacySettings): PharmacySettingsFormValues {
  return {
    pharmacy_name: settings.pharmacy_name,
    address: settings.address ?? "",
    phone: settings.phone ?? "",
    currency_code: settings.currency_code,
    receipt_footer: settings.receipt_footer ?? "",
    expiry_alert_days: settings.expiry_alert_days,
  };
}

export function PharmacySettingsForm({
  settings,
  canEdit,
  isPending,
  onSubmit,
}: {
  settings: PharmacySettings;
  canEdit: boolean;
  isPending: boolean;
  onSubmit: (values: PharmacySettingsFormValues) => void;
}) {
  const form = useForm<PharmacySettingsFormValues>({
    resolver: zodResolver(pharmacySettingsSchema),
    defaultValues: getValues(settings),
  });

  useEffect(() => {
    form.reset(getValues(settings));
  }, [form, settings]);

  return (
    <Card>
      <div className="flex items-start justify-between gap-4 border-b px-5 py-4">
        <div className="flex gap-3">
          <div className="grid size-10 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary">
            <Building2 className="size-5" />
          </div>
          <div>
            <h2 className="font-semibold">Pharmacy profile</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              These details appear on receipts, reports, and stock warnings.
            </p>
          </div>
        </div>
        {!canEdit ? (
          <div className="flex items-center gap-1.5 rounded-full bg-muted px-3 py-1 text-xs text-muted-foreground">
            <LockKeyhole className="size-3.5" />
            View only
          </div>
        ) : null}
      </div>
      <CardContent>
        <form
          className="grid gap-5"
          onSubmit={form.handleSubmit(onSubmit)}
          noValidate
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <Field
              label="Pharmacy name"
              error={form.formState.errors.pharmacy_name?.message}
              className="sm:col-span-2"
            >
              <Input
                aria-label="Pharmacy name"
                disabled={!canEdit}
                {...form.register("pharmacy_name")}
              />
            </Field>
            <Field
              label="Phone"
              error={form.formState.errors.phone?.message}
            >
              <Input
                aria-label="Phone"
                type="tel"
                disabled={!canEdit}
                placeholder="Optional"
                {...form.register("phone")}
              />
            </Field>
            <Field
              label="Currency code"
              error={form.formState.errors.currency_code?.message}
              hint="Use a 3-letter code such as USD, AFN, or PKR."
            >
              <Input
                aria-label="Currency code"
                disabled={!canEdit}
                maxLength={3}
                className="uppercase"
                {...form.register("currency_code")}
              />
            </Field>
            <Field
              label="Address"
              error={form.formState.errors.address?.message}
              className="sm:col-span-2"
            >
              <Textarea
                aria-label="Address"
                disabled={!canEdit}
                rows={3}
                placeholder="Optional pharmacy address"
                {...form.register("address")}
              />
            </Field>
            <Field
              label="Default expiry warning"
              error={form.formState.errors.expiry_alert_days?.message}
              hint="Dashboard alerts use this number of days."
            >
              <Input
                aria-label="Default expiry warning"
                type="number"
                min="0"
                max="365"
                step="1"
                disabled={!canEdit}
                {...form.register("expiry_alert_days", {
                  valueAsNumber: true,
                })}
              />
            </Field>
            <Field
              label="Receipt footer note"
              error={form.formState.errors.receipt_footer?.message}
              hint="Example: Thank you for choosing our pharmacy."
              className="sm:col-span-2"
            >
              <Textarea
                aria-label="Receipt footer note"
                disabled={!canEdit}
                rows={3}
                placeholder="Optional note printed at the bottom of receipts"
                {...form.register("receipt_footer")}
              />
            </Field>
          </div>
          {canEdit ? (
            <div className="flex justify-end border-t pt-5">
              <Button
                type="submit"
                disabled={isPending || !form.formState.isDirty}
              >
                {isPending ? (
                  <LoaderCircle className="size-4 animate-spin" />
                ) : null}
                {isPending ? "Saving..." : "Save pharmacy settings"}
              </Button>
            </div>
          ) : (
            <p className="rounded-lg bg-muted/50 p-3 text-sm text-muted-foreground">
              Pharmacists can review these details. Only an Admin can change them.
            </p>
          )}
        </form>
      </CardContent>
    </Card>
  );
}

function Field({
  label,
  error,
  hint,
  className,
  children,
}: {
  label: string;
  error?: string;
  hint?: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={`grid gap-2 ${className ?? ""}`}>
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
