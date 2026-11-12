/**
 * "YYYY-MM-DD" for a date, using LOCAL calendar fields. Deliberately not
 * `date.toISOString().slice(0, 10)` — that reads UTC fields, which is a
 * different calendar day from local "today" for roughly half of each day in
 * any timezone west of UTC (and the reverse to the east). Every call site
 * that means "the day the user experienced this on" should go through here.
 */
export function toLocalIsoDate(date: Date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function todayIsoDate(): string {
  return toLocalIsoDate();
}

export function formatVisitDate(isoDate: string): string {
  const date = new Date(`${isoDate}T00:00:00`);
  if (Number.isNaN(date.getTime())) return isoDate;
  return date.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
}

export function formatUnlockDate(isoTimestamp: string): string {
  const date = new Date(isoTimestamp);
  if (Number.isNaN(date.getTime())) return isoTimestamp;
  return date.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
}

export function formatWarehouseSubtitle(city: string, region: string, country: string): string {
  return `${city}, ${region} · ${country}`;
}

/** Real local calendar date, never a future visit. */
export function isValidVisitDate(value: string, today: string = todayIsoDate()): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value) || value > today) return false;
  const date = new Date(`${value}T00:00:00`);
  return !Number.isNaN(date.getTime()) && toLocalIsoDate(date) === value;
}
