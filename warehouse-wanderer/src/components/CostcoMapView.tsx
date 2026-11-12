import React, { useMemo } from "react";
import { Platform, StyleSheet, Text, View } from "react-native";
import MapView, { Marker, PROVIDER_DEFAULT } from "react-native-maps";
import Constants from "expo-constants";

import { WarehouseLocationList } from "./WarehouseLocationList";
import { colors } from "../theme/colors";
import type { Warehouse } from "../types";
import type { DeviceLocation } from "../services/LocationService";

export type MarkerStatus = "visited" | "wishlist" | "nearby" | "unvisited";

interface Props {
  warehouses: Warehouse[];
  statusFor: (warehouse: Warehouse) => MarkerStatus;
  currentLocation: DeviceLocation | null;
  onSelect: (warehouse: Warehouse) => void;
  mapRef?: React.RefObject<MapView | null>;
}

// A Google-native MapView requires an Android API key even when UrlTile is
// layered over it. Do not mount that native view when no key is configured.
const ANDROID_MAP_UNCONFIGURED = Platform.OS === "android" &&
  Constants.expoConfig?.extra?.androidNativeMapsConfigured !== true;

const markerColor: Record<MarkerStatus, string> = {
  visited: colors.visited,
  wishlist: colors.wishlist,
  nearby: colors.nearby,
  unvisited: colors.unvisited,
};

export function CostcoMapView({ warehouses, statusFor, currentLocation, onSelect, mapRef }: Props) {
  const initialRegion = useMemo(() => {
    if (currentLocation) {
      return {
        latitude: currentLocation.latitude,
        longitude: currentLocation.longitude,
        latitudeDelta: 4,
        longitudeDelta: 4,
      };
    }
    return { latitude: 39.5, longitude: -98.35, latitudeDelta: 40, longitudeDelta: 40 };
  }, [currentLocation]);

  if (ANDROID_MAP_UNCONFIGURED) {
    return <WarehouseLocationList warehouses={warehouses} statusFor={statusFor}
      currentLocation={currentLocation} onSelect={onSelect}
      help="Map view requires a configured Google Maps key on Android. Select a warehouse below to inspect it." />;
  }

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        style={StyleSheet.absoluteFill}
        provider={PROVIDER_DEFAULT}
        initialRegion={initialRegion}
        showsUserLocation={currentLocation != null}
        showsMyLocationButton={false}
        toolbarEnabled={false}
      >
        {warehouses.map((warehouse) => {
          const status = statusFor(warehouse);
          return (
            <Marker
              key={warehouse.id}
              coordinate={{ latitude: warehouse.latitude, longitude: warehouse.longitude }}
              pinColor={markerColor[status]}
              onPress={() => onSelect(warehouse)}
            />
          );
        })}
      </MapView>

    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, overflow: "hidden" },
  attribution: {
    position: "absolute",
    bottom: 4,
    left: 4,
    backgroundColor: "rgba(255,255,255,0.8)",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  attributionText: { fontSize: 9, color: "#333" },
});
