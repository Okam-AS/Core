import { describe, it, expect, beforeEach } from "vitest";
import { freshPinia } from "../tests/test-platform";
import { useUser } from "./user";

// phoneNumberIsValid gates whether a verification SMS is sent and whether login proceeds, and it is the
// only place the +41 (Swiss) rules were added alongside the existing +47 (Norway) rules.
// normalizePhoneNumber (which strips the Swiss 0xx national trunk so the NSN concatenates onto +41) is a
// closure inside the store and is NOT exported, so it is exercised here through the public
// phoneNumberIsValid: a trunk-form +41 number only validates if the leading 0 was stripped first.
describe("useUser phoneNumberIsValid / normalizePhoneNumber", () => {
  let phoneNumberIsValid: (landcode: string, phoneNumber: string) => boolean;

  beforeEach(() => {
    freshPinia();
    // Instantiating useUser pulls in its lazy store graph (cart/checkout/order); freshPinia() has the
    // test platform registered so persistence/http constructors don't throw.
    phoneNumberIsValid = useUser().phoneNumberIsValid;
  });

  it("accepts a valid Norwegian +47 8-digit mobile number", () => {
    expect(phoneNumberIsValid("+47", "91234567")).toBe(true);
    expect(phoneNumberIsValid("+47", "912 34 567")).toBe(true); // spaces stripped
  });

  it("rejects Norwegian numbers below the 40000000 mobile/landline range or with the wrong length", () => {
    expect(phoneNumberIsValid("+47", "12345678")).toBe(false); // < 40000000
    expect(phoneNumberIsValid("+47", "9123456")).toBe(false); // 7 digits
    expect(phoneNumberIsValid("+47", "912345678")).toBe(false); // 9 digits
  });

  it("accepts a valid Swiss +41 9-digit national significant number", () => {
    expect(phoneNumberIsValid("+41", "761234567")).toBe(true);
    expect(phoneNumberIsValid("+41", "76 123 45 67")).toBe(true); // spaces stripped
  });

  it("normalizes a Swiss trunk-form (leading 0) number to the bare 9-digit NSN and accepts it", () => {
    // "0761234567" is 10 digits; it can only be valid if normalizePhoneNumber dropped the trunk 0,
    // leaving the 9-digit NSN "761234567". This is the observable proof of the normalization.
    expect(phoneNumberIsValid("+41", "0761234567")).toBe(true);
    expect(phoneNumberIsValid("+41", "076 123 45 67")).toBe(true);
  });

  it("rejects Swiss numbers that are not 9 digits after normalization", () => {
    expect(phoneNumberIsValid("+41", "76123456")).toBe(false); // 8 digits
    expect(phoneNumberIsValid("+41", "7612345678")).toBe(false); // 10 digits (no trunk 0 to strip)
    expect(phoneNumberIsValid("+41", "76123456a")).toBe(false); // non-numeric
  });

  it("rejects obviously invalid input and unknown country codes", () => {
    expect(phoneNumberIsValid("+47", "")).toBe(false);
    expect(phoneNumberIsValid("+41", "")).toBe(false);
    expect(phoneNumberIsValid("+1", "5551234567")).toBe(false); // unsupported landcode
    expect(phoneNumberIsValid("+47", undefined as any)).toBe(false);
    expect(phoneNumberIsValid("+41", null as any)).toBe(false);
  });
});
