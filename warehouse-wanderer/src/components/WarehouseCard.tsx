import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { formatDistance } from "../services/distance";
import { colors } from "../theme/colors";
import { fontSize, radius, spacing } from "../theme/spacing";
import type { Warehouse } from "../types";

interface Props {
  warehouse: Warehouse;
  distanceMeters?: number | null;
  distanceUnit?: "mi" | "km";
  visited?: boolean;
  wishlisted?: boolean;
  isNearby?: boolean;
  onPress: () => void;
}

export function WarehouseCard({
  warehouse,
  distanceMeters = null,
  distanceUnit = "mi",
  visited = false,
  wishlisted = false,
  isNearby = false,
  onPress,
}: Props) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}
      accessibilityRole="button"
      accessibilityLabel={`${warehouse.name}, ${warehouse.city}`}
    >
      <View style={[styles.badge, { backgroundColor: statusColor(visited, wishlisted, isNearby) }]}>
        <Text style={styles.badgeIcon}>{statusIcon(visited, wishlisted, isNearby)}</Text>
      </View>
      <View style={styles.info}>
        <View style={styles.titleRow}>
          <Text style={styles.name} numberOfLines={1}>
            {warehouse.name}
          </Text>
          {warehouse.number ? <Text style={styles.number}>#{warehouse.number}</Text> : null}
        </View>
        <Text style={styles.subtitle} numberOfLines={1}>
          {warehouse.city}, {warehouse.region} · {warehouse.country}
        </Text>
        {warehouse.format === "business_center" ? (
          <Text style={styles.tag}>Business Center</Text>
        ) : null}
      </View>
      {distanceMeters != null ? (
        <Text style={styles.distance}>{formatDistance(distanceMeters, distanceUnit)}</Text>
      ) : null}
    </Pressable>
  );
}

function statusColor(visited: boolean, wishlisted: boolean, isNearby: boolean): string {
  if (isNearby) return colors.nearby;
  if (visited) return colors.visited;
  if (wishlisted) return colors.wishlist;
  return colors.unvisited;
}

function statusIcon(visited: boolean, wishlisted: boolean, isNearby: boolean): string {
  if (isNearby) return "📍";
  if (visited) return "✓";
  if (wishlisted) return "♥";
  return "○";
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.paper,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    marginBottom: spacing.sm,
    gap: spacing.md,
  },
  pressed: { opacity: 0.7 },
  badge: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  badgeIcon: { color: colors.paper, fontWeight: "800", fontSize: fontSize.md },
  info: { flex: 1, gap: 2 },
  titleRow: { flexDirection: "row", alignItems: "baseline", gap: spacing.xs },
  name: { fontSize: fontSize.md, fontWeight: "700", color: colors.ink, flexShrink: 1 },
  number: { fontSize: fontSize.xs, color: colors.inkMuted },
  subtitle: { fontSize: fontSize.sm, color: colors.inkMuted },
  tag: {
    alignSelf: "flex-start",
    marginTop: 2,
    fontSize: fontSize.xs,
    color: colors.tealDark,
    fontWeight: "700",
  },
  distance: { fontSize: fontSize.sm, fontWeight: "700", color: colors.ink },
});
