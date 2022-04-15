import $config from '../helpers/configuration'
const fileSuffix = $config.platformFileSuffix

export const { HttpModule } = require(`./http-module${fileSuffix}`)