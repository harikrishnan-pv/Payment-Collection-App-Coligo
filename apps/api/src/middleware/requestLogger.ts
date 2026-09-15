import type { NextFunction, Request, Response } from "express";
import pino from "pino";
import { config } from "../config";

export const logger = pino({
  level: config.isProd ? "info" : "debug",
});

/** One JSON log line per request: method, path, status, duration. */
export function requestLogger(req: Request, res: Response, next: NextFunction): void {
  const start = process.hrtime.bigint();
  res.on("finish", () => {
    const ms = Number(process.hrtime.bigint() - start) / 1e6;
    logger.info({ method: req.method, path: req.originalUrl, status: res.statusCode, ms: ms.toFixed(1) }, "request");
  });
  next();
}
