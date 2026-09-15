import { Router } from "express";
import { resetDemoData } from "../db/seed";

export const demoRouter = Router();

/**
 * Demo convenience (not part of the test-mandated contract): restore the seed
 * dataset. Useful after a 409 EMI_ALREADY_PAID, to demo the happy path again.
 */
demoRouter.post("/reset", async (_req, res, next) => {
  try {
    const result = await resetDemoData();
    res.json({ status: "reset", ...result });
  } catch (err) {
    next(err);
  }
});
