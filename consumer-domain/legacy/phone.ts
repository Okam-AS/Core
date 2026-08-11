/**
 * Compatibility adapter for Core's existing Pinia user-store contract.
 *
 * V1 exposes complete E.164 normalization. This adapter intentionally keeps
 * the legacy surface's narrower input handling and national-significant-number
 * output until a consuming app explicitly migrates to V1.
 */
export function normalizeLegacyPhoneNumberV1(landcode: string, phoneNumber: unknown): string {
  let nationalNumber = typeof phoneNumber === "string" ? phoneNumber.replace(/\s+/gu, "") : "";
  if (landcode === "+41" && nationalNumber.startsWith("0")) nationalNumber = nationalNumber.slice(1);
  return nationalNumber;
}

export function isLegacyPhoneNumberValidV1(landcode: string, phoneNumber: unknown): boolean {
  const nationalNumber = normalizeLegacyPhoneNumberV1(landcode, phoneNumber);
  const isNorwegian = landcode === "+47" && nationalNumber.length === 8 && parseInt(nationalNumber, 10) >= 40_000_000;
  const isSwiss = landcode === "+41" && /^\d{9}$/u.test(nationalNumber);
  return isNorwegian || isSwiss;
}
