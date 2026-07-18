import { describe, expect, it } from 'vitest';

import {
  cartTotalMinorV1,
  compileAuthorizedStoreScopeV1,
  createInstalledManifestVerifierV1,
  createConsumerCartV1,
  parseConsumerManifestV1,
  reduceConsumerCartV1,
  verifyInstalledConsumerManifestV1,
  type ConsumerCartLineV1,
} from '../consumer/c1/domain/v1';

function scope() {
  const manifest = parseConsumerManifestV1({
    id: 'property-brand',
    key: 'okam',
    version: 1,
    publicationState: 'published',
    displayName: 'Okam',
    showOkamTrace: false,
    storeScope: { kind: 'explicit', allowedStoreIds: ['6'] },
  });
  if (!manifest.ok) throw new Error('fixture manifest must parse');
  const provenance = {
    kind: 'compiled-install' as const,
    fingerprint: 'property-brand:v1',
  };
  const verifier = createInstalledManifestVerifierV1({
    expectedManifest: manifest.manifest,
    provenance,
  });
  const verified = verifyInstalledConsumerManifestV1({
    manifest: manifest.manifest,
    verifier,
    provenance,
  });
  if (!verified.ok) throw new Error('fixture manifest must verify');
  const authorized = compileAuthorizedStoreScopeV1({
    manifest: verified.manifest,
    storeId: '6',
    market: 'CH',
    currency: 'CHF',
  });
  if (!authorized.ok) throw new Error('fixture scope must authorize');
  return authorized.scope;
}

function line(index: number, quantity: number, unitPriceMinor: number): ConsumerCartLineV1 {
  return {
    product: {
      id: `product-${index}`,
      storeId: '6',
      name: `Product ${index}`,
      description: '',
      basePriceMinor: unitPriceMinor,
      unitPriceMinor,
      currency: 'CHF',
      soldOut: false,
      requiresConfiguration: false,
    },
    quantity,
    selections: [],
  };
}

describe('consumer C1 adversarial invariants', () => {
  it('keeps exact totals across a deterministic product/quantity property matrix', () => {
    const authorized = scope();
    for (let seed = 1; seed <= 100; seed += 1) {
      const quantity = (seed % 99) + 1;
      const price = (seed * 7919) % 100_000;
      const cart = createConsumerCartV1(authorized);
      const result = reduceConsumerCartV1({
        cart,
        scope: authorized,
        event: { type: 'line-added', line: line(seed, quantity, price) },
      });
      expect(result.ok, `seed ${seed}`).toBe(true);
      if (!result.ok) continue;
      expect(cartTotalMinorV1(result.cart), `seed ${seed}`).toBe(quantity * price);
      expect(Number.isSafeInteger(cartTotalMinorV1(result.cart))).toBe(true);
    }
  });

  it('atomically refuses revision exhaustion and total overflow with the same state identity', () => {
    const authorized = scope();
    const exhausted = createConsumerCartV1(authorized, {
      revision: Number.MAX_SAFE_INTEGER,
    });
    const revisionResult = reduceConsumerCartV1({
      cart: exhausted,
      scope: authorized,
      event: { type: 'line-added', line: line(1, 1, 100) },
    });
    expect(revisionResult).toEqual({
      ok: false,
      cart: exhausted,
      reason: 'revision-exhausted',
    });
    if ('cart' in revisionResult) expect(revisionResult.cart).toBe(exhausted);

    const initial = createConsumerCartV1(authorized);
    const overflowResult = reduceConsumerCartV1({
      cart: initial,
      scope: authorized,
      event: {
        type: 'line-added',
        line: line(2, 99, Number.MAX_SAFE_INTEGER),
      },
    });
    expect(overflowResult).toEqual({
      ok: false,
      cart: initial,
      reason: 'cart-total-overflow',
    });
    if ('cart' in overflowResult) expect(overflowResult.cart).toBe(initial);
  });

  it('does not allow option sums, duplicate identities, or cart totals to escape safe integers', () => {
    const authorized = scope();
    const initial = createConsumerCartV1(authorized);
    const invalidLines: unknown[] = [
      {
        ...line(1, 1, 1),
        product: { ...line(1, 1, 1).product, basePriceMinor: 0, unitPriceMinor: 0 },
        selections: [{
          variantId: 'v',
          variantName: 'V',
          options: [
            { optionId: 'o', optionName: 'O', priceDeltaMinor: Number.MAX_SAFE_INTEGER },
            { optionId: 'o2', optionName: 'O2', priceDeltaMinor: 1 },
          ],
        }],
      },
      {
        ...line(2, 1, 100),
        selections: [{
          variantId: 'v',
          variantName: 'V',
          options: [
            { optionId: 'o', optionName: 'O', priceDeltaMinor: 0 },
            { optionId: 'o', optionName: 'O again', priceDeltaMinor: 0 },
          ],
        }],
      },
    ];
    for (const invalidLine of invalidLines) {
      const result = reduceConsumerCartV1({
        cart: initial,
        scope: authorized,
        event: { type: 'line-added', line: invalidLine },
      });
      expect(result).toEqual({
        ok: false,
        cart: initial,
        reason: 'event-invalid',
      });
    }
  });
});
