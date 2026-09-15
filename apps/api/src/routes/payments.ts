import { Router } from "express";
import { AccountNumberSchema, CreatePaymentSchema } from "@coligo/shared";
import * as paymentService from "../services/paymentService";

export const paymentsRouter = Router();

/**
 * POST /payments — record an EMI payment (test-mandated path, AD-1).
 * Body: {accountNumber: string, amount: number} — zod-validated via shared schema.
 */
paymentsRouter.post("/", async (req, res) => {
  const input = CreatePaymentSchema.parse(req.body);
  const payment = await paymentService.payEmi(input);
  res.status(201).json(payment);
});

/** GET /payments/:accountNumber — payment history, newest first (AD-8). */
paymentsRouter.get("/:accountNumber", async (req, res) => {
  const accountNumber = AccountNumberSchema.parse(req.params.accountNumber);
  const history = await paymentService.getHistory(accountNumber);
  res.json(history);
});
