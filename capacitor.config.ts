import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.servicehub.app',
  appName: 'ServiceHub',
  webDir: 'dist',
  server: {
    url: 'https://5b1bfb33-34d7-43a1-acd8-b9699e73f0fb.lovableproject.com?forceHideBadge=true',
    cleartext: true
  },
  ios: {
    contentInset: 'automatic'
  },
  android: {
    backgroundColor: '#0A0A0F'
  }
};

export default config;
