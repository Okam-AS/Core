import { describe, expect, it } from "vitest";
import {
  authorizeStoreForManifestV1,
  CH_MONEY_PROFILE_V1,
  formatMarketMoneyV1,
  formatMoneyV1,
  isPhoneNumberValidV1,
  LEGACY_CONSUMER_MONEY_FORMAT_V1,
  normalizePhoneNumberV1,
  NO_MONEY_PROFILE_V1,
  resolveMoneyProfileV1,
  type MoneyFormatV1,
  type StoreManifestV1,
} from "./index";
import { formatLegacyPriceLabelV1 } from "../legacy/money";
import { isLegacyPhoneNumberValidV1, normalizeLegacyPhoneNumberV1 } from "../legacy/phone";

describe("consumer-domain V1 phone normalization", () => {
  it.each([
    [{ market: "NO", value: "912 34 567" }, "+4791234567"],
    [{ market: "NO", value: "+47 (912) 34-567" }, "+4791234567"],
    [{ market: "NO", value: "0047 91234567" }, "+4791234567"],
    [{ market: "CH", value: "076 123 45 67" }, "+41761234567"],
    [{ market: "CH", value: "+41 76 123 45 67" }, "+41761234567"],
  ] as const)("returns E.164 for %o", (input, e164) => {
    expect(normalizePhoneNumberV1(input)).toEqual({ ok: true, e164 });
    expect(isPhoneNumberValidV1(input)).toBe(true);
  });

  it.each([
    [{ market: "NO", value: "40000000" }, "invalid_national_number"],
    [{ market: "NO", value: "+41 761234567" }, "invalid_country_prefix"],
    [{ market: "CH", value: "+41 0761234567" }, "invalid_country_prefix"],
    [{ market: "CH", value: "76123456a" }, "unsupported_characters"],
    [{ market: "CH", value: "" }, "empty"],
  ] as const)("rejects %o with an explicit reason", (input, reason) => {
    expect(normalizePhoneNumberV1(input)).toEqual({ ok: false, reason });
    expect(isPhoneNumberValidV1(input)).toBe(false);
  });

  it("fails closed for an unknown market received at runtime", () => {
    const runtimeInput = { market: "US", value: "5551234567" } as never;
    expect(normalizePhoneNumberV1(runtimeInput)).toEqual({ ok: false, reason: "unsupported_market" });
    expect(isPhoneNumberValidV1(runtimeInput)).toBe(false);
  });
});

describe("legacy phone adapter parity", () => {
  it.each([
    ["+47", "91234567", "91234567", true],
    ["+47", "912 34 567", "91234567", true],
    ["+47", "12345678", "12345678", false],
    ["+41", "076 123 45 67", "761234567", true],
    ["+41", "76123456a", "76123456a", false],
    ["+1", "5551234567", "5551234567", false],
    ["+41", undefined, "", false],
  ] as const)("preserves Core's previous (%s, %o) behavior", (landcode, value, normalized, valid) => {
    expect(normalizeLegacyPhoneNumberV1(landcode, value)).toBe(normalized);
    expect(isLegacyPhoneNumberValidV1(landcode, value)).toBe(valid);
  });
});

describe("consumer-domain V1 money formatting", () => {
  const swissFormat: MoneyFormatV1 = {
    prefix: "CHF ",
    suffix: "",
    decimalSeparator: ".",
    thousandSeparator: "'",
    fractionDigits: 2,
  };

  it("formats configured, cross-platform money without Intl", () => {
    expect(formatMoneyV1(123456, swissFormat)).toBe("CHF 1'234.56");
    expect(formatMoneyV1(-100000000, swissFormat)).toBe("CHF -1'000'000.00");
    expect(formatMoneyV1(100, LEGACY_CONSUMER_MONEY_FORMAT_V1, { hideFractionIfZero: true })).toBe("1,–");
    expect(formatMoneyV1(100, LEGACY_CONSUMER_MONEY_FORMAT_V1, { hideAffixes: true })).toBe("1,00");
  });

  it("rejects unsafe or non-integral amounts rather than silently rounding money", () => {
    expect(() => formatMoneyV1(1.5, swissFormat)).toThrow(RangeError);
    expect(() => formatMoneyV1(Number.MAX_SAFE_INTEGER + 1, swissFormat)).toThrow(RangeError);
  });

  it("matches native fixtures below the grouping threshold and classifies the CHF grouping delta", () => {
    expect(formatMarketMoneyV1(3650, { market: "CH", currency: "CHF" })).toEqual({
      ok: true,
      formatted: "CHF 36.50",
      profile: CH_MONEY_PROFILE_V1,
    });
    expect(CH_MONEY_PROFILE_V1.locale).toBe("de-CH");

    expect(formatMarketMoneyV1(3650, { market: "NO", currency: "NOK" })).toEqual({
      ok: true,
      formatted: "36,50\u00a0kr",
      profile: NO_MONEY_PROFILE_V1,
    });
    expect(NO_MONEY_PROFILE_V1.locale).toBe("nb-NO");

    const dualRunClassification = {
      classification: "accepted_presentation_delta",
      currentNative: "CHF 1234.56",
      consumerDomainV1: "CHF 1'234.56",
      reason: "V1 applies the declared de-CH thousands separator; the current native toFixed path does not group",
    } as const;

    expect(formatMarketMoneyV1(123456, { market: "CH", currency: "CHF" })).toMatchObject({
      ok: true,
      formatted: dualRunClassification.consumerDomainV1,
    });
    expect(dualRunClassification.consumerDomainV1).not.toBe(dualRunClassification.currentNative);
  });

  it("fails closed for unknown markets and CH/NO currency mismatches", () => {
    expect(resolveMoneyProfileV1({ market: "CH", currency: "NOK" })).toEqual({
      ok: false,
      reason: "currency_mismatch",
    });
    expect(resolveMoneyProfileV1({ market: "NO", currency: "CHF" })).toEqual({
      ok: false,
      reason: "currency_mismatch",
    });
    expect(resolveMoneyProfileV1({ market: "US", currency: "USD" })).toEqual({
      ok: false,
      reason: "unsupported_market",
    });
  });

  it("formats both safe-integer extremes exactly without floating-point division", () => {
    expect(formatMarketMoneyV1(Number.MAX_SAFE_INTEGER, { market: "CH", currency: "CHF" })).toMatchObject({
      ok: true,
      formatted: "CHF 90'071'992'547'409.91",
    });
    expect(formatMarketMoneyV1(Number.MIN_SAFE_INTEGER, { market: "CH", currency: "CHF" })).toMatchObject({
      ok: true,
      formatted: "CHF -90'071'992'547'409.91",
    });
    expect(formatMarketMoneyV1(Number.MIN_SAFE_INTEGER, { market: "NO", currency: "NOK" })).toMatchObject({
      ok: true,
      formatted: "−90\u00a0071\u00a0992\u00a0547\u00a0409,91\u00a0kr",
    });
  });

  it.each([
    [0, "0,00,–"],
    [1, "0,00,–"],
    [100, "1,00,–"],
    [123456, "1 234,56,–"],
  ])("keeps legacy Core price-label output for %i minor units", (amount, expected) => {
    expect(formatLegacyPriceLabelV1(amount, LEGACY_CONSUMER_MONEY_FORMAT_V1)).toBe(expected);
  });
});

describe("consumer-domain V1 store-manifest authorization", () => {
  const explicitManifest: StoreManifestV1 = {
    id: "brand-bahnhof",
    key: "modul",
    version: 7,
    publicationState: "published",
    displayName: "okam",
    showOkamTrace: true,
    storeScope: { kind: "explicit", allowedStoreIds: ["6", "zurich-west"] },
  };

  function authorizeRuntime(manifest: unknown, store: unknown) {
    return authorizeStoreForManifestV1({ manifest, store } as never);
  }

  it("allows only exact, listed store IDs and returns manifest evidence", () => {
    expect(authorizeStoreForManifestV1({ manifest: explicitManifest, store: { id: "6" } })).toEqual({
      allowed: true,
      storeId: "6",
      manifestId: "brand-bahnhof",
      manifestVersion: 7,
    });
    expect(authorizeStoreForManifestV1({ manifest: explicitManifest, store: { id: " 6 " } })).toEqual({
      allowed: false,
      reason: "store_not_allowed",
    });
  });

  it.each([
    [{ manifest: null, store: { id: "6" } }, "manifest_missing"],
    [{ manifest: { ...explicitManifest, publicationState: "draft" }, store: { id: "6" } }, "manifest_not_published"],
    [{ manifest: { ...explicitManifest, storeScope: undefined }, store: { id: "6" } }, "scope_missing"],
    [{ manifest: { ...explicitManifest, storeScope: { kind: "explicit", allowedStoreIds: [] } }, store: { id: "6" } }, "allow_list_empty"],
    [{ manifest: explicitManifest, store: { id: "" } }, "store_id_missing"],
    [{ manifest: explicitManifest, store: { id: "foreign" } }, "store_not_allowed"],
  ] as const)("fails closed with %s", (input, reason) => {
    expect(authorizeStoreForManifestV1(input)).toEqual({ allowed: false, reason });
  });

  it.each([
    ["not-an-object", "manifest_invalid"],
    [{ ...explicitManifest, id: "" }, "manifest_invalid"],
    [{ ...explicitManifest, version: Number.NaN }, "manifest_invalid"],
    [{ ...explicitManifest, showOkamTrace: "yes" }, "manifest_invalid"],
    [{ ...explicitManifest, publicationState: "unknown" }, "manifest_invalid"],
    [{ ...explicitManifest, storeScope: [] }, "scope_invalid"],
    [{ ...explicitManifest, storeScope: { kind: "explicit", allowedStoreIds: [6] } }, "scope_invalid"],
    [{ ...explicitManifest, storeScope: { kind: "future-scope", allowedStoreIds: ["6"] } }, "scope_kind_unsupported"],
    [{ ...explicitManifest, storeScope: { kind: "organization-derived", organizationId: "", resolvedStoreIds: ["6"] } }, "scope_invalid"],
  ] as const)("denies malformed runtime manifest %o", (manifest, reason) => {
    expect(authorizeRuntime(manifest, { id: "6" })).toEqual({ allowed: false, reason });
  });

  it("uses resolved organization membership, never a claimed organization ID", () => {
    const manifest: StoreManifestV1 = {
      ...explicitManifest,
      storeScope: { kind: "organization-derived", organizationId: "org-jungel", resolvedStoreIds: ["oslo-west"] },
    };
    expect(authorizeStoreForManifestV1({ manifest, store: { id: "foreign", organizationId: "org-jungel" } })).toEqual({
      allowed: false,
      reason: "store_not_allowed",
    });
    expect(authorizeStoreForManifestV1({ manifest, store: { id: "oslo-west" } })).toEqual({
      allowed: true,
      storeId: "oslo-west",
      manifestId: "brand-bahnhof",
      manifestVersion: 7,
    });
  });

  it("denies empty and retired organization-derived scopes", () => {
    const organizationManifest: StoreManifestV1 = {
      ...explicitManifest,
      storeScope: { kind: "organization-derived", organizationId: "org-jungel", resolvedStoreIds: [] },
    };
    expect(authorizeStoreForManifestV1({ manifest: organizationManifest, store: { id: "oslo-west" } })).toEqual({
      allowed: false,
      reason: "allow_list_empty",
    });
    expect(authorizeStoreForManifestV1({
      manifest: { ...organizationManifest, publicationState: "retired", storeScope: { ...organizationManifest.storeScope, resolvedStoreIds: ["oslo-west"] } },
      store: { id: "oslo-west" },
    })).toEqual({ allowed: false, reason: "manifest_not_published" });
  });

  it("does not mutate the manifest, scope, allow-list, or candidate store", () => {
    const allowedStoreIds = Object.freeze(["6", "zurich-west"]);
    const storeScope = Object.freeze({ kind: "explicit" as const, allowedStoreIds });
    const manifest = Object.freeze({ ...explicitManifest, storeScope });
    const store = Object.freeze({ id: "6", organizationId: "org-modul" });
    const before = JSON.stringify({ manifest, store });

    expect(authorizeStoreForManifestV1({ manifest, store }).allowed).toBe(true);
    expect(JSON.stringify({ manifest, store })).toBe(before);
  });
});
