---
okf_version: "0.1"
---
# okam Core OKF Bundle

Machine-readable Open Knowledge Format map of the okam **Core** shared TypeScript library — the vendored library bundled into every okam client. Generated offline and deterministically from `models/**`, `services/**` and `enums/**`. Schema and contract shape only (no values, no PII, no secrets).

* [Models](models/index.md) - one concept per shared model (class/interface): fields + types. (96)
* [Services](services/index.md) - one concept per `*Service`: public methods + the HTTP call surface. (40)
* [Enums](enums/index.md) - one concept per shared enum: its members. (22)

## Multi-region surface (CH + NO)

Core is region-aware: the same vendored library drives both the Norwegian (NOK) and Swiss (CHF) clients. An LLM reading this bundle should keep the following in mind — some of it lives in source that is intentionally **out of the parsed set** (see "Parser scope" below), so the pointers here are the map to it.

**Currency (NOK / CHF).** Amount formatting flows through `setCurrencyFormat(...)` / `currencyInfo()` in `helpers/tools.ts`. The default is the Norwegian format (prefix, `,` decimal separator, ` ` (space) thousands separator); a client calls `setCurrencyFormat` to override it (Swiss stores use a `.` decimal and `'` thousands separator, CHF prefix). `priceLabel` / `priceString` in the same file honour those stored separators rather than hardcoding them, so a Swiss override is no longer silently ignored.

**Payment rails.** `okam://enum/PaymentType` is the payment-method contract. Norway uses `Vipps` (and the `Dintero*` family); Switzerland adds `Twint` — the string value round-trips to the backend `PaymentType.Twint` (numeric `210`, mapped server-side) and is additive, never surfaced for NO stores. The TWINT flow is a Stripe PaymentIntent: `okam://model/StripeCreatePaymentIntent` carries `paymentMethodType: "card" | "twint"` and `isApp`, and `okam://service/StripeService` exposes `Verify(...)` + the `GET /stripe/verify/{paymentIntentId}` poll (the server is the source of truth for a TWINT approval — the client polls after the deep-link, mirroring `VippsService.Verify` / `PullVerifyResult`). Terminal states are described by `okam://enum/VippsVerifyStatus` / `okam://enum/DinteroVerifyStatus`.

**Login phone gate.** The verification-token / login gate lives in `pinia/user.ts` (`phoneNumberIsValid`), not in a service. It accepts Norwegian `+47` (8-digit) numbers and Swiss `+41` (9-digit national significant) numbers; a small `normalizePhoneNumber` helper strips whitespace and the Swiss trunk `0` (`079…` → `79…`) so both the E.164 and `0xx` entry forms validate.

**Localisation.** Client copy is in `translations/{no,en,de,fr,it}.ts` (fr/it added for Swiss go-live; de/no/en pre-existing). TWINT-facing keys include `checkoutPage_payWithTwint`, `checkoutPage_waitingForTwint` and `paymentType_twint`. These are flat string maps and are also outside the parsed set.

## Conformance & scope

This bundle conforms to **Open Knowledge Format v0.1**: every concept document has parseable YAML frontmatter and a non-empty `type`.

**Extension keys.** Every concept document carries four extension keys beyond the canonical set:

* `authority_tier` — always `source`: generated directly from the library source, the authoritative definition of these contracts.
* `data_classification` — always `schema-only`: type/field/method/route shape, never values, rows, PII or secrets.
* `domain` — the logical area (the `models/<area>` submodule for models; an inferred area for services and enums).
* `source_ref` — the repo-relative `path:line` the concept was derived from.

**Parser scope.** Concept docs are generated only from `models/**`, `services/**` and `enums/**`. Pinia stores (`pinia/**`, e.g. the phone gate and checkout orchestration), helpers (`helpers/**`, e.g. currency formatting) and translations (`translations/**`) are **not** emitted as concept docs — the "Multi-region surface" section above is the pointer to that knowledge.

**Scope.**

* Internal-only — feeds the okam knowledge-MCP and the "okam is the brain" layer; never shipped in a client bundle.
* Schema-only — model field/type shape, service method signatures and the HTTP route surface they call; no request/response bodies, no values, no secrets.
* Deterministic — no timestamps or randomness; re-running on an unchanged tree is byte-identical.
