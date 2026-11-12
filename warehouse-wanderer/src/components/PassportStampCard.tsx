import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { colors } from "../theme/colors";
import { fontSize, radius, spacing } from "../theme/spacing";
import { formatVisitDate } from "../utils/formatters";
import type { Visit, Warehouse } from "../types";

interface Props {
  warehouse: Warehouse;
  visits: Visit[];
  rotation?: number;
  onPress: () => void;
}

/** A single passport "page" entry, styled like an ink travel stamp. */
export function PassportStampCard({ warehouse, visits, rotation = 0, onPress }: Props) {
  const mostRecent = visits[0];
  const isFavorite = visits.some((v) => v.isFavorite);
  const hasLocationConfirmed = visits.some((v) => v.verification === "location_confirmed");

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}
      accessibilityRole="button"
    >
      <View style={[styles.stamp, { transform: [{ rotate: `${rotation}deg` }] }]}>
        <View style={styles.stampRing}>
          <Text style={styles.stampCode}>{warehouse.countryCode}</Text>
          <Text style={styles.stampSub}>VISITED</Text>
        </View>
      </View>

      <View style={styles.info}>
        <View style={styles.titleRow}>
          <Text style={styles.name} numberOfLines={1}>
            {warehouse.name}
          </Text>
          {isFavorite ? <Text style={styles.favorite}>★</Text> : null}
        </View>
        <Text style={styles.subtitle} numberOfLines={1}>
          {warehouse.city}, {warehouse.region} · {warehouse.country}
        </Text>
        {mostRecent ? (
          <Text style={styles.meta}>
            Last visited {formatVisitDate(mostRecent.visitedAt)}
            {visits.length > 1 ? ` · ${visits.length}× total` : ""}
          </Text>
        ) : null}
        <Text style={styles.verification}>
          {hasLocationConfirmed ? "📍 GPS confirmed" : "✏️ Logged manually"}
        </Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    backgroundColor: colors.paper,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    marginBottom: spacing.md,
    gap: spacing.md,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },
  pressed: { opacity: 0.75 },
  stamp: { alignItems: "center", justifyContent: "center" },
  stampRing: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 3,
    borderColor: colors.teal,
    borderStyle: "dashed",
    alignItems: "center",
    justifyContent: "center",
  },
  stampCode: { fontSize: fontSize.md, fontWeight: "800", color: colors.tealDark },
  stampSub: { fontSize: 8, fontWeight: "700", color: colors.tealDark, letterSpacing: 0.5 },
  info: { flex: 1, gap: 3, justifyContent: "center" },
  titleRow: { flexDirection: "row", alignItems: "center", gap: spacing.xs },
  name: { fontSize: fontSize.md, fontWeight: "700", color: colors.ink, flexShrink: 1 },
  favorite: { color: colors.gold, fontSize: fontSize.md },
  subtitle: { fontSize: fontSize.sm, color: colors.inkMuted },
  meta: { fontSize: fontSize.xs, color: colors.inkMuted },
  verification: { fontSize: fontSize.xs, color: colors.tealDark, fontWeight: "600", marginTop: 2 },
});
