import {
  consumerManifestV1Schema,
  type ConsumerCurrencyWireV1,
  type ConsumerManifestWireV1,
  type ConsumerMarketWireV1,
} from '../../contracts/v1';
import { getConsumerMarketProfile } from '../../../c0/domain/v1/market';
import { deepFreezeV1, type DeepReadonlyV1 } from './immutable';

declare const parsedManifestBrandV1: unique symbol;
declare const verifiedManifestBrandV1: unique symbol;
declare const installedManifestVerifierBrandV1: unique symbol;
declare const authorizedStoreScopeBrandV1: unique symbol;

/**
 * Structurally valid but explicitly untrusted manifest data. Parsing JSON does
 * not grant store authority.
 */
export type ParsedConsumerManifestV1 =
  DeepReadonlyV1<ConsumerManifestWireV1> & {
    readonly [parsedManifestBrandV1]: true;
  };

/** A parsed manifest matched to an externally trusted installed identity. */
export type VerifiedConsumerManifestV1 = ParsedConsumerManifestV1 & {
  readonly [verifiedManifestBrandV1]: true;
};

export type InstalledManifestProvenanceV1 = DeepReadonlyV1<{
  kind: 'compiled-install' | 'verified-signature';
  /** Opaque build fingerprint or signature identifier verified by the host. */
  fingerprint: string;
}>;

export type InstalledManifestVerifierV1 = DeepReadonlyV1<{
  expectedManifestId: string;
  expectedManifestVersion: string | number;
  expectedBrandKey: string;
  provenance: InstalledManifestProvenanceV1;
}> & {
  readonly [installedManifestVerifierBrandV1]: true;
};

export type AuthorizedStoreScopeV1 = DeepReadonlyV1<{
  manifestId: string;
  manifestVersion: string | number;
  brandKey: string;
  storeId: string;
  market: ConsumerMarketWireV1;
  currency: ConsumerCurrencyWireV1;
}> & {
  readonly [authorizedStoreScopeBrandV1]: true;
};

export type ConsumerManifestParseV1 =
  | Readonly<{ ok: true; manifest: ParsedConsumerManifestV1 }>
  | Readonly<{ ok: false; reason: 'manifest-invalid' }>;

export type InstalledManifestVerificationV1 =
  | Readonly<{ ok: true; manifest: VerifiedConsumerManifestV1 }>
  | Readonly<{
      ok: false;
      reason:
        | 'verifier-untrusted'
        | 'provenance-mismatch'
        | 'installed-manifest-mismatch';
    }>;

export type AuthorizedStoreScopeCompilationV1 =
  | Readonly<{ ok: true; scope: AuthorizedStoreScopeV1 }>
  | Readonly<{
      ok: false;
      reason:
        | 'manifest-unverified'
        | 'manifest-not-published'
        | 'store-not-allowed'
        | 'currency-market-mismatch';
    }>;

type InstalledManifestVerifierRecordV1 = Readonly<{
  canonicalExpectedManifest: string;
  provenance: InstalledManifestProvenanceV1;
}>;

const installedManifestVerifiersV1 =
  new WeakMap<object, InstalledManifestVerifierRecordV1>();
const verifiedManifestsV1 = new WeakSet<object>();
const compiledScopesV1 = new WeakSet<object>();

function canonicalManifestV1(
  manifest: DeepReadonlyV1<ConsumerManifestWireV1>,
): string {
  return JSON.stringify(manifest);
}

/**
 * Pure structural parsing for untrusted wire/storage JSON. The result remains
 * unable to compile an authorized store scope until a trusted installed
 * verifier explicitly matches it.
 */
export function parseConsumerManifestV1(
  input: unknown,
): ConsumerManifestParseV1 {
  const parsed = consumerManifestV1Schema.safeParse(input);
  if (!parsed.success) return { ok: false, reason: 'manifest-invalid' };
  return {
    ok: true,
    manifest: deepFreezeV1(parsed.data) as ParsedConsumerManifestV1,
  };
}

/**
 * Creates the explicit host trust capability. `expectedManifest` must come
 * from the installed/signed build artifact, never discovery or remote JSON.
 * Core records the exact canonical store allow-list alongside the external
 * build fingerprint/signature provenance.
 */
export function createInstalledManifestVerifierV1(input: Readonly<{
  expectedManifest: DeepReadonlyV1<ConsumerManifestWireV1>;
  provenance: InstalledManifestProvenanceV1;
}>): InstalledManifestVerifierV1 {
  const expected = consumerManifestV1Schema.parse(input.expectedManifest);
  if (input.provenance.fingerprint.length === 0) {
    throw new TypeError('Installed manifest provenance requires a fingerprint.');
  }
  const provenance = deepFreezeV1({
    kind: input.provenance.kind,
    fingerprint: input.provenance.fingerprint,
  });
  const verifier = deepFreezeV1({
    expectedManifestId: expected.id,
    expectedManifestVersion: expected.version,
    expectedBrandKey: expected.key,
    provenance,
  }) as InstalledManifestVerifierV1;
  installedManifestVerifiersV1.set(verifier, {
    canonicalExpectedManifest: canonicalManifestV1(expected),
    provenance,
  });
  return verifier;
}

/**
 * Elevates only a parsed manifest that exactly matches the installed/signed
 * expected manifest and its separately supplied provenance evidence.
 */
export function verifyInstalledConsumerManifestV1(input: Readonly<{
  manifest: ParsedConsumerManifestV1;
  verifier: InstalledManifestVerifierV1;
  provenance: InstalledManifestProvenanceV1;
}>): InstalledManifestVerificationV1 {
  const record = installedManifestVerifiersV1.get(input.verifier);
  if (!record) return { ok: false, reason: 'verifier-untrusted' };
  if (
    input.provenance.kind !== record.provenance.kind ||
    input.provenance.fingerprint !== record.provenance.fingerprint
  ) {
    return { ok: false, reason: 'provenance-mismatch' };
  }
  if (
    canonicalManifestV1(input.manifest) !== record.canonicalExpectedManifest
  ) {
    return { ok: false, reason: 'installed-manifest-mismatch' };
  }
  verifiedManifestsV1.add(input.manifest);
  return {
    ok: true,
    manifest: input.manifest as VerifiedConsumerManifestV1,
  };
}

/**
 * Compiles only a currently published, installed-verified manifest into the
 * complete authorization evidence a persisted cart must carry.
 */
export function compileAuthorizedStoreScopeV1(input: Readonly<{
  manifest: VerifiedConsumerManifestV1;
  storeId: string;
  market: ConsumerMarketWireV1;
  currency: ConsumerCurrencyWireV1;
}>): AuthorizedStoreScopeCompilationV1 {
  if (!verifiedManifestsV1.has(input.manifest)) {
    return { ok: false, reason: 'manifest-unverified' };
  }
  if (input.manifest.publicationState !== 'published') {
    return { ok: false, reason: 'manifest-not-published' };
  }
  if (getConsumerMarketProfile(input.market).currency !== input.currency) {
    return { ok: false, reason: 'currency-market-mismatch' };
  }
  const allowedStoreIds = input.manifest.storeScope.kind === 'explicit'
    ? input.manifest.storeScope.allowedStoreIds
    : input.manifest.storeScope.resolvedStoreIds;
  if (!allowedStoreIds.includes(input.storeId)) {
    return { ok: false, reason: 'store-not-allowed' };
  }

  const scope = deepFreezeV1({
    manifestId: input.manifest.id,
    manifestVersion: input.manifest.version,
    brandKey: input.manifest.key,
    storeId: input.storeId,
    market: input.market,
    currency: input.currency,
  }) as AuthorizedStoreScopeV1;
  compiledScopesV1.add(scope);
  return { ok: true, scope };
}

export function isCompiledAuthorizedStoreScopeV1(
  scope: AuthorizedStoreScopeV1,
): boolean {
  return compiledScopesV1.has(scope);
}
