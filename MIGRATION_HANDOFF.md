# Core consolidation — migration handoff

> For the next engineer/AI taking over bug-fixing and further development of the
> Okam `core` consolidation. Read this top-to-bottom before touching anything.
> Last updated against core-unified `507ee75`.

---

## 1. Goal (what this project is)

`Okam/Core` (https://github.com/Okam-AS/Core.git) is a git submodule shared by 4 apps.
Over time it split into two incompatible architectures:

- **`master` + a `v4/` folder** — used by the **consumer** apps (Pinia / Vue 3).
- **a separate `v3` branch** — used by the **admin** apps (Vuex / Vue 2).

The goal is **one flat unified core**: promote v4 to the repo root (no `v4/` folder),
**delete the `v3` branch**, and have all 4 apps consume that single core.

The unified baseline lives on the **`core-unified`** branch. `master` and `v3` are
**untouched** and must stay that way until an explicitly-approved cutover (§9).

## 2. The 4 consuming apps

| Repo | Stack | Submodule path | Role |
|---|---|---|---|
| ConsumerWeb | Nuxt 3 / Vue 3 / Pinia / Vite | `core` | consumer (web) |
| ConsumerApp | NativeScript-Vue 3 / Pinia / webpack5 | `core` (src in `src/`) | consumer (native) |
| Web | Nuxt 2 / Vue 2 / Vuex / webpack4 | `core` | **admin** (web) |
| AdminApp | NativeScript-Vue 2 / Vuex / webpack5 | `app/core` | **admin** (native) |

Backend: OkamAPI (`/Users/asharghi/Okam/OkamAPI`), prod `https://okamapi.azurewebsites.net`.

## 3. Current state (branches / SHAs)

- **core**: `core-unified` @ `507ee75` (pushed to origin). `master` `9745bcd`, `v3` `eccb68d` — untouched.
- All 4 apps are on branch **`migrate/unified-core`**, core submodule pinned to `507ee75`:
  - ConsumerWeb `4b0bf0e`, Web `7b17e93`, ConsumerApp `1b9bd45`, AdminApp `ae181f6`.
- **Uncommitted, NOT pushed** (in repo `Web`): the admin adapter refactor —
  `plugins/admin-core-services.js` (new) + `plugins/global-mixin.js` (edited). Verified
  at runtime (see §7) but not yet committed. **Commit + bump is pending.**

> Rule that has been in force the whole project: **never push to `master`/`main`/`v3`.
> PRs / migrate branches only.** Nothing is merged yet.

## 4. The core architectural change (v3 → unified)

The single most important thing to understand:

- **v3 services** were Vuex-coupled and **stateful**: `constructor(vuexModule)`, they
  mutated Vuex internally (e.g. `SetCurrentUser`, `ClearState`), and had convenience
  `*AndSetState` methods. Several returned falsy booleans on failure.
- **Unified services** are **stateless API clients**: `constructor(coreInitializer)`
  where `ICoreInitializer = { bearerToken, clientPlatformName, cultureCode }`. They do
  **not** touch any store; on auth failure they **reject**; `*AndSetState` methods were
  removed. State now lives in the app's store (Pinia for consumer).

Consumer apps adopted this cleanly (Pinia stores own state mutation). **Admin apps still
use Vuex / Vue 2**, and their components were written against the v3 contract — so they
need an **adapter** (§6).

### Platform abstraction (`core/platform` + `core/interfaces`)
Core holds **no** platform-specific code. It defines interfaces and a DI registry:

- `interfaces/IHttpModule` (`httpClient`, optional `bghttp`), `interfaces/IPersistenceModule`.
- `platform/index.ts`: `setPlatform(HttpModule, PersistenceModule)` + `getHttpModule()`
  / `getPersistenceModule()` (typed as `new () => IHttpModule` / `…IPersistenceModule`;
  they **throw** if `setPlatform` wasn't called first).

Each app **owns** its platform impl and registers it once at startup:

| App | impl files | registered in |
|---|---|---|
| ConsumerWeb | `platform/{http,persistence}-module.ts` (axios + localStorage) | `plugins/0.platform.client.ts` |
| Web | `platform/{http,persistence}-module.ts` (axios + localStorage) | `plugins/platform-init.js` (FIRST in nuxt.config plugins) |
| ConsumerApp | `src/platform/{http,persistence}-module.ts` (NS http/bghttp + app-settings) | `src/app.ts` |
| AdminApp | `app/platform/{http,persistence}-module.ts` (NS) | `app/main.ts` |

If you add a new app or refactor boot order, **the platform must be registered before any
core service or store is touched**, or you get a clear thrown error.

## 5. The bug class to watch for: "works in one bundler, breaks in another"

Core is consumed by **Vite (Nuxt3), webpack4 (Nuxt2), webpack5 (NativeScript)**. These
historically caused runtime-only breakages that **build + typecheck did not catch**:

- `require('vue')` / `require(...)` in `.ts` → `undefined` under Vite → silently broke
  persistence (Pinia state never saved; with full-reload nav, all state lost). **Fixed**:
  `persistence-service.ts` uses `import * as vueApi from 'vue'` + runtime feature-detect.
- Conditional `require`/import-suffix hacks in `platform/index.ts` → `require is not
  defined` (Vite) / `$config is not defined` (webpack). **Fixed**: removed entirely via
  `setPlatform()` DI.
- top-level `await`, raw `process.env`, `window/document` at module scope → avoid all.

**Lesson encoded in the workflow: green build/typecheck ≠ working app. Always verify at
RUNTIME** (Playwright for web, `ns run ios` for native). Three real bugs were found this
way that the build missed.

## 6. Admin adapters (why they exist, where they are)

Admin components expect the service to *also* manage Vuex auth state (a v3 responsibility
the unified core moved to the store layer). Since admin is **not** being migrated to Pinia,
a thin **adapter** re-attaches that responsibility in one place. It restores the exact v3
contract the (often unguarded) call-sites depend on:

- `Reload`/`Get`: reject → `false`; on success preserve token + dispatch `SetCurrentUser`;
  **dispatch `ClearState` ONLY on a genuine HTTP 401** (see the bug in §8).
- `Login`/`LoginAdmin`: dispatch `SetCurrentUser` on success.
- `Logout`: route through the unified `Logout(notificationId, clearStateCallback)`.
- `SetLineItem`/`RemoveLineItem` (cart): re-exposed as direct Vuex commits (removed from core).
- Also: `setCurrencyFormat({prefix:'kr ', suffix:''})`, and the order/store/product
  `*AndSetState` methods re-exposed (AdminApp).

Locations:
- **Web**: `plugins/admin-core-services.js` — `AdminUserService extends UserService`,
  `AdminCartService extends CartService` (clean subclasses). `plugins/global-mixin.js`
  just does `new AdminUserService(this.$store, this._coreInitializer)`.
  **(This refactor is uncommitted — see §3.)**
- **AdminApp**: `app/main.ts` — **STILL the old inline monkey-patch style** (`const svc:
  any; svc.Reload = …`). **TODO: refactor to the same clean subclass pattern AND apply the
  401-only ClearState fix (§8). Not done yet.**

If admin ever moves to Pinia like the consumer apps, these adapters can be deleted entirely.

## 7. How to verify (runtime, the bar that matters)

Test account (prod-safe, **no SMS sent**): phone `98865120`, OTP `747475`.

- **ConsumerWeb / Web** (web): Playwright. Specs live in
  `…/scratchpad/pw/` (this session's scratchpad). Key ones: `cw-flow` (browse→categories),
  `web-admin-fix-verify` (login + transient-500 + 401), `cw-invoice-validate`.
  Run dev servers on distinct ports: ConsumerWeb `4522`, Web admin `4521`
  (`PORT=xxxx npm run dev`). They collide on `3000` if you don't set PORT.
- **ConsumerApp / AdminApp** (native): `npx ns prepare ios` (compile+typecheck, EXIT=0)
  and `npx ns run ios` (launch on simulator; scan log for crashes / `Reload` reject traces).
- Per-repo: `npm run build` (web) — but remember build ≠ runtime.

A multi-agent verification Workflow was used for the full sweep; last run returned CLEAN
across all 4 repos against `507ee75`.

### Prod-safety constraints (hard rules from the owner)
- Login with the test account against prod is fine.
- **Admin: read-only.** Do NOT create/delete/modify/status-change real admin data.
- Payment initiation (Vipps/card/**invoice/Dintero/Kravia**) returns **400 "Domain not
  allowed"** from `localhost` — that is a backend origin-whitelist check, **NOT a bug and
  NOT migration-related**. The request payload is byte-identical to old core. Only
  testable from a whitelisted/deployed domain. "Betal på stedet" is the only end-to-end
  order path testable locally.

## 8. Bugs found & fixed (and the one partially open)

1. **Blank `/admin` (Web)** — unguarded `await Reload()` + unified reject → unhandled
   rejection → mount crash. Fixed by the reject→falsy adapter.
2. **Broken ConsumerWeb persistence** — `require('vue')` undefined under Vite. Fixed (§5).
3. **Spurious logout on nav (Web admin)** — *(found 2026-06-28)* the adapter dispatched
   `ClearState` on **any** Reload/Get rejection. A transient 5xx / network blip / momentary
   missing token therefore nuked the session ("suddenly logged out navigating around").
   v3 only logged out on a **genuine 401**. **Fixed in Web** (`isUnauthorized(err)` →
   only clear on `status === 401`); verified: injected 500 stays logged in, injected 401
   logs out. **NOT yet fixed in AdminApp** — same bug exists in `app/main.ts`. Note: on
   NativeScript the http layer resolves all statuses, so the unified `Reload` rejects with
   no status info — detecting 401 there may require surfacing the status from core
   (`GetRequest`/`Reload`) or reading the NS `statusCode`. **Open TODO.**
4. AdminApp `env.ts` needed `declare const process`; NS string-concat `require` to dodge
   webpack static analysis — both already handled.

## 9. Outstanding work

1. **Commit + push the Web adapter refactor** (`migrate/unified-core`), then bump its pin
   if core changes.
2. **AdminApp**: refactor `app/main.ts` adapter to the clean subclass pattern (mirror
   `Web/plugins/admin-core-services.js`) **and** apply the 401-only `ClearState` fix (§8 #3).
   Then `ns prepare ios` + `ns run ios` to verify.
3. **The gated cutover** (do NOT start without explicit approval):
   - Ensure backups exist: `backup/master-pre-consolidation`, `backup/v3-pre-consolidation`
     on the core remote; `backup/pre-core-consolidation` per app.
   - Merge the 4 app `migrate/unified-core` PRs.
   - Push `core-unified` → `master` (full restructure — **replace**, not merge).
   - Bump each app's main-branch submodule pin to the new master SHA.
   - **Delete `v3` LAST**, only after admin apps are confirmed healthy in prod.
   - Confirm no other consumer still references `v3` or the old `v4/` path.
4. Owner-owed manual spot checks: real order/payment on a whitelisted domain; admin
   writes/deletes/status-changes (carefully, on a test store); native push / deep links /
   AdminApp product image upload (the only native-specific `FormdataRequest`/bghttp path).

## 10. Traps / gotchas

- **Don't trust build/typecheck alone** — verify at runtime (§5, §7).
- **Don't push master/v3.** PRs only until cutover.
- **`$goTo` in ConsumerWeb does a full page reload** (`window.location.href`) → all state
  must survive via persistence. This is why the persistence bug was so damaging.
- The unified `Reload`/`Get` **reject** (no token / non-200). Any admin call-site that
  `await`s them unguarded will crash unless it goes through the adapter.
- `setPlatform()` must run before any store/service. Watch plugin ordering (the `0.`
  prefix on ConsumerWeb's plugin; first entry in Web's nuxt.config plugins).
- Native http resolves all statuses (`statusCode`); web axios **throws** on non-2xx. Error
  shapes differ — code that inspects HTTP status must handle both (`err.response.status`
  vs `response.statusCode`).

## 11. Solutions & patterns that work (reuse these)

These are the canonical fixes the project converged on. Prefer them over ad-hoc variants.

- **Platform via DI registry, never conditional `require`.** `setPlatform(HttpModule,
  PersistenceModule)` + `getHttpModule()`/`getPersistenceModule()`. Core stays
  bundler-agnostic; each app owns its impl. This replaced every `typeof require` /
  `import(...).then()` / file-suffix hack that used to break one bundler or another.
- **Static namespace import + runtime feature-detect for optional framework APIs.**
  `import * as vueApi from 'vue'` then `if (typeof vueApi.watch === 'function')`. Works in
  Vite, and degrades to a no-op in Vue 2 builds without the Composition API. Never
  `require('vue')` in a `.ts` shared file.
- **Adapters as subclasses, not monkey-patching.** `class AdminUserService extends
  UserService` — override only the methods whose semantics changed, inherit the rest. No
  per-access re-binding, no name-drift, testable, `instanceof` intact. (Web is done this
  way; AdminApp still needs it — §6/§9.)
- **reject → falsy bridge** for unguarded `await` call-sites that expect the v3 boolean.
- **Clear session ONLY on 401**, never on generic rejection (§8 #3).
- **Typed constructor registry**: `new () => IHttpModule`. Makes the interface a real,
  enforced contract instead of `any`.
- **Distinct dev ports**: ConsumerWeb `4522`, Web admin `4521` (`PORT=xxxx npm run dev`) —
  both default to `3000` and collide otherwise.

## 12. Debugging techniques that paid off (use these to triage)

The recurring failure mode is "green build, broken runtime", so the wins all came from
observing the running app, not from static analysis:

- **Playwright network capture** — `page.on('response', …)` logging URL + status + body +
  request postData. This is what proved the invoice failure was a backend `400 "Domain
  not allowed"` (not migration), and that `/carts/validate` returned `200`. When something
  "fails", capture the actual HTTP exchange before theorising.
- **Inject a transient failure to prove a regression deterministically** —
  `page.route(/\/user/, r => r.fulfill({ status: 500 }))` then navigate. This turned an
  intermittent "sometimes logged out" report into a 100%-reproducible test, and then into
  a pass/fail gate for the fix.
- **Read live store state + subscribe to actions from the page** —
  `page.evaluate(() => window.$nuxt.$store.getters.userIsLoggedIn)` and
  `store.subscribeAction(a => { if (a.type==='ClearState') …})` to catch exactly *when* and
  *why* state changed.
- **Diff against ground truth instead of guessing.** `git show v3:services/user-service.ts`
  revealed the exact old semantics (logout only on 401) — that single diff pinned the
  logout bug. Same trick for confirming a new platform impl is behaviorally identical to
  the old one: `git show master:platform/http-module.nuxt.ts`.
- **Separate "my error" from "pre-existing noise" in typecheck.** Run strict `tsc` on just
  the changed files to read them, but gate on the **project's own** (lenient) tsconfig —
  ConsumerWeb has ~979 pre-existing strictness errors that are irrelevant. Grep the output
  for the files you touched.
- **`ns prepare ios`** is the fast compile+typecheck signal for native (≈2s webpack); use
  it before the slower `ns run ios`.
- When build is green but runtime is wrong: **drive the real flow + temporary
  `console.log`**, compare values against old core. That is how the persistence bug
  (Pinia state never saved) was localised.

## 13. How we want it (the north star)

Direction to keep steering toward — use this to judge whether a change is "in the spirit":

- **One flat core.** No `v3` branch, no `v4/` folder. Everything lives directly under
  `core/`, consumed by all 4 apps from a single branch (eventually `master`).
- **Core is pure and stateless.** Services are stateless API clients built from
  `ICoreInitializer`. No store coupling, no framework-specific code, no platform code, no
  bundler-specific `require`/`import` tricks. Platform is injected via interfaces + DI.
- **State lives in the app's store layer.** Consumer apps own this in Pinia. That is the
  intended pattern.
- **Admin adapters are transitional debt, not the destination.** They exist only because
  admin still runs Vue 2 / Vuex against the old contract. Keep them in **one documented
  file per app**, as clean subclasses, single source of truth for the v3 bridge. **North
  star: migrate admin (Web + AdminApp) to Pinia like the consumer apps, then delete the
  adapters entirely.** Don't grow the adapter surface; shrink it.
- **Runtime-verification-first culture.** A change isn't done when it builds — it's done
  when the relevant flow has been driven (Playwright / `ns run`) and the prod-safety rules
  (§7) were respected: admin read-only, test account only, never push master/v3.
- **Follow the repo conventions** (see each app's `CLAUDE.md`): `useXxx` Pinia stores,
  `XxxService` services, `$xxx` utilities, atomic-design components. Match surrounding code.
