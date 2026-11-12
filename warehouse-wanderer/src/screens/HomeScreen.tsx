import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import React, { useMemo } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { LocationStatusBanner } from "../components/LocationStatusBanner";
import { ProgressBar } from "../components/ProgressBar";
import { ScreenContainer } from "../components/ScreenContainer";
import { SectionHeader } from "../components/SectionHeader";
import { WarehouseCard } from "../components/WarehouseCard";
import type { RootStackParamList } from "../navigation/types";
import { usePassport } from "../state/PassportContext";
import { colors } from "../theme/colors";
import { fontSize, radius, spacing } from "../theme/spacing";
import { formatVisitDate } from "../utils/formatters";

type Nav = NativeStackNavigationProp<RootStackParamList>;

export function HomeScreen() {
  const navigation = useNavigation<Nav>();
  const {
    stats,
    visits,
    wishlist,
    badges,
    warehouses,
    settings,
    locationPermission,
    locationStatus,
    locationErrorMessage,
    requestLocationPermission,
    refreshLocation,
    getWarehouseById,
  } = usePassport();

  const recentVisits = useMemo(
    () =>
      [...visits]
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
        .slice(0, 3),
    [visits],
  );

  const nextBadge = useMemo(() => {
    const locked = badges.filter((b) => !b.unlocked && b.target > 1);
    if (locked.length === 0) return null;
    return locked.sort((a, b) => b.current / b.target - a.current / a.target)[0];
  }, [badges]);

  const suggestion = stats.nearestUnvisited;

  return (
    <ScreenContainer scroll contentContainerStyle={styles.content}>
      <Text style={styles.greeting}>Welcome back, wanderer 👋</Text>
      <Text style={styles.tagline}>Here's where your passport stands.</Text>

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

      <Pressable style={styles.progressCard} onPress={() => navigation.navigate("Stats")}>
        <View style={styles.progressHeader}>
          <Text style={styles.progressTitle}>Passport Progress</Text>
          <Text style={styles.progressPercent}>{stats.percentVisited.toFixed(1)}%</Text>
        </View>
        <ProgressBar progress={stats.percentVisited / 100} color={colors.gold} height={10} />
        <Text style={styles.progressSubtitle}>
          {stats.uniqueWarehousesVisited} of {stats.totalWarehouses} warehouses · {stats.countriesVisited}{" "}
          {stats.countriesVisited === 1 ? "country" : "countries"}
        </Text>
      </Pressable>

      <View style={styles.quickActions}>
        <Pressable style={styles.quickAction} onPress={() => navigation.navigate("NearbyCheckIn")}>
          <Text style={styles.quickActionIcon}>📍</Text>
          <Text style={styles.quickActionLabel}>Check In</Text>
        </Pressable>
        <Pressable style={styles.quickAction} onPress={() => navigation.navigate("Search")}>
          <Text style={styles.quickActionIcon}>🔎</Text>
          <Text style={styles.quickActionLabel}>Find a Costco</Text>
        </Pressable>
        <Pressable style={styles.quickAction} onPress={() => navigation.navigate("Wishlist")}>
          <Text style={styles.quickActionIcon}>♥</Text>
          <Text style={styles.quickActionLabel}>Wishlist ({wishlist.length})</Text>
        </Pressable>
      </View>

      {suggestion ? (
        <View style={styles.section}>
          <SectionHeader title="Suggested Next Destination" />
          <WarehouseCard
            warehouse={suggestion.warehouse}
            distanceMeters={suggestion.distanceMeters}
            distanceUnit={settings.distanceUnit}
            onPress={() => navigation.navigate("WarehouseDetail", { warehouseId: suggestion.warehouse.id })}
          />
        </View>
      ) : null}

      {recentVisits.length > 0 ? (
        <View style={styles.section}>
          <SectionHeader title="Recently Visited" actionLabel="See Passport" onAction={() => navigation.navigate("Tabs", { screen: "Passport" })} />
          {recentVisits.map((visit) => {
            const warehouse = getWarehouseById(visit.warehouseId);
            if (!warehouse) return null;
            return (
              <View key={visit.id} style={styles.recentRow}>
                <Text style={styles.recentIcon}>🎫</Text>
                <View style={styles.recentInfo}>
                  <Text style={styles.recentName}>{warehouse.name}</Text>
                  <Text style={styles.recentMeta}>
                    {warehouse.city}, {warehouse.region} · {formatVisitDate(visit.visitedAt)}
                  </Text>
                </View>
              </View>
            );
          })}
        </View>
      ) : (
        <View style={styles.section}>
          <SectionHeader title="Get Started" />
          <Text style={styles.emptyCopy}>
            Add your first warehouse to start your passport — search for one or check in when you're nearby.
          </Text>
        </View>
      )}

      {nextBadge ? (
        <View style={styles.section}>
          <SectionHeader
            title="Almost There"
            actionLabel="See Badges"
            onAction={() => navigation.navigate("Tabs", { screen: "Badges" })}
          />
          <Pressable
            style={styles.badgeTeaser}
            onPress={() => navigation.navigate("BadgeDetail", { badgeId: nextBadge.definition.id })}
          >
            <Text style={styles.badgeTeaserIcon}>{nextBadge.definition.icon}</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.badgeTeaserName}>{nextBadge.definition.name}</Text>
              <ProgressBar progress={nextBadge.current / nextBadge.target} color={colors.gold} height={6} />
              <Text style={styles.badgeTeaserProgress}>
                {nextBadge.current}/{nextBadge.target}
              </Text>
            </View>
          </Pressable>
        </View>
      ) : null}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: { padding: spacing.lg },
  greeting: { fontSize: fontSize.xl, fontWeight: "800", color: colors.ink },
  tagline: { fontSize: fontSize.sm, color: colors.inkMuted, marginTop: 2, marginBottom: spacing.lg },
  progressCard: {
    backgroundColor: colors.navy,
    borderRadius: radius.lg,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    gap: spacing.sm,
  },
  progressHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  progressTitle: { color: colors.cream, fontWeight: "700", fontSize: fontSize.md },
  progressPercent: { color: colors.gold, fontWeight: "800", fontSize: fontSize.lg },
  progressSubtitle: { color: colors.cream, opacity: 0.8, fontSize: fontSize.xs },
  quickActions: { flexDirection: "row", gap: spacing.sm, marginBottom: spacing.lg },
  quickAction: {
    flex: 1,
    backgroundColor: colors.paper,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: spacing.md,
    alignItems: "center",
    gap: 4,
  },
  quickActionIcon: { fontSize: 20 },
  quickActionLabel: { fontSize: fontSize.xs, fontWeight: "700", color: colors.ink, textAlign: "center" },
  section: { marginBottom: spacing.lg },
  emptyCopy: { color: colors.inkMuted, fontSize: fontSize.sm, lineHeight: 20 },
  recentRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  recentIcon: { fontSize: 20 },
  recentInfo: { flex: 1 },
  recentName: { fontWeight: "700", color: colors.ink, fontSize: fontSize.sm },
  recentMeta: { color: colors.inkMuted, fontSize: fontSize.xs },
  badgeTeaser: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    backgroundColor: colors.paper,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
  },
  badgeTeaserIcon: { fontSize: 32 },
  badgeTeaserName: { fontWeight: "700", color: colors.ink, marginBottom: 6 },
  badgeTeaserProgress: { fontSize: fontSize.xs, color: colors.inkMuted, marginTop: 2 },
});
