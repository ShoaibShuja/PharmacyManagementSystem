import { z } from "zod";

export const pharmacySettingsSchema = z.object({
  pharmacy_name: z
    .string()
    .trim()
    .min(1, "Pharmacy name is required.")
    .max(120),
  address: z.string().trim().max(300),
  phone: z.string().trim().max(40),
  currency_code: z
    .string()
    .trim()
    .length(3, "Use a 3-letter currency code.")
    .regex(/^[A-Za-z]{3}$/, "Use letters only.")
    .transform((value) => value.toUpperCase()),
  receipt_footer: z.string().trim().max(300),
  expiry_alert_days: z
    .number()
    .int("Expiry warning days must be a whole number.")
    .min(0, "Expiry warning days cannot be negative.")
    .max(365, "Expiry warning days cannot exceed 365."),
});

export const userRoleSchema = z.object({
  userId: z.string().uuid(),
  role: z.enum(["admin", "pharmacist", "cashier"]),
});

export type PharmacySettingsFormValues = z.infer<
  typeof pharmacySettingsSchema
>;
