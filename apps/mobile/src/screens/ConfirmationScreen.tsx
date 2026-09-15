import React from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import type { CustomerDto, PaymentDto } from "@coligo/shared";
import { Field } from "../components/Field";
import { PrimaryButton } from "../components/PrimaryButton";
import { formatDateTime, formatInr } from "../format";
import { card, colors, spacing, type } from "../theme";

type ConfirmationScreenProps = {
  customer: CustomerDto;
  payment: PaymentDto;
  onDone: () => void;
  onHistory: (customer: CustomerDto) => void;
};

/** Success acknowledgment (FR-4): amount, date, status, payment reference. */
export function ConfirmationScreen({ customer, payment, onDone, onHistory }: ConfirmationScreenProps) {
  return (
    <ScrollView contentContainerStyle={spacing.screen}>
      <View style={styles.checkWrap}>
        <View style={styles.check}>
          <Text style={styles.checkMark}>✓</Text>
        </View>
        <Text style={type.title}>Payment successful</Text>
        <Text style={type.subtle}>
          Your EMI payment for {customer.accountNumber} is confirmed.
        </Text>
      </View>

      <View style={styles.card}>
        <Field label="Amount paid" value={formatInr(payment.amount)} />
        <Field label="Paid on" value={formatDateTime(payment.paymentDate)} />
        <Field label="Status" value={payment.status} testID="confirmation-status" />
        <Field label="Payment reference" value={payment.id} testID="confirmation-reference" />
      </View>

      <View style={spacing.stack24} />
      <PrimaryButton label="Done" onPress={onDone} variant="success" testID="done-button" />
      <View style={spacing.stack12} />
      <PrimaryButton
        label="View payment history"
        onPress={() => onHistory(customer)}
        variant="secondary"
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  checkWrap: { alignItems: "center", marginVertical: 24, gap: 8 },
  check: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: colors.success,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
  },
  checkMark: { color: "#fff", fontSize: 40, fontWeight: "800" },
  card: { ...card, ...spacing.card },
});
