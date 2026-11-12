import type { NavigatorScreenParams } from "@react-navigation/native";

export type TabParamList = {
  Home: undefined;
  Explore: undefined;
  Passport: undefined;
  Badges: undefined;
  Settings: undefined;
};

export type RootStackParamList = {
  Tabs: NavigatorScreenParams<TabParamList>;
  WarehouseDetail: { warehouseId: string };
  Search: undefined;
  Wishlist: undefined;
  Stats: undefined;
  BadgeDetail: { badgeId: string };
  AddVisit: { warehouseId: string; verification: "manual" | "location_confirmed" };
  NearbyCheckIn: undefined;
  DevTools: undefined;
};

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}
