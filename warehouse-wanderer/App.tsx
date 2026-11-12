import { StatusBar } from "expo-status-bar";
import React from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { BadgeUnlockOverlay } from "./src/components/BadgeUnlockOverlay";
import { DevCommandPoller } from "./src/dev/DevCommandPoller";
import { DevDeepLinkHandler } from "./src/dev/DevDeepLinkHandler";
import { RootNavigator } from "./src/navigation/RootNavigator";
import { PassportProvider } from "./src/state/PassportContext";

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <PassportProvider>
          <RootNavigator />
          <BadgeUnlockOverlay />
          {__DEV__ ? <DevDeepLinkHandler /> : null}
          {__DEV__ ? <DevCommandPoller /> : null}
          <StatusBar style="dark" />
        </PassportProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
