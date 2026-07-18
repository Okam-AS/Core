import { z } from 'zod';

import {
  consumerCurrencyV1Schema,
  consumerMarketV1Schema,
  consumerStoreScopeV1Schema,
  opaqueStoreIdV1Schema,
} from './consumer-workflow';

export const consumerUiLanguageV1Schema = z.enum([
  'en',
  'de',
  'fr',
  'it',
  'no',
]);

export const consumerRegionalFormatTagV1Schema = z.enum([
  'de-CH',
  'en-CH',
  'en-NO',
  'fr-CH',
  'it-CH',
  'nb-NO',
]);

export const languagePolicyV1Schema = z.object({
  defaultLanguage: consumerUiLanguageV1Schema,
  offeredLanguages: z.array(consumerUiLanguageV1Schema).min(1),
}).strict().superRefine((policy, context) => {
  if (!policy.offeredLanguages.includes(policy.defaultLanguage)) {
    context.addIssue({
      code: 'custom',
      path: ['defaultLanguage'],
      message: 'The default UI language must be offered by the profile.',
    });
  }
  if (new Set(policy.offeredLanguages).size !== policy.offeredLanguages.length) {
    context.addIssue({
      code: 'custom',
      path: ['offeredLanguages'],
      message: 'Offered UI languages must be unique.',
    });
  }
});

export const consumerAppEnvironmentV1Schema = z.enum([
  'development',
  'staging',
  'production',
]);

export const compiledPaymentAdapterV1Schema = z.enum([
  'stripe',
  'vipps',
  'dintero',
]);

export const consumerPaymentProviderV1Schema = z.enum([
  'Stripe',
  'Twint',
  'Vipps',
  'Dintero',
  'DinteroVipps',
  'DinteroBillie',
  'DinteroKlarna',
  'DinteroKravia',
  'Giftcard',
  'PayInStore',
]);

export const consumerPaymentInteractionKindV1Schema = z.enum([
  'native',
  'hosted-redirect',
  'external-app',
  'offline',
]);

const profileIdentifierV1Schema = z
  .string()
  .regex(/^[a-z0-9]+(?:[._-][a-z0-9]+)*$/u);
const manifestVersionV1Schema = z.union([
  z.string().min(1),
  z.number().finite(),
]);
const sha256V1Schema = z.string().regex(/^[a-f0-9]{64}$/u);
const httpUrlV1Schema = z.url({ protocol: /^https?$/u });
const appIdentityV1Schema = z
  .string()
  .regex(/^[A-Za-z][A-Za-z0-9]*(?:\.[A-Za-z0-9_-]+)+$/u);
const appSchemeV1Schema = z
  .string()
  .regex(/^[a-z][a-z0-9+.-]*$/u);

export const consumerManifestReferenceV1Schema = z.object({
  id: z.string().min(1),
  version: manifestVersionV1Schema,
  sha256: sha256V1Schema,
}).strict();

export const consumerAppStoreScopeV1Schema =
  consumerStoreScopeV1Schema.superRefine((scope, context) => {
    const storeIds = scope.kind === 'explicit'
      ? scope.allowedStoreIds
      : scope.resolvedStoreIds;
    if (new Set(storeIds).size !== storeIds.length) {
      context.addIssue({
        code: 'custom',
        path: scope.kind === 'explicit'
          ? ['allowedStoreIds']
          : ['resolvedStoreIds'],
        message: 'Installed profile store IDs must be unique.',
      });
    }
  });

const consumerAppProfileBaseV1Schema = z.object({
  version: z.literal(1),
  id: profileIdentifierV1Schema,
  environment: consumerAppEnvironmentV1Schema,
  market: consumerMarketV1Schema,
  currency: consumerCurrencyV1Schema,
  apiOrigin: httpUrlV1Schema,
  themeManifest: consumerManifestReferenceV1Schema,
  marketManifest: consumerManifestReferenceV1Schema,
  storeScope: consumerAppStoreScopeV1Schema,
  identity: z.object({
    iosBundleId: appIdentityV1Schema,
    androidPackageName: appIdentityV1Schema,
    appScheme: appSchemeV1Schema,
    notificationHubName: z.string().min(1),
  }).strict(),
  storeLinks: z.object({
    appleAppStore: httpUrlV1Schema.nullable(),
    googlePlayStore: httpUrlV1Schema.nullable(),
  }).strict(),
  languagePolicy: languagePolicyV1Schema,
  compiledPaymentAdapters: z.array(compiledPaymentAdapterV1Schema),
}).strict();

const EXACT_LANGUAGE_POLICY_V1 = {
  CH: {
    defaultLanguage: 'de',
    offeredLanguages: ['de', 'fr', 'it', 'en'],
  },
  NO: {
    defaultLanguage: 'no',
    offeredLanguages: ['no', 'en'],
  },
} as const;

function sameStringSetV1(
  left: readonly string[],
  right: readonly string[],
): boolean {
  return (
    left.length === right.length &&
    left.every((value) => right.includes(value))
  );
}

export const consumerAppProfileV1Schema =
  consumerAppProfileBaseV1Schema.superRefine((profile, context) => {
    const expectedCurrency = profile.market === 'CH' ? 'CHF' : 'NOK';
    if (profile.currency !== expectedCurrency) {
      context.addIssue({
        code: 'custom',
        path: ['currency'],
        message: 'The installed market and currency do not match.',
      });
    }

    const expectedLanguagePolicy = EXACT_LANGUAGE_POLICY_V1[profile.market];
    if (
      profile.languagePolicy.defaultLanguage !==
        expectedLanguagePolicy.defaultLanguage ||
      !sameStringSetV1(
        profile.languagePolicy.offeredLanguages,
        expectedLanguagePolicy.offeredLanguages,
      )
    ) {
      context.addIssue({
        code: 'custom',
        path: ['languagePolicy'],
        message: 'The installed market language policy is not approved.',
      });
    }

    if (
      new Set(profile.compiledPaymentAdapters).size !==
        profile.compiledPaymentAdapters.length
    ) {
      context.addIssue({
        code: 'custom',
        path: ['compiledPaymentAdapters'],
        message: 'Compiled payment adapters must be unique.',
      });
    }

    if (
      profile.environment === 'production' &&
      new URL(profile.apiOrigin).protocol !== 'https:'
    ) {
      context.addIssue({
        code: 'custom',
        path: ['apiOrigin'],
        message: 'Production API origins must use HTTPS.',
      });
    }
  });

export const consumerStorePaymentScopeV1Schema = z.object({
  appProfileId: profileIdentifierV1Schema,
  appProfileFingerprint: z.string().min(1),
  storeId: opaqueStoreIdV1Schema,
  cartId: z.string().min(1),
  market: consumerMarketV1Schema,
  currency: consumerCurrencyV1Schema,
}).strict();

export const consumerUiLanguagePreferenceV1Schema = z.object({
  version: z.literal(1),
  appProfileId: profileIdentifierV1Schema,
  appProfileFingerprint: z.string().min(1),
  market: consumerMarketV1Schema,
  language: consumerUiLanguageV1Schema,
}).strict();

const marketPaymentPolicyBaseV1Schema = z.object({
  market: consumerMarketV1Schema,
  currency: consumerCurrencyV1Schema,
  manifest: consumerManifestReferenceV1Schema,
  publicProviders: z.array(consumerPaymentProviderV1Schema),
}).strict();

export const marketPaymentPolicyV1Schema =
  marketPaymentPolicyBaseV1Schema.superRefine((policy, context) => {
    const expectedCurrency = policy.market === 'CH' ? 'CHF' : 'NOK';
    if (policy.currency !== expectedCurrency) {
      context.addIssue({
        code: 'custom',
        path: ['currency'],
        message: 'The market payment policy currency does not match.',
      });
    }
    if (
      new Set(policy.publicProviders).size !== policy.publicProviders.length
    ) {
      context.addIssue({
        code: 'custom',
        path: ['publicProviders'],
        message: 'Public payment providers must be unique.',
      });
    }
  });

export const consumerPaymentCapabilityV1Schema = z.object({
  capabilityId: z.string().min(1),
  provider: consumerPaymentProviderV1Schema,
  available: z.boolean(),
  interactionKind: consumerPaymentInteractionKindV1Schema,
  providerCorrelationId: z.string().min(1),
  storeId: opaqueStoreIdV1Schema,
  cartId: z.string().min(1),
  market: consumerMarketV1Schema,
  currency: consumerCurrencyV1Schema,
}).strict();

const consumerPaymentCapabilitiesBaseV1Schema = z.object({
  version: z.literal(1),
  storeId: opaqueStoreIdV1Schema,
  cartId: z.string().min(1),
  market: consumerMarketV1Schema,
  currency: consumerCurrencyV1Schema,
  capabilities: z.array(consumerPaymentCapabilityV1Schema),
}).strict();

export const consumerPaymentCapabilitiesV1Schema =
  consumerPaymentCapabilitiesBaseV1Schema.superRefine((response, context) => {
    const capabilityIds = new Set<string>();
    for (const [index, capability] of response.capabilities.entries()) {
      if (
        capability.storeId !== response.storeId ||
        capability.cartId !== response.cartId ||
        capability.market !== response.market ||
        capability.currency !== response.currency
      ) {
        context.addIssue({
          code: 'custom',
          path: ['capabilities', index],
          message: 'Every payment capability must carry the response scope.',
        });
      }
      if (capabilityIds.has(capability.capabilityId)) {
        context.addIssue({
          code: 'custom',
          path: ['capabilities', index, 'capabilityId'],
          message: 'Payment capability IDs must be unique.',
        });
      }
      capabilityIds.add(capability.capabilityId);
    }
  });

export type ConsumerUiLanguageWireV1 = z.output<
  typeof consumerUiLanguageV1Schema
>;
export type ConsumerRegionalFormatTagWireV1 = z.output<
  typeof consumerRegionalFormatTagV1Schema
>;
export type LanguagePolicyWireV1 = z.output<typeof languagePolicyV1Schema>;
export type ConsumerAppEnvironmentWireV1 = z.output<
  typeof consumerAppEnvironmentV1Schema
>;
export type CompiledPaymentAdapterWireV1 = z.output<
  typeof compiledPaymentAdapterV1Schema
>;
export type ConsumerPaymentProviderWireV1 = z.output<
  typeof consumerPaymentProviderV1Schema
>;
export type ConsumerPaymentInteractionKindWireV1 = z.output<
  typeof consumerPaymentInteractionKindV1Schema
>;
export type ConsumerManifestReferenceWireV1 = z.output<
  typeof consumerManifestReferenceV1Schema
>;
export type ConsumerAppProfileWireV1 = z.output<
  typeof consumerAppProfileV1Schema
>;
export type ConsumerStorePaymentScopeWireV1 = z.output<
  typeof consumerStorePaymentScopeV1Schema
>;
export type ConsumerUiLanguagePreferenceWireV1 = z.output<
  typeof consumerUiLanguagePreferenceV1Schema
>;
export type MarketPaymentPolicyWireV1 = z.output<
  typeof marketPaymentPolicyV1Schema
>;
export type ConsumerPaymentCapabilityWireV1 = z.output<
  typeof consumerPaymentCapabilityV1Schema
>;
export type ConsumerPaymentCapabilitiesWireV1 = z.output<
  typeof consumerPaymentCapabilitiesV1Schema
>;
