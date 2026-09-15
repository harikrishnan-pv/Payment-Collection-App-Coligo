import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { type } from "../theme";

type FieldProps = {
  label: string;
  value: string;
  testID?: string;
};

/** Label/value row used across the loan card, acknowledgment and history. */
export function Field({ label, value, testID }: FieldProps) {
  return (
    <View style={styles.row} testID={testID}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value} numberOfLines={1}>
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 10,
    gap: 16,
  },
  label: { ...type.subtle, flexShrink: 0 },
  value: { ...type.body, fontWeight: "600", textAlign: "right", flexShrink: 1 },
});
