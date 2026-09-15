import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { colors } from "../theme";

/** Inline, human-readable error state (FR-2/FR-5 — no silent failures). */
export function ErrorBanner({ message }: { message: string }) {
  if (!message) return null;
  return (
    <View style={styles.banner} accessibilityRole="alert">
      <Text style={styles.text}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    backgroundColor: colors.dangerSoft,
    borderColor: colors.danger,
    borderWidth: 1,
    borderRadius: 12,
    padding: 14,
  },
  text: { color: colors.danger, fontSize: 14, fontWeight: "600" },
});
