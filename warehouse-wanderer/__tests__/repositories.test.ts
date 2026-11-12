import AsyncStorage from "@react-native-async-storage/async-storage";

import { BadgeUnlocksRepository } from "../src/storage/repositories/BadgeUnlocksRepository";
import { SettingsRepository } from "../src/storage/repositories/SettingsRepository";
import { VisitsRepository } from "../src/storage/repositories/VisitsRepository";
import { WishlistRepository } from "../src/storage/repositories/WishlistRepository";
import type { Visit } from "../src/types";

beforeEach(async () => {
  await AsyncStorage.clear();
});

function mkVisit(id: string, warehouseId: string): Visit {
  return {
    id,
    warehouseId,
    visitedAt: "2025-05-01",
    verification: "manual",
    isFavorite: false,
    createdAt: "2025-05-01T00:00:00.000Z",
  };
}

describe("VisitsRepository", () => {
  it("starts empty", async () => {
    expect(await VisitsRepository.getAll()).toEqual([]);
  });

  it("persists an added visit across separate reads (simulating app restart)", async () => {
    await VisitsRepository.add(mkVisit("v1", "w1"));
    const reread = await VisitsRepository.getAll();
    expect(reread).toHaveLength(1);
    expect(reread[0].id).toBe("v1");
  });

  it("allows multiple visits to the same warehouse (repeat visits)", async () => {
    await VisitsRepository.add(mkVisit("v1", "w1"));
    await VisitsRepository.add(mkVisit("v2", "w1"));
    const all = await VisitsRepository.getAll();
    expect(all).toHaveLength(2);
    expect(new Set(all.map((v) => v.warehouseId)).size).toBe(1);
  });

  it("updates only the targeted visit", async () => {
    await VisitsRepository.add(mkVisit("v1", "w1"));
    await VisitsRepository.add(mkVisit("v2", "w2"));
    await VisitsRepository.update("v1", { notes: "great trip" });
    const all = await VisitsRepository.getAll();
    expect(all.find((v) => v.id === "v1")?.notes).toBe("great trip");
    expect(all.find((v) => v.id === "v2")?.notes).toBeUndefined();
  });

  it("removes a visit by id", async () => {
    await VisitsRepository.add(mkVisit("v1", "w1"));
    await VisitsRepository.add(mkVisit("v2", "w2"));
    await VisitsRepository.remove("v1");
    const all = await VisitsRepository.getAll();
    expect(all.map((v) => v.id)).toEqual(["v2"]);
  });

  it("clears all visits", async () => {
    await VisitsRepository.add(mkVisit("v1", "w1"));
    await VisitsRepository.clear();
    expect(await VisitsRepository.getAll()).toEqual([]);
  });
});

describe("WishlistRepository", () => {
  it("adds and removes wishlist entries independently of visits", async () => {
    await WishlistRepository.add({ id: "wish1", warehouseId: "w9", addedAt: "2025-01-01T00:00:00.000Z" });
    expect(await WishlistRepository.getAll()).toHaveLength(1);
    await WishlistRepository.remove("wish1");
    expect(await WishlistRepository.getAll()).toEqual([]);
  });
});

describe("BadgeUnlocksRepository", () => {
  it("records the first-unlock timestamp and never overwrites it", async () => {
    await BadgeUnlocksRepository.recordUnlocks(["first-stamp"]);
    const first = (await BadgeUnlocksRepository.getAll())["first-stamp"];
    expect(first).toBeTruthy();

    await BadgeUnlocksRepository.recordUnlocks(["first-stamp"]);
    const second = (await BadgeUnlocksRepository.getAll())["first-stamp"];
    expect(second).toBe(first);
  });

  it("resets all recorded unlocks", async () => {
    await BadgeUnlocksRepository.recordUnlocks(["a", "b"]);
    await BadgeUnlocksRepository.reset();
    expect(await BadgeUnlocksRepository.getAll()).toEqual({});
  });
});

describe("SettingsRepository", () => {
  it("returns sensible defaults when nothing has been saved", async () => {
    const settings = await SettingsRepository.get();
    expect(settings.proximityThresholdMeters).toBeGreaterThan(0);
    expect(settings.distanceUnit).toBe("mi");
  });

  it("merges partial updates over the existing settings", async () => {
    await SettingsRepository.update({ distanceUnit: "km" });
    const settings = await SettingsRepository.get();
    expect(settings.distanceUnit).toBe("km");
    expect(settings.proximityThresholdMeters).toBeGreaterThan(0);
  });
});
