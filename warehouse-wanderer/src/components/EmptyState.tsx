import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { colors } from "../theme/colors";
import { fontSize, radius, spacing } from "../theme/spacing";

interface Props {
  icon: string;
  title: string;
  message: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function EmptyState({ icon, title, message, actionLabel, onAction }: Props) {
  return (
    <View style={styles.container}>
      <Text style={styles.icon}>{icon}</Text>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.message}>{message}</Text>
      {actionLabel && onAction ? (
        <Pressable style={styles.button} onPress={onAction}>
          <Text style={styles.buttonLabel}>{actionLabel}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: "center", paddingVertical: spacing.xxl, paddingHorizontal: spacing.xl },
  icon: { fontSize: 40, marginBottom: spacing.sm },
  title: { fontSize: fontSize.md, fontWeight: "700", color: colors.ink, marginBottom: spacing.xs },
  message: { fontSize: fontSize.sm, color: colors.inkMuted, textAlign: "center", lineHeight: 20 },
  button: {
    marginTop: spacing.lg,
    backgroundColor: colors.navy,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: radius.pill,
  },
  buttonLabel: { color: colors.cream, fontWeight: "700", fontSize: fontSize.sm },
});
