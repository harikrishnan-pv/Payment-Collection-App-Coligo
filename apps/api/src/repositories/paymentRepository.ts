import { query } from "../db/pool";

export type PaymentRow = {
  id: string;
  payment_date: Date;
  payment_amount: string;
  status: string;
};

/**
 * Insert-only ledger write (AD-4): one atomic statement that resolves the
 * customer by account number and inserts the payment. No row returned means
 * the account does not exist -> caller maps to 404. RETURNING can only see
 * payments columns; the account number is the caller's known input.
 */
export async function insertSuccessPayment(
  accountNumber: string,
  amount: number
): Promise<PaymentRow | null> {
  const { rows } = await query<PaymentRow>(
    `INSERT INTO payments (customer_id, payment_amount, status)
     SELECT id, $2, 'SUCCESS' FROM customers WHERE account_number = $1
     RETURNING id, payment_date, payment_amount, status`,
    [accountNumber, amount]
  );
  return rows[0] ?? null;
}

export type HistoryRow = PaymentRow & { account_number: string };

/** History hot path: one join query riding both indexes (AD-8). */
export async function findHistoryByAccount(accountNumber: string): Promise<HistoryRow[]> {
  const { rows } = await query<HistoryRow>(
    `SELECT p.id, c.account_number, p.payment_date, p.payment_amount, p.status
     FROM payments p
     JOIN customers c ON c.id = p.customer_id
     WHERE c.account_number = $1
     ORDER BY p.payment_date DESC
     LIMIT 500`,
    [accountNumber]
  );
  return rows;
}
