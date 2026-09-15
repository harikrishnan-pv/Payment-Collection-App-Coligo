import type { CustomerDto } from "@coligo/shared";
import { ApiError } from "../errors";
import * as customerRepository from "../repositories/customerRepository";

function toDto(row: customerRepository.CustomerRow): CustomerDto {
  return {
    id: Number(row.id),
    accountNumber: row.account_number,
    name: row.name,
    issueDate: row.issue_date, // already 'YYYY-MM-DD' via pg type parser
    interestRate: Number(row.interest_rate),
    tenureMonths: row.tenure_months,
    emiDue: Number(row.emi_due),
    outstanding: Number(row.outstanding),
  };
}

export async function listCustomers(): Promise<CustomerDto[]> {
  const rows = await customerRepository.findAll();
  return rows.map(toDto);
}

export async function getCustomerByAccountNumber(accountNumber: string): Promise<CustomerDto> {
  const row = await customerRepository.findByAccountNumber(accountNumber);
  if (!row) {
    throw ApiError.notFound(`No loan found for account number ${accountNumber}`);
  }
  return toDto(row);
}
