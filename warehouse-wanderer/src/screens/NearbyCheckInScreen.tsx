import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import React, { useEffect } from "react";
import { FlatList, Pressable, StyleSheet, Text, View } from "react-native";

import { EmptyState } from "../components/EmptyState";
import { LoadingView } from "../components/LoadingView";
import { LocationStatusBanner } from "../components/LocationStatusBanner";
import { ScreenContainer } from "../components/ScreenContainer";
import type { RootStackParamList } from "../navigation/types";
import { MAX_TRUSTED_ACCURACY_METERS } from "../services/LocationService";
import { formatDistance } from "../services/distance";
import { usePassport } from "../state/PassportContext";
import { colors } from "../theme/colors";
import { fontSize, radius, spacing } from "../theme/spacing";

type Nav = NativeStackNavigationProp<RootStackParamList>;

export function NearbyCheckInScreen() {
  const navigation = useNavigation<Nav>();
  const {
    locationPermission,
    locationStatus,
    locationErrorMessage,
    currentLocation,
    requestLocationPermission,
    refreshLocation,
    nearbyWarehouses,
    settings,
    isSimulatingLocation,
  } = usePassport();

  useEffect(() => {
    if (locationPermission === "granted") refreshLocation();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [locationPermission]);

  const nearby = nearbyWarehouses(15);
  const inRange = nearby.filter((n) => n.withinCheckInRange);
  const accuracy = currentLocation?.accuracyMeters ?? null;
  const lowAccuracy = accuracy != null && accuracy > MAX_TRUSTED_ACCURACY_METERS;

  return (
    <ScreenContainer contentContainerStyle={styles.root}>
      <View style={styles.header}>
        <Text style={styles.title}>Check In Nearby</Text>
        <Pressable onPress={() => navigation.goBack()} hitSlop={8}>
          <Text style={styles.close}>Close</Text>
        </Pressable>
      </View>

      <View style={{ paddingHorizontal: spacing.lg }}>
        <LocationStatusBanner
          permission={locationPermission}
          status={locationStatus}
          errorMessage={locationErrorMessage}
          onRequest={async () => {
            await requestLocationPermission();
            refreshLocation();
          }}
          onRetry={refreshLocation}
        />
        {isSimulatingLocation ? (
          <View style={styles.devBadge}>
            <Text style={styles.devBadgeText}>🛠 Simulated location active (Dev Tools)</Text>
          </View>
        ) : null}
        {lowAccuracy ? (
          <View style={styles.warningBanner}>
            <Text style={styles.warningText}>
              ⚠️ GPS accuracy is about {Math.round(accuracy!)} m right now — that's too imprecise to trust a nearby
              match. Try moving outdoors or near a window, then refresh.
            </Text>
          </View>
        ) : null}
      </View>

      {locationStatus === "loading" ? (
        <LoadingView label="Finding your location…" />
      ) : locationPermission !== "granted" ? null : inRange.length > 0 && !lowAccuracy ? (
        <FlatList
          data={inRange}
          keyExtractor={(n) => n.warehouse.id}
          contentContainerStyle={{ padding: spacing.lg }}
          ListHeaderComponent={<Text style={styles.sectionLabel}>You're close to these warehouses:</Text>}
          renderItem={({ item }) => (
            <View style={styles.candidateCard}>
              <View style={{ flex: 1 }}>
                <Text style={styles.candidateName}>{item.warehouse.name}</Text>
                <Text style={styles.candidateMeta}>
                  {item.warehouse.city}, {item.warehouse.region} ·{" "}
                  {formatDistance(item.distanceMeters, settings.distanceUnit)} away
                </Text>
              </View>
              <Pressable
                style={styles.checkInButton}
                onPress={() =>
                  navigation.navigate("AddVisit", {
                    warehouseId: item.warehouse.id,
                    verification: "location_confirmed",
                  })
                }
              >
                <Text style={styles.checkInButtonText}>Check In</Text>
              </Pressable>
            </View>
          )}
          ListFooterComponent={
            nearby.length > inRange.length ? (
              <>
                <Text style={[styles.sectionLabel, { marginTop: spacing.lg }]}>Other nearby warehouses</Text>
                {nearby
                  .filter((n) => !n.withinCheckInRange)
                  .slice(0, 5)
                  .map((n) => (
                    <View key={n.warehouse.id} style={styles.farRow}>
                      <Text style={styles.farName}>{n.warehouse.name}</Text>
                      <Text style={styles.farDistance}>{formatDistance(n.distanceMeters, settings.distanceUnit)}</Text>
                    </View>
                  ))}
              </>
            ) : null
          }
        />
      ) : (
        <EmptyState
          icon="🧭"
          title="No Costco nearby"
          message={
            nearby.length > 0
              ? `The closest one is ${formatDistance(nearby[0].distanceMeters, settings.distanceUnit)} away — that's outside check-in range (${formatDistance(settings.proximityThresholdMeters, settings.distanceUnit)}). You can still add it manually from its detail page.`
              : "We don't see any known warehouses near you. You can still add visits manually from search."
          }
          actionLabel="Search Instead"
          onAction={() => navigation.navigate("Search")}
        />
      )}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, padding: 0 },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    paddingBottom: spacing.sm,
  },
  title: { fontSize: fontSize.xl, fontWeight: "800", color: colors.ink },
  close: { color: colors.tealDark, fontWeight: "700" },
  devBadge: { backgroundColor: colors.gold, borderRadius: radius.md, padding: spacing.sm, marginBottom: spacing.md },
  devBadgeText: { color: colors.navy, fontWeight: "700", fontSize: fontSize.xs },
  warningBanner: { backgroundColor: `${colors.danger}18`, borderRadius: radius.md, padding: spacing.md, marginBottom: spacing.md },
  warningText: { color: colors.danger, fontSize: fontSize.xs, lineHeight: 17 },
  sectionLabel: { fontSize: fontSize.sm, fontWeight: "700", color: colors.inkMuted, marginBottom: spacing.sm },
  candidateCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.paper,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.teal,
    padding: spacing.md,
    marginBottom: spacing.sm,
    gap: spacing.md,
  },
  candidateName: { fontWeight: "800", color: colors.ink, fontSize: fontSize.md },
  candidateMeta: { color: colors.inkMuted, fontSize: fontSize.xs, marginTop: 2 },
  checkInButton: { backgroundColor: colors.teal, borderRadius: radius.pill, paddingHorizontal: spacing.md, paddingVertical: spacing.sm },
  checkInButtonText: { color: colors.paper, fontWeight: "800", fontSize: fontSize.xs },
  farRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  farName: { color: colors.ink, fontSize: fontSize.sm },
  farDistance: { color: colors.inkMuted, fontSize: fontSize.sm },
});
