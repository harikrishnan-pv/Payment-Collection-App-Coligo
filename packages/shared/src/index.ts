import { z } from "zod";

/**
 * Shared API contract for the Coligo Payment Collection App.
 * Single source of truth consumed by apps/api (server) and apps/mobile (client).
 */

// ---------------------------------------------------------------------------
// Primitives
// ---------------------------------------------------------------------------

/** Account numbers: alphanumeric with optional dashes, 4-20 chars (e.g. "ACC-100234"). */
export const AccountNumberSchema = z
  .string()
  .trim()
  .regex(/^[A-Za-z0-9-]{4,20}$/, "Account number must be 4-20 letters, digits or dashes");

/** INR money: positive, at most 2 decimals, sane upper bound. */
export const MoneySchema = z
  .number({ invalid_type_error: "Amount must be a number" })
  .positive("Amount must be greater than zero")
  .max(10_000_000, "Amount exceeds the maximum allowed")
  .refine(
    (n) => Number.isFinite(n) && Math.round(n * 100) === n * 100,
    "Amount supports at most 2 decimal places"
  );

// ---------------------------------------------------------------------------
// Requests
// ---------------------------------------------------------------------------

export const CreatePaymentSchema = z.object({
  accountNumber: AccountNumberSchema,
  amount: MoneySchema,
});
export type CreatePaymentRequest = z.infer<typeof CreatePaymentSchema>;

// ---------------------------------------------------------------------------
// Responses
// ---------------------------------------------------------------------------

export const CustomerDtoSchema = z.object({
  id: z.number().int(),
  accountNumber: z.string(),
  name: z.string(),
  issueDate: z.string(), // ISO-8601 date (YYYY-MM-DD)
  interestRate: z.number(), // annual %
  tenureMonths: z.number().int(),
  emiDue: z.number(),
  outstanding: z.number(),
});
export type CustomerDto = z.infer<typeof CustomerDtoSchema>;

export const PAYMENT_STATUSES = ["SUCCESS", "PENDING", "FAILED"] as const;
export type PaymentStatus = (typeof PAYMENT_STATUSES)[number];

export const PaymentDtoSchema = z.object({
  id: z.string().uuid(), // payment reference shown on the acknowledgment
  accountNumber: z.string(),
  amount: z.number(),
  paymentDate: z.string(), // ISO-8601 timestamp
  status: z.enum(PAYMENT_STATUSES),
});
export type PaymentDto = z.infer<typeof PaymentDtoSchema>;

// ---------------------------------------------------------------------------
// Error envelope (every non-2xx response)
// ---------------------------------------------------------------------------

export type ApiErrorBody = {
  error: {
    code: string;
    message: string;
  };
};
