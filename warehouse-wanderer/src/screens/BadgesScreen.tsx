import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import React, { useMemo } from "react";
import { SectionList, StyleSheet, Text, View } from "react-native";

import { BadgeTile } from "../components/BadgeTile";
import { ScreenContainer } from "../components/ScreenContainer";
import type { RootStackParamList } from "../navigation/types";
import { usePassport } from "../state/PassportContext";
import { colors } from "../theme/colors";
import { fontSize, spacing } from "../theme/spacing";
import type { BadgeProgress } from "../types";

type Nav = NativeStackNavigationProp<RootStackParamList>;

const CATEGORY_LABELS: Record<BadgeProgress["definition"]["category"], string> = {
  milestone: "Milestones",
  geography: "Geography",
  dedication: "Dedication",
  explorer: "Explorer",
  special: "Notable Locations",
};

export function BadgesScreen() {
  const navigation = useNavigation<Nav>();
  const { badges } = usePassport();

  const unlockedCount = badges.filter((b) => b.unlocked).length;

  const sections = useMemo(() => {
    const groups = new Map<string, BadgeProgress[]>();
    for (const badge of badges) {
      const key = badge.definition.category;
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key)!.push(badge);
    }
    return [...groups.entries()].map(([key, data]) => ({
      title: CATEGORY_LABELS[key as BadgeProgress["definition"]["category"]],
      // One "item" per section whose row wraps every badge via flexWrap —
      // simpler than pre-chunking into fixed-size rows.
      data: [data],
    }));
  }, [badges]);

  return (
    <ScreenContainer>
      <View style={styles.header}>
        <Text style={styles.title}>Badges</Text>
        <Text style={styles.subtitle}>
          {unlockedCount} of {badges.length} unlocked
        </Text>
      </View>
      <SectionList
        sections={sections}
        keyExtractor={(_, index) => String(index)}
        contentContainerStyle={{ padding: spacing.lg, paddingBottom: 120 }}
        renderSectionHeader={({ section }) => <Text style={styles.sectionTitle}>{section.title}</Text>}
        renderItem={({ item: rows }) => (
          <View style={styles.grid}>
            {rows.map((badge) => (
              <BadgeTile
                key={badge.definition.id}
                badge={badge}
                onPress={() => navigation.navigate("BadgeDetail", { badgeId: badge.definition.id })}
              />
            ))}
          </View>
        )}
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  header: { paddingHorizontal: spacing.lg, paddingTop: spacing.sm },
  title: { fontSize: fontSize.xl, fontWeight: "800", color: colors.ink },
  subtitle: { fontSize: fontSize.sm, color: colors.inkMuted, marginTop: 2, marginBottom: spacing.sm },
  sectionTitle: {
    fontSize: fontSize.md,
    fontWeight: "700",
    color: colors.ink,
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
  grid: { flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between" },
});
