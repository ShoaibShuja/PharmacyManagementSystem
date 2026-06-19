import { z } from "zod";

function todayDateValue() {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export const purchaseOrderItemSchema = z.object({
  medicine_id: z.string().min(1, "Select a medicine."),
  ordered_quantity: z
    .number()
    .int("Quantity must be a whole number.")
    .min(1, "Quantity must be at least 1."),
  unit_cost: z.number().min(0, "Cost price cannot be negative."),
  intended_selling_price: z
    .number()
    .min(0, "Selling price cannot be negative."),
});

export const purchaseOrderSchema = z.object({
  supplier_id: z.string().min(1, "Select a supplier."),
  expected_date: z
    .string()
    .refine(
      (value) => value.length === 0 || value >= todayDateValue(),
      "Expected date cannot be in the past.",
    ),
  notes: z.string().trim().max(1000),
  items: z
    .array(purchaseOrderItemSchema)
    .min(1, "Add at least one medicine.")
    .refine(
      (items) => new Set(items.map((item) => item.medicine_id)).size === items.length,
      "Each medicine can appear only once.",
    ),
});

export const purchaseDeliverySchema = z.object({
  deliveries: z
    .array(
      z.object({
        purchase_order_item_id: z.string().uuid(),
        batch_number: z
          .string()
          .trim()
          .min(1, "Batch number is required.")
          .max(120),
        expiry_date: z
          .string()
          .min(1, "Expiry date is required.")
          .refine(
            (value) => value >= todayDateValue(),
            "Expiry date cannot be in the past.",
          ),
      }),
    )
    .min(1, "Delivery details are required."),
});

export type PurchaseOrderFormValues = z.infer<typeof purchaseOrderSchema>;
export type PurchaseDeliveryFormValues = z.infer<
  typeof purchaseDeliverySchema
>;
