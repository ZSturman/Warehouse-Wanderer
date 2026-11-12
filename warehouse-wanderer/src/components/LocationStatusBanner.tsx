import React from "react";
import { Linking, Platform, Pressable, StyleSheet, Text, View } from "react-native";
import { colors } from "../theme/colors";
import { fontSize, radius, spacing } from "../theme/spacing";
import type { LocationFetchStatus } from "../state/PassportContext";
import type { LocationPermissionState } from "../services/LocationService";

interface Props {
  permission: LocationPermissionState;
  status: LocationFetchStatus;
  errorMessage?: string | null;
  onRequest: () => void;
  onRetry: () => void;
}

/**
 * A single, reusable place that explains what's going on with location and
 * offers the right next action. Every screen that wants "near me" behavior
 * renders this instead of re-deriving the same copy.
 */
export function LocationStatusBanner({ permission, status, errorMessage, onRequest, onRetry }: Props) {
  if (permission === "granted" && status === "success") return null;

  if (permission === "denied") {
    return (
      <Banner
        icon="🔒"
        title="Location access is off"
        message="Warehouse Wanderer still works fully without it — you can browse, search, and add visits manually. Turn it on in Settings to see distances and nearby check-in."
        actionLabel={Platform.OS === "ios" ? "Open Settings" : "App Settings"}
        onAction={() => Linking.openSettings()}
      />
    );
  }

  if (permission === "undetermined") {
    return (
      <Banner
        icon="📍"
        title="Find warehouses near you"
        message="We use your location only to show distances and let you confirm a visit when you're actually there. We never store a history of everywhere you go."
        actionLabel="Allow Location"
        onAction={onRequest}
      />
    );
  }

  if (status === "unavailable") {
    return (
      <Banner
        icon="🛰️"
        title="Location is unavailable"
        message="Location services seem to be off for this device. Enable them to see nearby warehouses."
        actionLabel="Try Again"
        onAction={onRetry}
      />
    );
  }

  if (status === "error") {
    return (
      <Banner
        icon="⚠️"
        title="Couldn't get your location"
        message={errorMessage ?? "Something went wrong fetching GPS. You can try again or keep browsing manually."}
        actionLabel="Try Again"
        onAction={onRetry}
      />
    );
  }

  return null;
}

function Banner({
  icon,
  title,
  message,
  actionLabel,
  onAction,
}: {
  icon: string;
  title: string;
  message: string;
  actionLabel: string;
  onAction: () => void;
}) {
  return (
    <View style={styles.banner}>
      <Text style={styles.icon}>{icon}</Text>
      <View style={styles.textWrap}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.message}>{message}</Text>
        <Pressable onPress={onAction} style={styles.button} hitSlop={6}>
          <Text style={styles.buttonLabel}>{actionLabel}</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    flexDirection: "row",
    gap: spacing.md,
    backgroundColor: colors.navy,
    borderRadius: radius.lg,
    padding: spacing.md,
    marginBottom: spacing.lg,
  },
  icon: { fontSize: 24 },
  textWrap: { flex: 1, gap: 4 },
  title: { color: colors.cream, fontWeight: "800", fontSize: fontSize.sm },
  message: { color: colors.cream, opacity: 0.85, fontSize: fontSize.xs, lineHeight: 17 },
  button: { marginTop: 4, alignSelf: "flex-start" },
  buttonLabel: { color: colors.gold, fontWeight: "800", fontSize: fontSize.xs },
});
