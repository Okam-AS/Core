import $config from '../helpers/configuration'

// Load the platform-specific module via dynamic ESM import(). This is the common
// denominator across all consumers: Vite (Nuxt 3) has no CommonJS `require` (it
// ReferenceErrors -> blank page), while webpack (Nuxt 2) and NativeScript support
// import() too. This mirrors the consumer v4 form. The suffix is read into a local
// const first so the bundlers bind it correctly inside the import() context.
const fileSuffix = $config.platformFileSuffix

export const { HttpModule } = await import(`./http-module${fileSuffix}.ts`)
export const { PersistenceModule } = await import(`./persistence-module${fileSuffix}.ts`)