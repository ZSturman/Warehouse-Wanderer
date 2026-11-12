import { LocalCostcoLocationProvider } from "./LocalCostcoLocationProvider";
import type { CostcoLocationProvider } from "./CostcoLocationProvider";

export type { CostcoLocationProvider } from "./CostcoLocationProvider";
export { LocalCostcoLocationProvider } from "./LocalCostcoLocationProvider";

/**
 * Single place the rest of the app asks for "the" location provider.
 *
 * Today this always resolves to the local dataset. A production build would
 * branch here — e.g. on `process.env.EXPO_PUBLIC_LOCATIONS_API_URL` — and
 * return a `RemoteCostcoLocationProvider` instead, without touching any
 * calling code.
 */
export function getCostcoLocationProvider(): CostcoLocationProvider {
  return new LocalCostcoLocationProvider();
}
