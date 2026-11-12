import { KeyValueStore } from "../AsyncStorageAdapter";
import { StorageKeys } from "../StorageKeys";

/** Maps badge id -> ISO timestamp of when it was first unlocked. */
export type BadgeUnlockMap = Record<string, string>;

export const BadgeUnlocksRepository = {
  async getAll(): Promise<BadgeUnlockMap> {
    return (await KeyValueStore.get<BadgeUnlockMap>(StorageKeys.badgeUnlocks)) ?? {};
  },

  async recordUnlocks(newlyUnlockedIds: string[]): Promise<BadgeUnlockMap> {
    if (newlyUnlockedIds.length === 0) return this.getAll();
    const current = await this.getAll();
    const now = new Date().toISOString();
    const next = { ...current };
    for (const id of newlyUnlockedIds) {
      if (!next[id]) next[id] = now;
    }
    await KeyValueStore.set(StorageKeys.badgeUnlocks, next);
    return next;
  },

  async reset(): Promise<void> {
    await KeyValueStore.remove(StorageKeys.badgeUnlocks);
  },
};
