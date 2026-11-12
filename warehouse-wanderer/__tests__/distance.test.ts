import { distanceMeters, formatDistance, metersToKm, metersToMiles } from "../src/services/distance";

describe("distanceMeters", () => {
  it("returns ~0 for identical coordinates", () => {
    expect(distanceMeters(47.6062, -122.3321, 47.6062, -122.3321)).toBeCloseTo(0, 3);
  });

  it("computes a known great-circle distance (Seattle to Portland, ~233km)", () => {
    const d = distanceMeters(47.6062, -122.3321, 45.5152, -122.6784);
    const km = metersToKm(d);
    expect(km).toBeGreaterThan(220);
    expect(km).toBeLessThan(245);
  });

  it("is symmetric", () => {
    const a = distanceMeters(10, 10, 20, 20);
    const b = distanceMeters(20, 20, 10, 10);
    expect(a).toBeCloseTo(b, 6);
  });
});

describe("unit conversion", () => {
  it("converts meters to miles", () => {
    expect(metersToMiles(1609.344)).toBeCloseTo(1, 5);
  });

  it("converts meters to km", () => {
    expect(metersToKm(1000)).toBe(1);
  });
});

describe("formatDistance", () => {
  it("renders a dash for unknown distance", () => {
    expect(formatDistance(null, "mi")).toBe("—");
  });

  it("renders sub-tenth distances specially", () => {
    expect(formatDistance(50, "mi")).toBe("< 0.1 mi");
  });

  it("renders miles with one decimal under 10", () => {
    expect(formatDistance(1609.344 * 3.2, "mi")).toBe("3.2 mi");
  });

  it("renders whole numbers at 10 or above", () => {
    expect(formatDistance(1609.344 * 42, "mi")).toBe("42 mi");
  });
});
