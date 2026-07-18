import {
  consumerAppProfileV1Schema,
  consumerPaymentCapabilitiesV1Schema,
  consumerPaymentProviderV1Schema,
  consumerStorePaymentScopeV1Schema,
  consumerUiLanguagePreferenceV1Schema,
  languagePolicyV1Schema,
  marketPaymentPolicyV1Schema,
  type CompiledPaymentAdapterWireV1,
  type ConsumerAppProfileWireV1,
  type ConsumerManifestReferenceWireV1,
  type ConsumerPaymentCapabilityWireV1,
  type ConsumerPaymentProviderWireV1,
  type ConsumerRegionalFormatTagWireV1,
  type ConsumerStorePaymentScopeWireV1,
  type ConsumerUiLanguageWireV1,
  type ConsumerUiLanguagePreferenceWireV1,
  type LanguagePolicyWireV1,
  type MarketPaymentPolicyWireV1,
} from '../../contracts/v1';
import {
  resolveConsumerRegionalFormatTag,
  type ConsumerMarket,
} from '../../../c0/domain/v1/market';
import { deepFreezeV1, type DeepReadonlyV1 } from './immutable';

declare const parsedConsumerAppProfileBrandV1: unique symbol;
declare const verifiedConsumerAppProfileBrandV1: unique symbol;
declare const installedAppProfileVerifierBrandV1: unique symbol;
declare const parsedMarketPaymentPolicyBrandV1: unique symbol;
declare const verifiedMarketPaymentPolicyBrandV1: unique symbol;
declare const installedMarketPolicyVerifierBrandV1: unique symbol;

export type ParsedConsumerAppProfileV1 =
  DeepReadonlyV1<ConsumerAppProfileWireV1> & {
    readonly [parsedConsumerAppProfileBrandV1]: true;
  };
export type VerifiedConsumerAppProfileV1 = ParsedConsumerAppProfileV1 & {
  readonly [verifiedConsumerAppProfileBrandV1]: true;
};
/** Compatibility name for structurally parsed, explicitly untrusted data. */
export type ConsumerAppProfileV1 = ParsedConsumerAppProfileV1;
export type LanguagePolicyV1 = DeepReadonlyV1<LanguagePolicyWireV1>;
export type ConsumerUiLanguagePreferenceV1 =
  DeepReadonlyV1<ConsumerUiLanguagePreferenceWireV1>;
export type ConsumerPaymentCapabilityV1 =
  DeepReadonlyV1<ConsumerPaymentCapabilityWireV1>;

export type ConsumerAppProfileParseV1 =
  | Readonly<{ ok: true; profile: ParsedConsumerAppProfileV1 }>
  | Readonly<{ ok: false; reason: 'profile-invalid' }>;

export function parseConsumerAppProfileV1(
  input: unknown,
): ConsumerAppProfileParseV1 {
  const parsed = consumerAppProfileV1Schema.safeParse(input);
  return parsed.success
    ? {
        ok: true,
        profile: deepFreezeV1(parsed.data) as ParsedConsumerAppProfileV1,
      }
    : { ok: false, reason: 'profile-invalid' };
}

export type InstalledAppProfileProvenanceV1 = DeepReadonlyV1<{
  kind: 'compiled-install' | 'verified-signature';
  fingerprint: string;
}>;

export type InstalledAppProfileVerifierV1 = DeepReadonlyV1<{
  expectedProfileId: string;
  provenance: InstalledAppProfileProvenanceV1;
}> & {
  readonly [installedAppProfileVerifierBrandV1]: true;
};

type VerifiedAppProfileRecordV1 = Readonly<{
  canonicalProfile: string;
  provenance: InstalledAppProfileProvenanceV1;
}>;

const installedAppProfileVerifiersV1 =
  new WeakMap<object, VerifiedAppProfileRecordV1>();
const verifiedAppProfilesV1 =
  new WeakMap<object, VerifiedAppProfileRecordV1>();

function canonicalAuthorityV1(value: unknown): string {
  return JSON.stringify(value);
}

function checkedFingerprintV1(fingerprint: string): string {
  if (fingerprint.trim().length === 0 || fingerprint.trim() !== fingerprint) {
    throw new TypeError('Installed authority requires an exact fingerprint.');
  }
  return fingerprint;
}

export function createInstalledAppProfileVerifierV1(input: Readonly<{
  expectedProfile: DeepReadonlyV1<ConsumerAppProfileWireV1>;
  provenance: InstalledAppProfileProvenanceV1;
}>): InstalledAppProfileVerifierV1 {
  const expected = consumerAppProfileV1Schema.parse(input.expectedProfile);
  const provenance = deepFreezeV1({
    kind: input.provenance.kind,
    fingerprint: checkedFingerprintV1(input.provenance.fingerprint),
  });
  const verifier = deepFreezeV1({
    expectedProfileId: expected.id,
    provenance,
  }) as InstalledAppProfileVerifierV1;
  installedAppProfileVerifiersV1.set(verifier, {
    canonicalProfile: canonicalAuthorityV1(expected),
    provenance,
  });
  return verifier;
}

export type InstalledAppProfileVerificationV1 =
  | Readonly<{
      ok: true;
      profile: VerifiedConsumerAppProfileV1;
    }>
  | Readonly<{
      ok: false;
      reason:
        | 'verifier-untrusted'
        | 'provenance-mismatch'
        | 'installed-profile-mismatch';
    }>;

export function verifyInstalledConsumerAppProfileV1(input: Readonly<{
  profile: ParsedConsumerAppProfileV1;
  verifier: InstalledAppProfileVerifierV1;
  provenance: InstalledAppProfileProvenanceV1;
}>): InstalledAppProfileVerificationV1 {
  const record = installedAppProfileVerifiersV1.get(input.verifier);
  if (!record) return { ok: false, reason: 'verifier-untrusted' };
  if (
    input.provenance.kind !== record.provenance.kind ||
    input.provenance.fingerprint !== record.provenance.fingerprint
  ) {
    return { ok: false, reason: 'provenance-mismatch' };
  }
  if (canonicalAuthorityV1(input.profile) !== record.canonicalProfile) {
    return { ok: false, reason: 'installed-profile-mismatch' };
  }
  verifiedAppProfilesV1.set(input.profile, record);
  return {
    ok: true,
    profile: input.profile as VerifiedConsumerAppProfileV1,
  };
}

function verifiedAppProfileRecordV1(
  input: unknown,
): VerifiedAppProfileRecordV1 | undefined {
  return typeof input === 'object' && input !== null
    ? verifiedAppProfilesV1.get(input)
    : undefined;
}

const APPROVED_LANGUAGE_POLICIES_V1 = {
  CH: {
    defaultLanguage: 'de',
    offeredLanguages: ['de', 'fr', 'it', 'en'],
  },
  NO: {
    defaultLanguage: 'no',
    offeredLanguages: ['no', 'en'],
  },
} as const;

function sameLanguageSetV1(
  left: readonly ConsumerUiLanguageWireV1[],
  right: readonly ConsumerUiLanguageWireV1[],
): boolean {
  return (
    left.length === right.length &&
    left.every((language) => right.includes(language))
  );
}

export type LanguagePolicyValidationV1 =
  | Readonly<{ ok: true; policy: LanguagePolicyV1 }>
  | Readonly<{
      ok: false;
      reason:
        | 'market-unknown'
        | 'policy-invalid'
        | 'default-language-mismatch'
        | 'offered-languages-mismatch';
    }>;

export function validateLanguagePolicyForMarketV1(input: Readonly<{
  market: unknown;
  policy: unknown;
}>): LanguagePolicyValidationV1 {
  if (input.market !== 'CH' && input.market !== 'NO') {
    return { ok: false, reason: 'market-unknown' };
  }
  const parsed = languagePolicyV1Schema.safeParse(input.policy);
  if (!parsed.success) return { ok: false, reason: 'policy-invalid' };

  const approved = APPROVED_LANGUAGE_POLICIES_V1[input.market];
  if (parsed.data.defaultLanguage !== approved.defaultLanguage) {
    return { ok: false, reason: 'default-language-mismatch' };
  }
  if (
    !sameLanguageSetV1(
      parsed.data.offeredLanguages,
      approved.offeredLanguages,
    )
  ) {
    return { ok: false, reason: 'offered-languages-mismatch' };
  }
  return { ok: true, policy: deepFreezeV1(parsed.data) };
}

export type ConsumerUiLanguageResolutionV1 =
  | Readonly<{
      ok: true;
      language: ConsumerUiLanguageWireV1;
      regionalFormatTag: ConsumerRegionalFormatTagWireV1;
      source: 'persisted' | 'device' | 'profile-default';
    }>
  | Readonly<{ ok: false; reason: 'profile-unverified' }>;

function languageFromDeviceTagV1(
  tag: unknown,
): ConsumerUiLanguageWireV1 | undefined {
  if (typeof tag !== 'string') return undefined;
  const primary = tag.trim().split(/[-_]/u)[0]?.toLowerCase();
  if (primary === 'nb' || primary === 'nn') return 'no';
  return (
    primary === 'en' ||
    primary === 'no' ||
    primary === 'de' ||
    primary === 'fr' ||
    primary === 'it'
  )
    ? primary
    : undefined;
}

export function resolveConsumerUiLanguageV1(input: Readonly<{
  profile: VerifiedConsumerAppProfileV1;
  persistedPreference?: unknown;
  deviceLanguages: readonly unknown[];
}>): ConsumerUiLanguageResolutionV1 {
  const profileRecord = verifiedAppProfileRecordV1(input.profile);
  if (!profileRecord) {
    return { ok: false, reason: 'profile-unverified' };
  }

  const policy = input.profile.languagePolicy;
  const persisted = consumerUiLanguagePreferenceV1Schema.safeParse(
    input.persistedPreference,
  );
  if (
    persisted.success &&
    persisted.data.appProfileId === input.profile.id &&
    persisted.data.appProfileFingerprint ===
      profileRecord.provenance.fingerprint &&
    persisted.data.market === input.profile.market &&
    policy.offeredLanguages.includes(
      persisted.data.language,
    )
  ) {
    return languageResolutionV1(
      input.profile.market,
      persisted.data.language,
      'persisted',
    );
  }

  for (const tag of input.deviceLanguages) {
    const language = languageFromDeviceTagV1(tag);
    if (language && policy.offeredLanguages.includes(language)) {
      return languageResolutionV1(
        input.profile.market,
        language,
        'device',
      );
    }
  }

  return languageResolutionV1(
    input.profile.market,
    policy.defaultLanguage,
    'profile-default',
  );
}

function languageResolutionV1(
  market: ConsumerMarket,
  language: ConsumerUiLanguageWireV1,
  source: 'persisted' | 'device' | 'profile-default',
): Extract<ConsumerUiLanguageResolutionV1, { ok: true }> {
  return deepFreezeV1({
    ok: true,
    language,
    regionalFormatTag: resolveConsumerRegionalFormatTag({
      market,
      locale: language,
    }),
    source,
  });
}

export type ParsedMarketPaymentPolicyV1 =
  DeepReadonlyV1<MarketPaymentPolicyWireV1> & {
    readonly [parsedMarketPaymentPolicyBrandV1]: true;
  };
export type VerifiedMarketPaymentPolicyV1 =
  ParsedMarketPaymentPolicyV1 & {
    readonly [verifiedMarketPaymentPolicyBrandV1]: true;
  };

export type MarketPaymentPolicyParseV1 =
  | Readonly<{ ok: true; policy: ParsedMarketPaymentPolicyV1 }>
  | Readonly<{ ok: false; reason: 'market-policy-invalid' }>;

export function parseMarketPaymentPolicyV1(
  input: unknown,
): MarketPaymentPolicyParseV1 {
  const parsed = marketPaymentPolicyV1Schema.safeParse(input);
  return parsed.success
    ? {
        ok: true,
        policy: deepFreezeV1(parsed.data) as ParsedMarketPaymentPolicyV1,
      }
    : { ok: false, reason: 'market-policy-invalid' };
}

export type InstalledMarketPolicyProvenanceV1 = DeepReadonlyV1<{
  kind: 'generated-projection' | 'verified-signature';
  fingerprint: string;
}>;

export type InstalledMarketPolicyVerifierV1 = DeepReadonlyV1<{
  expectedManifestId: string;
  expectedMarket: ConsumerMarket;
  provenance: InstalledMarketPolicyProvenanceV1;
}> & {
  readonly [installedMarketPolicyVerifierBrandV1]: true;
};

type VerifiedMarketPolicyRecordV1 = Readonly<{
  canonicalPolicy: string;
  provenance: InstalledMarketPolicyProvenanceV1;
}>;

const installedMarketPolicyVerifiersV1 =
  new WeakMap<object, VerifiedMarketPolicyRecordV1>();
const verifiedMarketPaymentPoliciesV1 =
  new WeakMap<object, VerifiedMarketPolicyRecordV1>();

export function createInstalledMarketPolicyVerifierV1(input: Readonly<{
  expectedPolicy: DeepReadonlyV1<MarketPaymentPolicyWireV1>;
  provenance: InstalledMarketPolicyProvenanceV1;
}>): InstalledMarketPolicyVerifierV1 {
  const expected = marketPaymentPolicyV1Schema.parse(input.expectedPolicy);
  const provenance = deepFreezeV1({
    kind: input.provenance.kind,
    fingerprint: checkedFingerprintV1(input.provenance.fingerprint),
  });
  const verifier = deepFreezeV1({
    expectedManifestId: expected.manifest.id,
    expectedMarket: expected.market,
    provenance,
  }) as InstalledMarketPolicyVerifierV1;
  installedMarketPolicyVerifiersV1.set(verifier, {
    canonicalPolicy: canonicalAuthorityV1(expected),
    provenance,
  });
  return verifier;
}

export type InstalledMarketPolicyVerificationV1 =
  | Readonly<{
      ok: true;
      policy: VerifiedMarketPaymentPolicyV1;
    }>
  | Readonly<{
      ok: false;
      reason:
        | 'verifier-untrusted'
        | 'provenance-mismatch'
        | 'installed-policy-mismatch';
    }>;

export function verifyInstalledMarketPaymentPolicyV1(input: Readonly<{
  policy: ParsedMarketPaymentPolicyV1;
  verifier: InstalledMarketPolicyVerifierV1;
  provenance: InstalledMarketPolicyProvenanceV1;
}>): InstalledMarketPolicyVerificationV1 {
  const record = installedMarketPolicyVerifiersV1.get(input.verifier);
  if (!record) return { ok: false, reason: 'verifier-untrusted' };
  if (
    input.provenance.kind !== record.provenance.kind ||
    input.provenance.fingerprint !== record.provenance.fingerprint
  ) {
    return { ok: false, reason: 'provenance-mismatch' };
  }
  if (canonicalAuthorityV1(input.policy) !== record.canonicalPolicy) {
    return { ok: false, reason: 'installed-policy-mismatch' };
  }
  verifiedMarketPaymentPoliciesV1.set(input.policy, record);
  return {
    ok: true,
    policy: input.policy as VerifiedMarketPaymentPolicyV1,
  };
}

function verifiedMarketPaymentPolicyRecordV1(
  input: unknown,
): VerifiedMarketPolicyRecordV1 | undefined {
  return typeof input === 'object' && input !== null
    ? verifiedMarketPaymentPoliciesV1.get(input)
    : undefined;
}

const REQUIRED_ADAPTER_BY_PROVIDER_V1: Readonly<
  Record<
    ConsumerPaymentProviderWireV1,
    CompiledPaymentAdapterWireV1 | null
  >
> = {
  Stripe: 'stripe',
  Twint: 'stripe',
  Vipps: 'vipps',
  Dintero: 'dintero',
  DinteroVipps: 'dintero',
  DinteroBillie: 'dintero',
  DinteroKlarna: 'dintero',
  DinteroKravia: 'dintero',
  Giftcard: null,
  PayInStore: null,
};

const INTERACTION_KINDS_BY_PROVIDER_V1: Readonly<
  Record<ConsumerPaymentProviderWireV1, readonly string[]>
> = {
  Stripe: ['native', 'hosted-redirect'],
  Twint: ['hosted-redirect', 'external-app'],
  Vipps: ['external-app', 'hosted-redirect'],
  Dintero: ['hosted-redirect'],
  DinteroVipps: ['hosted-redirect', 'external-app'],
  DinteroBillie: ['hosted-redirect'],
  DinteroKlarna: ['hosted-redirect'],
  DinteroKravia: ['hosted-redirect'],
  Giftcard: ['native'],
  PayInStore: ['offline'],
};

export type PaymentCapabilityDenialReasonV1 =
  | 'server-unavailable'
  | 'provider-not-public-for-market'
  | 'adapter-not-compiled';

export type DeniedConsumerPaymentCapabilityV1 = DeepReadonlyV1<{
  capabilityId: string;
  provider: ConsumerPaymentProviderWireV1;
  reason: PaymentCapabilityDenialReasonV1;
}>;

export type ResolvedConsumerPaymentCapabilityV1 = DeepReadonlyV1<{
  capability: ConsumerPaymentCapabilityWireV1;
  requiredAdapter: CompiledPaymentAdapterWireV1 | null;
}>;

export type PaymentCapabilityResolutionFailureReasonV1 =
  | 'profile-unverified'
  | 'store-scope-invalid'
  | 'market-policy-unverified'
  | 'payment-capabilities-invalid'
  | 'provider-unknown'
  | 'profile-store-profile-mismatch'
  | 'profile-store-fingerprint-mismatch'
  | 'profile-store-market-mismatch'
  | 'profile-store-currency-mismatch'
  | 'store-not-authorized'
  | 'profile-market-policy-mismatch'
  | 'capability-market-mismatch'
  | 'capability-currency-mismatch'
  | 'capability-store-mismatch'
  | 'capability-cart-mismatch'
  | 'provider-interaction-mismatch';

export type ConsumerPaymentCapabilityResolutionV1 =
  | DeepReadonlyV1<{
      ok: true;
      offered: ResolvedConsumerPaymentCapabilityV1[];
      denied: DeniedConsumerPaymentCapabilityV1[];
    }>
  | Readonly<{
      ok: false;
      offered: readonly [];
      denied: readonly [];
      reason: PaymentCapabilityResolutionFailureReasonV1;
    }>;

function profileAllowsStoreV1(
  profile: ConsumerAppProfileV1,
  storeId: string,
): boolean {
  const storeIds = profile.storeScope.kind === 'explicit'
    ? profile.storeScope.allowedStoreIds
    : profile.storeScope.resolvedStoreIds;
  return storeIds.includes(storeId);
}

function manifestReferencesMatchV1(
  left: ConsumerManifestReferenceWireV1,
  right: ConsumerManifestReferenceWireV1,
): boolean {
  return (
    left.id === right.id &&
    left.version === right.version &&
    left.sha256 === right.sha256
  );
}

function rawCapabilitiesContainUnknownProviderV1(input: unknown): boolean {
  if (typeof input !== 'object' || input === null) return false;
  const capabilities = (input as Record<string, unknown>)['capabilities'];
  if (!Array.isArray(capabilities)) return false;
  return capabilities.some((capability) => {
    if (typeof capability !== 'object' || capability === null) return false;
    const provider = (capability as Record<string, unknown>)['provider'];
    return (
      typeof provider === 'string' &&
      !consumerPaymentProviderV1Schema.safeParse(provider).success
    );
  });
}

function failureV1(
  reason: PaymentCapabilityResolutionFailureReasonV1,
): Extract<ConsumerPaymentCapabilityResolutionV1, { ok: false }> {
  return {
    ok: false,
    offered: [],
    denied: [],
    reason,
  };
}

function validateProfileAndScopeV1(input: Readonly<{
  profile: VerifiedConsumerAppProfileV1;
  storeScope: unknown;
}>):
  | Readonly<{
      ok: true;
      profile: VerifiedConsumerAppProfileV1;
      storeScope: ConsumerStorePaymentScopeWireV1;
    }>
  | Readonly<{
      ok: false;
      reason: PaymentCapabilityResolutionFailureReasonV1;
    }> {
  const profileRecord = verifiedAppProfileRecordV1(input.profile);
  if (!profileRecord) {
    return { ok: false, reason: 'profile-unverified' };
  }

  const parsedScope = consumerStorePaymentScopeV1Schema.safeParse(
    input.storeScope,
  );
  if (!parsedScope.success) {
    return { ok: false, reason: 'store-scope-invalid' };
  }
  if (input.profile.id !== parsedScope.data.appProfileId) {
    return { ok: false, reason: 'profile-store-profile-mismatch' };
  }
  if (
    profileRecord.provenance.fingerprint !==
      parsedScope.data.appProfileFingerprint
  ) {
    return { ok: false, reason: 'profile-store-fingerprint-mismatch' };
  }
  if (input.profile.market !== parsedScope.data.market) {
    return { ok: false, reason: 'profile-store-market-mismatch' };
  }
  if (input.profile.currency !== parsedScope.data.currency) {
    return { ok: false, reason: 'profile-store-currency-mismatch' };
  }
  if (!profileAllowsStoreV1(input.profile, parsedScope.data.storeId)) {
    return { ok: false, reason: 'store-not-authorized' };
  }
  return {
    ok: true,
    profile: input.profile,
    storeScope: parsedScope.data,
  };
}

/**
 * Pure fail-closed composition of the signed profile, generated market
 * projection and the exact server response. It never infers market authority
 * from a currency or provider and never turns a redirect return into success.
 */
export function resolveConsumerPaymentCapabilitiesV1(input: Readonly<{
  profile: VerifiedConsumerAppProfileV1;
  storeScope: unknown;
  marketPolicy: VerifiedMarketPaymentPolicyV1;
  serverCapabilities: unknown;
}>): ConsumerPaymentCapabilityResolutionV1 {
  const profileAndScope = validateProfileAndScopeV1(input);
  if (!profileAndScope.ok) return failureV1(profileAndScope.reason);

  if (!verifiedMarketPaymentPolicyRecordV1(input.marketPolicy)) {
    return failureV1('market-policy-unverified');
  }

  if (
    input.marketPolicy.market !== profileAndScope.profile.market ||
    input.marketPolicy.currency !== profileAndScope.profile.currency ||
    !manifestReferencesMatchV1(
      input.marketPolicy.manifest,
      profileAndScope.profile.marketManifest,
    )
  ) {
    return failureV1('profile-market-policy-mismatch');
  }

  if (rawCapabilitiesContainUnknownProviderV1(input.serverCapabilities)) {
    return failureV1('provider-unknown');
  }
  const parsedCapabilities = consumerPaymentCapabilitiesV1Schema.safeParse(
    input.serverCapabilities,
  );
  if (!parsedCapabilities.success) {
    return failureV1('payment-capabilities-invalid');
  }

  const scope = profileAndScope.storeScope;
  const response = parsedCapabilities.data;
  if (response.market !== scope.market) {
    return failureV1('capability-market-mismatch');
  }
  if (response.currency !== scope.currency) {
    return failureV1('capability-currency-mismatch');
  }
  if (response.storeId !== scope.storeId) {
    return failureV1('capability-store-mismatch');
  }
  if (response.cartId !== scope.cartId) {
    return failureV1('capability-cart-mismatch');
  }

  for (const capability of response.capabilities) {
    if (
      !INTERACTION_KINDS_BY_PROVIDER_V1[capability.provider].includes(
        capability.interactionKind,
      )
    ) {
      return failureV1('provider-interaction-mismatch');
    }
  }

  const offered: ResolvedConsumerPaymentCapabilityV1[] = [];
  const denied: DeniedConsumerPaymentCapabilityV1[] = [];
  for (const capability of response.capabilities) {
    const requiredAdapter = REQUIRED_ADAPTER_BY_PROVIDER_V1[
      capability.provider
    ];
    let reason: PaymentCapabilityDenialReasonV1 | undefined;
    if (!capability.available) {
      reason = 'server-unavailable';
    } else if (
      !input.marketPolicy.publicProviders.includes(capability.provider)
    ) {
      reason = 'provider-not-public-for-market';
    } else if (
      requiredAdapter !== null &&
      !profileAndScope.profile.compiledPaymentAdapters.includes(
        requiredAdapter,
      )
    ) {
      reason = 'adapter-not-compiled';
    }

    if (reason) {
      denied.push({
        capabilityId: capability.capabilityId,
        provider: capability.provider,
        reason,
      });
    } else {
      offered.push({ capability, requiredAdapter });
    }
  }

  return deepFreezeV1({ ok: true, offered, denied });
}

/** Compatibility name for structurally parsed, explicitly untrusted data. */
export type ConsumerMarketPaymentPolicyV1 = ParsedMarketPaymentPolicyV1;
