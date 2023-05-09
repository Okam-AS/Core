import $config from '../helpers/configuration'

export const { HttpModule } = await import(`../../platform/http-module${$config.platformFileSuffix}.ts`)
export const { PersistenceModule } = await import(`../../platform/persistence-module${$config.platformFileSuffix}.ts`)