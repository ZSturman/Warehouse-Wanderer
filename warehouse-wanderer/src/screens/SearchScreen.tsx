import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import React, { useMemo, useState } from "react";
import { FlatList, StyleSheet, Text, TextInput, View } from "react-native";

import { EmptyState } from "../components/EmptyState";
import { ScreenContainer } from "../components/ScreenContainer";
import { WarehouseCard } from "../components/WarehouseCard";
import type { RootStackParamList } from "../navigation/types";
import { distanceMeters } from "../services/distance";
import { usePassport } from "../state/PassportContext";
import { colors } from "../theme/colors";
import { fontSize, radius, spacing } from "../theme/spacing";

type Nav = NativeStackNavigationProp<RootStackParamList>;

export function SearchScreen() {
  const navigation = useNavigation<Nav>();
  const { warehouses, visits, currentLocation, settings, isWishlisted } = usePassport();
  const [query, setQuery] = useState("");

  const visitedIds = useMemo(() => new Set(visits.map((v) => v.warehouseId)), [visits]);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return warehouses
      .filter((w) =>
        [w.name, w.city, w.region, w.country, w.number, w.address]
          .filter(Boolean)
          .some((field) => field!.toLowerCase().includes(q)),
      )
      .slice(0, 50);
  }, [query, warehouses]);

  return (
    <ScreenContainer contentContainerStyle={styles.root}>
      <View style={styles.searchBar}>
        <Text style={styles.searchIcon}>🔎</Text>
        <TextInput
          style={styles.input}
          placeholder="Search by city, state, country, or #"
          placeholderTextColor={colors.inkMuted}
          value={query}
          onChangeText={setQuery}
          autoFocus
          returnKeyType="search"
        />
      </View>

      {query.trim().length === 0 ? (
        <EmptyState icon="🗺️" title="Search warehouses" message="Try a city, state, country, or warehouse number." />
      ) : results.length === 0 ? (
        <EmptyState icon="🤷" title="No matches" message={`Nothing found for "${query}".`} />
      ) : (
        <FlatList
          data={results}
          keyExtractor={(w) => w.id}
          contentContainerStyle={{ padding: spacing.lg }}
          keyboardShouldPersistTaps="handled"
          renderItem={({ item }) => (
            <WarehouseCard
              warehouse={item}
              distanceMeters={
                currentLocation
                  ? distanceMeters(currentLocation.latitude, currentLocation.longitude, item.latitude, item.longitude)
                  : null
              }
              distanceUnit={settings.distanceUnit}
              visited={visitedIds.has(item.id)}
              wishlisted={isWishlisted(item.id)}
              onPress={() => navigation.navigate("WarehouseDetail", { warehouseId: item.id })}
            />
          )}
        />
      )}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, padding: 0 },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    backgroundColor: colors.paper,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    marginHorizontal: spacing.lg,
    marginBottom: spacing.md,
    paddingHorizontal: spacing.md,
  },
  searchIcon: { fontSize: 16 },
  input: { flex: 1, paddingVertical: spacing.md, fontSize: fontSize.md, color: colors.ink },
});
