import React from "react";
import { ScrollView, StyleSheet, View, ViewStyle } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { colors } from "../theme/colors";

interface Props {
  children: React.ReactNode;
  scroll?: boolean;
  style?: ViewStyle;
  contentContainerStyle?: ViewStyle;
}

/** Common page chrome: safe-area background + optional scroll wrapper. */
export function ScreenContainer({ children, scroll = false, style, contentContainerStyle }: Props) {
  if (scroll) {
    return (
      <SafeAreaView style={[styles.safe, style]} edges={["top", "left", "right"]}>
        <ScrollView
          style={styles.flex}
          contentContainerStyle={[styles.scrollContent, contentContainerStyle]}
          keyboardShouldPersistTaps="handled"
        >
          {children}
        </ScrollView>
      </SafeAreaView>
    );
  }
  return (
    <SafeAreaView style={[styles.safe, style]} edges={["top", "left", "right"]}>
      <View style={[styles.flex, contentContainerStyle]}>{children}</View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.cream },
  flex: { flex: 1 },
  // Generous enough to clear the bottom tab bar on every device size when
  // this screen happens to be a tab (stack-pushed screens with no tab bar
  // just get a bit of extra breathing room instead).
  scrollContent: { paddingBottom: 120 },
});
