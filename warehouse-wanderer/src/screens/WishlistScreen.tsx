import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import React, { useMemo, useState } from "react";
import { FlatList, Pressable, StyleSheet, Text, View } from "react-native";

import { EmptyState } from "../components/EmptyState";
import { ScreenContainer } from "../components/ScreenContainer";
import { WarehouseCard } from "../components/WarehouseCard";
import type { RootStackParamList } from "../navigation/types";
import { distanceMeters } from "../services/distance";
import { usePassport } from "../state/PassportContext";
import { colors } from "../theme/colors";
import { fontSize, radius, spacing } from "../theme/spacing";
import type { Warehouse, WishlistItem } from "../types";

type Nav = NativeStackNavigationProp<RootStackParamList>;
type SortKey = "closest" | "recent" | "region" | "country";

const SORTS: { key: SortKey; label: string }[] = [
  { key: "recent", label: "Recently Added" },
  { key: "closest", label: "Closest" },
  { key: "region", label: "State/Region" },
  { key: "country", label: "Country" },
];

export function WishlistScreen() {
  const navigation = useNavigation<Nav>();
  const { wishlist, warehouses, currentLocation, settings, visits, removeFromWishlist } = usePassport();
  const [sort, setSort] = useState<SortKey>("recent");

  const visitedIds = useMemo(() => new Set(visits.map((v) => v.warehouseId)), [visits]);
  const byId = useMemo(() => new Map(warehouses.map((w) => [w.id, w])), [warehouses]);

  const entries = useMemo(() => {
    const withWarehouse = wishlist
      .map((item) => ({ item, warehouse: byId.get(item.warehouseId) }))
      .filter((e): e is { item: WishlistItem; warehouse: Warehouse } => Boolean(e.warehouse));

    const distanceOf = (w: Warehouse) =>
      currentLocation ? distanceMeters(currentLocation.latitude, currentLocation.longitude, w.latitude, w.longitude) : Infinity;

    switch (sort) {
      case "closest":
        return [...withWarehouse].sort((a, b) => distanceOf(a.warehouse) - distanceOf(b.warehouse));
      case "region":
        return [...withWarehouse].sort((a, b) => a.warehouse.region.localeCompare(b.warehouse.region));
      case "country":
        return [...withWarehouse].sort((a, b) => a.warehouse.country.localeCompare(b.warehouse.country));
      default:
        return [...withWarehouse].sort((a, b) => b.item.addedAt.localeCompare(a.item.addedAt));
    }
  }, [wishlist, byId, sort, currentLocation]);

  return (
    <ScreenContainer>
      <View style={styles.header}>
        <Text style={styles.title}>Costcos to Go</Text>
        <Text style={styles.subtitle}>{wishlist.length} saved</Text>
      </View>

      {entries.length > 0 ? (
        <FlatList
          horizontal
          data={SORTS}
          keyExtractor={(s) => s.key}
          showsHorizontalScrollIndicator={false}
          style={styles.sortRow}
          contentContainerStyle={{ gap: spacing.sm, paddingHorizontal: spacing.lg }}
          renderItem={({ item }) => (
            <Pressable
              style={[styles.chip, sort === item.key && styles.chipActive]}
              onPress={() => setSort(item.key)}
            >
              <Text style={[styles.chipLabel, sort === item.key && styles.chipLabelActive]}>{item.label}</Text>
            </Pressable>
          )}
        />
      ) : null}

      {entries.length === 0 ? (
        <EmptyState
          icon="♥"
          title="No wishlist items yet"
          message="Save warehouses you'd like to visit from the map, search, or any warehouse's detail page."
          actionLabel="Explore the Map"
          onAction={() => navigation.navigate("Tabs", { screen: "Explore" })}
        />
      ) : (
        <FlatList
          data={entries}
          keyExtractor={(e) => e.item.id}
          contentContainerStyle={{ padding: spacing.lg }}
          renderItem={({ item }) => (
            <View>
              <WarehouseCard
                warehouse={item.warehouse}
                distanceMeters={
                  currentLocation
                    ? distanceMeters(currentLocation.latitude, currentLocation.longitude, item.warehouse.latitude, item.warehouse.longitude)
                    : null
                }
                distanceUnit={settings.distanceUnit}
                visited={visitedIds.has(item.warehouse.id)}
                wishlisted
                onPress={() => navigation.navigate("WarehouseDetail", { warehouseId: item.warehouse.id })}
              />
              {visitedIds.has(item.warehouse.id) ? (
                <Text style={styles.visitedNote}>🎉 You've already visited this one!</Text>
              ) : (
                <Pressable onPress={() => removeFromWishlist(item.warehouse.id)} style={styles.removeButton}>
                  <Text style={styles.removeButtonText}>Remove from wishlist</Text>
                </Pressable>
              )}
            </View>
          )}
        />
      )}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  header: { paddingHorizontal: spacing.lg, paddingTop: spacing.sm },
  title: { fontSize: fontSize.xl, fontWeight: "800", color: colors.ink },
  subtitle: { fontSize: fontSize.sm, color: colors.inkMuted, marginBottom: spacing.sm },
  sortRow: { flexGrow: 0, marginBottom: spacing.sm },
  chip: {
    paddingHorizontal: spacing.md,
    paddingVertical: 8,
    borderRadius: radius.pill,
    backgroundColor: colors.paper,
    borderWidth: 1,
    borderColor: colors.border,
  },
  chipActive: { backgroundColor: colors.wishlist, borderColor: colors.wishlist },
  chipLabel: { fontSize: fontSize.xs, fontWeight: "700", color: colors.ink },
  chipLabelActive: { color: colors.paper },
  visitedNote: { color: colors.tealDark, fontWeight: "700", fontSize: fontSize.xs, marginTop: -spacing.sm, marginBottom: spacing.md, marginLeft: spacing.xs },
  removeButton: { alignItems: "flex-end", marginTop: -spacing.sm, marginBottom: spacing.md },
  removeButtonText: { color: colors.danger, fontSize: fontSize.xs, fontWeight: "600" },
});
