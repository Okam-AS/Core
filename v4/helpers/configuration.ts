import getEnv from '../../../env'

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
    this.okamApiBaseUrl = getEnv('API_BASE_URL')
    this.version = getEnv('VERSION')
    this.isNativeScript = getEnv('IS_NATIVESCRIPT') === 'true'
    this.isProduction = getEnv('IS_PRODUCTION') === 'true'
    this.stripePublishableKey = getEnv('STRIPE_PUBLISHABLE_KEY')
    this.vippsiOSPath = getEnv('VIPPS_IOS_PATH')
    this.vippsAndroidPath = getEnv('VIPPS_ANDROID_PATH')
    this.platformFileSuffix = getEnv('PLATFORM_FILE_SUFFIX')
    this.notificationHub = getEnv('NOTIFICATION_HUB')
  }
}

export default new Configuration()