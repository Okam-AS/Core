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
  createInstalledAppProfileVerifierV1,
  createInstalledManifestVerifierV1,
  createInstalledMarketPolicyVerifierV1,
  createConsumerCartV1,
  parseConsumerManifestV1,
  parseConsumerAppProfileV1,
  parseMarketPaymentPolicyV1,
  reduceConsumerCartV1,
  resolveConsumerPaymentCapabilitiesV1,
  resolveConsumerUiLanguageV1,
  verifyInstalledConsumerAppProfileV1,
  verifyInstalledConsumerManifestV1,
  verifyInstalledMarketPaymentPolicyV1,
  type ConsumerCartV1,
} from '@okam/core/consumer/c1/domain/v1';
import { cartEventV1Schema } from '@okam/core/consumer/c1/contracts/v1';
import {
  consumerAppProfileV1Schema,
  type ConsumerAppProfileWireV1,
} from '@okam/core/consumer/c1/contracts/v1';

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

const packageConsumerAppProfileWire: ConsumerAppProfileWireV1 =
  consumerAppProfileV1Schema.parse({
    version: 1,
    id: 'okam.ch.package',
    environment: 'production',
    market: 'CH',
    currency: 'CHF',
    apiOrigin: 'https://api.okam.ch',
    themeManifest: {
      id: 'okam',
      version: 1,
      sha256: 'a'.repeat(64),
    },
    marketManifest: {
      id: 'market-ch',
      version: 1,
      sha256: 'b'.repeat(64),
    },
    storeScope: {
      kind: 'explicit',
      allowedStoreIds: ['6'],
    },
    identity: {
      iosBundleId: 'no.okam.consumer.ch',
      androidPackageName: 'no.okam.consumer.ch',
      appScheme: 'okam-ch',
      notificationHubName: 'okam-consumer-ch',
    },
    storeLinks: {
      appleAppStore: null,
      googlePlayStore: null,
    },
    languagePolicy: {
      defaultLanguage: 'de',
      offeredLanguages: ['de', 'fr', 'it', 'en'],
    },
    compiledPaymentAdapters: ['stripe'],
  });
const packageConsumerAppProfileParsed = parseConsumerAppProfileV1(
  packageConsumerAppProfileWire,
);
if (!packageConsumerAppProfileParsed.ok) {
  throw new Error('Package profile must parse.');
}
const packageConsumerAppProfileProvenance = {
  kind: 'compiled-install' as const,
  fingerprint: 'package-profile:v1',
};
const packageConsumerAppProfileVerifier =
  createInstalledAppProfileVerifierV1({
    expectedProfile: packageConsumerAppProfileWire,
    provenance: packageConsumerAppProfileProvenance,
  });
const packageConsumerAppProfileVerified =
  verifyInstalledConsumerAppProfileV1({
    profile: packageConsumerAppProfileParsed.profile,
    verifier: packageConsumerAppProfileVerifier,
    provenance: packageConsumerAppProfileProvenance,
  });
if (!packageConsumerAppProfileVerified.ok) {
  throw new Error('Package profile must verify.');
}

export const packageConsumerLanguage = resolveConsumerUiLanguageV1({
  profile: packageConsumerAppProfileVerified.profile,
  persistedPreference: {
    version: 1,
    appProfileId: packageConsumerAppProfileVerified.profile.id,
    appProfileFingerprint: packageConsumerAppProfileProvenance.fingerprint,
    market: packageConsumerAppProfileVerified.profile.market,
    language: 'fr',
  },
  deviceLanguages: ['de-CH'],
});

const packageMarketPaymentPolicyWire = {
  market: 'CH' as const,
  currency: 'CHF' as const,
  manifest: packageConsumerAppProfileWire.marketManifest,
  publicProviders: ['PayInStore'] as const,
};
const packageMarketPaymentPolicyParsed = parseMarketPaymentPolicyV1(
  packageMarketPaymentPolicyWire,
);
if (!packageMarketPaymentPolicyParsed.ok) {
  throw new Error('Package market policy must parse.');
}
const packageMarketPaymentPolicyProvenance = {
  kind: 'generated-projection' as const,
  fingerprint: 'package-market-policy:v1',
};
const packageMarketPaymentPolicyVerifier =
  createInstalledMarketPolicyVerifierV1({
    expectedPolicy: packageMarketPaymentPolicyWire,
    provenance: packageMarketPaymentPolicyProvenance,
  });
const packageMarketPaymentPolicyVerified =
  verifyInstalledMarketPaymentPolicyV1({
    policy: packageMarketPaymentPolicyParsed.policy,
    verifier: packageMarketPaymentPolicyVerifier,
    provenance: packageMarketPaymentPolicyProvenance,
  });
if (!packageMarketPaymentPolicyVerified.ok) {
  throw new Error('Package market policy must verify.');
}

export const packagePaymentCapabilityResolution =
  resolveConsumerPaymentCapabilitiesV1({
    profile: packageConsumerAppProfileVerified.profile,
    storeScope: {
      appProfileId: packageConsumerAppProfileVerified.profile.id,
      appProfileFingerprint:
        packageConsumerAppProfileProvenance.fingerprint,
      storeId: '6',
      cartId: 'package-cart',
      market: 'CH',
      currency: 'CHF',
    },
    marketPolicy: packageMarketPaymentPolicyVerified.policy,
    serverCapabilities: {
      version: 1,
      storeId: '6',
      cartId: 'package-cart',
      market: 'CH',
      currency: 'CHF',
      capabilities: [],
    },
  });
