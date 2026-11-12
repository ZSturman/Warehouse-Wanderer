import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import React, { useMemo } from "react";
import { FlatList, Pressable, StyleSheet, Text, View } from "react-native";

import { EmptyState } from "../components/EmptyState";
import { PassportStampCard } from "../components/PassportStampCard";
import { ScreenContainer } from "../components/ScreenContainer";
import { StatTile } from "../components/StatTile";
import type { RootStackParamList } from "../navigation/types";
import { usePassport } from "../state/PassportContext";
import { colors } from "../theme/colors";
import { fontSize, spacing } from "../theme/spacing";
import type { Warehouse } from "../types";

type Nav = NativeStackNavigationProp<RootStackParamList>;

interface PassportEntry {
  warehouse: Warehouse;
  lastVisitedAt: string;
}

export function PassportScreen() {
  const navigation = useNavigation<Nav>();
  const { visits, warehouses, stats, visitsForWarehouse } = usePassport();

  const entries = useMemo<PassportEntry[]>(() => {
    const byWarehouse = new Map<string, string>();
    for (const visit of visits) {
      const existing = byWarehouse.get(visit.warehouseId);
      if (!existing || visit.visitedAt > existing) byWarehouse.set(visit.warehouseId, visit.visitedAt);
    }
    const byId = new Map(warehouses.map((w) => [w.id, w]));
    return [...byWarehouse.entries()]
      .map(([warehouseId, lastVisitedAt]) => {
        const warehouse = byId.get(warehouseId);
        return warehouse ? { warehouse, lastVisitedAt } : null;
      })
      .filter((e): e is PassportEntry => Boolean(e))
      .sort((a, b) => b.lastVisitedAt.localeCompare(a.lastVisitedAt));
  }, [visits, warehouses]);

  return (
    <ScreenContainer>
      <View style={styles.header}>
        <Text style={styles.title}>My Passport</Text>
        <Pressable onPress={() => navigation.navigate("Stats")}>
          <Text style={styles.link}>Full Stats →</Text>
        </Pressable>
      </View>

      <View style={styles.statsRow}>
        <StatTile label="Warehouses" value={String(stats.uniqueWarehousesVisited)} icon="🏬" accent={colors.tealDark} />
        <StatTile label="Countries" value={String(stats.countriesVisited)} icon="🌎" accent={colors.goldDark} />
        <StatTile label="Total Visits" value={String(stats.totalVisitCount)} icon="🎫" accent={colors.navy} />
      </View>

      {entries.length === 0 ? (
        <EmptyState
          icon="🛂"
          title="Your passport is empty"
          message="Find a warehouse on the map or via search, then add it to your passport to get your first stamp."
        />
      ) : (
        <FlatList
          data={entries}
          keyExtractor={(e) => e.warehouse.id}
          contentContainerStyle={styles.list}
          renderItem={({ item, index }) => (
            <PassportStampCard
              warehouse={item.warehouse}
              visits={visitsForWarehouse(item.warehouse.id)}
              rotation={index % 2 === 0 ? -1.5 : 1.5}
              onPress={() => navigation.navigate("WarehouseDetail", { warehouseId: item.warehouse.id })}
            />
          )}
        />
      )}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
  },
  title: { fontSize: fontSize.xl, fontWeight: "800", color: colors.ink },
  link: { fontSize: fontSize.sm, fontWeight: "700", color: colors.tealDark },
  statsRow: { flexDirection: "row", gap: spacing.sm, paddingHorizontal: spacing.lg, marginVertical: spacing.md },
  list: { paddingHorizontal: spacing.lg, paddingBottom: 120 },
});
