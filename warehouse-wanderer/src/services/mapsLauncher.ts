import { Linking, Platform } from "react-native";
import type { Warehouse } from "../types";

/** Opens the device's native maps app centered on / routing to a warehouse. */
export async function openInMaps(warehouse: Warehouse): Promise<void> {
  const label = encodeURIComponent(`Costco ${warehouse.name}`);
  const { latitude, longitude } = warehouse;
  const url = Platform.select({
    ios: `maps:0,0?q=${label}@${latitude},${longitude}`,
    android: `geo:0,0?q=${latitude},${longitude}(${label})`,
    default: `https://www.openstreetmap.org/?mlat=${latitude}&mlon=${longitude}#map=17/${latitude}/${longitude}`,
  });

  const canOpen = await Linking.canOpenURL(url);
  if (canOpen) {
    await Linking.openURL(url);
    return;
  }
  // Fallback that works everywhere, including simulators without Maps signed in.
  await Linking.openURL(
    `https://www.openstreetmap.org/?mlat=${latitude}&mlon=${longitude}#map=17/${latitude}/${longitude}`,
  );
}
