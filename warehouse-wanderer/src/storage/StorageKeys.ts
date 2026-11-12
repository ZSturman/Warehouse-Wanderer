export const StorageKeys = {
  visits: "ww:visits:v1",
  wishlist: "ww:wishlist:v1",
  badgeUnlocks: "ww:badgeUnlocks:v1",
  settings: "ww:settings:v1",
} as const;

export const ALL_STORAGE_KEYS = Object.values(StorageKeys);
