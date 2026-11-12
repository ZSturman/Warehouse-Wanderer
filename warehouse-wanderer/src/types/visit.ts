export type VisitVerification = "manual" | "location_confirmed";

/**
 * A single passport entry. A warehouse can have many visits (a user may
 * stop by the same Costco many times), but only counts once toward the
 * unique-location total — see `src/statistics/computeStats.ts`.
 */
export interface Visit {
  id: string;
  warehouseId: string;
  /** ISO-8601 date (yyyy-mm-dd) the user says they visited. */
  visitedAt: string;
  verification: VisitVerification;
  notes?: string;
  isFavorite: boolean;
  /** ISO-8601 timestamp of when this record was created on-device. */
  createdAt: string;
}

export interface CreateVisitInput {
  warehouseId: string;
  visitedAt: string;
  verification: VisitVerification;
  notes?: string;
  isFavorite?: boolean;
}
