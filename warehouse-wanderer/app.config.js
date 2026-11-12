/**
 * Dynamic app config so a few settings can come from environment variables
 * instead of being hard-coded — most importantly the optional Google Maps
 * API key (see README "Map implementation"). Nothing here requires a paid
 * service: the app runs fully without EXPO_PUBLIC_GOOGLE_MAPS_API_KEY set,
 * using a warehouse-list fallback on unconfigured Android and native Apple
 * Maps on iOS. A Google Maps key requires regenerating and rebuilding the
 * Android native configuration; configured map rendering remains unverified.
 */
const fs = require("node:fs");
const path = require("node:path");

const googleMapsApiKey = process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY || undefined;

// Metro can load a public JS key from .env even while the generated native
// manifest still lacks it. Only mount Android's Google view when both match.
const nativeManifestPath = path.join(__dirname, "android/app/src/main/AndroidManifest.xml");
const nativeManifest = fs.existsSync(nativeManifestPath) ? fs.readFileSync(nativeManifestPath, "utf8") : "";
const androidNativeMapsConfigured = Boolean(googleMapsApiKey &&
  (nativeManifest.match(/<meta-data\b[^>]*>/g) || []).some((entry) =>
    entry.includes('android:name="com.google.android.geo.API_KEY"') &&
    entry.includes(`android:value="${googleMapsApiKey}"`)));

module.exports = {
  expo: {
    name: "Warehouse Wanderer",
    slug: "warehouse-wanderer",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/icon.png",
    scheme: "warehousewanderer",
    userInterfaceStyle: "automatic",
    newArchEnabled: true,
    splash: {
      image: "./assets/splash-icon.png",
      resizeMode: "contain",
      backgroundColor: "#FAF3E4",
    },
    assetBundlePatterns: ["**/*"],
    ios: {
      bundleIdentifier: "com.warehousewanderer.app",
      supportsTablet: true,
      infoPlist: {
        NSLocationWhenInUseUsageDescription:
          "Warehouse Wanderer uses your location to find nearby warehouse clubs, show distances, and let you check in when you're actually there. We don't track or store where you've been — only which warehouses you've confirmed visiting.",
        UIBackgroundModes: [],
      },
      // Only present the `config` key at all when a key is supplied — an
      // explicit `config: undefined` still leaves the key present and trips
      // up a downstream `'x' in obj` presence check in @expo/config-plugins.
      ...(googleMapsApiKey ? { config: { googleMapsApiKey } } : {}),
    },
    android: {
      package: "com.warehousewanderer.app",
      adaptiveIcon: {
        backgroundColor: "#16213E",
        foregroundImage: "./assets/android-icon-foreground.png",
        backgroundImage: "./assets/android-icon-background.png",
        monochromeImage: "./assets/android-icon-monochrome.png",
      },
      predictiveBackGestureEnabled: true,
      permissions: ["ACCESS_COARSE_LOCATION", "ACCESS_FINE_LOCATION"],
      ...(googleMapsApiKey ? { config: { googleMaps: { apiKey: googleMapsApiKey } } } : {}),
    },
    web: {
      favicon: "./assets/favicon.png",
    },
    plugins: [
      "./plugins/withSceneSupport",
      "@react-native-community/datetimepicker",
      [
        "expo-location",
        {
          locationWhenInUsePermission:
            "Warehouse Wanderer uses your location to find nearby warehouse clubs and let you check in when you're there. Your location isn't tracked in the background or stored as a history.",
        },
      ],
    ],
    extra: {
      googleMapsApiKey: googleMapsApiKey ?? null,
      androidNativeMapsConfigured,
      eas: {},
    },
  },
};
