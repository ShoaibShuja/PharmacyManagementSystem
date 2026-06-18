import { z } from "zod";

const receiptItemSchema = z.object({
  id: z.string(),
  medicine_id: z.string(),
  medicine_name: z.string(),
  batch_number: z.string(),
  quantity: z.number(),
  unit_price: z.number(),
  line_total: z.number(),
});

export const saleReceiptSchema = z.object({
  id: z.string(),
  sale_number: z.string(),
  subtotal: z.number(),
  discount_amount: z.number(),
  total_amount: z.number(),
  payment_method: z.enum(["cash", "card", "other"]),
  completed_at: z.string(),
  items: z.array(receiptItemSchema),
});
