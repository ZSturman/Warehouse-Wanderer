import { distanceMeters } from "../services/distance";
import type { DeviceLocation } from "../services/LocationService";
import type { Visit, Warehouse } from "../types";
import { computeCurrentStreakWeeks } from "./streak";

export interface RankedWarehouse {
  warehouse: Warehouse;
  distanceMeters: number;
}

export interface MostVisitedWarehouse {
  warehouse: Warehouse;
  visitCount: number;
}

export interface PassportStats {
  uniqueWarehousesVisited: number;
  totalWarehouses: number;
  totalVisitCount: number;
  percentVisited: number;
  regionsVisited: number;
  totalRegions: number;
  countriesVisited: number;
  totalCountries: number;
  nearestUnvisited: RankedWarehouse | null;
  farthestVisited: RankedWarehouse | null;
  mostVisited: MostVisitedWarehouse | null;
  currentStreakWeeks: number;
}

export interface ComputeStatsInput {
  visits: Visit[];
  warehouses: Warehouse[];
  currentLocation: DeviceLocation | null;
  /** Used as the distance origin for "farthest visited" when GPS isn't available. */
  homeWarehouse: Warehouse | null;
}

export function computeStats({
  visits,
  warehouses,
  currentLocation,
  homeWarehouse,
}: ComputeStatsInput): PassportStats {
  const warehousesById = new Map(warehouses.map((w) => [w.id, w]));
  const visitedIds = new Set(visits.map((v) => v.warehouseId));
  const visitedWarehouses = [...visitedIds]
    .map((id) => warehousesById.get(id))
    .filter((w): w is Warehouse => Boolean(w));

  const regionsVisited = new Set(visitedWarehouses.map((w) => `${w.countryCode}:${w.region}`));
  const countriesVisited = new Set(visitedWarehouses.map((w) => w.countryCode));
  const totalRegions = new Set(warehouses.map((w) => `${w.countryCode}:${w.region}`)).size;
  const totalCountries = new Set(warehouses.map((w) => w.countryCode)).size;

  const visitCountByWarehouse = new Map<string, number>();
  for (const visit of visits) {
    visitCountByWarehouse.set(visit.warehouseId, (visitCountByWarehouse.get(visit.warehouseId) ?? 0) + 1);
  }

  let mostVisited: MostVisitedWarehouse | null = null;
  for (const [warehouseId, visitCount] of visitCountByWarehouse) {
    const warehouse = warehousesById.get(warehouseId);
    if (!warehouse) continue;
    if (!mostVisited || visitCount > mostVisited.visitCount) {
      mostVisited = { warehouse, visitCount };
    }
  }

  const origin = currentLocation
    ? { latitude: currentLocation.latitude, longitude: currentLocation.longitude }
    : homeWarehouse
      ? { latitude: homeWarehouse.latitude, longitude: homeWarehouse.longitude }
      : null;

  let nearestUnvisited: RankedWarehouse | null = null;
  if (origin) {
    for (const warehouse of warehouses) {
      if (visitedIds.has(warehouse.id)) continue;
      const d = distanceMeters(origin.latitude, origin.longitude, warehouse.latitude, warehouse.longitude);
      if (!nearestUnvisited || d < nearestUnvisited.distanceMeters) {
        nearestUnvisited = { warehouse, distanceMeters: d };
      }
    }
  }

  let farthestVisited: RankedWarehouse | null = null;
  if (origin) {
    for (const warehouse of visitedWarehouses) {
      const d = distanceMeters(origin.latitude, origin.longitude, warehouse.latitude, warehouse.longitude);
      if (!farthestVisited || d > farthestVisited.distanceMeters) {
        farthestVisited = { warehouse, distanceMeters: d };
      }
    }
  }

  return {
    uniqueWarehousesVisited: visitedIds.size,
    totalWarehouses: warehouses.length,
    totalVisitCount: visits.length,
    percentVisited: warehouses.length === 0 ? 0 : (visitedIds.size / warehouses.length) * 100,
    regionsVisited: regionsVisited.size,
    totalRegions,
    countriesVisited: countriesVisited.size,
    totalCountries,
    nearestUnvisited,
    farthestVisited,
    mostVisited,
    currentStreakWeeks: computeCurrentStreakWeeks(visits),
  };
}
