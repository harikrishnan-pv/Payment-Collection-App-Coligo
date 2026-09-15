import type { NextFunction, Request, Response } from "express";
import { ZodError } from "zod";
import { ApiError } from "../errors";
import { logger } from "./requestLogger";

type Envelope = { error: { code: string; message: string } };

function envelope(code: string, message: string): Envelope {
  return { error: { code, message } };
}

/**
 * Structural zod check: the shared package may resolve a different zod copy
 * under pnpm, making `instanceof` unreliable across package boundaries.
 */
function isZodError(err: unknown): err is ZodError {
  return (
    err instanceof ZodError ||
    (typeof err === "object" &&
      err !== null &&
      (err as { name?: unknown }).name === "ZodError" &&
      Array.isArray((err as { issues?: unknown }).issues))
  );
}

/**
 * Terminal middleware: every failure leaves as {error:{code,message}} (AD-5).
 * 500s log the details server-side but never leak them to the client.
 */
export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  if (err instanceof ApiError) {
    res.status(err.status).json(envelope(err.code, err.message));
    return;
  }

  if (isZodError(err)) {
    const first = err.issues[0];
    const detail = first ? `${first.path.join(".") || "body"}: ${first.message}` : "Invalid request body";
    res.status(400).json(envelope("VALIDATION_ERROR", detail));
    return;
  }

  // Malformed JSON body from express.json()
  if (err instanceof SyntaxError && "body" in (err as object)) {
    res.status(400).json(envelope("BAD_JSON", "Request body is not valid JSON"));
    return;
  }

  const message = err instanceof Error ? err.message : String(err);
  logger.error({ err: message }, "unhandled error");
  if (!res.headersSent) {
    res.status(500).json(envelope("INTERNAL_ERROR", "Something went wrong. Please try again."));
  }
}

/** Unknown routes get the same envelope. */
export function notFoundHandler(_req: Request, res: Response): void {
  res.status(404).json(envelope("ROUTE_NOT_FOUND", "The requested endpoint does not exist."));
}
