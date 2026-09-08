module.exports = {
  "expo": {
    "name": "Massar (مسار)",
    "slug": "massar",
    "version": "1.0.0",
    "orientation": "portrait",
    "icon": "./assets/images/icon.png",
    "scheme": "massar",
    "userInterfaceStyle": "light",
    "ios": {
      "supportsTablet": false,
      "bundleIdentifier": "com.massar.driver",
      "config": {
        "googleMapsApiKey": process.env.GOOGLE_MAPS_IOS_API_KEY
      }
    },
    "android": {
      "package": "com.massar.driver",
      "config": {
        "googleMaps": {
          "apiKey": process.env.GOOGLE_MAPS_ANDROID_API_KEY
        }
      }
    },
    "web": {
      "favicon": "./assets/images/icon.png"
    },
    "plugins": ["expo-router"],
    "experiments": {
      "typedRoutes": true,
      "reactCompiler": true
    }
  }
};
