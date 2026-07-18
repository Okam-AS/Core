import {
  ConsumerCatalogueScopeError,
  mapConsumerStorefront,
  normalizePhoneNumber,
  type PhoneInput,
} from '@okam/core/consumer/c0/application/v1';
import {
  type ConsumerProductScope,
  type ConsumerStorefrontScope,
  type StorefrontCatalog,
  formatMoneyMinor,
  type ConsumerMarket,
} from '@okam/core/consumer/c0/domain/v1';
import {
  consumerStorefrontSchema,
  type ConsumerStorefrontWire,
} from '@okam/core/consumer/c0/contracts';
import {
  createReducerStore,
  type StateTransition,
} from '@okam/core/consumer/adapters/state';
import { useOkamStore } from '@okam/core/consumer/adapters/react';
import {
  compileAuthorizedStoreScopeV1,
  createInstalledManifestVerifierV1,
  createConsumerCartV1,
  parseConsumerManifestV1,
  reduceConsumerCartV1,
  verifyInstalledConsumerManifestV1,
  type ConsumerCartV1,
} from '@okam/core/consumer/c1/domain/v1';
import { cartEventV1Schema } from '@okam/core/consumer/c1/contracts/v1';

type State = Readonly<{ market: ConsumerMarket }>;
type Event = { type: 'market-selected'; market: ConsumerMarket };

const transition: StateTransition<State, Event> = (_state, event) => ({
  market: event.market,
});

export const packageConsumerStore = createReducerStore({
  createInitialState: (): State => ({ market: 'CH' }),
  transition,
});

export function useSelectedMarket(): ConsumerMarket {
  return useOkamStore(packageConsumerStore, (state) => state.value.market);
}

const phone: PhoneInput = {
  market: packageConsumerStore.getState().value.market,
  value: '79 123 45 67',
};

export const packageConsumerExamples = {
  formatted: formatMoneyMinor(1_234, 'CH'),
  phone: normalizePhoneNumber(phone),
};

const packageStorefrontWire: ConsumerStorefrontWire =
  consumerStorefrontSchema.parse({
    id: 6,
    name: 'Bahnhof Beizli',
    slug: 'bahnhof-beizli',
    currencyCode: 'CHF',
    isOpenNow: true,
    selfPickUp: true,
    categories: [],
  });

const packageStorefrontScope: ConsumerStorefrontScope = {
  storeId: 6,
  slug: 'bahnhof-beizli',
};

export const packageProductScope: ConsumerProductScope = {
  storeId: packageStorefrontScope.storeId,
  currencyCode: packageStorefrontWire.currencyCode,
};

export const packageCatalogueMismatchCode =
  new ConsumerCatalogueScopeError('contract probe').code;

export const packageStorefront: StorefrontCatalog = mapConsumerStorefront(
  packageStorefrontWire,
  'https://api.example.test',
  packageStorefrontScope,
);

const packageC1Manifest = parseConsumerManifestV1({
  id: 'package-contract',
  key: 'okam',
  version: 1,
  publicationState: 'published',
  displayName: 'Okam',
  showOkamTrace: false,
  storeScope: { kind: 'explicit', allowedStoreIds: ['6'] },
});
if (!packageC1Manifest.ok) throw new Error('package manifest must parse');
const packageC1Provenance = {
  kind: 'compiled-install' as const,
  fingerprint: 'package-contract:v1',
};
const packageC1Verifier = createInstalledManifestVerifierV1({
  expectedManifest: packageC1Manifest.manifest,
  provenance: packageC1Provenance,
});
const packageC1VerifiedManifest = verifyInstalledConsumerManifestV1({
  manifest: packageC1Manifest.manifest,
  verifier: packageC1Verifier,
  provenance: packageC1Provenance,
});
if (!packageC1VerifiedManifest.ok) {
  throw new Error('package manifest must verify');
}
const packageC1Scope = compileAuthorizedStoreScopeV1({
  manifest: packageC1VerifiedManifest.manifest,
  storeId: '6',
  market: 'CH',
  currency: 'CHF',
});
if (!packageC1Scope.ok) throw new Error('package scope must compile');

export const packageC1Cart: ConsumerCartV1 = createConsumerCartV1(
  packageC1Scope.scope,
);

export const packageC1CartEvent = cartEventV1Schema.parse({
  type: 'cart-cleared',
});

export const packageC1CartReduction = reduceConsumerCartV1({
  cart: packageC1Cart,
  scope: packageC1Scope.scope,
  event: packageC1CartEvent,
});
