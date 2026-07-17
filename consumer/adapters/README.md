# Consumer state adapter decision

Decision date: 2026-07-17

## Decision

Use Zustand 5's vanilla store as the small client-state runtime and expose the
React binding through a separate package subpath. Core domain and application
code remains framework-neutral:

- `@okam/core/consumer/c0/*` owns contracts, pure transitions, use cases, and
  ports. It must not import Zustand, React, React Native, Vue, or Pinia.
- `@okam/core/consumer/adapters/state` adapts pure transitions to
  instance-scoped vanilla stores.
- `@okam/core/consumer/adapters/react` binds an explicitly provided store to
  React or React Native with selectors.
- Host apps own providers, store lifetimes, validated persistence, secure
  storage, lifecycle handling, and TanStack Query server caches.

The React adapter requires the host to provide React 18 or newer. React is an
optional package peer because legacy Vue/Pinia consumers use other Core
subpaths and must not be forced to install a renderer they do not execute.
Zustand 5.0.14 publishes a React Native export condition and accepts React 19,
matching the native app's React 19 / React Native 0.86 toolchain.

Do not export a global store singleton. Create one store per native app root,
web client root, or server-rendering request. Do not put API response caches in
this client-state adapter.

Legacy Pinia stores remain available while each characterized workflow is
migrated through equivalence tests. A migrated workflow should first move its
pure transition into `consumer/c0`, then wrap that transition with this
adapter. Removing Pinia is a later, independently verified cleanup.

XState remains an option for explicit long-running workflow machines such as
payment authorization and order recovery. It is not the default client-state
container.

## Evidence

| Candidate | Official evidence | Verdict |
| --- | --- | --- |
| Zustand | [`createStore`](https://zustand.docs.pmnd.rs/reference/apis/create-store) creates a standalone vanilla store; [`useStore`](https://zustand.docs.pmnd.rs/reference/hooks/use-store) subscribes React to a supplied vanilla store; persistence supports custom synchronous and asynchronous storage. | Selected. It gives Core a vanilla seam and one small React/RN binding without taking over server state. |
| Redux Toolkit | [Redux Toolkit is Redux's recommended approach](https://redux.js.org/tutorials/essentials/part-1-overview-concepts), but its store, reducer, middleware, and optional query layer are broader than this migration seam. | Valid for a Redux product, but unnecessary here and overlapping with the apps' existing TanStack Query server cache. |
| TanStack Store | It is framework-agnostic, but its current [installation guide](https://tanstack.com/store/latest/docs/installation) says the React adapter is ReactDOM-only and asks contributors to help create a React Native adapter. | Not eligible for the shared RN/web binding today. Re-evaluate when RN is officially supported and stable. |
| XState | [XState v5](https://stately.ai/docs) models complex logic as state machines and actors, with a separate React adapter. | Reserve for workflows with meaningful legal/illegal transitions, replay, and recovery; do not use as the generic UI/client store. |

TanStack Query remains an app concern for asynchronous server state. Its
[official overview](https://tanstack.com/query/latest) describes query
freshness, request de-duplication, cache lifetime, mutation, and refetching,
which should not be reimplemented in a client-state container.
