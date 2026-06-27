import $config from '../helpers/configuration'

// Extract the suffix to a local const before the dynamic require. Inlining
// `$config.platformFileSuffix` directly inside the require() template literal
// breaks under Nuxt 2's webpack/babel (the member expression is not bound in the
// generated context module -> "ReferenceError: $config is not defined" at load,
// blanking the page). Vite/NativeScript tolerate the inline form; webpack does not.
const fileSuffix = $config.platformFileSuffix

export const { HttpModule } = require(`./http-module${fileSuffix}`)
export const { PersistenceModule } = require(`./persistence-module${fileSuffix}`)