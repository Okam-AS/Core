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

  constructor () {
    this.okamApiBaseUrl = process.env.API_BASE_URL || ''
    this.version = process.env.VERSION || ''
    this.isNativeScript = process.env.IS_NATIVESCRIPT === 'true'
    this.isProduction = process.env.IS_PRODUCTION === 'true'
    this.stripePublishableKey = process.env.STRIPE_PUBLISHABLE_KEY || ''
    this.vippsiOSPath = process.env.VIPPS_IOS_PATH || ''
    this.vippsAndroidPath = process.env.VIPPS_ANDROID_PATH || ''
    this.platformFileSuffix = process.env.PLATFORM_FILE_SUFFIX || ''
    this.notificationHub = process.env.NOTIFICATION_HUB || ''
  }
}

export default new Configuration()