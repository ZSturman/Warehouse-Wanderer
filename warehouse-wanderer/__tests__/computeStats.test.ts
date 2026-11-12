import { computeStats } from "../src/statistics/computeStats";
import type { Visit, Warehouse } from "../src/types";

const warehouses: Warehouse[] = [
  mkWarehouse("w1", "Seattle", "Washington", "US", "United States", 47.6, -122.3),
  mkWarehouse("w2", "Portland", "Oregon", "US", "United States", 45.5, -122.6),
  mkWarehouse("w3", "Vancouver", "British Columbia", "CA", "Canada", 49.2, -123.1),
  mkWarehouse("w4", "Miami", "Florida", "US", "United States", 25.7, -80.1),
];

function mkWarehouse(
  id: string,
  name: string,
  region: string,
  countryCode: string,
  country: string,
  latitude: number,
  longitude: number,
): Warehouse {
  return {
    id,
    name,
    address: "123 Main St",
    city: name,
    region,
    countryCode,
    country,
    latitude,
    longitude,
    format: "warehouse",
    services: [],
  };
}

function mkVisit(warehouseId: string, visitedAt: string, overrides: Partial<Visit> = {}): Visit {
  return {
    id: `${warehouseId}-${visitedAt}-${Math.random()}`,
    warehouseId,
    visitedAt,
    verification: "manual",
    isFavorite: false,
    createdAt: new Date(visitedAt).toISOString(),
    ...overrides,
  };
}

describe("computeStats", () => {
  it("counts a repeat-visited warehouse only once toward unique total, but counts every visit", () => {
    const visits = [mkVisit("w1", "2025-01-01"), mkVisit("w1", "2025-02-01"), mkVisit("w1", "2025-03-01")];
    const stats = computeStats({ visits, warehouses, currentLocation: null, homeWarehouse: null });
    expect(stats.uniqueWarehousesVisited).toBe(1);
    expect(stats.totalVisitCount).toBe(3);
  });

  it("computes percent visited against the full warehouse catalog", () => {
    const visits = [mkVisit("w1", "2025-01-01"), mkVisit("w2", "2025-01-02")];
    const stats = computeStats({ visits, warehouses, currentLocation: null, homeWarehouse: null });
    expect(stats.uniqueWarehousesVisited).toBe(2);
    expect(stats.totalWarehouses).toBe(4);
    expect(stats.percentVisited).toBeCloseTo(50, 5);
  });

  it("counts distinct regions and countries from visited warehouses only", () => {
    const visits = [mkVisit("w1", "2025-01-01"), mkVisit("w3", "2025-01-02")];
    const stats = computeStats({ visits, warehouses, currentLocation: null, homeWarehouse: null });
    expect(stats.regionsVisited).toBe(2);
    expect(stats.countriesVisited).toBe(2);
  });

  it("finds the most-visited warehouse by visit count", () => {
    const visits = [
      mkVisit("w1", "2025-01-01"),
      mkVisit("w1", "2025-02-01"),
      mkVisit("w1", "2025-03-01"),
      mkVisit("w2", "2025-01-01"),
    ];
    const stats = computeStats({ visits, warehouses, currentLocation: null, homeWarehouse: null });
    expect(stats.mostVisited?.warehouse.id).toBe("w1");
    expect(stats.mostVisited?.visitCount).toBe(3);
  });

  it("finds nearest unvisited and farthest visited relative to current location", () => {
    const visits = [mkVisit("w1", "2025-01-01"), mkVisit("w4", "2025-01-02")];
    const stats = computeStats({
      visits,
      warehouses,
      currentLocation: { latitude: 47.6, longitude: -122.3, accuracyMeters: 10, timestamp: Date.now() },
      homeWarehouse: null,
    });
    // w2 and w3 are unvisited; w3 (Vancouver) is closer to Seattle than w2 (Portland).
    expect(stats.nearestUnvisited?.warehouse.id).toBe("w3");
    // Of the visited set {w1, w4}, w4 (Miami) is far from Seattle.
    expect(stats.farthestVisited?.warehouse.id).toBe("w4");
  });

  it("returns zeroed-out stats with no visits and no warehouses gracefully", () => {
    const stats = computeStats({ visits: [], warehouses: [], currentLocation: null, homeWarehouse: null });
    expect(stats.uniqueWarehousesVisited).toBe(0);
    expect(stats.percentVisited).toBe(0);
    expect(stats.nearestUnvisited).toBeNull();
    expect(stats.mostVisited).toBeNull();
  });
});
