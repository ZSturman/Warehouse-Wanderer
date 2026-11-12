import React from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import type { Warehouse } from "../types";
import type { DeviceLocation } from "../services/LocationService";
import { colors } from "../theme/colors";

export type MarkerStatus = "visited" | "wishlist" | "nearby" | "unvisited";

export interface WarehouseLocationListProps {
  warehouses: Warehouse[];
  statusFor: (warehouse: Warehouse) => MarkerStatus;
  currentLocation: DeviceLocation | null;
  onSelect: (warehouse: Warehouse) => void;
  mapRef?: unknown;
  help?: string;
}

// Accessible discovery fallback for platforms without a configured map renderer.
export function WarehouseLocationList({ warehouses, statusFor, onSelect, help = "Map view is unavailable on web. Select a warehouse below to inspect it." }: WarehouseLocationListProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Warehouse locations</Text>
      <Text style={styles.help}>{help}</Text>
      <ScrollView>
        {warehouses.length === 0 ? <Text>No warehouses match this filter.</Text> : null}
        {warehouses.map((warehouse) => (
          <Pressable accessibilityRole="button" accessibilityLabel={`${warehouse.name}, ${warehouse.city}`} key={warehouse.id} onPress={() => onSelect(warehouse)} style={styles.row}>
            <Text style={styles.heading}>{warehouse.name}</Text>
            <Text>{warehouse.city}, {warehouse.region} · {statusFor(warehouse)}</Text>
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: colors.paper },
  heading: { fontWeight: "700", color: colors.ink, marginBottom: 4 },
  help: { color: colors.inkMuted, marginBottom: 12 },
  row: { paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: colors.border },
});
