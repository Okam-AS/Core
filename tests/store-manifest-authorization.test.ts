import { describe, expect, it } from 'vitest';

import {
  authorizeStoreForManifest,
  type ShippingThemeManifest,
  type StoreAccessDecision,
} from '../consumer/c0/contracts';

const publishedExplicit: ShippingThemeManifest = {
  id: 'brand-bahnhof',
  key: 'modul',
  version: 7,
  publicationState: 'published',
  displayName: 'okam',
  showOkamTrace: true,
  storeScope: {
    kind: 'explicit',
    allowedStoreIds: ['6', 'zurich-west'],
  },
};

const publishedOrganization: ShippingThemeManifest = {
  id: 'brand-jungel',
  key: 'jungelPizza',
  version: 3,
  publicationState: 'published',
  displayName: 'Jungel Pizza',
  showOkamTrace: true,
  storeScope: {
    kind: 'organization-derived',
    organizationId: 'org-jungel',
    resolvedStoreIds: ['oslo-east', 'oslo-west'],
  },
};

describe('store-manifest authorization compatibility', () => {
  it.each([
    {
      name: 'missing manifest',
      manifest: null,
      store: { id: '6' },
      expected: { allowed: false, reason: 'manifest_missing' },
    },
    {
      name: 'draft manifest',
      manifest: { ...publishedExplicit, publicationState: 'draft' as const },
      store: { id: '6' },
      expected: { allowed: false, reason: 'manifest_not_published' },
    },
    {
      name: 'retired manifest',
      manifest: { ...publishedExplicit, publicationState: 'retired' as const },
      store: { id: '6' },
      expected: { allowed: false, reason: 'manifest_not_published' },
    },
    {
      name: 'missing scope',
      manifest: {
        id: 'brand-unscoped',
        key: 'modul',
        version: 1,
        publicationState: 'published' as const,
        displayName: 'okam',
        showOkamTrace: true,
      },
      store: { id: '6' },
      expected: { allowed: false, reason: 'scope_missing' },
    },
    {
      name: 'empty explicit scope',
      manifest: {
        ...publishedExplicit,
        storeScope: { kind: 'explicit' as const, allowedStoreIds: [] },
      },
      store: { id: '6' },
      expected: { allowed: false, reason: 'allow_list_empty' },
    },
    {
      name: 'missing store ID',
      manifest: publishedExplicit,
      store: { id: null },
      expected: { allowed: false, reason: 'store_id_missing' },
    },
    {
      name: 'foreign store claiming the same organization',
      manifest: publishedOrganization,
      store: { id: 'foreign-store', organizationId: 'org-jungel' },
      expected: { allowed: false, reason: 'store_not_allowed' },
    },
    {
      name: 'exact explicit member',
      manifest: publishedExplicit,
      store: { id: '6' },
      expected: {
        allowed: true,
        storeId: '6',
        manifestId: 'brand-bahnhof',
        manifestVersion: 7,
      },
    },
    {
      name: 'resolved organization member',
      manifest: publishedOrganization,
      store: { id: 'oslo-west', organizationId: 'org-jungel' },
      expected: {
        allowed: true,
        storeId: 'oslo-west',
        manifestId: 'brand-jungel',
        manifestVersion: 3,
      },
    },
  ] satisfies ReadonlyArray<{
    name: string;
    manifest: ShippingThemeManifest | null;
    store: { id?: string | null; organizationId?: string | null };
    expected: StoreAccessDecision;
  }>)('$name matches the established native decision', ({ manifest, store, expected }) => {
    expect(authorizeStoreForManifest({ manifest, store })).toEqual(expected);
  });

  it('treats store IDs as exact opaque values', () => {
    for (const id of [' 6 ', 'ZURICH-WEST']) {
      expect(
        authorizeStoreForManifest({
          manifest: publishedExplicit,
          store: { id },
        }),
      ).toEqual({
        allowed: false,
        reason: 'store_not_allowed',
      });
    }
  });

  it('does not mutate manifest evidence', () => {
    const before = JSON.stringify(publishedExplicit);

    authorizeStoreForManifest({
      manifest: publishedExplicit,
      store: { id: '6' },
    });

    expect(JSON.stringify(publishedExplicit)).toBe(before);
  });
});
