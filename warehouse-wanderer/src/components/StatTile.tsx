import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { colors } from "../theme/colors";
import { fontSize, radius, spacing } from "../theme/spacing";

interface Props {
  label: string;
  value: string;
  icon?: string;
  accent?: string;
}

export function StatTile({ label, value, icon, accent = colors.navy }: Props) {
  return (
    <View style={styles.tile}>
      {icon ? <Text style={styles.icon}>{icon}</Text> : null}
      <Text style={[styles.value, { color: accent }]} numberOfLines={1} adjustsFontSizeToFit>
        {value}
      </Text>
      <Text style={styles.label} numberOfLines={2}>
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  tile: {
    flex: 1,
    minWidth: 100,
    backgroundColor: colors.paper,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
    alignItems: "center",
    gap: 2,
  },
  icon: { fontSize: 18, marginBottom: 2 },
  value: { fontSize: fontSize.lg, fontWeight: "800" },
  label: { fontSize: fontSize.xs, color: colors.inkMuted, textAlign: "center" },
});
