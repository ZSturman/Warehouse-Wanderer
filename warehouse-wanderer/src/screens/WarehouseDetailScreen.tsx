import type { RouteProp } from "@react-navigation/native";
import { useNavigation, useRoute } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import React from "react";
import { Alert, Pressable, StyleSheet, Text, View } from "react-native";

import { ScreenContainer } from "../components/ScreenContainer";
import type { RootStackParamList } from "../navigation/types";
import { formatDistance, distanceMeters } from "../services/distance";
import { openInMaps } from "../services/mapsLauncher";
import { usePassport } from "../state/PassportContext";
import { colors } from "../theme/colors";
import { fontSize, radius, spacing } from "../theme/spacing";
import { formatVisitDate } from "../utils/formatters";

type Route = RouteProp<RootStackParamList, "WarehouseDetail">;
type Nav = NativeStackNavigationProp<RootStackParamList>;

const SERVICE_LABELS: Record<string, string> = {
  gas_station: "⛽ Gas Station",
  pharmacy: "💊 Pharmacy",
  optical: "👓 Optical",
  hearing_aid: "👂 Hearing Aid Center",
  tire_center: "🛞 Tire Center",
  food_court: "🍕 Food Court",
  photo_center: "📷 Photo Center",
  liquor: "🍷 Liquor",
  business_delivery: "📦 Business Delivery",
};

export function WarehouseDetailScreen() {
  const { params } = useRoute<Route>();
  const navigation = useNavigation<Nav>();
  const {
    getWarehouseById,
    visitsForWarehouse,
    currentLocation,
    settings,
    isWishlisted,
    addToWishlist,
    removeFromWishlist,
    removeVisit,
    updateVisit,
  } = usePassport();

  const warehouse = getWarehouseById(params.warehouseId);
  if (!warehouse) {
    return (
      <ScreenContainer>
        <Text style={styles.notFound}>Warehouse not found.</Text>
      </ScreenContainer>
    );
  }

  const visits = visitsForWarehouse(warehouse.id);
  const isVisited = visits.length > 0;
  const wishlisted = isWishlisted(warehouse.id);
  const distance = currentLocation
    ? distanceMeters(currentLocation.latitude, currentLocation.longitude, warehouse.latitude, warehouse.longitude)
    : null;

  const confirmDelete = (visitId: string) => {
    Alert.alert("Remove this visit?", "This can't be undone.", [
      { text: "Cancel", style: "cancel" },
      { text: "Remove", style: "destructive", onPress: () => removeVisit(visitId) },
    ]);
  };

  const toggleFavorite = (visitId: string, current: boolean) => {
    updateVisit(visitId, { isFavorite: !current });
  };

  return (
    <ScreenContainer scroll contentContainerStyle={styles.content}>
      <View style={styles.statusRow}>
        <View style={[styles.statusPill, { backgroundColor: isVisited ? colors.visited : colors.unvisited }]}>
          <Text style={styles.statusPillText}>{isVisited ? "Visited" : "Not Visited Yet"}</Text>
        </View>
        {warehouse.notableLabel ? (
          <View style={[styles.statusPill, { backgroundColor: colors.gold }]}>
            <Text style={styles.statusPillText}>Notable</Text>
          </View>
        ) : null}
      </View>

      <Text style={styles.name}>{warehouse.name}</Text>
      {warehouse.number ? <Text style={styles.number}>Warehouse #{warehouse.number}</Text> : null}
      <Text style={styles.address}>{warehouse.address}</Text>
      <Text style={styles.address}>
        {warehouse.city}, {warehouse.region} · {warehouse.country}
      </Text>
      {distance != null ? (
        <Text style={styles.distance}>{formatDistance(distance, settings.distanceUnit)} away</Text>
      ) : null}
      {warehouse.notableLabel ? <Text style={styles.notableText}>✨ {warehouse.notableLabel}</Text> : null}

      {warehouse.services.length > 0 ? (
        <View style={styles.servicesWrap}>
          {warehouse.services.map((service) => (
            <View key={service} style={styles.serviceChip}>
              <Text style={styles.serviceChipText}>{SERVICE_LABELS[service] ?? service}</Text>
            </View>
          ))}
        </View>
      ) : null}

      <View style={styles.actionsRow}>
        <Pressable
          style={[styles.primaryButton, { backgroundColor: colors.navy }]}
          onPress={() => navigation.navigate("AddVisit", { warehouseId: warehouse.id, verification: "manual" })}
        >
          <Text style={styles.primaryButtonText}>+ Add to Passport</Text>
        </Pressable>
        <Pressable
          style={[styles.secondaryButton, wishlisted && styles.secondaryButtonActive]}
          onPress={() => (wishlisted ? removeFromWishlist(warehouse.id) : addToWishlist(warehouse.id))}
        >
          <Text style={[styles.secondaryButtonText, wishlisted && styles.secondaryButtonTextActive]}>
            {wishlisted ? "♥ On Wishlist" : "♡ Add to Wishlist"}
          </Text>
        </Pressable>
      </View>

      <Pressable style={styles.mapsButton} onPress={() => openInMaps(warehouse)}>
        <Text style={styles.mapsButtonText}>🗺️ Open in Maps</Text>
      </Pressable>

      {isVisited ? (
        <View style={styles.historySection}>
          <Text style={styles.sectionTitle}>Visit History</Text>
          {visits.map((visit) => (
            <View key={visit.id} style={styles.historyRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.historyDate}>{formatVisitDate(visit.visitedAt)}</Text>
                <Text style={styles.historyMeta}>
                  {visit.verification === "location_confirmed" ? "📍 GPS confirmed" : "✏️ Manual entry"}
                </Text>
                {visit.notes ? <Text style={styles.historyNotes}>{visit.notes}</Text> : null}
              </View>
              <Pressable onPress={() => toggleFavorite(visit.id, visit.isFavorite)} hitSlop={8}>
                <Text style={[styles.favoriteIcon, visit.isFavorite && styles.favoriteIconActive]}>★</Text>
              </Pressable>
              <Pressable onPress={() => confirmDelete(visit.id)} hitSlop={8}>
                <Text style={styles.deleteIcon}>🗑️</Text>
              </Pressable>
            </View>
          ))}
        </View>
      ) : null}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: { padding: spacing.lg },
  notFound: { padding: spacing.lg, color: colors.inkMuted },
  statusRow: { flexDirection: "row", gap: spacing.sm, marginBottom: spacing.sm },
  statusPill: { paddingHorizontal: spacing.md, paddingVertical: 4, borderRadius: radius.pill },
  statusPillText: { fontSize: fontSize.xs, fontWeight: "800", color: colors.paper },
  name: { fontSize: fontSize.xxl, fontWeight: "800", color: colors.ink },
  number: { fontSize: fontSize.sm, color: colors.inkMuted, marginTop: 2 },
  address: { fontSize: fontSize.sm, color: colors.inkMuted, marginTop: 2 },
  distance: { fontSize: fontSize.sm, fontWeight: "700", color: colors.tealDark, marginTop: spacing.xs },
  notableText: { fontSize: fontSize.sm, color: colors.goldDark, fontWeight: "700", marginTop: spacing.sm },
  servicesWrap: { flexDirection: "row", flexWrap: "wrap", gap: spacing.xs, marginTop: spacing.md },
  serviceChip: {
    backgroundColor: colors.paper,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
  },
  serviceChipText: { fontSize: fontSize.xs, color: colors.ink },
  actionsRow: { flexDirection: "row", gap: spacing.sm, marginTop: spacing.lg },
  primaryButton: { flex: 1, borderRadius: radius.md, paddingVertical: spacing.md, alignItems: "center" },
  primaryButtonText: { color: colors.cream, fontWeight: "800", fontSize: fontSize.sm },
  secondaryButton: {
    flex: 1,
    borderRadius: radius.md,
    paddingVertical: spacing.md,
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: colors.wishlist,
  },
  secondaryButtonActive: { backgroundColor: colors.wishlist },
  secondaryButtonText: { color: colors.wishlist, fontWeight: "800", fontSize: fontSize.sm },
  secondaryButtonTextActive: { color: colors.paper },
  mapsButton: { marginTop: spacing.sm, alignItems: "center", paddingVertical: spacing.sm },
  mapsButtonText: { color: colors.tealDark, fontWeight: "700", fontSize: fontSize.sm },
  historySection: { marginTop: spacing.xl },
  sectionTitle: { fontSize: fontSize.lg, fontWeight: "700", color: colors.ink, marginBottom: spacing.sm },
  historyRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  historyDate: { fontWeight: "700", color: colors.ink, fontSize: fontSize.sm },
  historyMeta: { color: colors.inkMuted, fontSize: fontSize.xs, marginTop: 2 },
  historyNotes: { color: colors.ink, fontSize: fontSize.xs, marginTop: 4, fontStyle: "italic" },
  favoriteIcon: { fontSize: fontSize.lg, color: colors.border },
  favoriteIconActive: { color: colors.gold },
  deleteIcon: { fontSize: fontSize.md },
});
