import * as Haptics from "expo-haptics";
import React, { useEffect, useState } from "react";
import { Modal, Pressable, StyleSheet, Text, View } from "react-native";

import { usePassport } from "../state/PassportContext";
import { colors, tierColor } from "../theme/colors";
import { fontSize, radius, spacing } from "../theme/spacing";

/**
 * Renders the "you just unlocked a badge" celebration whenever one fires,
 * stepping through them one at a time if several unlocked at once (e.g.
 * after Dev Tools populates a big batch of sample history).
 */
export function BadgeUnlockOverlay() {
  const { lastUnlockedBadges, clearLastUnlockedBadges } = usePassport();
  const [index, setIndex] = useState(0);
  const current = lastUnlockedBadges[index];

  useEffect(() => {
    if (lastUnlockedBadges.length === 0) setIndex(0);
  }, [lastUnlockedBadges.length]);

  useEffect(() => {
    if (current) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    }
  }, [current]);

  if (!current) return null;
  const accent = tierColor[current.tier];
  const isLast = index >= lastUnlockedBadges.length - 1;

  const handleDismiss = () => {
    if (isLast) {
      clearLastUnlockedBadges();
    } else {
      setIndex((i) => i + 1);
    }
  };

  return (
    <Modal transparent animationType="fade" visible>
      <View style={styles.backdrop}>
        <View style={styles.card}>
          <Text style={styles.confetti}>🎉</Text>
          <View style={[styles.medallion, { borderColor: accent, backgroundColor: `${accent}22` }]}>
            <Text style={styles.icon}>{current.icon}</Text>
          </View>
          <Text style={styles.title}>Badge Unlocked!</Text>
          <Text style={styles.name}>{current.name}</Text>
          <Text style={styles.description}>{current.description}</Text>
          <Pressable style={styles.button} onPress={handleDismiss}>
            <Text style={styles.buttonText}>{isLast ? "Nice!" : "Next →"}</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: "rgba(15,24,48,0.6)", alignItems: "center", justifyContent: "center", padding: spacing.xl },
  card: {
    backgroundColor: colors.paper,
    borderRadius: radius.lg,
    padding: spacing.xl,
    alignItems: "center",
    width: "100%",
    maxWidth: 320,
  },
  confetti: { fontSize: 32, marginBottom: spacing.sm },
  medallion: {
    width: 88,
    height: 88,
    borderRadius: 44,
    borderWidth: 3,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.md,
  },
  icon: { fontSize: 40 },
  title: { fontSize: fontSize.xs, fontWeight: "800", color: colors.inkMuted, letterSpacing: 1 },
  name: { fontSize: fontSize.lg, fontWeight: "800", color: colors.ink, marginTop: 4, textAlign: "center" },
  description: { fontSize: fontSize.sm, color: colors.inkMuted, textAlign: "center", marginTop: spacing.xs, marginBottom: spacing.lg },
  button: { backgroundColor: colors.navy, borderRadius: radius.pill, paddingHorizontal: spacing.xl, paddingVertical: spacing.sm },
  buttonText: { color: colors.cream, fontWeight: "800" },
});
