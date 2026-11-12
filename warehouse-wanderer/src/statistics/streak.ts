import type { Visit } from "../types";

/** ISO year-week key, e.g. "2026-W03". Weeks run Monday-Sunday. */
function isoWeekKey(date: Date): string {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const weekNum = Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
  return `${d.getUTCFullYear()}-W${String(weekNum).padStart(2, "0")}`;
}

function startOfWeek(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay() || 7;
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() - (day - 1));
  return d;
}

/**
 * "Wanderer streak" = consecutive weeks (Mon-Sun) with at least one logged
 * visit, counted back from the current week. A visit last week keeps the
 * streak alive through the end of this week (a one-week grace period) so
 * the number doesn't reset to zero the instant Monday ticks over; a gap of
 * a full extra week breaks it.
 */
export function computeCurrentStreakWeeks(visits: Visit[], now: Date = new Date()): number {
  if (visits.length === 0) return 0;

  // `visitedAt` is a plain "YYYY-MM-DD" calendar date with no timezone of its
  // own. Appending a local (not UTC) time keeps it anchored to the same
  // calendar day regardless of the device's timezone offset — parsing it as
  // UTC (via `new Date(v.visitedAt)`) would silently shift it a day in
  // either direction once local getters below (getDate, getDay, ...) apply.
  const weeksWithVisits = new Set(visits.map((v) => isoWeekKey(new Date(`${v.visitedAt}T00:00:00`))));

  const currentWeekStart = startOfWeek(now);
  const cursor = new Date(currentWeekStart);

  // Find the most recent active week at or before this week.
  let mostRecentActiveOffset: number | null = null;
  for (let offset = 0; offset <= 1; offset++) {
    const probe = new Date(currentWeekStart);
    probe.setDate(probe.getDate() - offset * 7);
    if (weeksWithVisits.has(isoWeekKey(probe))) {
      mostRecentActiveOffset = offset;
      break;
    }
  }
  if (mostRecentActiveOffset == null) return 0;

  cursor.setDate(cursor.getDate() - mostRecentActiveOffset * 7);
  let streak = 0;
  while (weeksWithVisits.has(isoWeekKey(cursor))) {
    streak += 1;
    cursor.setDate(cursor.getDate() - 7);
  }
  return streak;
}
