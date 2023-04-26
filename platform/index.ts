import $config from '../helpers/configuration'

export const { HttpModule } = await import(`./http-module${$config.platformFileSuffix}`);
export const { PersistenceModule } = await import(`./persistence-module${$config.platformFileSuffix}`);
