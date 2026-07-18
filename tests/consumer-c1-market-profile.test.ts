import { describe, expect, it } from 'vitest';

import {
  consumerAppProfileV1Schema,
  consumerPaymentCapabilitiesV1Schema,
  languagePolicyV1Schema,
  type ConsumerAppProfileWireV1,
  type ConsumerPaymentCapabilityWireV1,
  type ConsumerPaymentProviderWireV1,
  type MarketPaymentPolicyWireV1,
} from '../consumer/c1/contracts/v1';
import {
  createInstalledAppProfileVerifierV1,
  createInstalledMarketPolicyVerifierV1,
  parseConsumerAppProfileV1,
  parseMarketPaymentPolicyV1,
  resolveConsumerPaymentCapabilitiesV1,
  resolveConsumerUiLanguageV1,
  validateLanguagePolicyForMarketV1,
  verifyInstalledConsumerAppProfileV1,
  verifyInstalledMarketPaymentPolicyV1,
  type InstalledAppProfileProvenanceV1,
  type InstalledMarketPolicyProvenanceV1,
  type VerifiedConsumerAppProfileV1,
  type VerifiedMarketPaymentPolicyV1,
} from '../consumer/c1/domain/v1';
import {
  CONSUMER_LOCALES,
  CONSUMER_UI_LANGUAGES,
  isConsumerLocale,
  isConsumerUiLanguage,
  parseConsumerLocale,
  parseConsumerUiLanguage,
  resolveConsumerLocale,
  resolveConsumerRegionalFormatTag,
} from '../consumer/c0/domain/v1';

const THEME_HASH = 'a'.repeat(64);
const MARKET_HASH = 'b'.repeat(64);
const PROFILE_FINGERPRINT = 'installed-profile:okam:v1';
const MARKET_POLICY_FINGERPRINT = 'market-projection:v1';

function profileV1(
  market: 'CH' | 'NO',
  overrides: Partial<ConsumerAppProfileWireV1> = {},
): ConsumerAppProfileWireV1 {
  const swiss = market === 'CH';
  return {
    version: 1,
    id: swiss ? 'okam.ch.production' : 'okam.no.production',
    environment: 'production',
    market,
    currency: swiss ? 'CHF' : 'NOK',
    apiOrigin: swiss
      ? 'https://api.okam.ch'
      : 'https://api.okam.no',
    themeManifest: {
      id: 'okam',
      version: 1,
      sha256: THEME_HASH,
    },
    marketManifest: {
      id: swiss ? 'market-ch' : 'market-no',
      version: 1,
      sha256: MARKET_HASH,
    },
    storeScope: {
      kind: 'explicit',
      allowedStoreIds: [swiss ? '6' : '8'],
    },
    identity: {
      iosBundleId: swiss ? 'no.okam.consumer.ch' : 'no.okam.consumer',
      androidPackageName: swiss
        ? 'no.okam.consumer.ch'
        : 'no.okam.consumer',
      appScheme: swiss ? 'okam-ch' : 'okam',
      notificationHubName: swiss ? 'okam-consumer-ch' : 'okam-consumer-no',
    },
    storeLinks: {
      appleAppStore: null,
      googlePlayStore: null,
    },
    languagePolicy: swiss
      ? {
          defaultLanguage: 'de',
          offeredLanguages: ['de', 'fr', 'it', 'en'],
        }
      : {
          defaultLanguage: 'no',
          offeredLanguages: ['no', 'en'],
        },
    compiledPaymentAdapters: swiss
      ? ['stripe']
      : ['stripe', 'vipps', 'dintero'],
    ...overrides,
  };
}

function paymentPolicyV1(
  market: 'CH' | 'NO',
  publicProviders: ConsumerPaymentProviderWireV1[],
): MarketPaymentPolicyWireV1 {
  return {
    market,
    currency: market === 'CH' ? 'CHF' : 'NOK',
    manifest: {
      id: market === 'CH' ? 'market-ch' : 'market-no',
      version: 1,
      sha256: MARKET_HASH,
    },
    publicProviders,
  };
}

function profileAuthorityV1(
  market: 'CH' | 'NO',
  overrides: Partial<ConsumerAppProfileWireV1> = {},
) {
  const expectedProfile = profileV1(market, overrides);
  const parsed = parseConsumerAppProfileV1(expectedProfile);
  if (!parsed.ok) throw new Error('Profile fixture must parse.');
  const provenance: InstalledAppProfileProvenanceV1 = {
    kind: 'compiled-install',
    fingerprint: `${PROFILE_FINGERPRINT}:${expectedProfile.id}`,
  };
  const verifier = createInstalledAppProfileVerifierV1({
    expectedProfile,
    provenance,
  });
  const verified = verifyInstalledConsumerAppProfileV1({
    profile: parsed.profile,
    verifier,
    provenance,
  });
  if (!verified.ok) throw new Error('Profile fixture must verify.');
  return {
    expectedProfile,
    parsedProfile: parsed.profile,
    profile: verified.profile,
    provenance,
    verifier,
  } as const;
}

function verifiedProfileV1(
  market: 'CH' | 'NO',
  overrides: Partial<ConsumerAppProfileWireV1> = {},
): VerifiedConsumerAppProfileV1 {
  return profileAuthorityV1(market, overrides).profile;
}

function marketPolicyAuthorityV1(
  market: 'CH' | 'NO',
  publicProviders: ConsumerPaymentProviderWireV1[],
) {
  const expectedPolicy = paymentPolicyV1(market, publicProviders);
  const parsed = parseMarketPaymentPolicyV1(expectedPolicy);
  if (!parsed.ok) throw new Error('Market policy fixture must parse.');
  const provenance: InstalledMarketPolicyProvenanceV1 = {
    kind: 'generated-projection',
    fingerprint: `${MARKET_POLICY_FINGERPRINT}:${market}`,
  };
  const verifier = createInstalledMarketPolicyVerifierV1({
    expectedPolicy,
    provenance,
  });
  const verified = verifyInstalledMarketPaymentPolicyV1({
    policy: parsed.policy,
    verifier,
    provenance,
  });
  if (!verified.ok) throw new Error('Market policy fixture must verify.');
  return {
    expectedPolicy,
    parsedPolicy: parsed.policy,
    policy: verified.policy,
    provenance,
    verifier,
  } as const;
}

function verifiedPaymentPolicyV1(
  market: 'CH' | 'NO',
  publicProviders: ConsumerPaymentProviderWireV1[],
): VerifiedMarketPaymentPolicyV1 {
  return marketPolicyAuthorityV1(market, publicProviders).policy;
}

function capabilityV1(
  provider: ConsumerPaymentProviderWireV1,
  overrides: Partial<ConsumerPaymentCapabilityWireV1> = {},
): ConsumerPaymentCapabilityWireV1 {
  const interactionKind = {
    Stripe: 'native',
    Twint: 'hosted-redirect',
    Vipps: 'external-app',
    Dintero: 'hosted-redirect',
    DinteroVipps: 'external-app',
    DinteroBillie: 'hosted-redirect',
    DinteroKlarna: 'hosted-redirect',
    DinteroKravia: 'hosted-redirect',
    Giftcard: 'native',
    PayInStore: 'offline',
  } as const;
  return {
    capabilityId: `capability-${provider}`,
    provider,
    available: true,
    interactionKind: interactionKind[provider],
    providerCorrelationId: `correlation-${provider}`,
    storeId: '6',
    cartId: 'cart-6',
    market: 'CH',
    currency: 'CHF',
    ...overrides,
  };
}

function responseV1(capabilities: ConsumerPaymentCapabilityWireV1[]) {
  return {
    version: 1 as const,
    storeId: '6',
    cartId: 'cart-6',
    market: 'CH' as const,
    currency: 'CHF' as const,
    capabilities,
  };
}

const CH_STORE_SCOPE = {
  appProfileId: 'okam.ch.production',
  appProfileFingerprint:
    `${PROFILE_FINGERPRINT}:okam.ch.production`,
  storeId: '6',
  cartId: 'cart-6',
  market: 'CH',
  currency: 'CHF',
} as const;

function languagePreferenceV1(
  profile: ConsumerAppProfileWireV1,
  language: 'en' | 'de' | 'fr' | 'it' | 'no',
  overrides: Partial<{
    appProfileId: string;
    appProfileFingerprint: string;
    market: 'CH' | 'NO';
  }> = {},
) {
  return {
    version: 1 as const,
    appProfileId: profile.id,
    appProfileFingerprint: `${PROFILE_FINGERPRINT}:${profile.id}`,
    market: profile.market,
    language,
    ...overrides,
  };
}

describe('ConsumerAppProfileV1 and LanguagePolicyV1', () => {
  it('preserves the accepted C0 locale aliases while naming UI language explicitly', () => {
    expect(CONSUMER_UI_LANGUAGES).toBe(CONSUMER_LOCALES);
    expect(isConsumerUiLanguage).toBe(isConsumerLocale);
    expect(parseConsumerUiLanguage).toBe(parseConsumerLocale);
    expect(resolveConsumerRegionalFormatTag).toBe(resolveConsumerLocale);
  });

  it.each([
    ['CH', 'CHF', 'de', ['de', 'fr', 'it', 'en']],
    ['NO', 'NOK', 'no', ['no', 'en']],
  ] as const)(
    'accepts the exact %s country deployment contract',
    (market, currency, defaultLanguage, offeredLanguages) => {
      const parsed = parseConsumerAppProfileV1(profileV1(market));
      expect(parsed.ok).toBe(true);
      if (!parsed.ok) return;
      expect(parsed.profile).toMatchObject({
        market,
        currency,
        languagePolicy: { defaultLanguage, offeredLanguages },
      });
      expect(Object.isFrozen(parsed.profile)).toBe(true);
      expect(Object.isFrozen(parsed.profile.languagePolicy)).toBe(true);
      expect(Object.isFrozen(parsed.profile.storeScope)).toBe(true);
    },
  );

  it.each([
    ['CH', 'de'],
    ['CH', 'fr'],
    ['CH', 'it'],
    ['CH', 'en'],
    ['NO', 'no'],
    ['NO', 'en'],
  ] as const)('accepts the approved %s/%s language pair', (market, language) => {
    const profile = profileV1(market);
    expect(profile.languagePolicy.offeredLanguages).toContain(language);
    expect(
      validateLanguagePolicyForMarketV1({
        market,
        policy: profile.languagePolicy,
      }),
    ).toMatchObject({ ok: true });
  });

  it('requires a unique offered set containing the default language', () => {
    expect(
      languagePolicyV1Schema.safeParse({
        defaultLanguage: 'de',
        offeredLanguages: ['fr', 'it', 'en'],
      }).success,
    ).toBe(false);
    expect(
      languagePolicyV1Schema.safeParse({
        defaultLanguage: 'de',
        offeredLanguages: ['de', 'de'],
      }).success,
    ).toBe(false);
  });

  it.each([
    {
      name: 'CH with NOK',
      mutate: (profile: ConsumerAppProfileWireV1) => ({
        ...profile,
        currency: 'NOK',
      }),
    },
    {
      name: 'NO with CHF',
      mutate: (profile: ConsumerAppProfileWireV1) => ({
        ...profile,
        market: 'NO',
        currency: 'CHF',
      }),
    },
    {
      name: 'CH with Norwegian policy',
      mutate: (profile: ConsumerAppProfileWireV1) => ({
        ...profile,
        languagePolicy: {
          defaultLanguage: 'no',
          offeredLanguages: ['no', 'en'],
        },
      }),
    },
    {
      name: 'missing approved Swiss language',
      mutate: (profile: ConsumerAppProfileWireV1) => ({
        ...profile,
        languagePolicy: {
          defaultLanguage: 'de',
          offeredLanguages: ['de', 'fr', 'en'],
        },
      }),
    },
    {
      name: 'duplicate adapter declaration',
      mutate: (profile: ConsumerAppProfileWireV1) => ({
        ...profile,
        compiledPaymentAdapters: ['stripe', 'stripe'],
      }),
    },
    {
      name: 'duplicate installed store',
      mutate: (profile: ConsumerAppProfileWireV1) => ({
        ...profile,
        storeScope: {
          kind: 'explicit',
          allowedStoreIds: ['6', '6'],
        },
      }),
    },
    {
      name: 'tampered manifest digest',
      mutate: (profile: ConsumerAppProfileWireV1) => ({
        ...profile,
        marketManifest: {
          ...profile.marketManifest,
          sha256: 'not-a-sha',
        },
      }),
    },
    {
      name: 'insecure production API',
      mutate: (profile: ConsumerAppProfileWireV1) => ({
        ...profile,
        apiOrigin: 'http://api.okam.ch',
      }),
    },
    {
      name: 'undeclared profile field',
      mutate: (profile: ConsumerAppProfileWireV1) => ({
        ...profile,
        countryOverride: 'NO',
      }),
    },
  ])('rejects $name', ({ mutate }) => {
    const input = mutate(profileV1('CH')) as unknown;
    expect(consumerAppProfileV1Schema.safeParse(input).success).toBe(false);
    expect(parseConsumerAppProfileV1(input)).toEqual({
      ok: false,
      reason: 'profile-invalid',
    });
  });

  it.each([
    [undefined, ['fr-CH'], 'fr', 'device', 'fr-CH'],
    ['it', ['fr-CH'], 'it', 'persisted', 'it-CH'],
    ['no', ['en-GB'], 'en', 'device', 'en-CH'],
    ['SE', ['es-ES'], 'de', 'profile-default', 'de-CH'],
  ] as const)(
    'resolves persisted=%j and device=%j without changing CH authority',
    (persistedLanguage, deviceLanguages, language, source, regionalFormatTag) => {
      const profile = verifiedProfileV1('CH');
      const persistedPreference = persistedLanguage === undefined
        ? undefined
        : persistedLanguage === 'SE'
          ? 'stale-unscoped-value'
          : languagePreferenceV1(profile, persistedLanguage);
      expect(
        resolveConsumerUiLanguageV1({
          profile,
          ...(persistedPreference === undefined
            ? {}
            : { persistedPreference }),
          deviceLanguages,
        }),
      ).toEqual({
        ok: true,
        language,
        source,
        regionalFormatTag,
      });
    },
  );

  it.each([
    ['nb-NO', 'no', 'nb-NO'],
    ['nn_NO', 'no', 'nb-NO'],
    ['en-US', 'en', 'en-NO'],
  ] as const)(
    'maps Norwegian device language %s to catalog %s and regional tag %s',
    (deviceLanguage, language, regionalFormatTag) => {
      expect(
        resolveConsumerUiLanguageV1({
          profile: verifiedProfileV1('NO'),
          deviceLanguages: [deviceLanguage],
        }),
      ).toEqual({
        ok: true,
        language,
        source: 'device',
        regionalFormatTag,
      });
    },
  );

  it('fails language resolution closed for a parsed but unverified profile', () => {
    const parsed = parseConsumerAppProfileV1(profileV1('CH'));
    if (!parsed.ok) throw new Error('Profile fixture must parse.');
    expect(
      resolveConsumerUiLanguageV1({
        profile: parsed.profile as VerifiedConsumerAppProfileV1,
        deviceLanguages: ['en-US'],
      }),
    ).toEqual({ ok: false, reason: 'profile-unverified' });
    expect(
      validateLanguagePolicyForMarketV1({
        market: 'SE',
        policy: profileV1('CH').languagePolicy,
      }),
    ).toEqual({ ok: false, reason: 'market-unknown' });
  });

  it.each([
    [
      'another profile',
      { appProfileId: 'merchant.ch.production' },
    ],
    [
      'another installed fingerprint',
      { appProfileFingerprint: 'installed-profile:old-build' },
    ],
    [
      'another market',
      { market: 'NO' },
    ],
  ] as const)(
    'rejects a persisted preference scoped to %s',
    (_name, preferenceOverride) => {
      const profile = verifiedProfileV1('CH');
      expect(
        resolveConsumerUiLanguageV1({
          profile,
          persistedPreference: languagePreferenceV1(
            profile,
            'fr',
            preferenceOverride,
          ),
          deviceLanguages: ['it-CH'],
        }),
      ).toEqual({
        ok: true,
        language: 'it',
        source: 'device',
        regionalFormatTag: 'it-CH',
      });
    },
  );

  it('binds installed verification to every exact profile field', () => {
    const authority = profileAuthorityV1('CH');
    const mutated = parseConsumerAppProfileV1({
      ...authority.expectedProfile,
      storeScope: {
        kind: 'explicit',
        allowedStoreIds: ['6', '99'],
      },
    });
    if (!mutated.ok) throw new Error('Mutation fixture must parse.');

    expect(
      verifyInstalledConsumerAppProfileV1({
        profile: mutated.profile,
        verifier: authority.verifier,
        provenance: authority.provenance,
      }),
    ).toEqual({ ok: false, reason: 'installed-profile-mismatch' });

    expect(
      resolveConsumerPaymentCapabilitiesV1({
        profile: mutated.profile as VerifiedConsumerAppProfileV1,
        storeScope: {
          ...CH_STORE_SCOPE,
          storeId: '99',
        },
        marketPolicy: verifiedPaymentPolicyV1('CH', ['PayInStore']),
        serverCapabilities: {
          ...responseV1([]),
          storeId: '99',
        },
      }),
    ).toEqual({
      ok: false,
      offered: [],
      denied: [],
      reason: 'profile-unverified',
    });
  });

  it.each([
    [
      'native identity',
      (profile: ConsumerAppProfileWireV1) => ({
        ...profile,
        identity: {
          ...profile.identity,
          iosBundleId: 'no.okam.consumer.changed',
        },
      }),
    ],
    [
      'manifest digest',
      (profile: ConsumerAppProfileWireV1) => ({
        ...profile,
        themeManifest: {
          ...profile.themeManifest,
          sha256: 'c'.repeat(64),
        },
      }),
    ],
    [
      'language order',
      (profile: ConsumerAppProfileWireV1) => ({
        ...profile,
        languagePolicy: {
          ...profile.languagePolicy,
          offeredLanguages: ['en', 'de', 'fr', 'it'],
        },
      }),
    ],
    [
      'compiled adapters',
      (profile: ConsumerAppProfileWireV1) => ({
        ...profile,
        compiledPaymentAdapters: ['stripe', 'vipps'],
      }),
    ],
  ])('rejects a same-id mutation of %s', (_name, mutate) => {
    const authority = profileAuthorityV1('CH');
    const mutated = parseConsumerAppProfileV1(
      mutate(authority.expectedProfile),
    );
    if (!mutated.ok) throw new Error('Mutation fixture must parse.');
    expect(
      verifyInstalledConsumerAppProfileV1({
        profile: mutated.profile,
        verifier: authority.verifier,
        provenance: authority.provenance,
      }),
    ).toEqual({ ok: false, reason: 'installed-profile-mismatch' });
  });
});

describe('fail-closed payment capability intersection', () => {
  it('offers only market-public, server-available providers with compiled adapters', () => {
    const inputCapabilities = [
      capabilityV1('Stripe'),
      capabilityV1('Twint'),
      capabilityV1('Vipps'),
      capabilityV1('Giftcard'),
      capabilityV1('PayInStore'),
      capabilityV1('Dintero', { available: false }),
    ];
    const result = resolveConsumerPaymentCapabilitiesV1({
      profile: verifiedProfileV1('CH'),
      storeScope: CH_STORE_SCOPE,
      marketPolicy: verifiedPaymentPolicyV1('CH', [
        'Stripe',
        'Twint',
        'Giftcard',
        'PayInStore',
        'Dintero',
      ]),
      serverCapabilities: responseV1(inputCapabilities),
    });

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.offered.map((entry) => entry.capability.provider)).toEqual([
      'Stripe',
      'Twint',
      'Giftcard',
      'PayInStore',
    ]);
    expect(result.offered.map((entry) => entry.requiredAdapter)).toEqual([
      'stripe',
      'stripe',
      null,
      null,
    ]);
    expect(result.denied).toEqual([
      {
        capabilityId: 'capability-Vipps',
        provider: 'Vipps',
        reason: 'provider-not-public-for-market',
      },
      {
        capabilityId: 'capability-Dintero',
        provider: 'Dintero',
        reason: 'server-unavailable',
      },
    ]);
    expect(Object.isFrozen(result)).toBe(true);
    expect(Object.isFrozen(result.offered)).toBe(true);
    expect(inputCapabilities[0]?.available).toBe(true);
  });

  it.each([
    ['Vipps', 'vipps'],
    ['Dintero', 'dintero'],
    ['DinteroVipps', 'dintero'],
    ['DinteroBillie', 'dintero'],
    ['DinteroKlarna', 'dintero'],
    ['DinteroKravia', 'dintero'],
  ] as const)(
    'denies %s when the %s adapter is absent',
    (provider) => {
      const capability = capabilityV1(provider);
      const result = resolveConsumerPaymentCapabilitiesV1({
        profile: verifiedProfileV1('CH', {
          compiledPaymentAdapters: ['stripe'],
        }),
        storeScope: CH_STORE_SCOPE,
        marketPolicy: verifiedPaymentPolicyV1('CH', [provider]),
        serverCapabilities: responseV1([capability]),
      });
      expect(result).toEqual({
        ok: true,
        offered: [],
        denied: [
          {
            capabilityId: capability.capabilityId,
            provider,
            reason: 'adapter-not-compiled',
          },
        ],
      });
    },
  );

  it('rejects an unknown provider instead of silently dropping it', () => {
    const response = responseV1([capabilityV1('Stripe')]) as unknown as {
      capabilities: Array<Record<string, unknown>>;
    };
    response.capabilities.push({
      ...capabilityV1('Stripe'),
      capabilityId: 'unknown-provider',
      provider: 'KlarnaDirect',
    });
    expect(
      resolveConsumerPaymentCapabilitiesV1({
        profile: verifiedProfileV1('CH'),
        storeScope: CH_STORE_SCOPE,
        marketPolicy: verifiedPaymentPolicyV1('CH', ['Stripe']),
        serverCapabilities: response,
      }),
    ).toEqual({
      ok: false,
      offered: [],
      denied: [],
      reason: 'provider-unknown',
    });
  });

  it.each([
    [
      'profile-store-profile-mismatch',
      { ...CH_STORE_SCOPE, appProfileId: 'merchant.ch.production' },
    ],
    [
      'profile-store-fingerprint-mismatch',
      {
        ...CH_STORE_SCOPE,
        appProfileFingerprint: 'installed-profile:old-build',
      },
    ],
    [
      'profile-store-market-mismatch',
      { ...CH_STORE_SCOPE, market: 'NO' },
    ],
    [
      'profile-store-currency-mismatch',
      { ...CH_STORE_SCOPE, currency: 'NOK' },
    ],
    ['store-not-authorized', { ...CH_STORE_SCOPE, storeId: '99' }],
  ] as const)('fails closed on %s', (reason, storeScope) => {
    expect(
      resolveConsumerPaymentCapabilitiesV1({
        profile: verifiedProfileV1('CH'),
        storeScope,
        marketPolicy: verifiedPaymentPolicyV1('CH', ['Stripe']),
        serverCapabilities: responseV1([capabilityV1('Stripe')]),
      }),
    ).toEqual({ ok: false, offered: [], denied: [], reason });
  });

  it.each([
    [
      'capability-market-mismatch',
      {
        ...responseV1([]),
        market: 'NO',
        currency: 'NOK',
      },
    ],
    [
      'capability-currency-mismatch',
      {
        ...responseV1([]),
        currency: 'NOK',
      },
    ],
    [
      'capability-store-mismatch',
      {
        ...responseV1([]),
        storeId: '99',
      },
    ],
    [
      'capability-cart-mismatch',
      {
        ...responseV1([]),
        cartId: 'other-cart',
      },
    ],
  ] as const)('names a top-level %s', (reason, serverCapabilities) => {
    expect(
      resolveConsumerPaymentCapabilitiesV1({
        profile: verifiedProfileV1('CH'),
        storeScope: CH_STORE_SCOPE,
        marketPolicy: verifiedPaymentPolicyV1('CH', ['Stripe']),
        serverCapabilities,
      }),
    ).toEqual({ ok: false, offered: [], denied: [], reason });
  });

  it('binds the retained market hash to exact generated provider contents', () => {
    const authority = marketPolicyAuthorityV1('CH', ['Stripe']);
    const mutated = parseMarketPaymentPolicyV1({
      ...authority.expectedPolicy,
      publicProviders: ['Vipps'],
    });
    if (!mutated.ok) throw new Error('Policy mutation fixture must parse.');

    expect(
      verifyInstalledMarketPaymentPolicyV1({
        policy: mutated.policy,
        verifier: authority.verifier,
        provenance: authority.provenance,
      }),
    ).toEqual({ ok: false, reason: 'installed-policy-mismatch' });

    expect(
      resolveConsumerPaymentCapabilitiesV1({
        profile: verifiedProfileV1('CH'),
        storeScope: CH_STORE_SCOPE,
        marketPolicy: mutated.policy as VerifiedMarketPaymentPolicyV1,
        serverCapabilities: responseV1([capabilityV1('Vipps')]),
      }),
    ).toEqual({
      ok: false,
      offered: [],
      denied: [],
      reason: 'market-policy-unverified',
    });
  });

  it('rejects row scope drift, duplicate IDs and provider/interaction tampering', () => {
    const rowScopeDrift = responseV1([
      capabilityV1('Stripe', { storeId: '99' }),
    ]);
    expect(consumerPaymentCapabilitiesV1Schema.safeParse(rowScopeDrift).success)
      .toBe(false);
    expect(
      resolveConsumerPaymentCapabilitiesV1({
        profile: verifiedProfileV1('CH'),
        storeScope: CH_STORE_SCOPE,
        marketPolicy: verifiedPaymentPolicyV1('CH', ['Stripe']),
        serverCapabilities: rowScopeDrift,
      }),
    ).toMatchObject({
      ok: false,
      reason: 'payment-capabilities-invalid',
    });

    const duplicateIds = responseV1([
      capabilityV1('Stripe'),
      capabilityV1('Twint', { capabilityId: 'capability-Stripe' }),
    ]);
    expect(
      resolveConsumerPaymentCapabilitiesV1({
        profile: verifiedProfileV1('CH'),
        storeScope: CH_STORE_SCOPE,
        marketPolicy: verifiedPaymentPolicyV1('CH', ['Stripe', 'Twint']),
        serverCapabilities: duplicateIds,
      }),
    ).toMatchObject({
      ok: false,
      reason: 'payment-capabilities-invalid',
    });

    const interactionDrift = responseV1([
      capabilityV1('PayInStore', { interactionKind: 'native' }),
    ]);
    expect(
      resolveConsumerPaymentCapabilitiesV1({
        profile: verifiedProfileV1('CH'),
        storeScope: CH_STORE_SCOPE,
        marketPolicy: verifiedPaymentPolicyV1('CH', ['PayInStore']),
        serverCapabilities: interactionDrift,
      }),
    ).toMatchObject({
      ok: false,
      reason: 'provider-interaction-mismatch',
    });
  });
});

describe('payment intersection property matrix', () => {
  it('intersects public, compiled and available evidence for every CH provider row', () => {
    const providers = [
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
    ] as const;
    const requiredAdapter = {
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
    } as const;

    for (const provider of providers) {
      for (const isPublic of [false, true]) {
        for (const available of [false, true]) {
          for (const adapterCompiled of [false, true]) {
            const adapter = requiredAdapter[provider];
            const result = resolveConsumerPaymentCapabilitiesV1({
              profile: verifiedProfileV1('CH', {
                compiledPaymentAdapters:
                  adapter && adapterCompiled ? [adapter] : [],
              }),
              storeScope: CH_STORE_SCOPE,
              marketPolicy: verifiedPaymentPolicyV1(
                'CH',
                isPublic ? [provider] : [],
              ),
              serverCapabilities: responseV1([
                capabilityV1(provider, { available }),
              ]),
            });
            expect(result.ok).toBe(true);
            if (!result.ok) continue;
            const shouldOffer =
              isPublic && available && (adapter === null || adapterCompiled);
            expect(result.offered.length, {
              provider,
              isPublic,
              available,
              adapterCompiled,
            }).toBe(shouldOffer ? 1 : 0);
            expect(result.denied.length).toBe(shouldOffer ? 0 : 1);
          }
        }
      }
    }
  });
});
