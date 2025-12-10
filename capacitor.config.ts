import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.servicehub.app',
  appName: 'ServiceHub',
  webDir: 'dist',
  ios: {
    contentInset: 'automatic'
  },
  android: {
    backgroundColor: '#0A0A0F'
  }
};

export default config;
