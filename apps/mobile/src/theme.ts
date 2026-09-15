import { StyleSheet } from "react-native";

export const colors = {
  primary: "#0B5FA5",
  primaryDark: "#084A82",
  primarySoft: "#E3EFF9",
  success: "#1E8E3E",
  successSoft: "#E6F4EA",
  danger: "#C62828",
  dangerSoft: "#FDECEA",
  bg: "#F5F7FA",
  card: "#FFFFFF",
  border: "#E2E8F0",
  text: "#1F2937",
  textSubtle: "#64748B",
};

export const spacing = StyleSheet.create({
  screen: { padding: 20, flexGrow: 1, backgroundColor: colors.bg },
  card: { padding: 16 },
  stack4: { height: 4 },
  stack8: { height: 8 },
  stack12: { height: 12 },
  stack16: { height: 16 },
  stack24: { height: 24 },
});

export const type = {
  title: { fontSize: 24, fontWeight: "700" as const, color: colors.text },
  subtitle: { fontSize: 15, fontWeight: "600" as const, color: colors.text },
  body: { fontSize: 15, color: colors.text },
  subtle: { fontSize: 13, color: colors.textSubtle },
};

export const card = {
  backgroundColor: colors.card,
  borderRadius: 16,
  borderWidth: StyleSheet.hairlineWidth,
  borderColor: colors.border,
};
