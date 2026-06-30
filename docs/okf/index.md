---
okf_version: "0.1"
---
# okam Core OKF Bundle

Machine-readable Open Knowledge Format map of the okam **Core** shared TypeScript library — the vendored library bundled into every okam client. Generated offline and deterministically from `models/**`, `services/**` and `enums/**`. Schema and contract shape only (no values, no PII, no secrets).

* [Models](models/index.md) - one concept per shared model (class/interface): fields + types. (96)
* [Services](services/index.md) - one concept per `*Service`: public methods + the HTTP call surface. (40)
* [Enums](enums/index.md) - one concept per shared enum: its members. (22)

## Conformance & scope

This bundle conforms to **Open Knowledge Format v0.1**: every concept document has parseable YAML frontmatter and a non-empty `type`.

**Extension keys.** Every concept document carries four extension keys beyond the canonical set:

* `authority_tier` — always `source`: generated directly from the library source, the authoritative definition of these contracts.
* `data_classification` — always `schema-only`: type/field/method/route shape, never values, rows, PII or secrets.
* `domain` — the logical area (the `models/<area>` submodule for models; an inferred area for services and enums).
* `source_ref` — the repo-relative `path:line` the concept was derived from.

**Scope.**

* Internal-only — feeds the okam knowledge-MCP and the "okam is the brain" layer; never shipped in a client bundle.
* Schema-only — model field/type shape, service method signatures and the HTTP route surface they call; no request/response bodies, no values, no secrets.
* Deterministic — no timestamps or randomness; re-running on an unchanged tree is byte-identical.
