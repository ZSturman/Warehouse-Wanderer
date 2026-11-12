import { createNavigationContainerRef } from "@react-navigation/native";
import type { RootStackParamList } from "./types";

/**
 * Lets code outside the component tree (specifically the dev-only E2E test
 * harness, see `src/dev/e2eActions.ts`) drive navigation directly in-process
 * — no OS URL dispatch involved, so none of the iOS "Open in App?"
 * confirmation that a `Linking`-based deep link triggers when opened
 * externally. Not used for any production navigation path.
 */
export const navigationRef = createNavigationContainerRef<RootStackParamList>();
