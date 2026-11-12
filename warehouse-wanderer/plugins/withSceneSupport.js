const { withAppDelegate, withInfoPlist } = require("@expo/config-plugins");

// SDK 57's legacy native template crashes when built with the iOS 27 SDK.
// Use Expo's installed scene delegate; retain this migration across prebuilds.
function migrateAppDelegate(contents) {
  if (!contents.includes("ExpoReactNativeFactoryProvider")) {
    const declaration = "class AppDelegate: ExpoAppDelegate {";
    if (!contents.includes(declaration)) {
      throw new Error("Scene support requires the standard Expo Swift AppDelegate; review its native startup manually.");
    }
    contents = contents.replace(declaration, "class AppDelegate: ExpoAppDelegate, ExpoReactNativeFactoryProvider {");
  }
  const legacyStartup = /#if os\(iOS\) \|\| os\(tvOS\)\s+window = UIWindow\(frame: UIScreen\.main\.bounds\)[\s\S]*?#endif/;
  contents = contents.replace(legacyStartup, "// ExpoAppSceneDelegate creates the scene window and starts React Native.");
  if (contents.includes("factory.startReactNative(")) {
    throw new Error("Unexpected AppDelegate startup code remains; move it to the scene lifecycle before building.");
  }
  return contents;
}

module.exports = function withSceneSupport(config) {
  config = withInfoPlist(config, (config) => {
    config.modResults.UIApplicationSceneManifest = {
      UIApplicationSupportsMultipleScenes: false,
      UISceneConfigurations: {
        UIWindowSceneSessionRoleApplication: [{
          UISceneConfigurationName: "Default Configuration",
          UISceneDelegateClassName: "EXExpoAppSceneDelegate",
        }],
      },
    };
    return config;
  });
  return withAppDelegate(config, (config) => {
    if (config.modResults.language !== "swift") {
      throw new Error("Warehouse Wanderer's scene migration expects a Swift AppDelegate.");
    }
    config.modResults.contents = migrateAppDelegate(config.modResults.contents);
    return config;
  });
};

module.exports.migrateAppDelegate = migrateAppDelegate;
