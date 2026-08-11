export type StoreScopeV1 =
  | Readonly<{ kind: "explicit"; allowedStoreIds: readonly string[] }>
  | Readonly<{ kind: "organization-derived"; organizationId: string; resolvedStoreIds: readonly string[] }>;

export type StoreManifestV1 = Readonly<{
  id: string;
  key: string;
  version: string | number;
  publicationState: "draft" | "published" | "retired";
  displayName: string;
  showOkamTrace: boolean;
  storeScope?: StoreScopeV1;
}>;

export type CandidateStoreV1 = Readonly<{
  id?: string | null;
  organizationId?: string | null;
}>;

export type StoreManifestAuthorizationDenialV1 =
  | "manifest_missing"
  | "manifest_invalid"
  | "manifest_not_published"
  | "scope_missing"
  | "scope_invalid"
  | "scope_kind_unsupported"
  | "allow_list_empty"
  | "store_id_missing"
  | "store_not_allowed";

export type StoreManifestAuthorizationV1 =
  | Readonly<{ allowed: true; storeId: string; manifestId: string; manifestVersion: string | number }>
  | Readonly<{ allowed: false; reason: StoreManifestAuthorizationDenialV1 }>;

function isRecordV1(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function hasValidManifestEvidenceV1(manifest: Record<string, unknown>): boolean {
  const versionIsValid =
    (typeof manifest.version === "string" && manifest.version.length > 0) ||
    (typeof manifest.version === "number" && Number.isFinite(manifest.version));
  return typeof manifest.id === "string" && manifest.id.length > 0
    && typeof manifest.key === "string" && manifest.key.length > 0
    && versionIsValid
    && typeof manifest.displayName === "string" && manifest.displayName.length > 0
    && typeof manifest.showOkamTrace === "boolean";
}

function isStringIdListV1(value: unknown): value is readonly string[] {
  return Array.isArray(value) && value.every((id) => typeof id === "string" && id.length > 0);
}

/**
 * Authorizes exact opaque store IDs against a published, compiled manifest.
 * organizationId is intentionally not trusted as authorization evidence: an
 * organization-derived scope must already contain its resolved store IDs.
 */
export function authorizeStoreForManifestV1(input: Readonly<{
  manifest?: StoreManifestV1 | null;
  store: CandidateStoreV1;
}>): StoreManifestAuthorizationV1 {
  // Treat both values as runtime data internally. Callers written in JavaScript
  // or reading JSON can bypass the public TypeScript types.
  const manifest: unknown = input.manifest;
  const store: unknown = input.store;
  if (manifest === undefined || manifest === null) return { allowed: false, reason: "manifest_missing" };
  if (!isRecordV1(manifest)) return { allowed: false, reason: "manifest_invalid" };
  if (
    manifest.publicationState !== "draft"
    && manifest.publicationState !== "published"
    && manifest.publicationState !== "retired"
  ) return { allowed: false, reason: "manifest_invalid" };
  if (manifest.publicationState !== "published") return { allowed: false, reason: "manifest_not_published" };
  if (!hasValidManifestEvidenceV1(manifest)) return { allowed: false, reason: "manifest_invalid" };
  if (manifest.storeScope === undefined || manifest.storeScope === null) return { allowed: false, reason: "scope_missing" };
  if (!isRecordV1(manifest.storeScope)) return { allowed: false, reason: "scope_invalid" };

  let allowedStoreIds: readonly string[];
  if (manifest.storeScope.kind === "explicit") {
    if (!isStringIdListV1(manifest.storeScope.allowedStoreIds)) {
      return { allowed: false, reason: "scope_invalid" };
    }
    allowedStoreIds = manifest.storeScope.allowedStoreIds;
  } else if (manifest.storeScope.kind === "organization-derived") {
    if (
      typeof manifest.storeScope.organizationId !== "string"
      || manifest.storeScope.organizationId.length === 0
      || !isStringIdListV1(manifest.storeScope.resolvedStoreIds)
    ) return { allowed: false, reason: "scope_invalid" };
    allowedStoreIds = manifest.storeScope.resolvedStoreIds;
  } else {
    return { allowed: false, reason: "scope_kind_unsupported" };
  }

  if (allowedStoreIds.length === 0) return { allowed: false, reason: "allow_list_empty" };
  if (!isRecordV1(store) || typeof store.id !== "string" || store.id.length === 0) {
    return { allowed: false, reason: "store_id_missing" };
  }
  if (!allowedStoreIds.includes(store.id)) return { allowed: false, reason: "store_not_allowed" };

  return {
    allowed: true,
    storeId: store.id,
    manifestId: manifest.id as string,
    manifestVersion: manifest.version as string | number,
  };
}
