import * as Location from "expo-location";

export type LocationPermissionState = "granted" | "denied" | "undetermined";

export interface DeviceLocation {
  latitude: number;
  longitude: number;
  /** GPS accuracy radius in meters, when the platform reports one. */
  accuracyMeters: number | null;
  timestamp: number;
}

export type LocationResult =
  | { status: "success"; location: DeviceLocation }
  | { status: "denied" }
  | { status: "unavailable" }
  | { status: "error"; message: string };

/**
 * A GPS fix is only "accurate enough" to trust for a check-in if its
 * reported accuracy radius is within this bound. Prevents a low-quality fix
 * (e.g. cell-tower-only positioning) from falsely confirming a visit to a
 * warehouse that's actually a mile away.
 */
export const MAX_TRUSTED_ACCURACY_METERS = 100;

/**
 * Thin wrapper around expo-location. Centralizing permission + fetch logic
 * here means the UI only has to handle the small `LocationResult` union
 * instead of expo's broader API surface, and it gives the dev tools a single
 * seam to inject a simulated position (see `simulateLocation` below) without
 * any production code path knowing the difference.
 */
class LocationServiceImpl {
  /** Dev-only override, set from the hidden Developer Tools screen. */
  private devOverride: DeviceLocation | null = null;

  async getPermissionStatus(): Promise<LocationPermissionState> {
    const { status } = await Location.getForegroundPermissionsAsync();
    return mapStatus(status);
  }

  async requestPermission(): Promise<LocationPermissionState> {
    const { status } = await Location.requestForegroundPermissionsAsync();
    return mapStatus(status);
  }

  async getCurrentLocation(): Promise<LocationResult> {
    if (__DEV__ && this.devOverride) {
      return { status: "success", location: this.devOverride };
    }

    const permission = await this.getPermissionStatus();
    if (permission === "denied") return { status: "denied" };

    try {
      const servicesOn = await Location.hasServicesEnabledAsync();
      if (!servicesOn) return { status: "unavailable" };

      const position = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      return {
        status: "success",
        location: {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracyMeters: position.coords.accuracy ?? null,
          timestamp: position.timestamp,
        },
      };
    } catch (error) {
      return {
        status: "error",
        message: error instanceof Error ? error.message : "Unknown location error",
      };
    }
  }

  /** Dev Tools only: pin the "current location" to an arbitrary point. */
  simulateLocation(location: DeviceLocation | null) {
    if (!__DEV__) return;
    this.devOverride = location;
  }

  isSimulating(): boolean {
    return __DEV__ && this.devOverride != null;
  }
}

function mapStatus(status: Location.PermissionStatus): LocationPermissionState {
  switch (status) {
    case Location.PermissionStatus.GRANTED:
      return "granted";
    case Location.PermissionStatus.DENIED:
      return "denied";
    default:
      return "undetermined";
  }
}

export const LocationService = new LocationServiceImpl();
