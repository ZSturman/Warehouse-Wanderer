import type { RouteProp } from "@react-navigation/native";
import { useRoute } from "@react-navigation/native";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

import { ProgressBar } from "../components/ProgressBar";
import { ScreenContainer } from "../components/ScreenContainer";
import type { RootStackParamList } from "../navigation/types";
import { usePassport } from "../state/PassportContext";
import { colors, tierColor } from "../theme/colors";
import { fontSize, radius, spacing } from "../theme/spacing";
import { formatUnlockDate } from "../utils/formatters";

type Route = RouteProp<RootStackParamList, "BadgeDetail">;

const CRITERIA_HINTS: Record<string, string> = {
  unique_visits: "Unique warehouses added to your passport.",
  total_visits: "Total visits logged, including repeats.",
  regions_visited: "Distinct states/regions with at least one visit.",
  countries_visited: "Distinct countries with at least one visit.",
  region_swept: "Every known warehouse visited in one state/region.",
  distance_from_home: "A visited warehouse far enough from your home base.",
  specific_warehouse: "Visiting one particular warehouse.",
  location_confirmed_visits: "Visits confirmed via GPS check-in.",
  wishlist_conversions: "Wishlist warehouses you went on to visit.",
  streak_weeks: "Consecutive weeks with at least one visit.",
};

export function BadgeDetailScreen() {
  const { params } = useRoute<Route>();
  const { badges } = usePassport();
  const badge = badges.find((b) => b.definition.id === params.badgeId);

  if (!badge) {
    return (
      <ScreenContainer>
        <Text style={styles.notFound}>Badge not found.</Text>
      </ScreenContainer>
    );
  }

  const { definition, unlocked, current, target, unlockedAt } = badge;
  const accent = tierColor[definition.tier];

  return (
    <ScreenContainer scroll contentContainerStyle={styles.content}>
      <View style={[styles.medallion, { borderColor: accent, backgroundColor: unlocked ? `${accent}22` : colors.border }]}>
        <Text style={[styles.icon, !unlocked && styles.iconLocked]}>{definition.icon}</Text>
      </View>
      <Text style={styles.name}>{definition.name}</Text>
      <Text style={[styles.tier, { color: accent }]}>{definition.tier.toUpperCase()} TIER</Text>
      <Text style={styles.description}>{definition.description}</Text>

      <View style={styles.card}>
        <Text style={styles.cardLabel}>Progress</Text>
        {target > 1 ? (
          <>
            <ProgressBar progress={current / target} color={accent} height={10} />
            <Text style={styles.progressText}>
              {current} / {target}
            </Text>
          </>
        ) : (
          <Text style={styles.progressText}>{unlocked ? "Complete" : "Not yet complete"}</Text>
        )}
      </View>

      <View style={styles.card}>
        <Text style={styles.cardLabel}>How to unlock</Text>
        <Text style={styles.hintText}>{CRITERIA_HINTS[definition.criteria.type]}</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardLabel}>Status</Text>
        <Text style={styles.hintText}>
          {unlocked
            ? `Unlocked${unlockedAt ? ` on ${formatUnlockDate(unlockedAt)}` : ""}`
            : "Still locked — keep exploring!"}
        </Text>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: { alignItems: "center", padding: spacing.xl },
  medallion: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 3,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.lg,
  },
  icon: { fontSize: 56 },
  iconLocked: { opacity: 0.35 },
  name: { fontSize: fontSize.xl, fontWeight: "800", color: colors.ink, textAlign: "center" },
  tier: { fontSize: fontSize.xs, fontWeight: "800", letterSpacing: 1, marginTop: 4 },
  description: {
    fontSize: fontSize.sm,
    color: colors.inkMuted,
    textAlign: "center",
    marginTop: spacing.sm,
    marginBottom: spacing.lg,
    lineHeight: 20,
  },
  card: {
    width: "100%",
    backgroundColor: colors.paper,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    marginBottom: spacing.md,
    gap: spacing.sm,
  },
  cardLabel: { fontSize: fontSize.xs, fontWeight: "800", color: colors.inkMuted, letterSpacing: 0.5 },
  progressText: { fontSize: fontSize.sm, fontWeight: "700", color: colors.ink },
  hintText: { fontSize: fontSize.sm, color: colors.ink, lineHeight: 20 },
  notFound: { padding: spacing.lg, color: colors.inkMuted },
});
