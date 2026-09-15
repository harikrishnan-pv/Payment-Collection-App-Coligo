import React from "react";
import { StyleSheet, Text, View } from "react-native";
import type { CustomerDto } from "@coligo/shared";
import { Field } from "./Field";
import { formatDate, formatInr } from "../format";
import { card, colors, spacing, type } from "../theme";

/** Loan details card — the five mandated fields (FR-1). */
export function LoanCard({ customer }: { customer: CustomerDto }) {
  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={{ flexShrink: 1 }}>
          <Text style={type.subtle}>Loan account</Text>
          <Text style={type.title} testID="loan-account">
            {customer.accountNumber}
          </Text>
        </View>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>Active</Text>
        </View>
      </View>
      <Text style={[type.body, { fontWeight: "600" }]}>{customer.name}</Text>
      <View style={styles.divider} />
      <Field label="Issue date" value={formatDate(customer.issueDate)} />
      <Field label="Interest rate" value={`${customer.interestRate.toFixed(2)}% p.a.`} />
      <Field label="Tenure" value={`${customer.tenureMonths} months`} />
      <Field label="EMI due" value={formatInr(customer.emiDue)} testID="loan-emi-due" />
      <View style={styles.emiRow}>
        <Text style={styles.emiLabel}>Outstanding principal</Text>
        <Text style={styles.emiValue}>{formatInr(customer.outstanding)}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { ...card, ...spacing.card },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" },
  badge: {
    backgroundColor: colors.successSoft,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 4,
    marginLeft: 8,
  },
  badgeText: { color: colors.success, fontWeight: "700", fontSize: 12 },
  divider: { height: StyleSheet.hairlineWidth, backgroundColor: colors.border, marginVertical: 12 },
  emiRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: colors.primarySoft,
    borderRadius: 12,
    padding: 14,
    marginTop: 12,
  },
  emiLabel: { color: colors.primaryDark, fontWeight: "600", fontSize: 14 },
  emiValue: { color: colors.primaryDark, fontWeight: "800", fontSize: 14 },
});
