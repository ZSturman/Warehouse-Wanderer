import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { colors, tierColor } from "../theme/colors";
import { fontSize, radius, spacing } from "../theme/spacing";
import type { BadgeProgress } from "../types";
import { ProgressBar } from "./ProgressBar";

interface Props {
  badge: BadgeProgress;
  onPress: () => void;
}

export function BadgeTile({ badge, onPress }: Props) {
  const { definition, unlocked, current, target } = badge;
  const accent = tierColor[definition.tier];

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.tile, pressed && styles.pressed]}
      accessibilityRole="button"
      accessibilityLabel={`${definition.name}, ${unlocked ? "unlocked" : "locked"}`}
    >
      <View
        style={[
          styles.medallion,
          { borderColor: unlocked ? accent : colors.border, backgroundColor: unlocked ? `${accent}22` : colors.border },
        ]}
      >
        <Text style={[styles.icon, !unlocked && styles.iconLocked]}>{definition.icon}</Text>
      </View>
      <Text style={styles.name} numberOfLines={2}>
        {definition.name}
      </Text>
      {!unlocked && target > 1 ? (
        <View style={styles.progressWrap}>
          <ProgressBar progress={current / target} color={accent} height={5} />
          <Text style={styles.progressLabel}>
            {current}/{target}
          </Text>
        </View>
      ) : (
        <Text style={[styles.status, unlocked && { color: accent }]}>
          {unlocked ? "Unlocked" : "Locked"}
        </Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  tile: {
    width: "31%",
    alignItems: "center",
    marginBottom: spacing.lg,
    gap: 6,
  },
  pressed: { opacity: 0.7 },
  medallion: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
  },
  icon: { fontSize: 28 },
  iconLocked: { opacity: 0.35 },
  name: { fontSize: fontSize.xs, fontWeight: "700", color: colors.ink, textAlign: "center", minHeight: 30 },
  status: { fontSize: 10, color: colors.inkMuted, fontWeight: "600" },
  progressWrap: { width: "100%", gap: 2, alignItems: "center" },
  progressLabel: { fontSize: 10, color: colors.inkMuted },
});
