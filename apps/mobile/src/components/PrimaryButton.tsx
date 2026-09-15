import React from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text } from "react-native";
import { colors } from "../theme";

type PrimaryButtonProps = {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
  variant?: "primary" | "secondary" | "success";
  testID?: string;
};

export function PrimaryButton({
  label,
  onPress,
  disabled = false,
  loading = false,
  variant = "primary",
  testID,
}: PrimaryButtonProps) {
  const palette = {
    primary: { bg: colors.primary, fg: "#FFFFFF" },
    secondary: { bg: colors.primarySoft, fg: colors.primaryDark },
    success: { bg: colors.success, fg: "#FFFFFF" },
  }[variant];

  const busy = loading || disabled;
  return (
    <Pressable
      onPress={onPress}
      disabled={busy}
      accessibilityRole="button"
      accessibilityLabel={label}
      testID={testID}
      style={({ pressed }) => [
        styles.base,
        { backgroundColor: palette.bg, opacity: pressed ? 0.85 : busy ? 0.55 : 1 },
      ]}
    >
      {loading ? (
        <ActivityIndicator color={palette.fg} />
      ) : (
        <Text style={[styles.label, { color: palette.fg }]}>{label}</Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    minHeight: 52,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
  },
  label: { fontSize: 16, fontWeight: "700" },
});
