# Log

* Bundle generated offline from `models/**`, `services/**` and `enums/**` by `tools/okf/generate_okf.py`. Schema-only; deterministic (no timestamps).
* Parser scope is `models/`, `services/`, `enums/` only. Region-aware surface that lives elsewhere — currency formatting (`helpers/tools.ts::setCurrencyFormat`), the `+47`/`+41` login phone gate (`pinia/user.ts`) and the `no/en/de/fr/it` translations (`translations/**`) — is out of the parsed set and is signposted from `index.md` ("Multi-region surface") instead.
* `--check` rebuilds the whole bundle in memory and byte-compares it against the committed files; it exits non-zero on any drift so a stale bundle cannot merge. `--selftest` asserts determinism and a few parser invariants. Both are offline, stdlib-only and read no secrets.
