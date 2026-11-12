import { distanceMeters } from "../services/distance";
import { computeCurrentStreakWeeks } from "../statistics/streak";
import type { BadgeDefinition, BadgeProgress, Visit, Warehouse, WishlistItem } from "../types";

export interface AchievementContext {
  visits: Visit[];
  warehouses: Warehouse[];
  wishlist: WishlistItem[];
  /** ISO timestamps of previously-unlocked badges, keyed by badge id. */
  unlockedAt: Record<string, string>;
  /** The user's designated home base, if one has been set/inferred. */
  homeWarehouse: Warehouse | null;
}

/**
 * Evaluates every badge definition against the current passport state.
 *
 * This is the one place that knows how to turn a `BadgeCriteria` into a
 * `{ current, target }` progress pair. New badges that reuse an existing
 * criteria type (the common case — another visit-count milestone, another
 * region threshold, etc.) need no changes here at all; they're just new
 * entries in `badgeDefinitions.ts`.
 */
export function evaluateBadges(
  definitions: BadgeDefinition[],
  ctx: AchievementContext,
): BadgeProgress[] {
  const warehousesById = new Map(ctx.warehouses.map((w) => [w.id, w]));
  const visitedIds = new Set(ctx.visits.map((v) => v.warehouseId));
  const visitedWarehouses = [...visitedIds]
    .map((id) => warehousesById.get(id))
    .filter((w): w is Warehouse => Boolean(w));

  const regionsVisited = new Set(visitedWarehouses.map((w) => `${w.countryCode}:${w.region}`));
  const countriesVisited = new Set(visitedWarehouses.map((w) => w.countryCode));
  const locationConfirmedCount = ctx.visits.filter((v) => v.verification === "location_confirmed").length;
  const streakWeeks = computeCurrentStreakWeeks(ctx.visits);

  const wishlistWarehouseIds = new Set(ctx.wishlist.map((w) => w.warehouseId));
  const wishlistConversions = [...visitedIds].filter((id) => wishlistWarehouseIds.has(id)).length;

  const regionTotals = new Map<string, number>();
  for (const w of ctx.warehouses) {
    const key = `${w.countryCode}:${w.region}`;
    regionTotals.set(key, (regionTotals.get(key) ?? 0) + 1);
  }
  const regionVisitedCounts = new Map<string, number>();
  for (const w of visitedWarehouses) {
    const key = `${w.countryCode}:${w.region}`;
    regionVisitedCounts.set(key, (regionVisitedCounts.get(key) ?? 0) + 1);
  }
  const hasFullySweptRegion = [...regionTotals.entries()].some(
    ([key, total]) => total > 0 && regionVisitedCounts.get(key) === total,
  );

  return definitions.map((definition) => {
    const { current, target } = progressFor(definition, {
      uniqueVisits: visitedIds.size,
      totalVisits: ctx.visits.length,
      regionsVisited: regionsVisited.size,
      countriesVisited: countriesVisited.size,
      hasFullySweptRegion,
      locationConfirmedCount,
      wishlistConversions,
      streakWeeks,
      visitedIds,
      homeWarehouse: ctx.homeWarehouse,
      visitedWarehouses,
    });

    const unlocked = current >= target;
    return {
      definition,
      unlocked,
      unlockedAt: ctx.unlockedAt[definition.id],
      current: Math.min(current, target),
      target,
    };
  });
}

interface ProgressInputs {
  uniqueVisits: number;
  totalVisits: number;
  regionsVisited: number;
  countriesVisited: number;
  hasFullySweptRegion: boolean;
  locationConfirmedCount: number;
  wishlistConversions: number;
  streakWeeks: number;
  visitedIds: Set<string>;
  homeWarehouse: Warehouse | null;
  visitedWarehouses: Warehouse[];
}

function progressFor(
  definition: BadgeDefinition,
  inputs: ProgressInputs,
): { current: number; target: number } {
  const criteria = definition.criteria;
  switch (criteria.type) {
    case "unique_visits":
      return { current: inputs.uniqueVisits, target: criteria.threshold };
    case "total_visits":
      return { current: inputs.totalVisits, target: criteria.threshold };
    case "regions_visited":
      return { current: inputs.regionsVisited, target: criteria.threshold };
    case "countries_visited":
      return { current: inputs.countriesVisited, target: criteria.threshold };
    case "region_swept":
      return { current: inputs.hasFullySweptRegion ? 1 : 0, target: 1 };
    case "location_confirmed_visits":
      return { current: inputs.locationConfirmedCount, target: criteria.threshold };
    case "wishlist_conversions":
      return { current: inputs.wishlistConversions, target: criteria.threshold };
    case "streak_weeks":
      return { current: inputs.streakWeeks, target: criteria.threshold };
    case "specific_warehouse":
      return { current: inputs.visitedIds.has(criteria.warehouseId) ? 1 : 0, target: 1 };
    case "distance_from_home": {
      if (!inputs.homeWarehouse) return { current: 0, target: 1 };
      const maxDistanceKm = Math.max(
        0,
        ...inputs.visitedWarehouses.map((w) =>
          distanceMeters(inputs.homeWarehouse!.latitude, inputs.homeWarehouse!.longitude, w.latitude, w.longitude) / 1000,
        ),
      );
      return { current: maxDistanceKm >= criteria.km ? 1 : 0, target: 1 };
    }
    default:
      return { current: 0, target: 1 };
  }
}
