import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import { evaluateBadges } from "../achievements/achievementEngine";
import { BADGE_DEFINITIONS } from "../achievements/badgeDefinitions";
import { getCostcoLocationProvider } from "../data/providers";
import {
  LocationService,
  MAX_TRUSTED_ACCURACY_METERS,
  type DeviceLocation,
  type LocationPermissionState,
} from "../services/LocationService";
import { distanceMeters } from "../services/distance";
import { computeStats, type PassportStats } from "../statistics/computeStats";
import { BadgeUnlocksRepository } from "../storage/repositories/BadgeUnlocksRepository";
import { SettingsRepository } from "../storage/repositories/SettingsRepository";
import { VisitsRepository } from "../storage/repositories/VisitsRepository";
import { WishlistRepository } from "../storage/repositories/WishlistRepository";
import type {
  AppSettings,
  BadgeDefinition,
  BadgeProgress,
  CreateVisitInput,
  Visit,
  Warehouse,
  WishlistItem,
} from "../types";
import { generateId } from "../utils/id";

export type LocationFetchStatus =
  | "idle"
  | "loading"
  | "success"
  | "denied"
  | "unavailable"
  | "error";

export interface NearbyWarehouse {
  warehouse: Warehouse;
  distanceMeters: number;
  withinCheckInRange: boolean;
}

interface PassportContextValue {
  loading: boolean;
  warehouses: Warehouse[];
  visits: Visit[];
  wishlist: WishlistItem[];
  settings: AppSettings;
  badges: BadgeProgress[];
  stats: PassportStats;
  homeWarehouse: Warehouse | null;

  currentLocation: DeviceLocation | null;
  locationPermission: LocationPermissionState;
  locationStatus: LocationFetchStatus;
  locationErrorMessage: string | null;
  isSimulatingLocation: boolean;

  lastUnlockedBadges: BadgeDefinition[];
  clearLastUnlockedBadges: () => void;

  getWarehouseById: (id: string) => Warehouse | undefined;
  visitsForWarehouse: (warehouseId: string) => Visit[];
  isWishlisted: (warehouseId: string) => boolean;
  nearbyWarehouses: (limit?: number) => NearbyWarehouse[];

  requestLocationPermission: () => Promise<LocationPermissionState>;
  refreshLocation: () => Promise<void>;

  addVisit: (input: CreateVisitInput) => Promise<Visit>;
  updateVisit: (id: string, patch: Partial<Visit>) => Promise<void>;
  removeVisit: (id: string) => Promise<void>;

  addToWishlist: (warehouseId: string) => Promise<void>;
  removeFromWishlist: (warehouseId: string) => Promise<void>;

  updateSettings: (patch: Partial<AppSettings>) => Promise<void>;

  reloadAll: () => Promise<void>;
}

const PassportContext = createContext<PassportContextValue | null>(null);

export function PassportProvider({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = useState(true);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [visits, setVisits] = useState<Visit[]>([]);
  const [wishlist, setWishlist] = useState<WishlistItem[]>([]);
  const [settings, setSettings] = useState<AppSettings>({
    proximityThresholdMeters: 400,
    hasSeenLocationRationale: false,
    distanceUnit: "mi",
  });
  const [badgeUnlocks, setBadgeUnlocks] = useState<Record<string, string>>({});

  const [currentLocation, setCurrentLocation] = useState<DeviceLocation | null>(null);
  const [locationPermission, setLocationPermission] = useState<LocationPermissionState>("undetermined");
  const [locationStatus, setLocationStatus] = useState<LocationFetchStatus>("idle");
  const [locationErrorMessage, setLocationErrorMessage] = useState<string | null>(null);

  const [lastUnlockedBadges, setLastUnlockedBadges] = useState<BadgeDefinition[]>([]);
  const previousUnlockedIdsRef = React.useRef<Set<string> | null>(null);

  const reloadAll = useCallback(async () => {
    const [loadedWarehouses, loadedVisits, loadedWishlist, loadedSettings, loadedUnlocks, permission] =
      await Promise.all([
        getCostcoLocationProvider().getAllWarehouses(),
        VisitsRepository.getAll(),
        WishlistRepository.getAll(),
        SettingsRepository.get(),
        BadgeUnlocksRepository.getAll(),
        LocationService.getPermissionStatus(),
      ]);
    setWarehouses(loadedWarehouses);
    setVisits(loadedVisits);
    setWishlist(loadedWishlist);
    setSettings(loadedSettings);
    setBadgeUnlocks(loadedUnlocks);
    setLocationPermission(permission);
    setLoading(false);
  }, []);

  useEffect(() => {
    reloadAll();
  }, [reloadAll]);

  const homeWarehouse = useMemo<Warehouse | null>(() => {
    const byId = new Map(warehouses.map((w) => [w.id, w]));
    if (settings.homeWarehouseId) {
      const explicit = byId.get(settings.homeWarehouseId);
      if (explicit) return explicit;
    }
    if (visits.length === 0) return null;
    const earliest = [...visits].sort((a, b) => a.visitedAt.localeCompare(b.visitedAt))[0];
    return byId.get(earliest.warehouseId) ?? null;
  }, [warehouses, visits, settings.homeWarehouseId]);

  const stats = useMemo(
    () => computeStats({ visits, warehouses, currentLocation, homeWarehouse }),
    [visits, warehouses, currentLocation, homeWarehouse],
  );

  const badges = useMemo(
    () =>
      evaluateBadges(BADGE_DEFINITIONS, {
        visits,
        warehouses,
        wishlist,
        unlockedAt: badgeUnlocks,
        homeWarehouse,
      }),
    [visits, warehouses, wishlist, badgeUnlocks, homeWarehouse],
  );

  // Whenever the derived badge list changes, persist any newly-crossed
  // thresholds and surface them for a celebratory UI moment.
  useEffect(() => {
    if (loading) return;
    const unlockedIds = badges.filter((b) => b.unlocked).map((b) => b.definition.id);
    const previous = previousUnlockedIdsRef.current;
    const newlyUnlocked = previous ? unlockedIds.filter((id) => !previous.has(id)) : [];
    previousUnlockedIdsRef.current = new Set(unlockedIds);

    if (newlyUnlocked.length > 0) {
      BadgeUnlocksRepository.recordUnlocks(newlyUnlocked).then(setBadgeUnlocks);
      const defs = newlyUnlocked
        .map((id) => BADGE_DEFINITIONS.find((d) => d.id === id))
        .filter((d): d is BadgeDefinition => Boolean(d));
      if (previous) setLastUnlockedBadges((prev) => [...prev, ...defs]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [badges, loading]);

  const getWarehouseById = useCallback(
    (id: string) => warehouses.find((w) => w.id === id),
    [warehouses],
  );

  const visitsForWarehouse = useCallback(
    (warehouseId: string) =>
      visits
        .filter((v) => v.warehouseId === warehouseId)
        .sort((a, b) => b.visitedAt.localeCompare(a.visitedAt)),
    [visits],
  );

  const isWishlisted = useCallback(
    (warehouseId: string) => wishlist.some((w) => w.warehouseId === warehouseId),
    [wishlist],
  );

  const nearbyWarehouses = useCallback(
    (limit = 20): NearbyWarehouse[] => {
      if (!currentLocation) return [];
      return warehouses
        .map((warehouse) => {
          const distance = distanceMeters(
            currentLocation.latitude,
            currentLocation.longitude,
            warehouse.latitude,
            warehouse.longitude,
          );
          return {
            warehouse,
            distanceMeters: distance,
            withinCheckInRange: distance <= settings.proximityThresholdMeters,
          };
        })
        .sort((a, b) => a.distanceMeters - b.distanceMeters)
        .slice(0, limit);
    },
    [currentLocation, warehouses, settings.proximityThresholdMeters],
  );

  const requestLocationPermission = useCallback(async () => {
    const result = await LocationService.requestPermission();
    setLocationPermission(result);
    return result;
  }, []);

  const refreshLocation = useCallback(async () => {
    setLocationStatus("loading");
    setLocationErrorMessage(null);
    const result = await LocationService.getCurrentLocation();
    switch (result.status) {
      case "success":
        setCurrentLocation(result.location);
        setLocationStatus("success");
        setLocationPermission("granted");
        break;
      case "denied":
        setLocationStatus("denied");
        setLocationPermission("denied");
        break;
      case "unavailable":
        setLocationStatus("unavailable");
        break;
      case "error":
        setLocationStatus("error");
        setLocationErrorMessage(result.message);
        break;
    }
  }, []);

  const addVisit = useCallback(async (input: CreateVisitInput): Promise<Visit> => {
    const visit: Visit = {
      id: generateId("visit"),
      warehouseId: input.warehouseId,
      visitedAt: input.visitedAt,
      verification: input.verification,
      notes: input.notes,
      isFavorite: input.isFavorite ?? false,
      createdAt: new Date().toISOString(),
    };
    const next = await VisitsRepository.add(visit);
    setVisits(next);
    return visit;
  }, []);

  const updateVisit = useCallback(async (id: string, patch: Partial<Visit>) => {
    const next = await VisitsRepository.update(id, patch);
    setVisits(next);
  }, []);

  const removeVisit = useCallback(async (id: string) => {
    const next = await VisitsRepository.remove(id);
    setVisits(next);
  }, []);

  const addToWishlist = useCallback(async (warehouseId: string) => {
    const item: WishlistItem = {
      id: generateId("wish"),
      warehouseId,
      addedAt: new Date().toISOString(),
    };
    const next = await WishlistRepository.add(item);
    setWishlist(next);
  }, []);

  const removeFromWishlist = useCallback(async (warehouseId: string) => {
    const existing = wishlist.find((w) => w.warehouseId === warehouseId);
    if (!existing) return;
    const next = await WishlistRepository.remove(existing.id);
    setWishlist(next);
  }, [wishlist]);

  const updateSettings = useCallback(async (patch: Partial<AppSettings>) => {
    const next = await SettingsRepository.update(patch);
    setSettings(next);
  }, []);

  const clearLastUnlockedBadges = useCallback(() => setLastUnlockedBadges([]), []);

  const value: PassportContextValue = {
    loading,
    warehouses,
    visits,
    wishlist,
    settings,
    badges,
    stats,
    homeWarehouse,
    currentLocation,
    locationPermission,
    locationStatus,
    locationErrorMessage,
    isSimulatingLocation: LocationService.isSimulating(),
    lastUnlockedBadges,
    clearLastUnlockedBadges,
    getWarehouseById,
    visitsForWarehouse,
    isWishlisted,
    nearbyWarehouses,
    requestLocationPermission,
    refreshLocation,
    addVisit,
    updateVisit,
    removeVisit,
    addToWishlist,
    removeFromWishlist,
    updateSettings,
    reloadAll,
  };

  return <PassportContext.Provider value={value}>{children}</PassportContext.Provider>;
}

export function usePassport(): PassportContextValue {
  const ctx = useContext(PassportContext);
  if (!ctx) throw new Error("usePassport must be used within a PassportProvider");
  return ctx;
}

export const MAX_TRUSTED_GPS_ACCURACY = MAX_TRUSTED_ACCURACY_METERS;
