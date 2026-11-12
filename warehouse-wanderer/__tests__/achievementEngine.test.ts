import { evaluateBadges } from "../src/achievements/achievementEngine";
import type { BadgeDefinition, Visit, Warehouse, WishlistItem } from "../src/types";

function mkWarehouse(id: string, region: string, countryCode: string, lat: number, lon: number): Warehouse {
  return {
    id,
    name: id,
    address: "1 Main St",
    city: id,
    region,
    countryCode,
    country: countryCode,
    latitude: lat,
    longitude: lon,
    format: "warehouse",
    services: [],
  };
}

function mkVisit(warehouseId: string, overrides: Partial<Visit> = {}): Visit {
  return {
    id: `${warehouseId}-${Math.random()}`,
    warehouseId,
    visitedAt: "2025-06-01",
    verification: "manual",
    isFavorite: false,
    createdAt: "2025-06-01T00:00:00.000Z",
    ...overrides,
  };
}

const warehouses = [
  mkWarehouse("w1", "Washington", "US", 47.6, -122.3),
  mkWarehouse("w2", "Oregon", "US", 45.5, -122.6),
  mkWarehouse("w3", "British Columbia", "CA", 49.2, -123.1),
];

function badge(id: string, criteria: BadgeDefinition["criteria"]): BadgeDefinition {
  return { id, name: id, description: id, icon: "🏅", tier: "bronze", category: "milestone", criteria };
}

describe("evaluateBadges", () => {
  it("unlocks a unique-visits badge once the threshold is met, not before", () => {
    const defs = [badge("b1", { type: "unique_visits", threshold: 2 })];
    const one = evaluateBadges(defs, {
      visits: [mkVisit("w1")],
      warehouses,
      wishlist: [],
      unlockedAt: {},
      homeWarehouse: null,
    });
    expect(one[0].unlocked).toBe(false);
    expect(one[0].current).toBe(1);

    const two = evaluateBadges(defs, {
      visits: [mkVisit("w1"), mkVisit("w2")],
      warehouses,
      wishlist: [],
      unlockedAt: {},
      homeWarehouse: null,
    });
    expect(two[0].unlocked).toBe(true);
  });

  it("does not let repeat visits to the same warehouse count toward unique_visits", () => {
    const defs = [badge("b1", { type: "unique_visits", threshold: 2 })];
    const result = evaluateBadges(defs, {
      visits: [mkVisit("w1"), mkVisit("w1"), mkVisit("w1")],
      warehouses,
      wishlist: [],
      unlockedAt: {},
      homeWarehouse: null,
    });
    expect(result[0].current).toBe(1);
    expect(result[0].unlocked).toBe(false);
  });

  it("counts total_visits including repeats", () => {
    const defs = [badge("b1", { type: "total_visits", threshold: 3 })];
    const result = evaluateBadges(defs, {
      visits: [mkVisit("w1"), mkVisit("w1"), mkVisit("w1")],
      warehouses,
      wishlist: [],
      unlockedAt: {},
      homeWarehouse: null,
    });
    expect(result[0].current).toBe(3);
    expect(result[0].unlocked).toBe(true);
  });

  it("tracks distinct regions and countries", () => {
    const defs = [
      badge("regions", { type: "regions_visited", threshold: 2 }),
      badge("countries", { type: "countries_visited", threshold: 2 }),
    ];
    const result = evaluateBadges(defs, {
      visits: [mkVisit("w1"), mkVisit("w3")],
      warehouses,
      wishlist: [],
      unlockedAt: {},
      homeWarehouse: null,
    });
    expect(result[0].current).toBe(2); // Washington + British Columbia
    expect(result[0].unlocked).toBe(true);
    expect(result[1].current).toBe(2); // US + CA
    expect(result[1].unlocked).toBe(true);
  });

  it("unlocks a specific-warehouse badge only for that exact warehouse", () => {
    const defs = [badge("original", { type: "specific_warehouse", warehouseId: "w1" })];
    const missed = evaluateBadges(defs, {
      visits: [mkVisit("w2")],
      warehouses,
      wishlist: [],
      unlockedAt: {},
      homeWarehouse: null,
    });
    expect(missed[0].unlocked).toBe(false);

    const hit = evaluateBadges(defs, {
      visits: [mkVisit("w1")],
      warehouses,
      wishlist: [],
      unlockedAt: {},
      homeWarehouse: null,
    });
    expect(hit[0].unlocked).toBe(true);
  });

  it("unlocks a distance-from-home badge only when a visited warehouse is far enough", () => {
    const defs = [badge("far", { type: "distance_from_home", km: 300 })];
    const home = warehouses[0]; // Seattle-ish
    const near = evaluateBadges(defs, {
      visits: [mkVisit("w1"), mkVisit("w2")], // Portland is ~230km from Seattle
      warehouses,
      wishlist: [],
      unlockedAt: {},
      homeWarehouse: home,
    });
    expect(near[0].unlocked).toBe(false);

    const farWithLA = evaluateBadges(defs, {
      visits: [mkVisit("w1"), mkVisit("w4")],
      warehouses: [...warehouses, mkWarehouse("w4", "California", "US", 34.0, -118.2)],
      wishlist: [],
      unlockedAt: {},
      homeWarehouse: home,
    });
    expect(farWithLA[0].unlocked).toBe(true);
  });

  it("counts location-confirmed visits separately from manual ones", () => {
    const defs = [badge("verified", { type: "location_confirmed_visits", threshold: 2 })];
    const result = evaluateBadges(defs, {
      visits: [
        mkVisit("w1", { verification: "location_confirmed" }),
        mkVisit("w2", { verification: "manual" }),
        mkVisit("w3", { verification: "location_confirmed" }),
      ],
      warehouses,
      wishlist: [],
      unlockedAt: {},
      homeWarehouse: null,
    });
    expect(result[0].current).toBe(2);
    expect(result[0].unlocked).toBe(true);
  });

  it("counts wishlist conversions: visiting a warehouse that was wishlisted", () => {
    const defs = [badge("conv", { type: "wishlist_conversions", threshold: 1 })];
    const wishlist: WishlistItem[] = [{ id: "wish1", warehouseId: "w2", addedAt: "2025-01-01T00:00:00.000Z" }];

    const beforeVisit = evaluateBadges(defs, {
      visits: [mkVisit("w1")],
      warehouses,
      wishlist,
      unlockedAt: {},
      homeWarehouse: null,
    });
    expect(beforeVisit[0].unlocked).toBe(false);

    const afterVisit = evaluateBadges(defs, {
      visits: [mkVisit("w1"), mkVisit("w2")],
      warehouses,
      wishlist,
      unlockedAt: {},
      homeWarehouse: null,
    });
    expect(afterVisit[0].unlocked).toBe(true);
  });

  it("detects a fully-swept region only once every warehouse in it is visited", () => {
    const defs = [badge("sweep", { type: "region_swept" })];
    const twoInWashington = [...warehouses, mkWarehouse("w1b", "Washington", "US", 47.7, -122.2)];

    const partial = evaluateBadges(defs, {
      visits: [mkVisit("w1")],
      warehouses: twoInWashington,
      wishlist: [],
      unlockedAt: {},
      homeWarehouse: null,
    });
    expect(partial[0].unlocked).toBe(false);

    const complete = evaluateBadges(defs, {
      visits: [mkVisit("w1"), mkVisit("w1b")],
      warehouses: twoInWashington,
      wishlist: [],
      unlockedAt: {},
      homeWarehouse: null,
    });
    expect(complete[0].unlocked).toBe(true);
  });

  it("preserves a previously-recorded unlock timestamp", () => {
    const defs = [badge("b1", { type: "unique_visits", threshold: 1 })];
    const result = evaluateBadges(defs, {
      visits: [mkVisit("w1")],
      warehouses,
      wishlist: [],
      unlockedAt: { b1: "2025-01-01T00:00:00.000Z" },
      homeWarehouse: null,
    });
    expect(result[0].unlockedAt).toBe("2025-01-01T00:00:00.000Z");
  });
});
