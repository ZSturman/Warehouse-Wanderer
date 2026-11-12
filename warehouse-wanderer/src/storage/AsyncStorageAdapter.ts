import AsyncStorage from "@react-native-async-storage/async-storage";

/**
 * Thin JSON-typed wrapper around AsyncStorage. Every repository in
 * `src/storage/repositories` goes through this, so there's exactly one
 * place that would need to change to move persistence to something else
 * (SQLite, a keychain-backed store, or a cloud-synced backend) later.
 */
export const KeyValueStore = {
  async get<T>(key: string): Promise<T | null> {
    const raw = await AsyncStorage.getItem(key);
    if (raw == null) return null;
    try {
      return JSON.parse(raw) as T;
    } catch {
      return null;
    }
  },

  async set<T>(key: string, value: T): Promise<void> {
    await AsyncStorage.setItem(key, JSON.stringify(value));
  },

  async remove(key: string): Promise<void> {
    await AsyncStorage.removeItem(key);
  },

  async clearAll(keys: string[]): Promise<void> {
    await AsyncStorage.multiRemove(keys);
  },
};
