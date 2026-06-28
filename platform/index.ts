import $config from '../helpers/configuration'

// Load the platform-specific module across THREE incompatible bundlers:
//   - webpack (Nuxt 2): has CommonJS `require`, but NO top-level `await` (webpack 4
//     babel can't even parse it).
//   - NativeScript: has `require` (synchronous, needed for the .ns module).
//   - Vite (Nuxt 3): NO `require` ("ReferenceError: require is not defined"),
//     so it must use dynamic import().
// Use `require` where available (sync, webpack + NativeScript); otherwise fall back
// to import() with .then() (Vite). NO top-level await, so webpack can parse the file.
// Services are constructed lazily (well after module load), so the Vite async
// assignment has resolved by the time HttpModule is used.
const fileSuffix = $config.platformFileSuffix

let HttpModule: any
let PersistenceModule: any

if (typeof require === 'function') {
  HttpModule = require(`./http-module${fileSuffix}`).HttpModule
  PersistenceModule = require(`./persistence-module${fileSuffix}`).PersistenceModule
} else {
  import(`./http-module${fileSuffix}.ts`).then((m) => { HttpModule = m.HttpModule })
  import(`./persistence-module${fileSuffix}.ts`).then((m) => { PersistenceModule = m.PersistenceModule })
}

export { HttpModule, PersistenceModule }