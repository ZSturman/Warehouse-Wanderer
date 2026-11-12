import type { Warehouse } from "../../types";
import { WAREHOUSES } from "../warehouses.dataset";
import type { CostcoLocationProvider } from "./CostcoLocationProvider";

/**
 * Dev/prototype implementation of `CostcoLocationProvider`, backed by the
 * bundled local dataset. A tiny artificial delay simulates network latency
 * so loading states in the UI get exercised the same way they would against
 * a real API.
 */
export class LocalCostcoLocationProvider implements CostcoLocationProvider {
  private readonly warehouses: Warehouse[];

  constructor(warehouses: Warehouse[] = WAREHOUSES) {
    this.warehouses = warehouses;
  }

  async getAllWarehouses(): Promise<Warehouse[]> {
    await simulatedLatency();
    return this.warehouses;
  }

  async getWarehouseById(id: string): Promise<Warehouse | undefined> {
    await simulatedLatency();
    return this.warehouses.find((w) => w.id === id);
  }

  async search(query: string): Promise<Warehouse[]> {
    await simulatedLatency();
    const q = query.trim().toLowerCase();
    if (!q) return this.warehouses;
    return this.warehouses.filter((w) =>
      [w.name, w.city, w.region, w.country, w.number, w.address]
        .filter(Boolean)
        .some((field) => field!.toLowerCase().includes(q)),
    );
  }
}

function simulatedLatency(ms = 60): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
