import React, { useCallback, useState } from "react";
import { Pressable, StyleSheet, Text, View, SafeAreaView } from "react-native";
import { StatusBar } from "expo-status-bar";
import type { CustomerDto, PaymentDto } from "@coligo/shared";
import { HomeScreen } from "./src/screens/HomeScreen";
import { DetailsScreen } from "./src/screens/DetailsScreen";
import { PayScreen } from "./src/screens/PayScreen";
import { ConfirmationScreen } from "./src/screens/ConfirmationScreen";
import { HistoryScreen } from "./src/screens/HistoryScreen";
import { colors } from "./src/theme";

/**
 * Lightweight stack navigation: a Route union + an array of routes.
 * Right-sized for a 5-screen linear flow; no navigation library needed.
 */
type Route =
  | { name: "home" }
  | { name: "details"; customer: CustomerDto }
  | { name: "pay"; customer: CustomerDto }
  | { name: "confirmation"; customer: CustomerDto; payment: PaymentDto }
  | { name: "history"; customer: CustomerDto };

const TITLES: Record<Route["name"], string> = {
  home: "Coligo Loans",
  details: "Loan details",
  pay: "Pay EMI",
  confirmation: "Acknowledgment",
  history: "Payment history",
};

export default function App() {
  const [stack, setStack] = useState<Route[]>([{ name: "home" }]);
  const current = stack[stack.length - 1];

  const push = useCallback((route: Route) => setStack((s) => [...s, route]), []);
  const pop = useCallback(() => setStack((s) => (s.length > 1 ? s.slice(0, -1) : s)), []);
  const goHome = useCallback(() => setStack([{ name: "home" }]), []);

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar style="dark" />
      {current.name !== "home" ? (
        <View style={styles.header}>
          <Pressable
            onPress={pop}
            accessibilityRole="button"
            accessibilityLabel="Back"
            hitSlop={12}
            style={styles.back}
          >
            <Text style={styles.backText}>‹ Back</Text>
          </Pressable>
          <Text style={styles.headerTitle}>{TITLES[current.name]}</Text>
          <View style={styles.headerSpacer} />
        </View>
      ) : null}

      {current.name === "home" ? (
        <HomeScreen onCustomerLoaded={(customer) => push({ name: "details", customer })} />
      ) : null}

      {current.name === "details" ? (
        <DetailsScreen
          customer={current.customer}
          onPay={(customer) => push({ name: "pay", customer })}
          onHistory={(customer) => push({ name: "history", customer })}
        />
      ) : null}

      {current.name === "pay" ? (
        <PayScreen
          customer={current.customer}
          onPaid={(customer, payment) => {
            // replace the pay screen with the confirmation
            setStack((s) => [...s.slice(0, -1), { name: "confirmation", customer, payment }]);
          }}
        />
      ) : null}

      {current.name === "confirmation" ? (
        <ConfirmationScreen
          customer={current.customer}
          payment={current.payment}
          onDone={goHome}
          onHistory={(customer) => push({ name: "history", customer })}
        />
      ) : null}

      {current.name === "history" ? <HistoryScreen customer={current.customer} /> : null}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: colors.card,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  back: { paddingHorizontal: 8, paddingVertical: 4 },
  backText: { color: colors.primary, fontSize: 17, fontWeight: "600" },
  headerTitle: { flex: 1, textAlign: "center", fontSize: 17, fontWeight: "700", color: colors.text },
  headerSpacer: { width: 64 },
});
