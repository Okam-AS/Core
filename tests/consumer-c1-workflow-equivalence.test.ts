import { describe, expect, it } from 'vitest';

import {
  formatMoneyMinor as formatC0Money,
} from '../consumer/c0/domain/v1';
import {
  normalizePhoneNumber as normalizeC0Phone,
} from '../consumer/c0/application/v1';
import {
  cartLineIdentityV1,
  cartTotalMinorV1,
  compileAuthorizedStoreScopeV1,
  createInstalledManifestVerifierV1,
  createConsumerCartV1,
  formatMoneyMinor,
  normalizePhoneNumber,
  parseConsumerCartLineV1,
  parseConsumerCartV1,
  parseConsumerManifestV1,
  reduceConsumerCartV1,
  selectFulfilmentV1,
  switchConsumerCartStoreV1,
  verifyInstalledConsumerManifestV1,
  type AuthorizedStoreScopeV1,
  type ConsumerCartLineV1,
  type InstalledManifestProvenanceV1,
  type InstalledManifestVerifierV1,
  type VerifiedConsumerManifestV1,
} from '../consumer/c1/domain/v1';
import {
  consumerManifestV1Schema,
  fulfilmentSelectionV1Schema,
} from '../consumer/c1/contracts/v1';

const publishedManifestWire = {
  id: 'brand-bahnhof',
  key: 'okam',
  version: 7,
  publicationState: 'published',
  displayName: 'Okam',
  showOkamTrace: false,
  storeScope: { kind: 'explicit' as const, allowedStoreIds: ['6', '7'] },
};

function fixtureProvenance(
  manifest = publishedManifestWire,
): InstalledManifestProvenanceV1 {
  return {
    kind: 'compiled-install',
    fingerprint: `fixture:${manifest.id}:${String(manifest.version)}`,
  };
}

function verifiedManifest(
  manifest = publishedManifestWire,
): VerifiedConsumerManifestV1 {
  const parsed = parseConsumerManifestV1(manifest);
  if (!parsed.ok) throw new Error('fixture manifest must parse');
  const provenance = fixtureProvenance(manifest);
  const verifier = createInstalledManifestVerifierV1({
    expectedManifest: manifest,
    provenance,
  });
  const verified = verifyInstalledConsumerManifestV1({
    manifest: parsed.manifest,
    verifier,
    provenance,
  });
  if (!verified.ok) {
    throw new Error(`fixture manifest must verify: ${verified.reason}`);
  }
  return verified.manifest;
}

function authorizedScope(
  overrides: Partial<{
    storeId: string;
    market: 'CH' | 'NO';
    currency: 'CHF' | 'NOK';
    manifest: typeof publishedManifestWire;
  }> = {},
): AuthorizedStoreScopeV1 {
  const manifest = overrides.manifest ?? publishedManifestWire;
  const result = compileAuthorizedStoreScopeV1({
    manifest: verifiedManifest(manifest),
    storeId: overrides.storeId ?? '6',
    market: overrides.market ?? 'CH',
    currency: overrides.currency ?? 'CHF',
  });
  if (!result.ok) throw new Error(`fixture scope must authorize: ${result.reason}`);
  return result.scope;
}

const configuredLine: ConsumerCartLineV1 = {
  product: {
    id: 'product-1',
    storeId: '6',
    name: 'Rösti',
    description: 'Knusprig',
    basePriceMinor: 2500,
    unitPriceMinor: 2800,
    currency: 'CHF',
    soldOut: false,
    requiresConfiguration: true,
  },
  quantity: 1,
  modifier: 'Extra Ei',
  note: 'Bitte knusprig',
  selections: [
    {
      variantId: 'variant-1',
      variantName: 'Extras',
      options: [
        {
          optionId: 'option-1',
          optionName: 'Extra Ei',
          priceDeltaMinor: 300,
        },
      ],
    },
  ],
};

function nativeLineKey(line: ConsumerCartLineV1): string {
  return JSON.stringify({
    itemId: line.product.id,
    unitPriceMinor: line.product.unitPriceMinor,
    modifier: line.modifier ?? '',
    note: line.note ?? '',
    selections: JSON.stringify(
      line.selections.map((selection) => ({
        variantId: selection.variantId,
        optionIds: selection.options.map((option) => option.optionId),
      })),
    ),
  });
}

describe('consumer C1 exact C0 equivalence', () => {
  it.each([
    ['CH', 123_450],
    ['NO', -123_450],
  ] as const)('keeps %s money presentation on the accepted C0 implementation', (market, minor) => {
    expect(formatMoneyMinor(minor, market)).toBe(formatC0Money(minor, market));
  });

  it.each([
    { market: 'CH' as const, value: '079 123 45 67' },
    { market: 'NO' as const, value: '999 99 999' },
  ])('keeps market-scoped phone normalization on the accepted C0 implementation', (input) => {
    expect(normalizePhoneNumber(input)).toBe(normalizeC0Phone(input));
  });
});

describe('consumer C1 compiled store authorization', () => {
  it('separates untrusted parsing from a compiled authorized scope', () => {
    const parsed = parseConsumerManifestV1(publishedManifestWire);
    expect(parsed).toMatchObject({ ok: true, manifest: publishedManifestWire });
    if (!parsed.ok) throw new Error('manifest should parse');
    const provenance = fixtureProvenance();
    const verifier = createInstalledManifestVerifierV1({
      expectedManifest: publishedManifestWire,
      provenance,
    });
    const verified = verifyInstalledConsumerManifestV1({
      manifest: parsed.manifest,
      verifier,
      provenance,
    });
    expect(verified).toMatchObject({ ok: true, manifest: publishedManifestWire });
    if (!verified.ok) throw new Error('manifest should verify');
    expect(compileAuthorizedStoreScopeV1({
      manifest: verified.manifest,
      storeId: '6',
      market: 'CH',
      currency: 'CHF',
    })).toMatchObject({
      ok: true,
      scope: {
        manifestId: 'brand-bahnhof',
        manifestVersion: 7,
        brandKey: 'okam',
        storeId: '6',
        market: 'CH',
        currency: 'CHF',
      },
    });
    expect(compileAuthorizedStoreScopeV1({
      manifest: verified.manifest,
      storeId: ' 6 ',
      market: 'CH',
      currency: 'CHF',
    })).toEqual({ ok: false, reason: 'store-not-allowed' });
    expect(Object.isFrozen(parsed.manifest)).toBe(true);
    expect(Object.isFrozen(parsed.manifest.storeScope)).toBe(true);
    expect(Object.isFrozen(parsed.manifest.storeScope.kind === 'explicit'
      ? parsed.manifest.storeScope.allowedStoreIds
      : parsed.manifest.storeScope.resolvedStoreIds)).toBe(true);
    const fabricated = {
      ...parsed.manifest,
    } as VerifiedConsumerManifestV1;
    expect(compileAuthorizedStoreScopeV1({
      manifest: fabricated,
      storeId: '6',
      market: 'CH',
      currency: 'CHF',
    })).toEqual({ ok: false, reason: 'manifest-unverified' });
  });

  it('never authorizes forged raw JSON through a public parser entry', () => {
    const forgedWire = {
      ...publishedManifestWire,
      // Keep the trusted public identity and only widen the allow-list. Exact
      // canonical matching, not id/key/version matching alone, must stop it.
      storeScope: {
        kind: 'explicit' as const,
        allowedStoreIds: ['6', '7', '999'],
      },
    };
    const provenance = fixtureProvenance();
    const verifier = createInstalledManifestVerifierV1({
      expectedManifest: publishedManifestWire,
      provenance,
    });

    const schemaParsed = consumerManifestV1Schema.parse(forgedWire);
    expect(compileAuthorizedStoreScopeV1({
      manifest: schemaParsed as VerifiedConsumerManifestV1,
      storeId: '999',
      market: 'CH',
      currency: 'CHF',
    })).toEqual({ ok: false, reason: 'manifest-unverified' });

    const domainParsed = parseConsumerManifestV1(forgedWire);
    expect(domainParsed.ok).toBe(true);
    if (!domainParsed.ok) throw new Error('forged JSON is structurally valid');
    expect(compileAuthorizedStoreScopeV1({
      manifest: domainParsed.manifest as VerifiedConsumerManifestV1,
      storeId: '999',
      market: 'CH',
      currency: 'CHF',
    })).toEqual({ ok: false, reason: 'manifest-unverified' });
    expect(verifyInstalledConsumerManifestV1({
      manifest: domainParsed.manifest,
      verifier,
      provenance,
    })).toEqual({ ok: false, reason: 'installed-manifest-mismatch' });
    expect(verifyInstalledConsumerManifestV1({
      manifest: domainParsed.manifest,
      verifier,
      provenance: {
        ...provenance,
        fingerprint: 'attacker-fingerprint',
      },
    })).toEqual({ ok: false, reason: 'provenance-mismatch' });

    const counterfeitVerifier = JSON.parse(
      JSON.stringify(verifier),
    ) as InstalledManifestVerifierV1;
    expect(verifyInstalledConsumerManifestV1({
      manifest: domainParsed.manifest,
      verifier: counterfeitVerifier,
      provenance,
    })).toEqual({ ok: false, reason: 'verifier-untrusted' });
  });

  it('invalidates persisted carts after manifest version or store-scope revocation', () => {
    const scope = authorizedScope();
    const cart = createConsumerCartV1(scope);
    expect(parseConsumerCartV1({ cart, scope })).toEqual({ ok: true, cart });
    const revived = parseConsumerCartV1({
      cart: JSON.parse(JSON.stringify(cart)) as unknown,
      scope,
    });
    expect(revived).toMatchObject({ ok: true, cart });
    if (revived.ok) {
      expect(Object.isFrozen(revived.cart)).toBe(true);
      expect(Object.isFrozen(revived.cart.lines)).toBe(true);
    }

    const nextScope = authorizedScope({
      manifest: { ...publishedManifestWire, version: 8 },
    });
    expect(parseConsumerCartV1({ cart, scope: nextScope })).toEqual({
      ok: false,
      reason: 'authorization-stale',
    });

    const revoked = parseConsumerManifestV1({
      ...publishedManifestWire,
      version: 8,
      storeScope: { kind: 'explicit', allowedStoreIds: ['7'] },
    });
    if (!revoked.ok) throw new Error('revoked manifest should still parse');
    const revokedWire = {
      ...publishedManifestWire,
      version: 8,
      storeScope: { kind: 'explicit' as const, allowedStoreIds: ['7'] },
    };
    const revokedProvenance = fixtureProvenance(revokedWire);
    const revokedVerifier = createInstalledManifestVerifierV1({
      expectedManifest: revokedWire,
      provenance: revokedProvenance,
    });
    const verifiedRevoked = verifyInstalledConsumerManifestV1({
      manifest: revoked.manifest,
      verifier: revokedVerifier,
      provenance: revokedProvenance,
    });
    if (!verifiedRevoked.ok) throw new Error('revoked manifest should verify');
    expect(compileAuthorizedStoreScopeV1({
      manifest: verifiedRevoked.manifest,
      storeId: '6',
      market: 'CH',
      currency: 'CHF',
    })).toEqual({ ok: false, reason: 'store-not-allowed' });
    expect(parseConsumerCartV1({ cart, scope: null })).toEqual({
      ok: false,
      reason: 'authorization-unavailable',
    });
  });
});

describe('consumer C1 exact native cart-line differential', () => {
  it('preserves product/configuration identity and variant-scoped options bidirectionally', () => {
    const scope = authorizedScope();
    const initial = createConsumerCartV1(scope);
    const added = reduceConsumerCartV1({
      cart: initial,
      scope,
      event: { type: 'line-added', line: configuredLine },
    });
    expect(added.ok).toBe(true);
    if (!added.ok) throw new Error('line should be accepted');
    expect(added.cart.lines[0]).toEqual(configuredLine);
    const roundTripped = parseConsumerCartLineV1(
      JSON.parse(JSON.stringify(configuredLine)) as unknown,
    );
    expect(roundTripped).toEqual(configuredLine);
    expect(Object.isFrozen(roundTripped)).toBe(true);
    expect(Object.isFrozen(roundTripped?.product)).toBe(true);
    expect(Object.isFrozen(roundTripped?.selections)).toBe(true);
    expect(Object.isFrozen(roundTripped?.selections[0]?.options)).toBe(true);
    expect(cartLineIdentityV1(configuredLine)).toBe(nativeLineKey(configuredLine));
    expect(cartTotalMinorV1(added.cart)).toBe(2800);

    const legacyCompatible = {
      ...configuredLine,
      product: {
        ...configuredLine.product,
        basePriceMinor: undefined,
      },
      selections: configuredLine.selections.map((selection) => ({
        ...selection,
        options: selection.options.map(({ priceDeltaMinor: _price, ...option }) => option),
      })),
    };
    expect(parseConsumerCartLineV1(legacyCompatible)).toEqual(legacyCompatible);
  });

  it('matches native merge, clamp, remove and sold-out increase behavior', () => {
    const scope = authorizedScope();
    let cart = createConsumerCartV1(scope);
    for (let count = 0; count < 101; count += 1) {
      const result = reduceConsumerCartV1({
        cart,
        scope,
        event: { type: 'line-added', line: configuredLine },
      });
      if (!result.ok) throw new Error('line addition should be valid');
      cart = result.cart;
    }
    expect(cart.lines).toHaveLength(1);
    expect(cart.lines[0]?.quantity).toBe(99);

    const identity = cartLineIdentityV1(configuredLine);
    const removed = reduceConsumerCartV1({
      cart,
      scope,
      event: { type: 'line-quantity-set', identity, quantity: 0 },
    });
    expect(removed).toMatchObject({ ok: true, changed: true, cart: { lines: [] } });

    const soldOut = {
      ...configuredLine,
      product: { ...configuredLine.product, soldOut: true },
    };
    const restored = reduceConsumerCartV1({
      cart: createConsumerCartV1(scope),
      scope,
      event: { type: 'line-added', line: soldOut },
    });
    expect(restored).toMatchObject({ ok: true, changed: false });
  });

  it('rejects cross-store/currency/configuration drift and notes beyond 300 characters', () => {
    const scope = authorizedScope();
    const initial = createConsumerCartV1(scope);
    for (const line of [
      { ...configuredLine, product: { ...configuredLine.product, storeId: '7' } },
      { ...configuredLine, product: { ...configuredLine.product, currency: 'NOK' } },
      { ...configuredLine, note: 'x'.repeat(301) },
      {
        ...configuredLine,
        product: { ...configuredLine.product, unitPriceMinor: 2799 },
      },
    ]) {
      const result = reduceConsumerCartV1({
        cart: initial,
        scope,
        event: { type: 'line-added', line },
      });
      expect(result).toMatchObject({ ok: false, cart: initial });
      if ('cart' in result) expect(result.cart).toBe(initial);
    }
  });
});

describe('consumer C1 exact five fulfilment methods', () => {
  it.each([
    'SelfPickup',
    'TableDelivery',
    'InstantHomeDelivery',
    'DineHomeDelivery',
    'WoltDelivery',
  ] as const)('accepts available backend method %s as ASAP', (kind) => {
    const selection = kind === 'TableDelivery'
      ? { kind, timing: { kind: 'asap' as const }, tableName: '12' }
      : kind === 'InstantHomeDelivery' || kind === 'DineHomeDelivery' || kind === 'WoltDelivery'
        ? {
            kind,
            timing: { kind: 'asap' as const },
            address: {
              city: 'Zürich',
              deliveryInstructions: '',
              fullAddress: 'Bahnhofplatz 15',
              zipCode: '8001',
            },
          }
        : { kind, timing: { kind: 'asap' as const } };
    expect(selectFulfilmentV1({
      available: [{ kind, enabled: true }],
      selection,
    })).toMatchObject({ accepted: true, selection });
  });

  it('rejects backend-internal/external marketplace types and invented schedules', () => {
    for (const kind of ['NotSet', 'WoltMarketplaceDelivery']) {
      expect(fulfilmentSelectionV1Schema.safeParse({
        kind,
        timing: { kind: 'asap' },
      }).success).toBe(false);
    }
    expect(fulfilmentSelectionV1Schema.safeParse({
      kind: 'SelfPickup',
      timing: {
        kind: 'scheduled',
        scheduledFor: '2026-07-18T12:00:00.000Z',
      },
    }).success).toBe(false);
  });
});

describe('consumer C1 state identity and switch authorization', () => {
  it('returns the exact deeply frozen cart on failures and no-ops', () => {
    const scope = authorizedScope();
    const cart = createConsumerCartV1(scope);
    expect(Object.isFrozen(cart)).toBe(true);
    expect(Object.isFrozen(cart.lines)).toBe(true);

    const invalid = reduceConsumerCartV1({
      cart,
      scope,
      event: { type: 'line-quantity-set', identity: 'missing', quantity: 2 },
    });
    expect(invalid).toMatchObject({ ok: false, reason: 'line-not-found' });
    if ('cart' in invalid) expect(invalid.cart).toBe(cart);

    const sameStore = switchConsumerCartStoreV1({
      cart,
      currentScope: scope,
      targetScope: scope,
      discardExistingLines: false,
    });
    expect(sameStore).toEqual({ ok: true, cart, changed: false, discarded: false });
    if (sameStore.ok) expect(sameStore.cart).toBe(cart);
  });

  it('persists new authorization evidence only after an explicit destructive switch', () => {
    const scope = authorizedScope();
    const target = authorizedScope({ storeId: '7' });
    const added = reduceConsumerCartV1({
      cart: createConsumerCartV1(scope),
      scope,
      event: { type: 'line-added', line: configuredLine },
    });
    if (!added.ok) throw new Error('line should be accepted');
    const blocked = switchConsumerCartStoreV1({
      cart: added.cart,
      currentScope: scope,
      targetScope: target,
      discardExistingLines: false,
    });
    expect(blocked).toEqual({
      ok: false,
      cart: added.cart,
      reason: 'cart-not-empty',
    });
    const switched = switchConsumerCartStoreV1({
      cart: added.cart,
      currentScope: scope,
      targetScope: target,
      discardExistingLines: true,
    });
    expect(switched).toMatchObject({
      ok: true,
      changed: true,
      discarded: true,
      cart: {
        manifestId: 'brand-bahnhof',
        manifestVersion: 7,
        brandKey: 'okam',
        storeId: '7',
        market: 'CH',
        currency: 'CHF',
        lines: [],
      },
    });
  });
});
