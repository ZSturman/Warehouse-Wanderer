import { computeCurrentStreakWeeks } from "../src/statistics/streak";
import type { Visit } from "../src/types";

const NOW = new Date("2026-01-14T12:00:00Z"); // a Wednesday

function daysAgoIso(days: number): string {
  return new Date(NOW.getTime() - days * 86400000).toISOString().slice(0, 10);
}

function visitOn(isoDate: string): Visit {
  return {
    id: `visit-${isoDate}`,
    warehouseId: "w1",
    visitedAt: isoDate,
    verification: "manual",
    isFavorite: false,
    createdAt: new Date(isoDate).toISOString(),
  };
}

describe("computeCurrentStreakWeeks", () => {
  it("is 0 with no visits", () => {
    expect(computeCurrentStreakWeeks([], NOW)).toBe(0);
  });

  it("is 1 with a single visit this week", () => {
    const visits = [visitOn(daysAgoIso(1))]; // yesterday, same week
    expect(computeCurrentStreakWeeks(visits, NOW)).toBe(1);
  });

  it("counts two consecutive weeks", () => {
    const visits = [visitOn(daysAgoIso(1)), visitOn(daysAgoIso(8))];
    expect(computeCurrentStreakWeeks(visits, NOW)).toBe(2);
  });

  it("keeps the streak alive on a grace week (last week only, nothing yet this week)", () => {
    const visits = [visitOn(daysAgoIso(9))]; // last week, not this week
    expect(computeCurrentStreakWeeks(visits, NOW)).toBe(1);
  });

  it("resets to 0 when the most recent visit is more than one week stale", () => {
    const visits = [visitOn(daysAgoIso(20))]; // ~3 weeks ago
    expect(computeCurrentStreakWeeks(visits, NOW)).toBe(0);
  });

  it("breaks the streak across a skipped week in the middle", () => {
    // Visit this week and three weeks ago, but nothing one or two weeks ago.
    const visits = [visitOn(daysAgoIso(1)), visitOn(daysAgoIso(22))];
    expect(computeCurrentStreakWeeks(visits, NOW)).toBe(1);
  });

  it("counts four consecutive weeks", () => {
    const visits = [daysAgoIso(1), daysAgoIso(8), daysAgoIso(15), daysAgoIso(22)].map(visitOn);
    expect(computeCurrentStreakWeeks(visits, NOW)).toBe(4);
  });
});
