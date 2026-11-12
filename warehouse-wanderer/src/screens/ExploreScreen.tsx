import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import React, { useMemo, useRef, useState } from "react";
import { FlatList, Pressable, StyleSheet, Text, View } from "react-native";
import type MapView from "react-native-maps";

import { CostcoMapView, type MarkerStatus } from "../components/CostcoMapView";
import { EmptyState } from "../components/EmptyState";
import { LocationStatusBanner } from "../components/LocationStatusBanner";
import { ScreenContainer } from "../components/ScreenContainer";
import { WarehouseCard } from "../components/WarehouseCard";
import type { RootStackParamList } from "../navigation/types";
import { distanceMeters } from "../services/distance";
import { usePassport } from "../state/PassportContext";
import { colors } from "../theme/colors";
import { fontSize, radius, spacing } from "../theme/spacing";
import type { Warehouse } from "../types";

type Nav = NativeStackNavigationProp<RootStackParamList>;

type ViewMode = "map" | "list";
type FilterKey = "all" | "nearby" | "unvisited" | "visited" | "wishlist" | "new_regions" | "new_countries";

const FILTERS: { key: FilterKey; label: string; needsLocation?: boolean }[] = [
  { key: "all", label: "All" },
  { key: "nearby", label: "Nearby", needsLocation: true },
  { key: "unvisited", label: "Unvisited Near Me", needsLocation: true },
  { key: "visited", label: "Visited" },
  { key: "wishlist", label: "Wishlist" },
  { key: "new_regions", label: "New States/Regions" },
  { key: "new_countries", label: "New Countries" },
];

export function ExploreScreen() {
  const navigation = useNavigation<Nav>();
  const {
    warehouses,
    visits,
    wishlist,
    settings,
    currentLocation,
    locationPermission,
    locationStatus,
    locationErrorMessage,
    requestLocationPermission,
    refreshLocation,
    isWishlisted,
  } = usePassport();

  const [viewMode, setViewMode] = useState<ViewMode>("map");
  const [filter, setFilter] = useState<FilterKey>("all");
  const mapRef = useRef<MapView>(null);

  const visitedIds = useMemo(() => new Set(visits.map((v) => v.warehouseId)), [visits]);
  const visitedRegions = useMemo(() => {
    const byId = new Map(warehouses.map((w) => [w.id, w]));
    return new Set(
      [...visitedIds]
        .map((id) => byId.get(id))
        .filter((w): w is Warehouse => Boolean(w))
        .map((w) => `${w.countryCode}:${w.region}`),
    );
  }, [visitedIds, warehouses]);
  const visitedCountries = useMemo(() => {
    const byId = new Map(warehouses.map((w) => [w.id, w]));
    return new Set(
      [...visitedIds]
        .map((id) => byId.get(id))
        .filter((w): w is Warehouse => Boolean(w))
        .map((w) => w.countryCode),
    );
  }, [visitedIds, warehouses]);

  const filtered = useMemo(() => {
    let list = warehouses;
    switch (filter) {
      case "visited":
        list = warehouses.filter((w) => visitedIds.has(w.id));
        break;
      case "wishlist":
        list = warehouses.filter((w) => isWishlisted(w.id));
        break;
      case "new_regions":
        list = warehouses.filter((w) => !visitedRegions.has(`${w.countryCode}:${w.region}`) && !visitedIds.has(w.id));
        break;
      case "new_countries":
        list = warehouses.filter((w) => !visitedCountries.has(w.countryCode) && !visitedIds.has(w.id));
        break;
      case "nearby":
      case "unvisited":
        if (!currentLocation) {
          list = [];
        } else {
          list = warehouses
            .filter((w) => (filter === "unvisited" ? !visitedIds.has(w.id) : true))
            .map((w) => ({
              w,
              d: distanceMeters(currentLocation.latitude, currentLocation.longitude, w.latitude, w.longitude),
            }))
            .sort((a, b) => a.d - b.d)
            .slice(0, 30)
            .map((x) => x.w);
        }
        break;
      default:
        list = warehouses;
    }
    return list;
  }, [filter, warehouses, visitedIds, isWishlisted, visitedRegions, visitedCountries, currentLocation]);

  const statusFor = (warehouse: Warehouse): MarkerStatus => {
    if (visitedIds.has(warehouse.id)) return "visited";
    if (isWishlisted(warehouse.id)) return "wishlist";
    if (currentLocation) {
      const d = distanceMeters(currentLocation.latitude, currentLocation.longitude, warehouse.latitude, warehouse.longitude);
      if (d <= settings.proximityThresholdMeters * 3) return "nearby";
    }
    return "unvisited";
  };

  const distanceFor = (warehouse: Warehouse): number | null =>
    currentLocation
      ? distanceMeters(currentLocation.latitude, currentLocation.longitude, warehouse.latitude, warehouse.longitude)
      : null;

  const handleNearMe = async () => {
    if (locationPermission !== "granted") {
      await requestLocationPermission();
    }
    await refreshLocation();
    if (currentLocation && mapRef.current) {
      mapRef.current.animateToRegion(
        {
          latitude: currentLocation.latitude,
          longitude: currentLocation.longitude,
          latitudeDelta: 2,
          longitudeDelta: 2,
        },
        400,
      );
    }
  };

  const needsLocationButFilterBlocked =
    FILTERS.find((f) => f.key === filter)?.needsLocation && !currentLocation;

  return (
    <ScreenContainer contentContainerStyle={styles.root}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Explore</Text>
        <View style={styles.headerActions}>
          <Pressable style={styles.iconButton} onPress={() => navigation.navigate("Search")} hitSlop={8}>
            <Text style={styles.iconButtonText}>🔎</Text>
          </Pressable>
          <View style={styles.segmented}>
            <SegmentButton label="Map" active={viewMode === "map"} onPress={() => setViewMode("map")} />
            <SegmentButton label="List" active={viewMode === "list"} onPress={() => setViewMode("list")} />
          </View>
        </View>
      </View>

      <FlatList
        horizontal
        data={FILTERS}
        keyExtractor={(f) => f.key}
        showsHorizontalScrollIndicator={false}
        style={styles.filterRow}
        contentContainerStyle={{ gap: spacing.sm, paddingHorizontal: spacing.lg }}
        renderItem={({ item }) => (
          <Pressable
            style={[styles.chip, filter === item.key && styles.chipActive]}
            onPress={() => setFilter(item.key)}
          >
            <Text style={[styles.chipLabel, filter === item.key && styles.chipLabelActive]}>{item.label}</Text>
          </Pressable>
        )}
      />

      {viewMode === "map" ? (
        <View style={styles.mapWrap}>
          <CostcoMapView
            warehouses={filtered}
            statusFor={statusFor}
            currentLocation={currentLocation}
            onSelect={(w) => navigation.navigate("WarehouseDetail", { warehouseId: w.id })}
            mapRef={mapRef}
          />
          <Pressable style={styles.nearMeButton} onPress={handleNearMe}>
            <Text style={styles.nearMeText}>📍 Near Me</Text>
          </Pressable>
        </View>
      ) : (
        <View style={styles.listWrap}>
          {locationPermission !== "granted" ? (
            <View style={{ paddingHorizontal: spacing.lg }}>
              <LocationStatusBanner
                permission={locationPermission}
                status={locationStatus}
                errorMessage={locationErrorMessage}
                onRequest={handleNearMe}
                onRetry={handleNearMe}
              />
            </View>
          ) : null}
          {needsLocationButFilterBlocked ? (
            <EmptyState
              icon="📍"
              title="Turn on location to use this filter"
              message="We need your location to figure out what's nearby."
              actionLabel="Enable Location"
              onAction={handleNearMe}
            />
          ) : filtered.length === 0 ? (
            <EmptyState icon="🧭" title="Nothing here yet" message="Try a different filter or search directly." />
          ) : (
            <FlatList
              data={filtered}
              keyExtractor={(w) => w.id}
              contentContainerStyle={{ padding: spacing.lg, paddingBottom: 120 }}
              renderItem={({ item }) => (
                <WarehouseCard
                  warehouse={item}
                  distanceMeters={distanceFor(item)}
                  distanceUnit={settings.distanceUnit}
                  visited={visitedIds.has(item.id)}
                  wishlisted={isWishlisted(item.id)}
                  onPress={() => navigation.navigate("WarehouseDetail", { warehouseId: item.id })}
                />
              )}
            />
          )}
        </View>
      )}
    </ScreenContainer>
  );
}

function SegmentButton({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
  return (
    <Pressable style={[styles.segmentButton, active && styles.segmentButtonActive]} onPress={onPress}>
      <Text style={[styles.segmentLabel, active && styles.segmentLabelActive]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, padding: 0 },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.sm,
  },
  headerTitle: { fontSize: fontSize.xl, fontWeight: "800", color: colors.ink },
  headerActions: { flexDirection: "row", alignItems: "center", gap: spacing.sm },
  iconButton: { padding: 6 },
  iconButtonText: { fontSize: 18 },
  segmented: { flexDirection: "row", backgroundColor: colors.border, borderRadius: radius.pill, padding: 2 },
  segmentButton: { paddingHorizontal: spacing.md, paddingVertical: 6, borderRadius: radius.pill },
  segmentButtonActive: { backgroundColor: colors.navy },
  segmentLabel: { fontSize: fontSize.xs, fontWeight: "700", color: colors.inkMuted },
  segmentLabelActive: { color: colors.cream },
  filterRow: { flexGrow: 0, marginBottom: spacing.sm },
  chip: {
    paddingHorizontal: spacing.md,
    paddingVertical: 8,
    borderRadius: radius.pill,
    backgroundColor: colors.paper,
    borderWidth: 1,
    borderColor: colors.border,
  },
  chipActive: { backgroundColor: colors.navy, borderColor: colors.navy },
  chipLabel: { fontSize: fontSize.xs, fontWeight: "700", color: colors.ink },
  chipLabelActive: { color: colors.cream },
  mapWrap: { flex: 1 },
  nearMeButton: {
    position: "absolute",
    bottom: spacing.lg,
    alignSelf: "center",
    backgroundColor: colors.navy,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: radius.pill,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 3,
  },
  nearMeText: { color: colors.cream, fontWeight: "700", fontSize: fontSize.sm },
  listWrap: { flex: 1 },
});
