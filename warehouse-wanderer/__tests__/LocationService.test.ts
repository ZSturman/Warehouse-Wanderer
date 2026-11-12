jest.mock("expo-location", () => ({
  PermissionStatus: { GRANTED: "granted", DENIED: "denied", UNDETERMINED: "undetermined" },
  Accuracy: { Balanced: 3 },
  getForegroundPermissionsAsync: jest.fn(),
  requestForegroundPermissionsAsync: jest.fn(),
  hasServicesEnabledAsync: jest.fn(),
  getCurrentPositionAsync: jest.fn(),
}));

import * as Location from "expo-location";
import { LocationService } from "../src/services/LocationService";

const mocked = Location as jest.Mocked<typeof Location>;

beforeEach(() => {
  jest.clearAllMocks();
  LocationService.simulateLocation(null);
});

describe("LocationService permission failure paths", () => {
  it("reports denied without attempting a GPS fetch", async () => {
    mocked.getForegroundPermissionsAsync.mockResolvedValue({ status: "denied" } as any);

    const result = await LocationService.getCurrentLocation();

    expect(result.status).toBe("denied");
    expect(mocked.getCurrentPositionAsync).not.toHaveBeenCalled();
  });

  it("reports unavailable when location services are off device-wide", async () => {
    mocked.getForegroundPermissionsAsync.mockResolvedValue({ status: "granted" } as any);
    mocked.hasServicesEnabledAsync.mockResolvedValue(false);

    const result = await LocationService.getCurrentLocation();

    expect(result.status).toBe("unavailable");
  });

  it("surfaces an error result if the native call throws", async () => {
    mocked.getForegroundPermissionsAsync.mockResolvedValue({ status: "granted" } as any);
    mocked.hasServicesEnabledAsync.mockResolvedValue(true);
    mocked.getCurrentPositionAsync.mockRejectedValue(new Error("GPS timeout"));

    const result = await LocationService.getCurrentLocation();

    expect(result.status).toBe("error");
    if (result.status === "error") expect(result.message).toBe("GPS timeout");
  });

  it("returns a successful fix with accuracy when everything works", async () => {
    mocked.getForegroundPermissionsAsync.mockResolvedValue({ status: "granted" } as any);
    mocked.hasServicesEnabledAsync.mockResolvedValue(true);
    mocked.getCurrentPositionAsync.mockResolvedValue({
      coords: { latitude: 47.6, longitude: -122.3, accuracy: 12 },
      timestamp: 1700000000000,
    } as any);

    const result = await LocationService.getCurrentLocation();

    expect(result.status).toBe("success");
    if (result.status === "success") {
      expect(result.location.latitude).toBe(47.6);
      expect(result.location.accuracyMeters).toBe(12);
    }
  });
});

describe("LocationService dev simulation", () => {
  it("short-circuits real GPS calls once a location is simulated", async () => {
    LocationService.simulateLocation({ latitude: 1, longitude: 2, accuracyMeters: 5, timestamp: 123 });

    const result = await LocationService.getCurrentLocation();

    expect(result.status).toBe("success");
    if (result.status === "success") expect(result.location.latitude).toBe(1);
    expect(mocked.getCurrentPositionAsync).not.toHaveBeenCalled();
  });

  it("resumes real GPS once the simulation is cleared", async () => {
    LocationService.simulateLocation({ latitude: 1, longitude: 2, accuracyMeters: 5, timestamp: 123 });
    LocationService.simulateLocation(null);
    mocked.getForegroundPermissionsAsync.mockResolvedValue({ status: "denied" } as any);

    const result = await LocationService.getCurrentLocation();

    expect(result.status).toBe("denied");
  });
});
