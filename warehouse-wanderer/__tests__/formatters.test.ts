import { formatUnlockDate, formatVisitDate, toLocalIsoDate, isValidVisitDate } from "../src/utils/formatters";

describe("toLocalIsoDate", () => {
  it("reads local calendar fields, not UTC ones", () => {
    const date = new Date(2026, 8, 17, 23, 30); // local Sep 17, 2026, 11:30 PM — month is 0-indexed
    expect(toLocalIsoDate(date)).toBe("2026-09-17");
  });

  it("pads single-digit months and days", () => {
    const date = new Date(2026, 0, 5); // Jan 5, 2026
    expect(toLocalIsoDate(date)).toBe("2026-01-05");
  });
});

describe("visit date and unlock date agree on the same calendar day", () => {
  it("a visit logged 'today' and a badge unlocked at the same instant format to the same day", () => {
    // Regression test: visitedAt used to be derived via
    // `date.toISOString().slice(0, 10)` (UTC calendar day), while badge
    // unlock timestamps were always full local-aware ISO instants formatted
    // with toLocaleDateString (local calendar day). Near a UTC day boundary
    // those two disagreed by one day. Both must now agree.
    const now = new Date();
    const visitedAt = toLocalIsoDate(now);
    const unlockTimestamp = now.toISOString();
    expect(formatVisitDate(visitedAt)).toBe(formatUnlockDate(unlockTimestamp));
  });
});

describe("visit date validation", () => {
  it("accepts today and a real leap day", () => {
    expect(isValidVisitDate("2026-10-06", "2026-10-06")).toBe(true);
    expect(isValidVisitDate("2024-02-29", "2026-10-06")).toBe(true);
  });
  it("rejects empty, rolled-over and future dates", () => {
    for (const date of ["", "2026-02-29", "2026-13-01", "2026-10-07", "2026-1-1"]) {
      expect(isValidVisitDate(date, "2026-10-06")).toBe(false);
    }
  });
});
