import React, { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { MoneySchema } from "@coligo/shared";
import type { CustomerDto, PaymentDto } from "@coligo/shared";
import { PrimaryButton } from "../components/PrimaryButton";
import { ErrorBanner } from "../components/ErrorBanner";
import { api } from "../services/api";
import { formatInr } from "../format";
import { card, colors, spacing, type } from "../theme";

type PayScreenProps = {
  customer: CustomerDto;
  onPaid: (customer: CustomerDto, payment: PaymentDto) => void;
};

/** EMI payment form (FR-3): amount pre-filled with the EMI due, editable. */
export function PayScreen({ customer, onPaid }: PayScreenProps) {
  const [amountText, setAmountText] = useState(String(customer.emiDue));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function validate(): number | null {
    const amount = Number(amountText);
    if (!/^\d+(\.\d{1,2})?$/.test(amountText.trim())) {
      setError("Enter a valid amount, e.g. 12480.50 (max 2 decimals)");
      return null;
    }
    const parsed = MoneySchema.safeParse(amount);
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Enter a valid amount");
      return null;
    }
    return parsed.data;
  }

  async function submit() {
    const amount = validate();
    if (amount === null) return;
    setError("");
    setLoading(true);
    try {
      const payment = await api.payEmi({ accountNumber: customer.accountNumber, amount });
      onPaid(customer, payment);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Payment failed. Try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView contentContainerStyle={spacing.screen} keyboardShouldPersistTaps="handled">
        <View style={styles.card}>
          <Text style={type.subtitle}>Pay EMI — {customer.accountNumber}</Text>
          <View style={spacing.stack8} />
          <Text style={type.subtle}>
            EMI due this month: {formatInr(customer.emiDue)}
          </Text>
          <View style={spacing.stack16} />
          <Text style={styles.label}>Amount to pay (INR)</Text>
          <View style={spacing.stack8} />
          <TextInput
            style={styles.amountInput}
            value={amountText}
            onChangeText={(t) => {
              setAmountText(t);
              if (error) setError("");
            }}
            keyboardType="decimal-pad"
            accessibilityLabel="EMI amount"
            testID="amount-input"
          />
          <View style={spacing.stack12} />
          {error ? <ErrorBanner message={error} /> : null}
          {error ? <View style={spacing.stack12} /> : <View style={spacing.stack4} />}
          <PrimaryButton
            label={`Pay ${formatInr(Number(amountText) || 0)}`}
            onPress={submit}
            loading={loading}
            testID="submit-payment-button"
          />
          <View style={spacing.stack8} />
          <Text style={type.subtle}>You will see a confirmation once the payment completes.</Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  card: { ...card, ...spacing.card },
  label: { ...type.body, fontWeight: "600" },
  amountInput: {
    minHeight: 56,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 22,
    fontWeight: "700",
    backgroundColor: "#FBFDFF",
    color: colors.text,
  },
});
