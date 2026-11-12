export interface AppSettings {
  /**
   * The warehouse the user has designated as "home", used for the
   * "Far From Home" achievements and the "farthest visited" stat. Defaults
   * to the warehouse of the user's first visit if never set explicitly.
   */
  homeWarehouseId?: string;
  /** Meters. How close a user must be to a warehouse to check in. */
  proximityThresholdMeters: number;
  /** Whether onboarding / the location-permission rationale has been shown. */
  hasSeenLocationRationale: boolean;
  distanceUnit: "mi" | "km";
}

export const DEFAULT_SETTINGS: AppSettings = {
  proximityThresholdMeters: 400,
  hasSeenLocationRationale: false,
  distanceUnit: "mi",
};
