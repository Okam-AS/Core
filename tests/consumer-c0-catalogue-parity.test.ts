import { describe, expect, it } from 'vitest';

import {
  consumerLineItemSchema,
  consumerStorefrontSchema,
  type ConsumerProductWire,
  type ConsumerStorefrontWire,
} from '../consumer/c0/contracts';
import {
  ConsumerCatalogueScopeError,
  mapConsumerProduct,
  mapConsumerStorefront,
  normalizeConsumerMediaUrl,
  parseAndMapConsumerProduct,
  parseAndMapConsumerStorefront,
} from '../consumer/c0/application/v1';

const apiBaseUrl = 'http://10.0.2.2:5080';
const storefrontScope = {
  storeId: 6,
  slug: 'bahnhof-beizli',
} as const;
const productScope = {
  storeId: 6,
  currencyCode: 'CHF',
} as const;

function expectScopeMismatch(action: () => void): void {
  try {
    action();
  } catch (error) {
    expect(error).toBeInstanceOf(ConsumerCatalogueScopeError);
    expect(error).toMatchObject({ code: 'store-mismatch' });
    return;
  }
  throw new Error('Expected catalogue scope validation to fail closed');
}

const configurableProduct = {
  id: '66666666-6666-6666-6666-6666666600a1',
  hide: false,
  storeId: 6,
  name: 'Zürcher Geschnetzeltes',
  description: 'Kalbsgeschnetzeltes an Rahmsauce mit Rösti',
  image: {
    imageUrl: 'http://127.0.0.1:5081/images/hero.jpg',
    thumbnailUrl: 'http://127.0.0.1:5081/images/thumb.jpg',
    thumbHash: 'VKF5?x00_3t7~q%MRjof',
  },
  soldOut: false,
  currency: 'CHF',
  baseAmount: 3650,
  amount: 3850,
  productVariants: [
    {
      id: 'cccccccc-cccc-cccc-cccc-cccccccccccc',
      orderIndex: 1,
      name: 'Beilage',
      required: true,
      multiselect: false,
      options: [
        {
          id: 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee',
          orderIndex: 2,
          name: 'Ohne Beilage',
          amount: 100,
          negativeAmount: true,
          selected: false,
        },
        {
          id: 'dddddddd-dddd-dddd-dddd-dddddddddddd',
          orderIndex: 1,
          name: 'Spätzli',
          amount: 200,
          negativeAmount: false,
          selected: true,
        },
      ],
    },
  ],
} satisfies ConsumerProductWire;

const storefrontPayload = {
  id: 6,
  name: 'Bahnhof Beizli',
  slug: 'bahnhof-beizli',
  currencyCode: 'CHF',
  isOpenNow: true,
  selfPickUp: true,
  allowOrdersAfterOpeningHours: true,
  statusMessage: null,
  address: {
    fullAddress: 'Bahnhofplatz 15',
    zipCode: '8001',
    city: 'Zürich',
  },
  categories: [
    {
      id: 'category-hidden',
      orderIndex: 0,
      name: 'Entwurf',
      published: false,
      categoryProductListEnabled: true,
      categoryProductListItems: [],
    },
    {
      id: 'category-kitchen',
      orderIndex: 2,
      name: 'Küche',
      published: true,
      categoryProductListEnabled: true,
      categoryProductListItems: [
        {
          id: 'hidden-product-row',
          orderIndex: 0,
          isHeading: false,
          heading: null,
          product: { ...configurableProduct, hide: true },
        },
        {
          id: 'product-row',
          orderIndex: 2,
          isHeading: false,
          heading: null,
          product: configurableProduct,
        },
        {
          id: 'heading-row',
          orderIndex: 1,
          isHeading: true,
          heading: '  Klassiker  ',
          product: null,
        },
      ],
    },
  ],
} satisfies ConsumerStorefrontWire;

/**
 * Frozen projection of the current React Native mapper. Its image objects are
 * reduced to URL metadata so the comparison remains framework-neutral.
 */
function nativeReferenceProduct(product: ConsumerProductWire) {
  const thumbnailUrl =
    product.image?.thumbnailUrl || product.image?.imageUrl || undefined;
  const heroUrl =
    product.image?.imageUrl || product.image?.thumbnailUrl || undefined;
  return {
    id: product.id,
    storeId: product.storeId,
    name: product.name,
    description: product.description || '',
    priceMinor: product.amount,
    currency: product.currency,
    soldOut: product.soldOut,
    requiresConfiguration: product.productVariants.length > 0,
    media:
      thumbnailUrl || heroUrl || product.image?.thumbHash
        ? {
            ...(thumbnailUrl
              ? {
                  thumbnailUrl: normalizeConsumerMediaUrl(
                    thumbnailUrl,
                    apiBaseUrl,
                  ),
                }
              : {}),
            ...(heroUrl
              ? {
                  heroUrl: normalizeConsumerMediaUrl(heroUrl, apiBaseUrl),
                }
              : {}),
            ...(product.image?.thumbHash
              ? { thumbHash: product.image.thumbHash }
              : {}),
          }
        : undefined,
  };
}

function nativeReferenceStorefront(response: ConsumerStorefrontWire) {
  const categories = response.categories
    .filter(
      (category) =>
        category.published && category.categoryProductListEnabled,
    )
    .sort((left, right) => left.orderIndex - right.orderIndex)
    .map((category) => {
      const entries = category.categoryProductListItems
        .slice()
        .sort((left, right) => left.orderIndex - right.orderIndex)
        .flatMap((entry) => {
          if (entry.isHeading) {
            return [
              {
                kind: 'heading' as const,
                id: entry.id,
                title: entry.heading!.trim(),
              },
            ];
          }
          return entry.product && !entry.product.hide
            ? [
                {
                  kind: 'product' as const,
                  id: entry.id,
                  item: nativeReferenceProduct(entry.product),
                },
              ]
            : [];
        });
      return {
        id: category.id,
        name: category.name,
        entries,
        items: entries.flatMap((entry) =>
          entry.kind === 'product' ? [entry.item] : [],
        ),
      };
    });

  return {
    storeId: response.id,
    storeName: response.name,
    slug: response.slug,
    currencyCode: response.currencyCode,
    isOpenNow: response.isOpenNow,
    pickupEnabled: response.selfPickUp,
    afterHoursOrdersEnabled: response.allowOrdersAfterOpeningHours,
    addressLabel: 'Bahnhofplatz 15, 8001, Zürich',
    categories,
  };
}

describe('consumer C0 catalogue parity', () => {
  it('dual-runs the shared storefront mapper against the frozen native projection and golden result', () => {
    const parsed = consumerStorefrontSchema.parse(storefrontPayload);
    const shared = mapConsumerStorefront(
      parsed,
      apiBaseUrl,
      storefrontScope,
    );
    const native = nativeReferenceStorefront(parsed);

    expect(shared).toEqual(native);
    expect(shared).toEqual({
      storeId: 6,
      storeName: 'Bahnhof Beizli',
      slug: 'bahnhof-beizli',
      currencyCode: 'CHF',
      isOpenNow: true,
      pickupEnabled: true,
      afterHoursOrdersEnabled: true,
      addressLabel: 'Bahnhofplatz 15, 8001, Zürich',
      categories: [
        {
          id: 'category-kitchen',
          name: 'Küche',
          entries: [
            {
              kind: 'heading',
              id: 'heading-row',
              title: 'Klassiker',
            },
            {
              kind: 'product',
              id: 'product-row',
              item: nativeReferenceProduct(configurableProduct),
            },
          ],
          items: [nativeReferenceProduct(configurableProduct)],
        },
      ],
    });
    expect(
      parseAndMapConsumerStorefront(
        storefrontPayload,
        apiBaseUrl,
        storefrontScope,
      ),
    ).toEqual(shared);
  });

  it('dual-runs product modifiers, negative amounts and media metadata', () => {
    const payload = { product: configurableProduct };
    const parsed = consumerLineItemSchema.parse(payload);
    const shared = mapConsumerProduct(
      parsed.product,
      apiBaseUrl,
      configurableProduct.id,
      productScope,
    );

    expect(
      parseAndMapConsumerProduct(
        payload,
        apiBaseUrl,
        configurableProduct.id,
        productScope,
      ),
    ).toEqual(shared);
    expect(shared.item).toEqual(nativeReferenceProduct(parsed.product));
    expect(shared.variants).toEqual([
      {
        id: 'cccccccc-cccc-cccc-cccc-cccccccccccc',
        name: 'Beilage',
        required: true,
        multiselect: false,
        options: [
          {
            id: 'dddddddd-dddd-dddd-dddd-dddddddddddd',
            name: 'Spätzli',
            priceDeltaMinor: 200,
            selected: true,
          },
          {
            id: 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee',
            name: 'Ohne Beilage',
            priceDeltaMinor: -100,
            selected: false,
          },
        ],
      },
    ]);
  });

  it('preserves CDN hosts and rebases only device-inaccessible loopback media', () => {
    expect(
      normalizeConsumerMediaUrl(
        'https://cdn.example.test/p/hero.jpg',
        apiBaseUrl,
      ),
    ).toBe('https://cdn.example.test/p/hero.jpg');
    expect(
      normalizeConsumerMediaUrl(
        'http://127.0.0.1:5081/p/hero.jpg',
        apiBaseUrl,
      ),
    ).toBe('http://10.0.2.2:5081/p/hero.jpg');
    expect(
      normalizeConsumerMediaUrl(
        'http://127.0.0.1:5081/p/hero.jpg',
        'http://127.0.0.1:5080',
      ),
    ).toBe('http://127.0.0.1:5081/p/hero.jpg');
  });

  it('recognizes bracketed IPv6 loopback hosts on both media and API URLs', () => {
    expect(
      normalizeConsumerMediaUrl(
        'http://[::1]:5081/p/hero.jpg',
        apiBaseUrl,
      ),
    ).toBe('http://10.0.2.2:5081/p/hero.jpg');
    expect(
      normalizeConsumerMediaUrl(
        'http://[::1]:5081/p/hero.jpg',
        'http://[::1]:5080',
      ),
    ).toBe('http://[::1]:5081/p/hero.jpg');
    expect(
      normalizeConsumerMediaUrl(
        'http://127.0.0.1:5081/p/hero.jpg',
        'http://[::1]:5080',
      ),
    ).toBe('http://127.0.0.1:5081/p/hero.jpg');
  });

  it('fails closed when store lookup identity or any storefront product store differs', () => {
    for (const mismatchedScope of [
      { ...storefrontScope, storeId: 7 },
      { ...storefrontScope, slug: 'another-store' },
    ]) {
      expectScopeMismatch(() =>
        parseAndMapConsumerStorefront(
          storefrontPayload,
          apiBaseUrl,
          mismatchedScope,
        ),
      );
    }

    expectScopeMismatch(() =>
      parseAndMapConsumerStorefront(
        {
          ...storefrontPayload,
          categories: [
            {
              id: 'draft-foreign-category',
              name: 'Draft',
              orderIndex: 0,
              published: false,
              categoryProductListEnabled: false,
              categoryProductListItems: [
                {
                  id: 'hidden-foreign-product',
                  orderIndex: 0,
                  isHeading: false,
                  heading: null,
                  product: {
                    ...configurableProduct,
                    hide: true,
                    storeId: 7,
                  },
                },
              ],
            },
          ],
        },
        apiBaseUrl,
        storefrontScope,
      ),
    );
  });

  it('fails closed when requested product ID, store, or currency differs', () => {
    const payload = { product: configurableProduct };
    const mismatches = [
      {
        productId: 'another-product',
        scope: productScope,
      },
      {
        productId: configurableProduct.id,
        scope: { ...productScope, storeId: 7 },
      },
      {
        productId: configurableProduct.id,
        scope: { ...productScope, currencyCode: 'NOK' },
      },
    ];

    for (const mismatch of mismatches) {
      expectScopeMismatch(() =>
        parseAndMapConsumerProduct(
          payload,
          apiBaseUrl,
          mismatch.productId,
          mismatch.scope,
        ),
      );
    }
  });

  it('rejects unsafe media schemes and blank ThumbHashes', () => {
    for (const imageUrl of [
      'ftp://cdn.example.test/product.jpg',
      'data:image/png;base64,AA==',
      'javascript:alert(1)',
    ]) {
      expect(
        consumerLineItemSchema.safeParse({
          product: {
            ...configurableProduct,
            image: { imageUrl },
          },
        }).success,
      ).toBe(false);
      expect(() =>
        normalizeConsumerMediaUrl(imageUrl, apiBaseUrl),
      ).toThrow(TypeError);
    }

    for (const image of [
      { thumbHash: '' },
      { thumbHash: '   ' },
      { thumbhash: '\n\t' },
    ]) {
      expect(
        consumerLineItemSchema.safeParse({
          product: {
            ...configurableProduct,
            image,
          },
        }).success,
      ).toBe(false);
    }
  });

  it('preserves empty media while leaving bundled fallbacks adapter-owned', () => {
    for (const image of [
      undefined,
      null,
      {
        imageUrl: null,
        thumbnailUrl: null,
        thumbHash: null,
        thumbhash: null,
      },
    ]) {
      const product = consumerLineItemSchema.parse({
        product: {
          ...configurableProduct,
          image,
        },
      }).product;

      expect(
        mapConsumerProduct(
          product,
          apiBaseUrl,
          configurableProduct.id,
          productScope,
        ).item.media,
      ).toBeUndefined();
    }
  });

  it('keeps the native fail-closed heading and configuration contracts', () => {
    expect(() =>
      parseAndMapConsumerStorefront(
        {
          ...storefrontPayload,
          categories: [
            {
              ...storefrontPayload.categories[1],
              categoryProductListItems: [
                {
                  id: 'invalid-heading',
                  isHeading: true,
                  heading: ' ',
                  product: null,
                },
              ],
            },
          ],
        },
        apiBaseUrl,
        storefrontScope,
      ),
    ).toThrow();
    expect(() =>
      parseAndMapConsumerProduct(
        {
          product: {
            ...configurableProduct,
            productVariants: undefined,
          },
        },
        apiBaseUrl,
        configurableProduct.id,
        productScope,
      ),
    ).toThrow();
  });

  it('keeps the lowercase experimental thumbhash fallback without leaking platform image types', () => {
    const product = consumerLineItemSchema.parse({
      product: {
        ...configurableProduct,
        image: {
          imageUrl: null,
          thumbnailUrl: 'https://cdn.example.test/thumbnail.jpg',
          thumbHash: null,
          thumbhash: 'legacy-thumbhash',
        },
      },
    }).product;

    expect(
      mapConsumerProduct(
        product,
        apiBaseUrl,
        configurableProduct.id,
        productScope,
      ).item.media,
    ).toEqual({
      thumbnailUrl: 'https://cdn.example.test/thumbnail.jpg',
      heroUrl: 'https://cdn.example.test/thumbnail.jpg',
      thumbHash: 'legacy-thumbhash',
    });
  });
});
