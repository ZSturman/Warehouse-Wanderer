import { File, Paths } from "expo-file-system";
import { useEffect } from "react";

import { usePassport } from "../state/PassportContext";
import { createE2EActionRunner } from "./e2eActions";

const POLL_INTERVAL_MS = 750;

/**
 * A second, dialog-free way to drive the dev-only E2E test harness (see
 * `e2eActions.ts`): drop a JSON file at
 * `<Documents>/e2e-command.json` — e.g. via `xcrun simctl` host filesystem
 * access to the simulator's app container, or `adb push` on Android — and
 * this picks it up within ~1s, runs the action, and deletes the file.
 *
 * This exists specifically for headless/CI simulators with no GUI to tap
 * through iOS's "Open in App?" deep-link confirmation. See the README's
 * testing section for the exact commands used during this project's own
 * simulator/emulator verification.
 *
 * Command file shape: `{"action": "populate", "args": []}`
 */
export function DevCommandPoller() {
  const { addVisit, addToWishlist, getWarehouseById, reloadAll, warehouses, clearLastUnlockedBadges } = usePassport();

  useEffect(() => {
    if (!__DEV__) return;
    const run = createE2EActionRunner({ addVisit, addToWishlist, getWarehouseById, reloadAll, warehouses, clearLastUnlockedBadges });
    const commandFile = new File(Paths.document, "e2e-command.json");

    const interval = setInterval(async () => {
      if (!commandFile.exists) return;
      try {
        const raw = await commandFile.text();
        commandFile.delete();
        const { action, args } = JSON.parse(raw) as { action: string; args?: string[] };
        await run(action, args ?? []);
      } catch (error) {
        console.warn("[E2E] command failed", error);
      }
    }, POLL_INTERVAL_MS);

    return () => clearInterval(interval);
  }, [addVisit, addToWishlist, getWarehouseById, reloadAll, warehouses, clearLastUnlockedBadges]);

  return null;
}
