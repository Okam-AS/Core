# Consumer C0 compatibility surface

## Version 1

The `domain/v1` and `application/v1` exports are the first framework-neutral
leaf migration from the native C0 implementation.

Phone normalization deliberately matches the current native C0 behavior:

- CH accepts a Swiss national number, optional trunk `0`, `+41`, or `0041`.
- NO accepts a Norwegian national number, `+47`, or `0047`, and preserves the
  native lower-bound rule that rejects `40 000 000`.
- Both markets reject a foreign calling code.
- Verification codes contain exactly six ASCII digits.

The future requirement for a guest with another valid E.164 number to order in
CH or NO is not silently folded into v1. It needs an explicit new contract
version, fixtures, backend proof, abuse/rate-limit review, and app rollout.

Core exposes both a non-throwing `parsePhoneNumber` result and a
`normalizePhoneNumber` convenience wrapper. The wrapper throws
`PhoneInputError`; the native app must map that small structural error to its
local `AuthError` until the shared auth error contract moves into Core.

Market and locale are independent, explicit inputs. Supported v1 pairs are:

- CH: `de`, `fr`, `it`, `en`
- NO: `no`, `en`

The translation catalog key stays `no`; the standards-based locale tag is
`nb-NO`.

Money accepts safe integer minor units only. Formatting is intentionally
deterministic and changes current app presentation:

- CH: `CHF 1'234.50`
- NO: `1 234,50 kr`

This removes the current native CHF no-grouping output and runtime-dependent
`Intl` whitespace/symbol placement. Formatting never applies cash rounding.
`roundCashAmountMinor` is a separate operation: CH rounds to 5 rappen and NO
rounds to one krone, with exact ties away from zero.

Legacy Pinia remains unchanged. Its NO-only validator accepts the exact
`40 000 000` boundary and performs weaker parsing; those behaviors are recorded
compatibility gaps, not rules copied into the new C0 surface.
