import { describe, it, expect, afterEach } from "vitest";
import { priceLabel, setCurrencyFormat } from "./tools";

// The Norwegian consumer format. currencyInfoTool()'s base. setCurrencyFormat merges an override on
// top of this base, and the override is module-level state, so every test that changes it must
// restore this afterwards or it leaks into the next test.
const NO_DEFAULT = {
  prefix: "",
  suffix: ",–",
  decimalSeparator: ",",
  thousandSeparator: " ",
  fractionLength: 2,
  symbol: "kr",
};

// The Swiss override, exactly as pinia/checkout wiring applies it for a CHF store.
const CHF_FORMAT = {
  symbol: "CHF",
  prefix: "CHF ",
  suffix: "",
  decimalSeparator: ".",
  thousandSeparator: "'",
};

describe("priceLabel / setCurrencyFormat", () => {
  // Restore the NO default after each case so the module-level override never bleeds across tests.
  afterEach(() => setCurrencyFormat(NO_DEFAULT));

  it("formats with the Norwegian default (space thousands, comma decimal, ,– suffix)", () => {
    // Amounts are in minor units (øre/rappen): 123456 => 1 234,56.
    expect(priceLabel(123456)).toBe("1 234,56,–");
  });

  it("honours a Swiss CHF override (apostrophe thousands, dot decimal, CHF prefix)", () => {
    setCurrencyFormat(CHF_FORMAT);
    // Guards the separator bug that was just fixed: priceLabelTool used to hardcode the NO
    // separators and silently ignore the override, so CHF rendered as "CHF 1 234,56".
    expect(priceLabel(123456)).toBe("CHF 1'234.56");
  });

  it("groups every thousands separator for large CHF amounts", () => {
    setCurrencyFormat(CHF_FORMAT);
    // 100000000 minor units => 1'000'000.00 major. Verifies the grouping regex applies the
    // override separator at every 3-digit boundary, not just the first.
    expect(priceLabel(100000000)).toBe("CHF 1'000'000.00");
  });

  it("restores Norwegian formatting after resetting to the NO default", () => {
    setCurrencyFormat(CHF_FORMAT);
    expect(priceLabel(123456)).toBe("CHF 1'234.56");

    setCurrencyFormat(NO_DEFAULT);
    expect(priceLabel(123456)).toBe("1 234,56,–");
  });
});
