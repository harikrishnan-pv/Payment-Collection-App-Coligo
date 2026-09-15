import { Router } from "express";
import { AccountNumberSchema } from "@coligo/shared";
import * as customerService from "../services/customerService";

export const customersRouter = Router();

/**
 * GET /customers — loan details of all customers (test-mandated path, AD-1).
 * GET /customers/:accountNumber — single loan (used by the app's lookup).
 */
customersRouter.get("/", async (_req, res) => {
  const customers = await customerService.listCustomers();
  res.json(customers);
});

customersRouter.get("/:accountNumber", async (req, res) => {
  const accountNumber = AccountNumberSchema.parse(req.params.accountNumber);
  const customer = await customerService.getCustomerByAccountNumber(accountNumber);
  res.json(customer);
});
