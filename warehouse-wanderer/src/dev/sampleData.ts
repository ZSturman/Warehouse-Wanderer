import { BadgeUnlocksRepository } from "../storage/repositories/BadgeUnlocksRepository";
import { SettingsRepository } from "../storage/repositories/SettingsRepository";
import { VisitsRepository } from "../storage/repositories/VisitsRepository";
import { WishlistRepository } from "../storage/repositories/WishlistRepository";
import { LocationService } from "../services/LocationService";
import type { Visit, VisitVerification, Warehouse } from "../types";
import { generateId } from "../utils/id";
import { toLocalIsoDate } from "../utils/formatters";

/**
 * Shared sample-data generation used by both the Dev Tools screen buttons
 * and the dev-only deep-link test harness (`DevDeepLinkHandler`) — one
 * implementation, two ways to trigger it, so there's no drift between what a
 * developer taps and what an automated end-to-end check invokes.
 */
export async function populateSampleHistory(warehouses: Warehouse[]): Promise<void> {
  const shuffled = [...warehouses].sort(() => Math.random() - 0.5);
  const sampleSize = Math.min(30, shuffled.length);
  const now = Date.now();
  const newVisits: Visit[] = shuffled.slice(0, sampleSize).flatMap((w, index) => {
    const visitCount = index < 4 ? 2 : 1;
    return Array.from({ length: visitCount }, (_, repeat) => {
      const daysAgo = Math.floor(Math.random() * 400) + repeat * 10;
      const verification: VisitVerification = Math.random() > 0.6 ? "location_confirmed" : "manual";
      const visitedAt = toLocalIsoDate(new Date(now - daysAgo * 86400000));
      const visit: Visit = {
        id: generateId("visit"),
        warehouseId: w.id,
        visitedAt,
        verification,
        isFavorite: index < 3 && repeat === 0,
        createdAt: new Date(now - daysAgo * 86400000).toISOString(),
      };
      return visit;
    });
  });
  const current = await VisitsRepository.getAll();
  await VisitsRepository.replaceAll([...current, ...newVisits]);
}

export async function clearAllAppData(): Promise<void> {
  await VisitsRepository.clear();
  await WishlistRepository.clear();
  await BadgeUnlocksRepository.reset();
  await SettingsRepository.reset();
  LocationService.simulateLocation(null);
}
