import { pool } from "./pool";

/**
 * Rerunnable seed: wipes and repopulates demo customers + payment history.
 * Demo accounts are listed on the landing page and in the README.
 */
type SeedCustomer = {
  accountNumber: string;
  name: string;
  issueDate: string;
  interestRate: number;
  tenureMonths: number;
  emiDue: number;
  outstanding: number;
  pastPayments: { monthsAgo: number; amount: number }[];
};

const customers: SeedCustomer[] = [
  { accountNumber: "ACC-100234", name: "Ananya Menon", issueDate: "2024-02-15", interestRate: 11.25, tenureMonths: 36, emiDue: 12480.5, outstanding: 412500, pastPayments: [{ monthsAgo: 3, amount: 12480.5 }, { monthsAgo: 2, amount: 12480.5 }, { monthsAgo: 1, amount: 12480.5 }] },
  { accountNumber: "ACC-100235", name: "Rahul Varma", issueDate: "2023-08-01", interestRate: 12.5, tenureMonths: 48, emiDue: 9310, outstanding: 358200, pastPayments: [{ monthsAgo: 4, amount: 9310 }, { monthsAgo: 3, amount: 9310 }] },
  { accountNumber: "ACC-100236", name: "Priya Nair", issueDate: "2025-01-10", interestRate: 10.75, tenureMonths: 24, emiDue: 14750.25, outstanding: 310800, pastPayments: [{ monthsAgo: 2, amount: 14750.25 }] },
  { accountNumber: "ACC-100237", name: "Arjun Pillai", issueDate: "2022-11-20", interestRate: 13.0, tenureMonths: 60, emiDue: 7620.75, outstanding: 289400, pastPayments: [{ monthsAgo: 5, amount: 7620.75 }, { monthsAgo: 4, amount: 7620.75 }, { monthsAgo: 3, amount: 7620.75 }, { monthsAgo: 2, amount: 7620.75 }, { monthsAgo: 1, amount: 7620.75 }] },
  { accountNumber: "ACC-100238", name: "Divya Krishnan", issueDate: "2024-06-05", interestRate: 11.0, tenureMonths: 18, emiDue: 18990, outstanding: 268500, pastPayments: [{ monthsAgo: 1, amount: 18990 }] },
  { accountNumber: "ACC-100239", name: "Vikram Shetty", issueDate: "2023-03-12", interestRate: 12.0, tenureMonths: 36, emiDue: 10120.5, outstanding: 244900, pastPayments: [{ monthsAgo: 6, amount: 10120.5 }, { monthsAgo: 5, amount: 10120.5 }, { monthsAgo: 4, amount: 10120.5 }] },
  { accountNumber: "ACC-100240", name: "Sneha Thomas", issueDate: "2025-04-18", interestRate: 10.5, tenureMonths: 12, emiDue: 21500.75, outstanding: 224300, pastPayments: [] },
  { accountNumber: "ACC-100241", name: "Karthik Iyer", issueDate: "2021-09-30", interestRate: 14.0, tenureMonths: 84, emiDue: 5480.25, outstanding: 198700, pastPayments: [{ monthsAgo: 8, amount: 5480.25 }, { monthsAgo: 7, amount: 5480.25 }, { monthsAgo: 6, amount: 5480.25 }, { monthsAgo: 5, amount: 5480.25 }, { monthsAgo: 4, amount: 5480.25 }, { monthsAgo: 3, amount: 5480.25 }] },
  { accountNumber: "ACC-100242", name: "Meera Raghavan", issueDate: "2024-10-22", interestRate: 11.75, tenureMonths: 30, emiDue: 13640, outstanding: 186200, pastPayments: [{ monthsAgo: 2, amount: 13640 }, { monthsAgo: 1, amount: 13640 }] },
  { accountNumber: "ACC-100243", name: "Sanjay Gupta", issueDate: "2022-05-14", interestRate: 12.75, tenureMonths: 48, emiDue: 8730.5, outstanding: 167800, pastPayments: [{ monthsAgo: 10, amount: 8730.5 }, { monthsAgo: 9, amount: 8730.5 }] },
  { accountNumber: "ACC-100244", name: "Lakshmi Prasad", issueDate: "2025-07-01", interestRate: 10.25, tenureMonths: 24, emiDue: 12980.25, outstanding: 152400, pastPayments: [] },
  { accountNumber: "ACC-100245", name: "Rohit Desai", issueDate: "2023-12-08", interestRate: 13.5, tenureMonths: 36, emiDue: 11890.75, outstanding: 134600, pastPayments: [{ monthsAgo: 3, amount: 11890.75 }, { monthsAgo: 2, amount: 11890.75 }, { monthsAgo: 1, amount: 11890.75 }] },
];

async function seed(): Promise<void> {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    await client.query("TRUNCATE payments, customers RESTART IDENTITY CASCADE");

    for (const c of customers) {
      const { rows } = await client.query<{ id: string }>(
        `INSERT INTO customers (account_number, name, issue_date, interest_rate, tenure_months, emi_due, outstanding)
         VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id`,
        [c.accountNumber, c.name, c.issueDate, c.interestRate, c.tenureMonths, c.emiDue, c.outstanding]
      );
      for (const p of c.pastPayments) {
        await client.query(
          `INSERT INTO payments (customer_id, payment_date, payment_amount, status)
           VALUES ($1, now() - make_interval(months => $2), $3, 'SUCCESS')`,
          [rows[0].id, p.monthsAgo, p.amount]
        );
      }
    }
    await client.query("COMMIT");
    console.log(`seeded ${customers.length} customers`);
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
    await pool.end();
  }
}

seed().catch((err) => {
  console.error("seed failed:", err);
  process.exit(1);
});
