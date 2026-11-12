import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import React from "react";
import { Linking, Pressable, StyleSheet, Text, View } from "react-native";

import { ScreenContainer } from "../components/ScreenContainer";
import type { RootStackParamList } from "../navigation/types";
import { usePassport } from "../state/PassportContext";
import { colors } from "../theme/colors";
import { fontSize, radius, spacing } from "../theme/spacing";

type Nav = NativeStackNavigationProp<RootStackParamList>;

const PERMISSION_LABEL: Record<string, string> = {
  granted: "Allowed",
  denied: "Denied",
  undetermined: "Not asked yet",
};

export function SettingsScreen() {
  const navigation = useNavigation<Nav>();
  const { settings, updateSettings, locationPermission, requestLocationPermission, homeWarehouse } = usePassport();

  return (
    <ScreenContainer scroll contentContainerStyle={styles.content}>
      <Text style={styles.title}>Settings</Text>

      <Section title="Location">
        <Row
          label="Permission"
          value={PERMISSION_LABEL[locationPermission]}
          onPress={
            locationPermission === "denied"
              ? () => Linking.openSettings()
              : locationPermission === "undetermined"
                ? () => requestLocationPermission()
                : undefined
          }
          actionLabel={locationPermission === "denied" ? "Open Settings" : locationPermission === "undetermined" ? "Allow" : undefined}
        />
        <Row label="Check-in distance" value={`${Math.round(settings.proximityThresholdMeters)} m`} />
        <Text style={styles.helpText}>
          How close you need to be to a warehouse to confirm a GPS check-in. Adjust this from Developer Tools.
        </Text>
      </Section>

      <Section title="Units">
        <View style={styles.unitToggle}>
          <UnitButton
            label="Miles"
            active={settings.distanceUnit === "mi"}
            onPress={() => updateSettings({ distanceUnit: "mi" })}
          />
          <UnitButton
            label="Kilometers"
            active={settings.distanceUnit === "km"}
            onPress={() => updateSettings({ distanceUnit: "km" })}
          />
        </View>
      </Section>

      <Section title="Home Base">
        <Text style={styles.helpText}>
          {homeWarehouse
            ? `${homeWarehouse.name} (${homeWarehouse.city}, ${homeWarehouse.region}) — used for "farthest visited" and distance-based badges. This is set automatically from your first passport entry.`
            : "Not set yet — add your first passport entry and we'll use it as home."}
        </Text>
      </Section>

      <Section title="Privacy">
        <Text style={styles.helpText}>
          Warehouse Wanderer never records a history of everywhere you go. Location is only used live, in the
          moment, to calculate distances and confirm nearby check-ins. What we do store is the warehouse you
          confirmed visiting — not a trail of GPS points.
        </Text>
      </Section>

      <Section title="About">
        <Text style={styles.helpText}>
          Warehouse Wanderer is an independent travel-passport app for warehouse club explorers. It isn't
          affiliated with, endorsed by, or operated by any warehouse retailer.
        </Text>
      </Section>

      {__DEV__ ? (
        <Pressable style={styles.devButton} onPress={() => navigation.navigate("DevTools")}>
          <Text style={styles.devButtonText}>🛠 Developer Tools</Text>
        </Pressable>
      ) : null}
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

function Row({
  label,
  value,
  actionLabel,
  onPress,
}: {
  label: string;
  value: string;
  actionLabel?: string;
  onPress?: () => void;
}) {
  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      <View style={styles.rowRight}>
        <Text style={styles.rowValue}>{value}</Text>
        {actionLabel && onPress ? (
          <Pressable onPress={onPress} hitSlop={8}>
            <Text style={styles.rowAction}>{actionLabel}</Text>
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}

function UnitButton({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
  return (
    <Pressable style={[styles.unitButton, active && styles.unitButtonActive]} onPress={onPress}>
      <Text style={[styles.unitButtonText, active && styles.unitButtonTextActive]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  content: { padding: spacing.lg },
  title: { fontSize: fontSize.xl, fontWeight: "800", color: colors.ink, marginBottom: spacing.md },
  section: { marginBottom: spacing.lg },
  sectionTitle: { fontSize: fontSize.sm, fontWeight: "800", color: colors.inkMuted, marginBottom: spacing.sm, letterSpacing: 0.5 },
  sectionCard: {
    backgroundColor: colors.paper,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    gap: spacing.sm,
  },
  row: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  rowLabel: { fontSize: fontSize.sm, color: colors.ink, fontWeight: "600" },
  rowRight: { flexDirection: "row", alignItems: "center", gap: spacing.sm },
  rowValue: { fontSize: fontSize.sm, color: colors.inkMuted },
  rowAction: { fontSize: fontSize.sm, color: colors.tealDark, fontWeight: "700" },
  helpText: { fontSize: fontSize.xs, color: colors.inkMuted, lineHeight: 17 },
  unitToggle: { flexDirection: "row", gap: spacing.sm },
  unitButton: {
    flex: 1,
    paddingVertical: spacing.sm,
    borderRadius: radius.pill,
    alignItems: "center",
    backgroundColor: colors.border,
  },
  unitButtonActive: { backgroundColor: colors.navy },
  unitButtonText: { fontWeight: "700", color: colors.inkMuted, fontSize: fontSize.sm },
  unitButtonTextActive: { color: colors.cream },
  devButton: {
    marginTop: spacing.md,
    backgroundColor: colors.navyDark,
    borderRadius: radius.md,
    paddingVertical: spacing.md,
    alignItems: "center",
  },
  devButtonText: { color: colors.gold, fontWeight: "800", fontSize: fontSize.sm },
});
