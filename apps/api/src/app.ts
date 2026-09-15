import express from "express";
import { customersRouter } from "./routes/customers";
import { paymentsRouter } from "./routes/payments";
import { demoRouter } from "./routes/demo";
import { requestLogger } from "./middleware/requestLogger";
import { errorHandler, notFoundHandler } from "./middleware/errorHandler";

/** App factory — exported for supertest; server.ts owns listen(). */
export function createApp() {
  const app = express();
  app.disable("x-powered-by");
  app.use(express.json({ limit: "64kb" }));
  app.use(requestLogger);

  app.get("/health", (_req, res) => {
    res.json({ status: "ok" });
  });

  // Test-mandated endpoints (AD-1)
  app.use("/customers", customersRouter);
  app.use("/payments", paymentsRouter);

  // Demo convenience: POST /demo/reset restores seed data
  app.use("/demo", demoRouter);

  app.use(notFoundHandler);
  app.use(errorHandler);
  return app;
}
