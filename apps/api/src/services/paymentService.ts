import type { CreatePaymentRequest, PaymentDto } from "@coligo/shared";
import { ApiError } from "../errors";
import * as customerRepository from "../repositories/customerRepository";
import * as paymentRepository from "../repositories/paymentRepository";

/**
 * Records an EMI payment as an insert-only SUCCESS ledger row (AD-4).
 * Throws 404 when the account number is unknown, and 409 EMI_ALREADY_PAID
 * when a successful payment already exists for the current month (PRD rule:
 * one EMI per account per calendar month).
 */
export async function payEmi(input: CreatePaymentRequest): Promise<PaymentDto> {
  const customer = await customerRepository.findByAccountNumber(input.accountNumber);
  if (!customer) {
    throw ApiError.notFound(`No loan found for account number ${input.accountNumber}`);
  }
  if (await paymentRepository.hasSuccessPaymentThisMonth(customer.id)) {
    throw new ApiError(
      409,
      "EMI_ALREADY_PAID",
      "EMI for this month has already been paid for this account."
    );
  }
  const row = await paymentRepository.insertSuccessPayment(input.accountNumber, input.amount);
  if (!row) {
    // Unreachable (customer resolved above); kept for type narrowing.
    throw ApiError.notFound(`No loan found for account number ${input.accountNumber}`);
  }
  return {
    id: row.id,
    accountNumber: input.accountNumber,
    amount: Number(row.payment_amount),
    paymentDate: row.payment_date.toISOString(),
    status: row.status as PaymentDto["status"],
  };
}

/** Newest-first payment history for one account; 404 when the account is unknown. */
export async function getHistory(accountNumber: string): Promise<PaymentDto[]> {
  const customer = await customerRepository.findByAccountNumber(accountNumber);
  if (!customer) {
    throw ApiError.notFound(`No loan found for account number ${accountNumber}`);
  }
  const rows = await paymentRepository.findHistoryByAccount(accountNumber);
  return rows.map((row) => ({
    id: row.id,
    accountNumber: row.account_number,
    amount: Number(row.payment_amount),
    paymentDate: row.payment_date.toISOString(),
    status: row.status as PaymentDto["status"],
  }));
}
