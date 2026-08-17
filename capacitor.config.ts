import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.rodrigopitsch.sala13',
  appName: 'Sala 13',
  webDir: 'www',
  backgroundColor: '#050711',
  server: {
    androidScheme: 'https'
  },
  android: {
    allowMixedContent: false
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 1100,
      launchAutoHide: true,
      backgroundColor: '#050711',
      showSpinner: false
    },
    App: {
      disableBackButtonHandler: true
    }
  }
};

export default config;
