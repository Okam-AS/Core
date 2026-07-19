import { describe, expect, it } from 'vitest';

import {
  cartLineIdentityV1,
  type CartLineIdentityInputV1,
  type ConsumerCartLineV1,
} from '../consumer/c1/domain/v1';

/**
 * `cartLineIdentityV1` is the single source of the consumer cart line identity
 * (master plan XXVI.4 cart slice, S3). This suite pins two things the native
 * app depends on when it deletes its own `cartLineKey` body and delegates here:
 *
 *  1. The rule is a pure function of the MINIMAL identity projection
 *     (product.id + product.unitPriceMinor + modifier + note + selections'
 *     variant/option ids). A caller does not need a scope-authorized wire cart.
 *  2. A full `ConsumerCartLineV1` and its minimal projection yield the exact
 *     same identity string — so widening the parameter is behavior-preserving.
 *
 * The canonical vectors below are the shared equivalence fixtures; the native
 * `cart-identity-core-equivalence` suite asserts the same strings against its
 * own `cartLineKey`, so both trees are proven to agree byte-for-byte.
 */

// The reference algorithm, kept verbatim next to the vectors so a drift in the
// production function is caught against an independent transcription.
function referenceLineKey(line: CartLineIdentityInputV1): string {
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

const vectors: ReadonlyArray<readonly [string, CartLineIdentityInputV1]> = [
  [
    'plain line, no configuration',
    { product: { id: 'product-1', unitPriceMinor: 3650 }, selections: [] },
  ],
  [
    'modifier and note only',
    {
      product: { id: 'product-1', unitPriceMinor: 3650 },
      modifier: 'Natur',
      note: 'Bitte knusprig',
      selections: [],
    },
  ],
  [
    'single variant, single option',
    {
      product: { id: 'product-2', unitPriceMinor: 4200 },
      modifier: 'Mit Kräuterbutter',
      note: 'Bitte gut durchbraten',
      selections: [{ variantId: 'sauce', options: [{ optionId: 'herbs' }] }],
    },
  ],
  [
    'multiple variants and options preserve order',
    {
      product: { id: 'product-3', unitPriceMinor: 5100 },
      selections: [
        { variantId: 'variant-a', options: [{ optionId: 'a1' }, { optionId: 'a2' }] },
        { variantId: 'variant-b', options: [{ optionId: 'b1' }] },
      ],
    },
  ],
];

describe('cartLineIdentityV1 — single-source consumer cart line identity', () => {
  it.each(vectors)('is a pure function of the minimal projection: %s', (_label, line) => {
    expect(cartLineIdentityV1(line)).toBe(referenceLineKey(line));
  });

  it('is stable across repeated calls', () => {
    const line = vectors[2]![1];
    expect(cartLineIdentityV1(line)).toBe(cartLineIdentityV1(line));
  });

  it('separates lines that differ only by unit price', () => {
    const base: CartLineIdentityInputV1 = {
      product: { id: 'product-9', unitPriceMinor: 1000 },
      selections: [],
    };
    const dearer: CartLineIdentityInputV1 = {
      ...base,
      product: { ...base.product, unitPriceMinor: 1100 },
    };
    expect(cartLineIdentityV1(base)).not.toBe(cartLineIdentityV1(dearer));
  });

  it('separates lines that differ only by selected option id', () => {
    const a: CartLineIdentityInputV1 = {
      product: { id: 'product-9', unitPriceMinor: 1000 },
      selections: [{ variantId: 'v', options: [{ optionId: 'x' }] }],
    };
    const b: CartLineIdentityInputV1 = {
      product: { id: 'product-9', unitPriceMinor: 1000 },
      selections: [{ variantId: 'v', options: [{ optionId: 'y' }] }],
    };
    expect(cartLineIdentityV1(a)).not.toBe(cartLineIdentityV1(b));
  });

  it('a full ConsumerCartLineV1 and its minimal projection yield the same identity', () => {
    const fullLine: ConsumerCartLineV1 = {
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
          options: [{ optionId: 'option-1', optionName: 'Extra Ei', priceDeltaMinor: 300 }],
        },
      ],
    };
    const minimalProjection: CartLineIdentityInputV1 = {
      product: {
        id: fullLine.product.id,
        unitPriceMinor: fullLine.product.unitPriceMinor,
      },
      modifier: fullLine.modifier,
      note: fullLine.note,
      selections: fullLine.selections.map((selection) => ({
        variantId: selection.variantId,
        options: selection.options.map((option) => ({ optionId: option.optionId })),
      })),
    };
    expect(cartLineIdentityV1(minimalProjection)).toBe(cartLineIdentityV1(fullLine));
  });
});
