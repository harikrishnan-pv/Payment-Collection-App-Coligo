import { query } from "../db/pool";

export type CustomerRow = {
  id: string;
  account_number: string;
  name: string;
  issue_date: string;
  interest_rate: string;
  tenure_months: number;
  emi_due: string;
  outstanding: string;
};

export async function findAll(limit = 200): Promise<CustomerRow[]> {
  const { rows } = await query<CustomerRow>(
    `SELECT id, account_number, name, issue_date, interest_rate, tenure_months, emi_due, outstanding
     FROM customers
     ORDER BY account_number
     LIMIT $1`,
    [limit]
  );
  return rows;
}

export async function findByAccountNumber(accountNumber: string): Promise<CustomerRow | null> {
  const { rows } = await query<CustomerRow>(
    `SELECT id, account_number, name, issue_date, interest_rate, tenure_months, emi_due, outstanding
     FROM customers
     WHERE account_number = $1`, // unique index (AD-8)
    [accountNumber]
  );
  return rows[0] ?? null;
}
