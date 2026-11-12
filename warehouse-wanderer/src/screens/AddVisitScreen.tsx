import type { RouteProp } from "@react-navigation/native";
import { useNavigation, useRoute } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import React, { useState } from "react";
import { Pressable, StyleSheet, Switch, Text, TextInput, View } from "react-native";

import { VisitDateField } from "../components/VisitDateField";
import { ScreenContainer } from "../components/ScreenContainer";
import type { RootStackParamList } from "../navigation/types";
import { usePassport } from "../state/PassportContext";
import { colors } from "../theme/colors";
import { fontSize, radius, spacing } from "../theme/spacing";
import { isValidVisitDate, todayIsoDate } from "../utils/formatters";

type Route = RouteProp<RootStackParamList, "AddVisit">;
type Nav = NativeStackNavigationProp<RootStackParamList>;

export function AddVisitScreen() {
  const { params } = useRoute<Route>();
  const navigation = useNavigation<Nav>();
  const { getWarehouseById, addVisit } = usePassport();
  const warehouse = getWarehouseById(params.warehouseId);

  const [visitedAt, setVisitedAt] = useState(todayIsoDate());
  const [notes, setNotes] = useState("");
  const [isFavorite, setIsFavorite] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  if (!warehouse) {
    return (
      <ScreenContainer>
        <Text style={styles.notFound}>Warehouse not found.</Text>
      </ScreenContainer>
    );
  }

  const isLocationConfirmed = params.verification === "location_confirmed";

  const leaveEntry = () => {
    if (navigation.canGoBack()) navigation.goBack();
    else navigation.replace("WarehouseDetail", { warehouseId: params.warehouseId });
  };

  const handleSave = async () => {
    if (!isValidVisitDate(visitedAt)) {
      setError("Choose a valid visit date on or before today.");
      return;
    }
    setError(null);
    setSaving(true);
    try {
      await addVisit({
        warehouseId: warehouse.id,
        visitedAt,
        verification: params.verification,
        notes: notes.trim() || undefined,
        isFavorite,
      });
      leaveEntry();
    } catch {
      setError("Could not save this visit. Your entry is still here — please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <ScreenContainer scroll contentContainerStyle={styles.content}>
      <Text style={styles.title}>
        {isLocationConfirmed ? "Confirm Check-In" : "Add to Passport"}
      </Text>
      <Text style={styles.subtitle}>{warehouse.name}</Text>
      <Text style={styles.address}>
        {warehouse.city}, {warehouse.region} · {warehouse.country}
      </Text>

      {isLocationConfirmed ? (
        <View style={styles.verifiedBanner}>
          <Text style={styles.verifiedBannerText}>📍 We confirmed you're near this warehouse right now.</Text>
        </View>
      ) : (
        <View style={styles.manualBanner}>
          <Text style={styles.manualBannerText}>
            ✏️ Manual entry — this visit will be marked as self-reported, distinct from a GPS check-in.
          </Text>
        </View>
      )}

      <Text style={styles.label}>Visit date</Text>
      <VisitDateField value={visitedAt} onChange={setVisitedAt} />

      <Text style={styles.label}>Notes (optional)</Text>
      <TextInput
        style={styles.notesInput}
        placeholder="What did you pick up? Anything memorable?"
        placeholderTextColor={colors.inkMuted}
        value={notes}
        onChangeText={setNotes}
        multiline
        numberOfLines={3}
      />

      <View style={styles.favoriteRow}>
        <Text style={styles.label}>Mark as favorite</Text>
        <Switch value={isFavorite} onValueChange={setIsFavorite} trackColor={{ true: colors.gold }} />
      </View>

      {error ? <Text accessibilityRole="alert" style={{ color: colors.danger, marginTop: spacing.md }}>{error}</Text> : null}
      <Pressable style={[styles.saveButton, saving && styles.saveButtonDisabled]} onPress={handleSave} disabled={saving}>
        <Text style={styles.saveButtonText}>{saving ? "Saving…" : "Save to Passport"}</Text>
      </Pressable>
      <Pressable style={styles.cancelButton} onPress={leaveEntry}>
        <Text style={styles.cancelButtonText}>Cancel</Text>
      </Pressable>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: { padding: spacing.lg },
  notFound: { padding: spacing.lg, color: colors.inkMuted },
  title: { fontSize: fontSize.xl, fontWeight: "800", color: colors.ink },
  subtitle: { fontSize: fontSize.md, fontWeight: "700", color: colors.ink, marginTop: spacing.sm },
  address: { fontSize: fontSize.sm, color: colors.inkMuted, marginBottom: spacing.md },
  verifiedBanner: {
    backgroundColor: `${colors.teal}22`,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.lg,
  },
  verifiedBannerText: { color: colors.tealDark, fontWeight: "600", fontSize: fontSize.sm },
  manualBanner: {
    backgroundColor: colors.border,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.lg,
  },
  manualBannerText: { color: colors.inkMuted, fontSize: fontSize.sm },
  label: { fontSize: fontSize.sm, fontWeight: "700", color: colors.ink, marginBottom: spacing.xs, marginTop: spacing.md },
  dateButton: {
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.paper,
    borderRadius: radius.md,
    padding: spacing.md,
  },
  dateButtonText: { fontSize: fontSize.md, color: colors.ink, fontWeight: "600" },
  notesInput: {
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.paper,
    borderRadius: radius.md,
    padding: spacing.md,
    fontSize: fontSize.sm,
    color: colors.ink,
    minHeight: 80,
    textAlignVertical: "top",
  },
  favoriteRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: spacing.md },
  saveButton: {
    backgroundColor: colors.navy,
    borderRadius: radius.md,
    paddingVertical: spacing.md,
    alignItems: "center",
    marginTop: spacing.xl,
  },
  saveButtonDisabled: { opacity: 0.6 },
  saveButtonText: { color: colors.cream, fontWeight: "800", fontSize: fontSize.sm },
  cancelButton: { alignItems: "center", paddingVertical: spacing.md },
  cancelButtonText: { color: colors.inkMuted, fontWeight: "600", fontSize: fontSize.sm },
});
