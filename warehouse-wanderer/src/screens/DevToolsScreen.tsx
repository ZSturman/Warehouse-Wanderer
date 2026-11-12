import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import React, { useState } from "react";
import { Alert, FlatList, Pressable, StyleSheet, Text, TextInput, View } from "react-native";

import { EmptyState } from "../components/EmptyState";
import { ScreenContainer } from "../components/ScreenContainer";
import type { RootStackParamList } from "../navigation/types";
import { LocationService } from "../services/LocationService";
import { populateSampleHistory as populateSampleHistoryData, clearAllAppData } from "../dev/sampleData";
import { BadgeUnlocksRepository } from "../storage/repositories/BadgeUnlocksRepository";
import { VisitsRepository } from "../storage/repositories/VisitsRepository";
import { usePassport } from "../state/PassportContext";
import { colors } from "../theme/colors";
import { fontSize, radius, spacing } from "../theme/spacing";
import { generateId } from "../utils/id";
import { formatVisitDate, toLocalIsoDate } from "../utils/formatters";
import type { Visit } from "../types";

type Nav = NativeStackNavigationProp<RootStackParamList>;

/**
 * Developer-only testing facility (requirement: since you can't physically
 * travel between warehouses in a simulator, give developers a way to fake
 * it). Everything here talks straight to the repositories and then calls
 * `reloadAll()` — it never introduces a separate code path for "production"
 * data, it just seeds/mutates the same storage a real user would.
 *
 * This screen is only reachable from Settings when `__DEV__` is true, and
 * every action here is explicit and developer-initiated — nothing here runs
 * automatically in a release build.
 */
export function DevToolsScreen() {
  const navigation = useNavigation<Nav>();
  const {
    warehouses,
    visits,
    settings,
    reloadAll,
    refreshLocation,
    updateSettings,
    getWarehouseById,
  } = usePassport();

  const [customLat, setCustomLat] = useState("");
  const [customLon, setCustomLon] = useState("");
  const [customAccuracy, setCustomAccuracy] = useState("15");
  const [busy, setBusy] = useState<string | null>(null);

  const run = async (label: string, fn: () => Promise<void>) => {
    setBusy(label);
    try {
      await fn();
    } finally {
      setBusy(null);
    }
  };

  const simulateAt = async (lat: number, lon: number, accuracy: number) => {
    LocationService.simulateLocation({ latitude: lat, longitude: lon, accuracyMeters: accuracy, timestamp: Date.now() });
    await refreshLocation();
  };

  const jumpNear = (warehouseId: string, exact: boolean) =>
    run(`jump-${warehouseId}`, async () => {
      const w = getWarehouseById(warehouseId);
      if (!w) return;
      const jitter = exact ? 0 : 0.003; // ~300m, deliberately outside default check-in range
      await simulateAt(w.latitude + jitter, w.longitude, exact ? 12 : 60);
    });

  const clearSimulation = () =>
    run("clear-sim", async () => {
      LocationService.simulateLocation(null);
      await refreshLocation();
    });

  const applyCustomLocation = () =>
    run("custom-loc", async () => {
      const lat = parseFloat(customLat);
      const lon = parseFloat(customLon);
      const accuracy = parseFloat(customAccuracy) || 15;
      if (Number.isNaN(lat) || Number.isNaN(lon)) {
        Alert.alert("Invalid coordinates", "Enter numeric latitude and longitude.");
        return;
      }
      await simulateAt(lat, lon, accuracy);
    });

  const populateSampleHistory = () =>
    run("populate", async () => {
      await populateSampleHistoryData(warehouses);
      await reloadAll();
    });

  const addRecentVisitToRandomWarehouse = () =>
    run("add-one", async () => {
      const w = warehouses[Math.floor(Math.random() * warehouses.length)];
      await VisitsRepository.add({
        id: generateId("visit"),
        warehouseId: w.id,
        visitedAt: toLocalIsoDate(),
        verification: "manual",
        isFavorite: false,
        createdAt: new Date().toISOString(),
      });
      await reloadAll();
    });

  const shiftVisitDate = (visit: Visit, deltaDays: number) =>
    run(`shift-${visit.id}`, async () => {
      const next = new Date(new Date(`${visit.visitedAt}T00:00:00`).getTime() + deltaDays * 86400000);
      await VisitsRepository.update(visit.id, { visitedAt: toLocalIsoDate(next) });
      await reloadAll();
    });

  const removeVisit = (visit: Visit) =>
    run(`remove-${visit.id}`, async () => {
      await VisitsRepository.remove(visit.id);
      await reloadAll();
    });

  const resetBadgeUnlockDates = () =>
    run("reset-badges", async () => {
      await BadgeUnlocksRepository.reset();
      await reloadAll();
    });

  const clearAllVisits = () =>
    Alert.alert("Clear all visits?", "Removes every passport entry.", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Clear",
        style: "destructive",
        onPress: () =>
          run("clear-visits", async () => {
            await VisitsRepository.clear();
            await BadgeUnlocksRepository.reset();
            await reloadAll();
          }),
      },
    ]);

  const clearEverything = () =>
    Alert.alert("Clear ALL app data?", "Visits, wishlist, badges, and settings will all be reset.", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Erase Everything",
        style: "destructive",
        onPress: () =>
          run("clear-all", async () => {
            await clearAllAppData();
            await reloadAll();
          }),
      },
    ]);

  const adjustThreshold = (delta: number) =>
    updateSettings({ proximityThresholdMeters: Math.max(50, settings.proximityThresholdMeters + delta) });

  return (
    <ScreenContainer scroll contentContainerStyle={styles.content}>
      <View style={styles.warningBanner}>
        <Text style={styles.warningText}>
          🛠 Developer Tools — this screen only exists in development builds and is unreachable from a release build.
        </Text>
      </View>

      <Section title="Simulate Location">
        <Text style={styles.helpText}>
          Overrides GPS with a fixed point so you can test nearby detection and check-in without moving. Real
          location resumes automatically once cleared.
        </Text>
        <View style={styles.buttonRow}>
          <SmallButton label="Use Real GPS" onPress={clearSimulation} busy={busy === "clear-sim"} />
        </View>

        <Text style={[styles.label, { marginTop: spacing.md }]}>Custom coordinates</Text>
        <View style={styles.coordRow}>
          <TextInput
            style={styles.coordInput}
            placeholder="Latitude"
            placeholderTextColor={colors.inkMuted}
            keyboardType="numbers-and-punctuation"
            value={customLat}
            onChangeText={setCustomLat}
          />
          <TextInput
            style={styles.coordInput}
            placeholder="Longitude"
            placeholderTextColor={colors.inkMuted}
            keyboardType="numbers-and-punctuation"
            value={customLon}
            onChangeText={setCustomLon}
          />
          <TextInput
            style={styles.coordInputSmall}
            placeholder="±m"
            placeholderTextColor={colors.inkMuted}
            keyboardType="numbers-and-punctuation"
            value={customAccuracy}
            onChangeText={setCustomAccuracy}
          />
        </View>
        <SmallButton label="Apply Custom Location" onPress={applyCustomLocation} busy={busy === "custom-loc"} />
      </Section>

      <Section title="Jump Near a Warehouse">
        <Text style={styles.helpText}>Places you exactly at, or ~300m from, a chosen warehouse.</Text>
        <FlatList
          data={warehouses.slice(0, 25)}
          keyExtractor={(w) => w.id}
          horizontal={false}
          scrollEnabled={false}
          renderItem={({ item }) => (
            <View style={styles.warehouseRow}>
              <Text style={styles.warehouseRowName} numberOfLines={1}>
                {item.name}
              </Text>
              <SmallButton label="Exact" onPress={() => jumpNear(item.id, true)} busy={busy === `jump-${item.id}`} />
              <SmallButton label="~300m" onPress={() => jumpNear(item.id, false)} busy={busy === `jump-${item.id}`} />
            </View>
          )}
        />
      </Section>

      <Section title="Check-In Distance Threshold">
        <View style={styles.buttonRow}>
          <SmallButton label="−50m" onPress={() => adjustThreshold(-50)} />
          <Text style={styles.thresholdValue}>{Math.round(settings.proximityThresholdMeters)} m</Text>
          <SmallButton label="+50m" onPress={() => adjustThreshold(50)} />
        </View>
      </Section>

      <Section title="Passport Data">
        <View style={styles.buttonRow}>
          <SmallButton label="Populate Sample History" onPress={populateSampleHistory} busy={busy === "populate"} />
          <SmallButton label="Add One Random Visit" onPress={addRecentVisitToRandomWarehouse} busy={busy === "add-one"} />
        </View>
      </Section>

      <Section title="Existing Visits">
        {visits.length === 0 ? (
          <EmptyState icon="🎫" title="No visits yet" message="Use the actions above to seed some." />
        ) : (
          visits.slice(0, 20).map((visit) => {
            const w = getWarehouseById(visit.warehouseId);
            return (
              <View key={visit.id} style={styles.visitRow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.visitName} numberOfLines={1}>
                    {w?.name ?? visit.warehouseId}
                  </Text>
                  <Text style={styles.visitDate}>{formatVisitDate(visit.visitedAt)}</Text>
                </View>
                <SmallButton label="−1d" onPress={() => shiftVisitDate(visit, -1)} busy={busy === `shift-${visit.id}`} />
                <SmallButton label="+1d" onPress={() => shiftVisitDate(visit, 1)} busy={busy === `shift-${visit.id}`} />
                <SmallButton label="✕" onPress={() => removeVisit(visit)} busy={busy === `remove-${visit.id}`} />
              </View>
            );
          })
        )}
      </Section>

      <Section title="Badges">
        <Text style={styles.helpText}>
          Badge unlock state is always derived live from your passport data — there's no separate "unlocked" flag to
          fake. Populate sample history above to unlock most badges realistically. This resets only the recorded
          unlock timestamps, so already-earned badges will re-stamp with a fresh date.
        </Text>
        <SmallButton label="Reset Badge Unlock Dates" onPress={resetBadgeUnlockDates} busy={busy === "reset-badges"} />
      </Section>

      <Section title="Danger Zone">
        <View style={styles.buttonRow}>
          <SmallButton label="Clear All Visits" onPress={clearAllVisits} busy={busy === "clear-visits"} destructive />
          <SmallButton label="Erase Everything" onPress={clearEverything} busy={busy === "clear-all"} destructive />
        </View>
      </Section>
    </ScreenContainer>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.sectionCard}>{children}</View>
    </View>
  );
}

function SmallButton({
  label,
  onPress,
  busy,
  destructive,
}: {
  label: string;
  onPress: () => void;
  busy?: boolean;
  destructive?: boolean;
}) {
  return (
    <Pressable
      style={[styles.smallButton, destructive && styles.smallButtonDestructive]}
      onPress={onPress}
      disabled={busy}
    >
      <Text style={[styles.smallButtonText, destructive && styles.smallButtonTextDestructive]}>
        {busy ? "…" : label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  content: { padding: spacing.lg },
  warningBanner: { backgroundColor: colors.navyDark, borderRadius: radius.md, padding: spacing.md, marginBottom: spacing.lg },
  warningText: { color: colors.gold, fontSize: fontSize.xs, fontWeight: "700" },
  section: { marginBottom: spacing.lg },
  sectionTitle: { fontSize: fontSize.sm, fontWeight: "800", color: colors.inkMuted, marginBottom: spacing.sm },
  sectionCard: {
    backgroundColor: colors.paper,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    gap: spacing.sm,
  },
  helpText: { fontSize: fontSize.xs, color: colors.inkMuted, lineHeight: 16 },
  label: { fontSize: fontSize.xs, fontWeight: "700", color: colors.ink },
  buttonRow: { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm, alignItems: "center" },
  coordRow: { flexDirection: "row", gap: spacing.xs },
  coordInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.sm,
    fontSize: fontSize.sm,
    color: colors.ink,
  },
  coordInputSmall: {
    width: 60,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.sm,
    fontSize: fontSize.sm,
    color: colors.ink,
  },
  warehouseRow: { flexDirection: "row", alignItems: "center", gap: spacing.xs, paddingVertical: 4 },
  warehouseRowName: { flex: 1, fontSize: fontSize.xs, color: colors.ink },
  thresholdValue: { fontWeight: "800", color: colors.ink, fontSize: fontSize.sm, minWidth: 60, textAlign: "center" },
  visitRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    paddingVertical: spacing.xs,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  visitName: { fontSize: fontSize.xs, fontWeight: "700", color: colors.ink },
  visitDate: { fontSize: 10, color: colors.inkMuted },
  smallButton: {
    backgroundColor: colors.navy,
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
    borderRadius: radius.sm,
  },
  smallButtonDestructive: { backgroundColor: `${colors.danger}22` },
  smallButtonText: { color: colors.cream, fontSize: 11, fontWeight: "700" },
  smallButtonTextDestructive: { color: colors.danger },
});
