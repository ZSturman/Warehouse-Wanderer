import type { WishlistItem } from "../../types";
import { StorageKeys } from "../StorageKeys";
import { createCollectionRepository } from "./collectionRepository";

export const WishlistRepository = createCollectionRepository<WishlistItem>(StorageKeys.wishlist);
