import $config from '../helpers/configuration'
const fileSuffix = $config.platformFileSuffix

export const { GeolocationModule } = require(`./geolocation-module${fileSuffix}`)
export const { NotificationModule } = require(`./notification-module${fileSuffix}`)
export const { HttpModule } = require(`./http-module${fileSuffix}`)