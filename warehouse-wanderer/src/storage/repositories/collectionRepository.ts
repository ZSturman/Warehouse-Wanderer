import { KeyValueStore } from "../AsyncStorageAdapter";

/**
 * Generic "array of records with an id" persistence helper. Both Visits and
 * Wishlist are exactly this shape, so they share this implementation
 * instead of duplicating load/save/mutate logic.
 */
export function createCollectionRepository<T extends { id: string }>(storageKey: string) {
  return {
    async getAll(): Promise<T[]> {
      return (await KeyValueStore.get<T[]>(storageKey)) ?? [];
    },

    async replaceAll(items: T[]): Promise<void> {
      await KeyValueStore.set(storageKey, items);
    },

    async add(item: T): Promise<T[]> {
      const current = await this.getAll();
      const next = [...current, item];
      await this.replaceAll(next);
      return next;
    },

    async update(id: string, patch: Partial<T>): Promise<T[]> {
      const current = await this.getAll();
      const next = current.map((item) => (item.id === id ? { ...item, ...patch } : item));
      await this.replaceAll(next);
      return next;
    },

    async remove(id: string): Promise<T[]> {
      const current = await this.getAll();
      const next = current.filter((item) => item.id !== id);
      await this.replaceAll(next);
      return next;
    },

    async clear(): Promise<void> {
      await KeyValueStore.remove(storageKey);
    },
  };
}
