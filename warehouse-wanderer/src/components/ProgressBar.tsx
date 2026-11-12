import React from "react";
import { StyleSheet, View } from "react-native";
import { colors } from "../theme/colors";
import { radius } from "../theme/spacing";

interface Props {
  progress: number; // 0-1
  color?: string;
  trackColor?: string;
  height?: number;
}

export function ProgressBar({ progress, color = colors.teal, trackColor = colors.border, height = 8 }: Props) {
  const clamped = Math.max(0, Math.min(1, progress));
  return (
    <View style={[styles.track, { backgroundColor: trackColor, height }]}>
      <View style={[styles.fill, { width: `${clamped * 100}%`, backgroundColor: color, height }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  track: { width: "100%", borderRadius: radius.pill, overflow: "hidden" },
  fill: { borderRadius: radius.pill },
});
