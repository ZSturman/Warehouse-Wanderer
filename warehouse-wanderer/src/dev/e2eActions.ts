import { navigationRef } from "../navigation/navigationRef";
import { LocationService } from "../services/LocationService";
import type { CreateVisitInput, Warehouse } from "../types";
import { toLocalIsoDate } from "../utils/formatters";
import { clearAllAppData, populateSampleHistory } from "./sampleData";

export interface E2EActionContext {
  addVisit: (input: CreateVisitInput) => Promise<unknown>;
  addToWishlist: (warehouseId: string) => Promise<void>;
  getWarehouseById: (id: string) => Warehouse | undefined;
  reloadAll: () => Promise<void>;
  warehouses: Warehouse[];
  clearLastUnlockedBadges: () => void;
}

/**
 * The full set of dev-only test actions, shared by every way of triggering
 * them (deep link, CDP eval, or the file-drop command poller below) — see
 * `DevDeepLinkHandler.tsx` and `DevCommandPoller.tsx` for the entry points,
 * and the README's testing section for when to use which.
 */
export function createE2EActionRunner(ctx: E2EActionContext) {
  return async function run(action: string, args: string[]): Promise<void> {
    switch (action) {
      case "populate":
        await populateSampleHistory(ctx.warehouses);
        await ctx.reloadAll();
        break;
      case "add-visit":
        if (args[0]) {
          await ctx.addVisit({
            warehouseId: args[0],
            visitedAt: toLocalIsoDate(),
            verification: "manual",
          });
        }
        break;
      case "wishlist":
        if (args[0]) await ctx.addToWishlist(args[0]);
        break;
      case "simulate": {
        const [lat, lon, accuracy] = args.map(Number);
        if (!Number.isNaN(lat) && !Number.isNaN(lon)) {
          LocationService.simulateLocation({
            latitude: lat,
            longitude: lon,
            accuracyMeters: Number.isNaN(accuracy) ? 15 : accuracy,
            timestamp: Date.now(),
          });
        }
        break;
      }
      case "checkin": {
        const warehouse = args[0] ? ctx.getWarehouseById(args[0]) : undefined;
        if (warehouse) {
          LocationService.simulateLocation({
            latitude: warehouse.latitude,
            longitude: warehouse.longitude,
            accuracyMeters: 12,
            timestamp: Date.now(),
          });
          await ctx.addVisit({
            warehouseId: warehouse.id,
            visitedAt: toLocalIsoDate(),
            verification: "location_confirmed",
          });
        }
        break;
      }
      case "clear":
        await clearAllAppData();
        await ctx.reloadAll();
        break;
      case "goto": {
        // args: [routeName, jsonParams?] — navigates in-process via the
        // navigationRef, e.g. ["WarehouseDetail", '{"warehouseId":"us-401"}'].
        // Deliberately bypasses Linking/URL scheme dispatch (and therefore
        // iOS's "Open in App?" confirmation) since this is a same-process
        // call, not an OS-brokered one.
        const [routeName, paramsJson] = args;
        if (routeName && navigationRef.isReady()) {
          const params = paramsJson ? JSON.parse(paramsJson) : undefined;
          (navigationRef.navigate as (name: string, params?: object) => void)(routeName, params);
        }
        break;
      }
      case "back":
        if (navigationRef.isReady() && navigationRef.canGoBack()) navigationRef.goBack();
        break;
      case "dismiss-badge-modal":
        ctx.clearLastUnlockedBadges();
        break;
      case "refresh-location":
        // Re-reads OS-level permission state (e.g. after `xcrun simctl
        // privacy grant location` / `adb shell pm grant ... ACCESS_FINE_LOCATION`)
        // into context, without needing to relaunch the app.
        await ctx.reloadAll();
        break;
    }
  };
}
