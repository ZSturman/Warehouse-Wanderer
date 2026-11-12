import { NavigationContainer, type LinkingOptions } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import React from "react";

import { AddVisitScreen } from "../screens/AddVisitScreen";
import { BadgeDetailScreen } from "../screens/BadgeDetailScreen";
import { DevToolsScreen } from "../screens/DevToolsScreen";
import { NearbyCheckInScreen } from "../screens/NearbyCheckInScreen";
import { SearchScreen } from "../screens/SearchScreen";
import { StatsScreen } from "../screens/StatsScreen";
import { WarehouseDetailScreen } from "../screens/WarehouseDetailScreen";
import { WishlistScreen } from "../screens/WishlistScreen";
import { colors } from "../theme/colors";
import { navigationRef } from "./navigationRef";
import { TabNavigator } from "./TabNavigator";
import type { RootStackParamList } from "./types";

const Stack = createNativeStackNavigator<RootStackParamList>();

const navTheme = {
  dark: false,
  colors: {
    primary: colors.navy,
    background: colors.cream,
    card: colors.paper,
    text: colors.ink,
    border: colors.border,
    notification: colors.gold,
  },
  fonts: {
    regular: { fontFamily: "System", fontWeight: "400" as const },
    medium: { fontFamily: "System", fontWeight: "500" as const },
    bold: { fontFamily: "System", fontWeight: "700" as const },
    heavy: { fontFamily: "System", fontWeight: "800" as const },
  },
};

// Enables `warehousewanderer://<path>` deep links to any screen — useful for
// notifications/universal links later, and for driving the app on simulators
// where no touch input is available (see README "Testing without a GUI
// simulator" and `src/dev/DevDeepLinkHandler.tsx`, which layers on top of
// this for actions that also mutate state, e.g. `warehousewanderer://e2e/...`).
const linking: LinkingOptions<RootStackParamList> = {
  prefixes: ["warehousewanderer://"],
  config: {
    screens: {
      Tabs: {
        screens: {
          Home: "home",
          Explore: "explore",
          Passport: "passport",
          Badges: "badges",
          Settings: "settings",
        },
      },
      WarehouseDetail: "warehouse/:warehouseId",
      Search: "search",
      Wishlist: "wishlist",
      Stats: "stats",
      BadgeDetail: "badge/:badgeId",
      AddVisit: "add-visit/:warehouseId",
      NearbyCheckIn: "nearby-checkin",
      DevTools: "dev-tools",
    },
  },
};

export function RootNavigator() {
  return (
    <NavigationContainer ref={navigationRef} theme={navTheme} linking={linking}>
      <Stack.Navigator
        screenOptions={{
          headerStyle: { backgroundColor: colors.paper },
          headerTintColor: colors.ink,
          headerTitleStyle: { fontWeight: "700" as const },
          headerBackButtonDisplayMode: "minimal",
        }}
      >
        <Stack.Screen name="Tabs" component={TabNavigator} options={{ headerShown: false }} />
        <Stack.Screen name="WarehouseDetail" component={WarehouseDetailScreen} options={{ title: "" }} />
        <Stack.Screen name="Search" component={SearchScreen} options={{ title: "Search" }} />
        <Stack.Screen name="Wishlist" component={WishlistScreen} options={{ title: "" }} />
        <Stack.Screen name="Stats" component={StatsScreen} options={{ title: "" }} />
        <Stack.Screen name="BadgeDetail" component={BadgeDetailScreen} options={{ title: "" }} />
        <Stack.Screen
          name="AddVisit"
          component={AddVisitScreen}
          options={{ presentation: "modal", title: "" }}
        />
        <Stack.Screen
          name="NearbyCheckIn"
          component={NearbyCheckInScreen}
          options={{ presentation: "modal", headerShown: false }}
        />
        <Stack.Screen name="DevTools" component={DevToolsScreen} options={{ title: "Developer Tools" }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
