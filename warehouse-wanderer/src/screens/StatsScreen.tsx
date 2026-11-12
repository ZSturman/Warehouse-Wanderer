import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { ProgressBar } from "../components/ProgressBar";
import { ScreenContainer } from "../components/ScreenContainer";
import { StatTile } from "../components/StatTile";
import type { RootStackParamList } from "../navigation/types";
import { formatDistance } from "../services/distance";
import { usePassport } from "../state/PassportContext";
import { colors } from "../theme/colors";
import { fontSize, radius, spacing } from "../theme/spacing";

type Nav = NativeStackNavigationProp<RootStackParamList>;

export function StatsScreen() {
  const navigation = useNavigation<Nav>();
  const { stats, settings } = usePassport();

  const goTo = (warehouseId: string) => navigation.navigate("WarehouseDetail", { warehouseId });

  return (
    <ScreenContainer scroll contentContainerStyle={styles.content}>
      <Text style={styles.title}>Statistics</Text>

      <View style={styles.card}>
        <Text style={styles.cardLabel}>Overall Progress</Text>
        <ProgressBar progress={stats.percentVisited / 100} color={colors.gold} height={10} />
        <Text style={styles.cardValue}>
          {stats.percentVisited.toFixed(1)}% of known warehouses ({stats.uniqueWarehousesVisited}/
          {stats.totalWarehouses})
        </Text>
      </View>

      <View style={styles.grid}>
        <StatTile label="Unique Warehouses" value={String(stats.uniqueWarehousesVisited)} icon="🏬" />
        <StatTile label="Total Visits" value={String(stats.totalVisitCount)} icon="🎫" />
        <StatTile
          label="States/Regions"
          value={`${stats.regionsVisited}/${stats.totalRegions}`}
          icon="🗺️"
        />
        <StatTile label="Countries" value={`${stats.countriesVisited}/${stats.totalCountries}`} icon="🌎" />
        <StatTile label="Current Streak" value={`${stats.currentStreakWeeks} wk`} icon="🔥" accent={colors.goldDark} />
      </View>

      {stats.nearestUnvisited ? (
        <Pressable style={styles.card} onPress={() => goTo(stats.nearestUnvisited!.warehouse.id)}>
          <Text style={styles.cardLabel}>Nearest Unvisited</Text>
          <Text style={styles.cardValue}>
            {stats.nearestUnvisited.warehouse.name} — {formatDistance(stats.nearestUnvisited.distanceMeters, settings.distanceUnit)}
          </Text>
        </Pressable>
      ) : null}

      {stats.farthestVisited ? (
        <Pressable style={styles.card} onPress={() => goTo(stats.farthestVisited!.warehouse.id)}>
          <Text style={styles.cardLabel}>Farthest Visited</Text>
          <Text style={styles.cardValue}>
            {stats.farthestVisited.warehouse.name} — {formatDistance(stats.farthestVisited.distanceMeters, settings.distanceUnit)}
          </Text>
        </Pressable>
      ) : null}

      {stats.mostVisited ? (
        <Pressable style={styles.card} onPress={() => goTo(stats.mostVisited!.warehouse.id)}>
          <Text style={styles.cardLabel}>Most Visited</Text>
          <Text style={styles.cardValue}>
            {stats.mostVisited.warehouse.name} — {stats.mostVisited.visitCount}× visits
          </Text>
        </Pressable>
      ) : null}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: { padding: spacing.lg },
  title: { fontSize: fontSize.xl, fontWeight: "800", color: colors.ink, marginBottom: spacing.md },
  card: {
    backgroundColor: colors.paper,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    marginBottom: spacing.md,
    gap: spacing.sm,
  },
  cardLabel: { fontSize: fontSize.xs, fontWeight: "800", color: colors.inkMuted, letterSpacing: 0.5 },
  cardValue: { fontSize: fontSize.md, fontWeight: "700", color: colors.ink },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm, marginBottom: spacing.md },
});
