import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.wazee20.puzzlegame',
  appName: 'Puzzle Game',
  webDir: '.',
  server: {
    androidScheme: 'https'
  }
};

export default config;
