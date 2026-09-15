import React, { useState } from "react";
import {
  KeyboardAvoidingView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { AccountNumberSchema } from "@coligo/shared";
import { PrimaryButton } from "../components/PrimaryButton";
import { ErrorBanner } from "../components/ErrorBanner";
import { api } from "../services/api";
import { card, colors, spacing, type } from "../theme";
import type { CustomerDto } from "@coligo/shared";

type HomeScreenProps = {
  onCustomerLoaded: (customer: CustomerDto) => void;
};

/** Entry screen: look up a loan by account number (FR-1/FR-2). */
export function HomeScreen({ onCustomerLoaded }: HomeScreenProps) {
  const [accountNumber, setAccountNumber] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function lookup() {
    const parsed = AccountNumberSchema.safeParse(accountNumber);
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Enter a valid account number");
      return;
    }
    setError("");
    setLoading(true);
    try {
      const customer = await api.getCustomer(parsed.data);
      onCustomerLoaded(customer);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    // Android 15+ enforces edge-to-edge, which disables adjustResize —
    // so padding must be applied on both platforms.
    <KeyboardAvoidingView style={{ flex: 1 }} behavior="padding">
      <ScrollView
        contentContainerStyle={styles.screen}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.hero}>
          <View style={styles.logo}>
            <Text style={styles.logoText}>C</Text>
          </View>
          <Text style={type.title}>Coligo Loans</Text>
          <Text style={type.subtle}>Pay your EMI, see your loan — in one place.</Text>
        </View>

        <View style={styles.card}>
          <Text style={type.subtitle}>View your loan</Text>
          <View style={spacing.stack8} />
          <Text style={type.subtle}>Enter the account number on your loan statement.</Text>
          <View style={spacing.stack12} />
          <TextInput
            style={styles.input}
            value={accountNumber}
            onChangeText={(t) => {
              setAccountNumber(t);
              if (error) setError("");
            }}
            placeholder="e.g. ACC-100234"
            autoCapitalize="characters"
            autoCorrect={false}
            keyboardType="default"
            returnKeyType="go"
            onSubmitEditing={lookup}
            accessibilityLabel="Account number"
            testID="account-input"
          />
          <View style={spacing.stack12} />
          {error ? <ErrorBanner message={error} /> : null}
          {error ? <View style={spacing.stack12} /> : <View style={spacing.stack4} />}
          <PrimaryButton
            label="View loan details"
            onPress={lookup}
            loading={loading}
            testID="lookup-button"
          />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: { ...spacing.screen, justifyContent: "center" },
  hero: { alignItems: "center", marginBottom: 28, gap: 6 },
  logo: {
    width: 64,
    height: 64,
    borderRadius: 20,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  logoText: { color: "#fff", fontSize: 32, fontWeight: "800" },
  card: { ...card, ...spacing.card },
  input: {
    minHeight: 52,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    backgroundColor: "#FBFDFF",
    color: colors.text,
  },
});
