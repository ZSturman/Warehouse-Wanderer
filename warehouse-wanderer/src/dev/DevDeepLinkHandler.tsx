import { useEffect } from "react";
import { Linking } from "react-native";

import { usePassport } from "../state/PassportContext";
import { createE2EActionRunner } from "./e2eActions";

/**
 * Dev-only automated test harness: `warehousewanderer://e2e/<action>/<args>`
 * deep links (`xcrun simctl openurl` / `adb shell am start -d ...`) invoke
 * the same actions a real screen's buttons call — see `e2eActions.ts` for the
 * full list and `DevCommandPoller.tsx` for a second, dialog-free entry point
 * used on headless iOS simulators (see the README's testing section for why
 * both exist: iOS shows an un-dismissable "Open in App?" confirmation for
 * custom-scheme links opened externally, which blocks this path on a
 * simulator with no touch input — Android does not have that restriction).
 * Inert unless `__DEV__` is true.
 */
export function DevDeepLinkHandler() {
  const { addVisit, addToWishlist, getWarehouseById, reloadAll, warehouses, clearLastUnlockedBadges } = usePassport();

  useEffect(() => {
    if (!__DEV__) return;
    const run = createE2EActionRunner({ addVisit, addToWishlist, getWarehouseById, reloadAll, warehouses, clearLastUnlockedBadges });

    const handleUrl = (url: string) => {
      // Parsed by hand rather than with the `URL` global: RN's polyfill
      // support for custom (non-http) schemes is inconsistent across
      // versions, and this format is simple enough not to need it.
      const match = /^[a-zA-Z][a-zA-Z0-9.+-]*:\/\/([^/?#]+)(\/[^?#]*)?/.exec(url);
      if (!match || match[1] !== "e2e") return;
      const segments = (match[2] ?? "").split("/").filter(Boolean);
      const [action, ...args] = segments;
      run(action, args);
    };

    Linking.getInitialURL().then((url) => {
      if (url) handleUrl(url);
    });
    const subscription = Linking.addEventListener("url", ({ url }) => handleUrl(url));
    return () => subscription.remove();
  }, [addVisit, addToWishlist, getWarehouseById, reloadAll, warehouses, clearLastUnlockedBadges]);

  return null;
}
