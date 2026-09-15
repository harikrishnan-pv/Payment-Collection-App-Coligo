import React, { useEffect, useState } from "react";
import { ActivityIndicator, FlatList, RefreshControl, StyleSheet, Text, View } from "react-native";
import type { CustomerDto, PaymentDto } from "@coligo/shared";
import { ErrorBanner } from "../components/ErrorBanner";
import { api } from "../services/api";
import { formatDateTime, formatInr } from "../format";
import { card, colors, spacing, type } from "../theme";

/** Payment history for one account (UJ-2), newest first, pull to refresh. */
export function HistoryScreen({ customer }: { customer: CustomerDto }) {
  const [payments, setPayments] = useState<PaymentDto[] | null>(null);
  const [error, setError] = useState("");
  const [refreshing, setRefreshing] = useState(false);

  async function load() {
    setError("");
    try {
      setPayments(await api.getHistory(customer.accountNumber));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load history.");
    }
  }

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [customer.accountNumber]);

  if (payments === null && !error) {
    return (
      <View style={[spacing.screen, styles.center]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <View style={styles.header}>
        <Text style={type.subtitle}>{customer.accountNumber}</Text>
        <Text style={type.subtle}>
          {payments ? `${payments.length} payment${payments.length === 1 ? "" : "s"}` : ""}
        </Text>
      </View>
      {error ? (
        <View style={spacing.screen}>
          <ErrorBanner message={error} />
        </View>
      ) : null}
      <FlatList
        contentContainerStyle={styles.list}
        data={payments ?? []}
        keyExtractor={(item) => item.id}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={load} tintColor={colors.primary} />
        }
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={type.subtle}>No payments yet. Your first EMI will appear here.</Text>
          </View>
        }
        renderItem={({ item }) => (
          <View style={styles.row}>
            <View style={{ flexShrink: 1, gap: 2 }}>
              <Text style={type.body} numberOfLines={1}>
                {formatInr(item.amount)}
              </Text>
              <Text style={type.subtle} numberOfLines={1}>
                {formatDateTime(item.paymentDate)}
              </Text>
            </View>
            <View style={styles.status}>
              <Text style={styles.statusText}>{item.status}</Text>
            </View>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  center: { alignItems: "center", justifyContent: "center" },
  header: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 4,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "baseline",
  },
  list: { paddingHorizontal: 20, paddingVertical: 12, gap: 10 },
  row: {
    ...card,
    ...spacing.card,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 12,
  },
  status: {
    backgroundColor: colors.successSoft,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 4,
    flexShrink: 0,
  },
  statusText: { color: colors.success, fontWeight: "700", fontSize: 12 },
  empty: { ...card, ...spacing.card, alignItems: "center", paddingVertical: 32 },
});
