import type { Warehouse } from "../../types";

/**
 * Abstraction over "where do warehouse locations come from".
 *
 * Costco does not publish an official, keyless, ToS-friendly public API for
 * bulk warehouse data, and this prototype intentionally avoids scraping
 * costco.com. Instead, the app ships a realistic local dataset
 * (`LocalCostcoLocationProvider`) behind this interface, so swapping in a
 * production data source later — a licensed locations API, a company-run
 * backend that periodically ingests store data, or a partner feed — only
 * means writing a new class that implements this interface. Nothing in
 * `src/screens`, `src/state`, or `src/statistics` needs to change.
 *
 * See the "Location data source" section of the README for more detail and
 * for what a production integration would require.
 */
export interface CostcoLocationProvider {
  /** All known warehouses. Cheap enough to keep in memory for a prototype. */
  getAllWarehouses(): Promise<Warehouse[]>;
  getWarehouseById(id: string): Promise<Warehouse | undefined>;
  /** Free-text search across name, city, region, country, and warehouse number. */
  search(query: string): Promise<Warehouse[]>;
}
