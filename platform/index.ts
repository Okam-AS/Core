import $config from '../helpers/configuration'

export const { HttpModule } = require(`./http-module${$config.platformFileSuffix}`)
export const { PersistenceModule } = require(`./persistence-module${$config.platformFileSuffix}`)