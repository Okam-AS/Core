import { describe, expect, it } from "vitest";
import {
  CH_MONEY_PROFILE_V1,
  normalizePhoneNumberV1,
  type PhoneNormalizationResultV1,
} from "@okam/core/consumer-domain";
import {
  authorizeStoreForManifestV1,
  NO_MONEY_PROFILE_V1,
  type StoreManifestAuthorizationV1,
} from "@okam/core/consumer-domain/v1";

describe("published consumer-domain package subpaths", () => {
  it("resolve runtime values through both explicit package exports", () => {
    const phone: PhoneNormalizationResultV1 = normalizePhoneNumberV1({ market: "CH", value: "076 123 45 67" });
    const authorization: StoreManifestAuthorizationV1 = authorizeStoreForManifestV1({
      manifest: null,
      store: { id: "6" },
    });

    expect(phone).toEqual({ ok: true, e164: "+41761234567" });
    expect(authorization).toEqual({ allowed: false, reason: "manifest_missing" });
    expect(CH_MONEY_PROFILE_V1.currency).toBe("CHF");
    expect(NO_MONEY_PROFILE_V1.currency).toBe("NOK");
  });
});
