import { DEFAULT_SETTINGS, type AppSettings } from "../../types/settings";
import { KeyValueStore } from "../AsyncStorageAdapter";
import { StorageKeys } from "../StorageKeys";

export const SettingsRepository = {
  async get(): Promise<AppSettings> {
    const stored = await KeyValueStore.get<AppSettings>(StorageKeys.settings);
    return { ...DEFAULT_SETTINGS, ...stored };
  },

  async update(patch: Partial<AppSettings>): Promise<AppSettings> {
    const current = await this.get();
    const next = { ...current, ...patch };
    await KeyValueStore.set(StorageKeys.settings, next);
    return next;
  },

  async reset(): Promise<void> {
    await KeyValueStore.remove(StorageKeys.settings);
  },
};
