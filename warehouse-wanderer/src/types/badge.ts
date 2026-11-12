export type BadgeTier = "bronze" | "silver" | "gold" | "platinum";

/**
 * Data-driven unlock rules. The achievement engine (`src/achievements`)
 * knows how to evaluate every criteria type below against the user's
 * current passport state. Adding a new badge with an *existing* criteria
 * type requires zero engine changes — just append to `badgeDefinitions.ts`.
 */
export type BadgeCriteria =
  | { type: "unique_visits"; threshold: number }
  | { type: "total_visits"; threshold: number }
  | { type: "regions_visited"; threshold: number }
  | { type: "countries_visited"; threshold: number }
  | { type: "region_swept" }
  | { type: "distance_from_home"; km: number }
  | { type: "specific_warehouse"; warehouseId: string }
  | { type: "location_confirmed_visits"; threshold: number }
  | { type: "wishlist_conversions"; threshold: number }
  | { type: "streak_weeks"; threshold: number };

export interface BadgeDefinition {
  id: string;
  name: string;
  description: string;
  /** Emoji glyph rendered inside the badge medallion. */
  icon: string;
  tier: BadgeTier;
  category: "milestone" | "geography" | "dedication" | "explorer" | "special";
  criteria: BadgeCriteria;
}

export interface BadgeProgress {
  definition: BadgeDefinition;
  unlocked: boolean;
  /** ISO-8601 timestamp, set the first time the engine observed it unlocked. */
  unlockedAt?: string;
  current: number;
  target: number;
}
