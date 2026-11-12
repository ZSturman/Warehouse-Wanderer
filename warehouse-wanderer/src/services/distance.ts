/** Haversine great-circle distance between two coordinates, in meters. */
export function distanceMeters(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
): number {
  const R = 6371000;
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export function metersToMiles(m: number): number {
  return m / 1609.344;
}

export function metersToKm(m: number): number {
  return m / 1000;
}

export function formatDistance(m: number | null, unit: "mi" | "km"): string {
  if (m == null) return "—";
  const value = unit === "mi" ? metersToMiles(m) : metersToKm(m);
  if (value < 0.1) return unit === "mi" ? "< 0.1 mi" : "< 0.1 km";
  return `${value < 10 ? value.toFixed(1) : Math.round(value)} ${unit}`;
}
