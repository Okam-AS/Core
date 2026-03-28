declare const process: {
  env: {
    API_BASE_URL: string;
    VERSION: string;
    IS_NATIVESCRIPT: string;
    IS_PRODUCTION: string;
    STRIPE_PUBLISHABLE_KEY: string;
    VIPPS_IOS_PATH: string;
    VIPPS_ANDROID_PATH: string;
    PLATFORM_FILE_SUFFIX: string;
    NOTIFICATION_HUB: string;
    SELECTED_THEME: string;
  }
};

let getEnvFn: ((key: string) => string) | undefined;
try {
  getEnvFn = require('../../../env').default;
} catch (e) {
  // No env.ts file available — fall back to process.env
}

function getEnvValue(key: string): string {
  if (getEnvFn) {
    return getEnvFn(key);
  }
  return (process.env as any)[key] || '';
}

class Configuration {
  okamApiBaseUrl: string;
  isAndroid: boolean;
  isIOS: boolean;
  isNativeScript: boolean;
  isProduction: boolean;
  version: string;
  stripePublishableKey: string;
  vippsiOSPath: string;
  vippsAndroidPath: string;
  platformFileSuffix: string;
  notificationHub: string;
  selectedTheme: string;

  constructor() {
    this.okamApiBaseUrl = getEnvValue('API_BASE_URL');
    this.version = getEnvValue('VERSION');
    this.isNativeScript = getEnvValue('IS_NATIVESCRIPT') === 'true';
    this.isProduction = getEnvValue('IS_PRODUCTION') === 'true';
    this.stripePublishableKey = getEnvValue('STRIPE_PUBLISHABLE_KEY');
    this.vippsiOSPath = getEnvValue('VIPPS_IOS_PATH');
    this.vippsAndroidPath = getEnvValue('VIPPS_ANDROID_PATH');
    this.platformFileSuffix = getEnvValue('PLATFORM_FILE_SUFFIX');
    this.notificationHub = getEnvValue('NOTIFICATION_HUB');
    this.selectedTheme = getEnvValue('SELECTED_THEME');
  }
}

export default new Configuration();
