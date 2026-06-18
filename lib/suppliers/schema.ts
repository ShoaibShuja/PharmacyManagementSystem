import { z } from "zod";

const optionalText = (maximum: number) => z.string().trim().max(maximum);

export const supplierSchema = z.object({
  name: z.string().trim().min(1, "Supplier name is required.").max(120),
  contact_person: optionalText(120),
  phone: optionalText(40),
  email: z
    .string()
    .trim()
    .max(160)
    .refine(
      (value) => value.length === 0 || z.email().safeParse(value).success,
      "Enter a valid email address.",
    ),
  address: optionalText(300),
  notes: optionalText(1000),
  is_active: z.boolean(),
});

export type SupplierFormValues = z.infer<typeof supplierSchema>;
