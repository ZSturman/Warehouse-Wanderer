/**
 * A single warehouse-club location.
 *
 * This shape is intentionally provider-agnostic: it's what the app renders,
 * regardless of whether the data came from the bundled dev dataset or a
 * future live API. See `src/data/providers` for the swappable data source.
 */
export type WarehouseFormat = "warehouse" | "business_center";

export type WarehouseService =
  | "gas_station"
  | "pharmacy"
  | "optical"
  | "hearing_aid"
  | "tire_center"
  | "food_court"
  | "photo_center"
  | "liquor"
  | "business_delivery";

export interface Warehouse {
  /** Stable, provider-independent identifier. Never reuse across warehouses. */
  id: string;
  /** Human-facing warehouse number, if the source data has one (e.g. "401"). */
  number?: string;
  /** Short display name, usually the city or neighborhood, e.g. "Seattle". */
  name: string;
  address: string;
  city: string;
  /** State / province / region name. */
  region: string;
  /** ISO 3166-1 alpha-2 country code, e.g. "US", "CA", "JP". */
  countryCode: string;
  /** Full country display name, e.g. "United States". */
  country: string;
  latitude: number;
  longitude: number;
  format: WarehouseFormat;
  services: WarehouseService[];
  /**
   * Optional flag + label for a handful of dataset entries that are
   * historically or culturally notable (used by a couple of achievements).
   */
  notableLabel?: string;
}

export interface WarehouseWithDistance extends Warehouse {
  /** Distance from the user's last known location, in meters. */
  distanceMeters: number | null;
}
