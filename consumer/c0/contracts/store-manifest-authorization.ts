export type StoreScope =
  | {
      kind: 'explicit';
      allowedStoreIds: readonly string[];
    }
  | {
      kind: 'organization-derived';
      organizationId: string;
      resolvedStoreIds: readonly string[];
    };

export type ShippingThemeManifest = {
  id: string;
  key: string;
  version: string | number;
  publicationState: 'draft' | 'published' | 'retired';
  displayName: string;
  showOkamTrace: boolean;
  storeScope?: StoreScope;
};

export type CandidateStore = {
  id?: string | null;
  organizationId?: string | null;
};

export type StoreAccessDenialReason =
  | 'manifest_missing'
  | 'manifest_not_published'
  | 'scope_missing'
  | 'allow_list_empty'
  | 'store_id_missing'
  | 'store_not_allowed';

export type StoreAccessDecision =
  | {
      allowed: true;
      storeId: string;
      manifestId: string;
      manifestVersion: string | number;
    }
  | {
      allowed: false;
      reason: StoreAccessDenialReason;
    };

/**
 * Fail-closed authorization for a store payload loaded by a branded build.
 *
 * Store IDs are opaque: they are not trimmed, case-folded, or inferred from
 * the candidate's organization. Organization-derived manifests authorize only
 * the store IDs resolved into the published manifest.
 */
export function authorizeStoreForManifest({
  manifest,
  store,
}: {
  manifest?: ShippingThemeManifest | null;
  store: CandidateStore;
}): StoreAccessDecision {
  if (!manifest) {
    return {
      allowed: false,
      reason: 'manifest_missing',
    };
  }

  if (manifest.publicationState !== 'published') {
    return {
      allowed: false,
      reason: 'manifest_not_published',
    };
  }

  if (!manifest.storeScope) {
    return {
      allowed: false,
      reason: 'scope_missing',
    };
  }

  const allowedStoreIds =
    manifest.storeScope.kind === 'explicit'
      ? manifest.storeScope.allowedStoreIds
      : manifest.storeScope.resolvedStoreIds;

  if (allowedStoreIds.length === 0) {
    return {
      allowed: false,
      reason: 'allow_list_empty',
    };
  }

  if (!store.id) {
    return {
      allowed: false,
      reason: 'store_id_missing',
    };
  }

  if (!allowedStoreIds.includes(store.id)) {
    return {
      allowed: false,
      reason: 'store_not_allowed',
    };
  }

  return {
    allowed: true,
    storeId: store.id,
    manifestId: manifest.id,
    manifestVersion: manifest.version,
  };
}
