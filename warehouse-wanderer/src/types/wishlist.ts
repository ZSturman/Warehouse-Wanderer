export interface WishlistItem {
  id: string;
  warehouseId: string;
  /** ISO-8601 timestamp of when the item was added. */
  addedAt: string;
}
