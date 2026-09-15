import Constants from "expo-constants";
import type { ApiErrorBody, CreatePaymentRequest, CustomerDto, PaymentDto } from "@coligo/shared";

/**
 * The single HTTP layer of the app (architecture: services own all network
 * access; screens never fetch). Base URL resolution order:
 *   1. EXPO_PUBLIC_API_URL (set for production/demo, e.g. http://<ip>/api)
 *   2. In Expo Go development: the machine serving the dev bundle, port 3000
 *   3. localhost fallback
 */
function resolveBaseUrl(): string {
  const fromEnv = process.env.EXPO_PUBLIC_API_URL;
  if (fromEnv) return fromEnv.replace(/\/+$/, "");

  const metroHost = Constants.expoConfig?.hostUri?.split(":")[0];
  if (metroHost) return `http://${metroHost}:3000`;
  return "http://localhost:3000";
}

export const API_BASE_URL = resolveBaseUrl();

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status?: number,
    public readonly code?: string
  ) {
    super(message);
    this.name = "ApiError";
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 15_000);
  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      ...init,
      signal: controller.signal,
      headers: { "Content-Type": "application/json", ...init?.headers },
    });
  } catch {
    throw new ApiError(
      "Could not reach the server. Check your connection and try again."
    );
  } finally {
    clearTimeout(timer);
  }

  if (!response.ok) {
    let message = `Request failed (${response.status}).`;
    let code: string | undefined;
    try {
      const body = (await response.json()) as ApiErrorBody;
      if (body?.error?.message) message = body.error.message;
      code = body?.error?.code;
    } catch {
      // non-JSON error body — keep the default message
    }
    throw new ApiError(message, response.status, code);
  }

  return (await response.json()) as T;
}

export const api = {
  getCustomer(accountNumber: string): Promise<CustomerDto> {
    return request<CustomerDto>(`/customers/${encodeURIComponent(accountNumber)}`);
  },

  payEmi(input: CreatePaymentRequest): Promise<PaymentDto> {
    return request<PaymentDto>("/payments", { method: "POST", body: JSON.stringify(input) });
  },

  getHistory(accountNumber: string): Promise<PaymentDto[]> {
    return request<PaymentDto[]>(`/payments/${encodeURIComponent(accountNumber)}`);
  },
};
