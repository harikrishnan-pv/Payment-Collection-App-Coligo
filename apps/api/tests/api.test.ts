import { beforeAll, describe, expect, it } from "vitest";
import request from "supertest";
import { createApp } from "../src/app";

const app = createApp();

const DEMO_ACCOUNT = "ACC-100234";
const UNKNOWN_ACCOUNT = "ACC-999999";

let seededHistoryCount = 0;
// Accounts with no payments this month, so insert tests are deterministic
// under the one-EMI-per-month rule. Picked fresh in beforeAll.
let payAccount = "";
let historyAccount = "";

beforeAll(async () => {
  const res = await request(app).get(`/payments/${DEMO_ACCOUNT}`);
  seededHistoryCount = res.status === 200 ? res.body.length : 0;

  const customers = await request(app).get("/customers");
  const accounts: string[] = customers.body.map((c: { accountNumber: string }) => c.accountNumber);
  const empties: string[] = [];
  for (const account of accounts) {
    const history = await request(app).get(`/payments/${account}`);
    if (history.status === 200 && history.body.length === 0) empties.push(account);
    if (empties.length >= 2) break;
  }
  if (empties.length < 2) throw new Error("Seed data must expose 2+ accounts with no payments this month");
  payAccount = empties[0];
  historyAccount = empties[1];
});

describe("GET /health", () => {
  it("returns ok", async () => {
    const res = await request(app).get("/health");
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ status: "ok" });
  });
});

describe("GET /customers", () => {
  it("lists loan details for all customers with the required fields", async () => {
    const res = await request(app).get("/customers");
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThanOrEqual(10);
    for (const c of res.body) {
      expect(c).toMatchObject({
        accountNumber: expect.any(String),
        issueDate: expect.stringMatching(/^\d{4}-\d{2}-\d{2}$/),
        interestRate: expect.any(Number),
        tenureMonths: expect.any(Number),
        emiDue: expect.any(Number),
      });
    }
  });

  it("returns a single loan by account number", async () => {
    const res = await request(app).get(`/customers/${DEMO_ACCOUNT}`);
    expect(res.status).toBe(200);
    expect(res.body.accountNumber).toBe(DEMO_ACCOUNT);
  });

  it("404s with the error envelope for unknown accounts", async () => {
    const res = await request(app).get(`/customers/${UNKNOWN_ACCOUNT}`);
    expect(res.status).toBe(404);
    expect(res.body.error).toEqual({ code: expect.any(String), message: expect.any(String) });
  });
});

describe("POST /payments", () => {
  it("records a payment and returns the acknowledgment payload", async () => {
    const res = await request(app)
      .post("/payments")
      .send({ accountNumber: payAccount, amount: 12480.5 });
    expect(res.status).toBe(201);
    expect(res.body).toMatchObject({
      id: expect.stringMatching(/^[0-9a-f-]{36}$/),
      accountNumber: payAccount,
      amount: 12480.5,
      status: "SUCCESS",
      paymentDate: expect.any(String),
    });
    expect(new Date(res.body.paymentDate).toString()).not.toBe("Invalid Date");
  });

  it("rejects a second EMI payment in the same month with 409", async () => {
    const res = await request(app)
      .post("/payments")
      .send({ accountNumber: payAccount, amount: 12480.5 });
    expect(res.status).toBe(409);
    expect(res.body.error).toMatchObject({ code: "EMI_ALREADY_PAID" });

    // The duplicate must not have been written to the ledger.
    const history = await request(app).get(`/payments/${payAccount}`);
    expect(history.body.length).toBe(1);
  });

  it("rejects non-positive amounts with 400 + envelope", async () => {
    const res = await request(app).post("/payments").send({ accountNumber: DEMO_ACCOUNT, amount: 0 });
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe("VALIDATION_ERROR");
  });

  it("rejects more than 2 decimal places with 400", async () => {
    const res = await request(app)
      .post("/payments")
      .send({ accountNumber: DEMO_ACCOUNT, amount: 10.123 });
    expect(res.status).toBe(400);
  });

  it("rejects malformed bodies (string amount) with 400", async () => {
    const res = await request(app)
      .post("/payments")
      .send({ accountNumber: DEMO_ACCOUNT, amount: "lots" });
    expect(res.status).toBe(400);
  });

  it("404s for unknown account numbers", async () => {
    const res = await request(app)
      .post("/payments")
      .send({ accountNumber: UNKNOWN_ACCOUNT, amount: 100 });
    expect(res.status).toBe(404);
    expect(res.body.error).toMatchObject({ code: "NOT_FOUND" });
  });

  it("returns 400 envelope for invalid JSON", async () => {
    const res = await request(app)
      .post("/payments")
      .set("Content-Type", "application/json")
      .send("{not json");
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe("BAD_JSON");
  });
});

describe("GET /payments/:account_number", () => {
  it("returns history newest-first and includes fresh payments", async () => {
    const before = await request(app).get(`/payments/${historyAccount}`);
    expect(before.status).toBe(200);
    const countBefore = before.body.length;

    const paid = await request(app)
      .post("/payments")
      .send({ accountNumber: historyAccount, amount: 1500 });

    const res = await request(app).get(`/payments/${historyAccount}`);
    expect(res.status).toBe(200);
    expect(res.body.length).toBe(countBefore + 1);
    expect(res.body[0].id).toBe(paid.body.id); // newest first

    const dates = res.body.map((p: { paymentDate: string }) => new Date(p.paymentDate).getTime());
    const sorted = [...dates].sort((a, b) => b - a);
    expect(dates).toEqual(sorted);
  });

  it("404s for unknown accounts", async () => {
    const res = await request(app).get(`/payments/${UNKNOWN_ACCOUNT}`);
    expect(res.status).toBe(404);
  });
});

describe("unknown routes", () => {
  it("return the envelope, not an HTML error page", async () => {
    const res = await request(app).get("/nope");
    expect(res.status).toBe(404);
    expect(res.body.error.code).toBe("ROUTE_NOT_FOUND");
  });
});

// Runs last: the reset wipes everything the tests above inserted.
describe("POST /demo/reset", () => {
  it("restores the seed dataset and clears this month's payments", async () => {
    const res = await request(app).post("/demo/reset");
    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({
      status: "reset",
      customersReset: 12,
      paymentsRestored: expect.any(Number),
    });

    // payAccount was paid by the tests above — the reset wiped that ledger row
    const history = await request(app).get(`/payments/${payAccount}`);
    expect(history.status).toBe(200);
    expect(history.body.length).toBe(0);

    // The demo account is back to exactly its seeded history, none of it this month
    const demo = await request(app).get(`/payments/${DEMO_ACCOUNT}`);
    expect(demo.body.length).toBe(3);
    const newest = new Date(demo.body[0].paymentDate);
    expect(newest.getUTCMonth()).not.toBe(new Date().getUTCMonth());
  });
});
