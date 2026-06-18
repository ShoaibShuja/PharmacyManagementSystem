import { z } from "zod";

const optionalText = z.string().trim().max(160);

export const medicineSchema = z.object({
  brand_name: z.string().trim().min(1, "Brand name is required.").max(120),
  generic_name: optionalText,
  dosage_form: z.string().trim().min(1, "Dosage form is required.").max(80),
  strength: optionalText,
  category_id: optionalText,
  sku: optionalText,
  barcode: optionalText,
  unit: z.string().trim().min(1, "Unit is required.").max(40),
  default_selling_price: z.number().min(0, "Selling price cannot be negative."),
  default_cost_price: z.number().min(0, "Cost price cannot be negative."),
  reorder_threshold: z
    .number()
    .int("Reorder threshold must be a whole number.")
    .min(0, "Reorder threshold cannot be negative."),
  status: z.enum(["active", "inactive"]),
});

export const categorySchema = z.object({
  name: z.string().trim().min(1, "Category name is required.").max(80),
  description: optionalText,
});

export type MedicineFormValues = z.infer<typeof medicineSchema>;
export type CategoryFormValues = z.infer<typeof categorySchema>;
