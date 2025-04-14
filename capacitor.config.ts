// capacitor.config.ts
import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.vasvariapp.app',
  appName: 'Vasvári App',
  webDir: 'dist', // Or 'www' depending on your build output

  // Add the server configuration here
  server: {
    // It's generally good practice to keep androidScheme as https
    androidScheme: 'https',
    // Set the custom hostname for iOS (and potentially Android)
    hostname: 'app.vasvariapp.hu'
  },

  plugins: {
    // Note: CapacitorHttp plugin (enabled: true) handles cookies natively.
    // The separate CapacitorCookies plugin might be redundant unless you have a specific reason for using it alongside CapacitorHttp.
    // If CapacitorHttp alone works for Android, you might not need CapacitorCookies enabled.
    CapacitorCookies: {
      enabled: true
    },
    CapacitorHttp: {
      enabled: true // This is important for making requests and handling cookies
    }
  }
};

export default config;