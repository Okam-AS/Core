#!/usr/bin/env python3
"""
OKF v0.1 bundle generator for the okam **Core** shared TypeScript library.

Walks the repo's `models/`, `services/` and `enums/` source trees and emits a
deterministic, schema-only Open Knowledge Format bundle under `docs/okf/`:

    docs/okf/
      index.md                  - bundle root, links to the three kind indexes
      log.md                    - generation provenance note
      models/<Name>.md          - okam://model/<Name>   (fields + types)
      services/<Name>.md        - okam://service/<Name> (public methods + HTTP calls)
      enums/<Name>.md           - okam://enum/<Name>    (members)

Hard rules (mirrors the raiis saladin-core reference bundle):
  * SCHEMA / CONTRACT ONLY. We emit type/field/method/route *shape*. We never
    read or emit runtime row values, secrets, connection coordinates or PII.
  * Every concept document carries a real `source_ref` (repo-relative path,
    with `:line` for the declaring line).
  * DETERMINISTIC. No timestamps, no randomness, stable ordering everywhere, so
    re-running on an unchanged tree produces byte-identical output (and a clean
    `git diff`). This is the deliberate tightening over the reference bundle,
    which used schema-epoch timestamps.

Dependency-free: standard library only. Python 3.8+.

Usage:
    python3 tools/okf/generate_okf.py            # write bundle, print summary
    python3 tools/okf/generate_okf.py --check    # parse only, do not write
"""

from __future__ import annotations

import argparse
import re
import sys
from pathlib import Path
from typing import Dict, List, NamedTuple, Optional, Tuple

# --------------------------------------------------------------------------- #
# Paths. The repo root is two levels up from this file (tools/okf/...).
# --------------------------------------------------------------------------- #

REPO_ROOT = Path(__file__).resolve().parents[2]
MODELS_DIR = REPO_ROOT / "models"
SERVICES_DIR = REPO_ROOT / "services"
ENUMS_DIR = REPO_ROOT / "enums"
OUT_ROOT = REPO_ROOT / "docs" / "okf"

OKF_VERSION = "0.1"
AUTHORITY_TIER = "source"          # generated-from-code (per task spec)
DATA_CLASSIFICATION = "schema-only"  # NEVER values / PII / secrets

# Files that are pure re-export barrels, never a concept of their own.
SKIP_BASENAMES = {"index.ts"}


# --------------------------------------------------------------------------- #
# Small helpers
# --------------------------------------------------------------------------- #

def rel(path: Path) -> str:
    """Repo-relative POSIX path for a source_ref."""
    return path.relative_to(REPO_ROOT).as_posix()


def strip_line_comment(line: str) -> str:
    """Drop a trailing `// ...` comment that is not inside a string.

    Good enough for declaration lines in this codebase (no `//` appears inside
    a type on a field/member line). URLs etc. live inside method bodies, which
    we never treat as declarations.
    """
    in_s: Optional[str] = None
    i = 0
    while i < len(line):
        c = line[i]
        if in_s:
            if c == "\\":
                i += 2
                continue
            if c == in_s:
                in_s = None
        else:
            if c in "\"'`":
                in_s = c
            elif c == "/" and i + 1 < len(line) and line[i + 1] == "/":
                return line[:i]
        i += 1
    return line


def humanize(name: str) -> str:
    """`StoreOverviewResponseModel` -> `Store Overview Response Model`."""
    spaced = re.sub(r"(?<=[a-z0-9])(?=[A-Z])", " ", name)
    spaced = re.sub(r"(?<=[A-Z])(?=[A-Z][a-z])", " ", spaced)
    return spaced


def md_escape_cell(text: str) -> str:
    """Escape a value going into a markdown table cell."""
    return text.replace("|", "\\|")


def yaml_quote(text: str) -> str:
    """Quote a YAML scalar; escape backslashes and double quotes."""
    return '"' + text.replace("\\", "\\\\").replace('"', '\\"') + '"'


def block_comment_spans(text: str) -> List[Tuple[int, int]]:
    """Character spans of `/* ... */` block comments, for masking."""
    spans = []
    for m in re.finditer(r"/\*.*?\*/", text, re.DOTALL):
        spans.append((m.start(), m.end()))
    return spans


def mask_block_comments(text: str) -> str:
    """Replace block-comment contents with spaces (preserve newlines/offsets)."""
    out = list(text)
    for s, e in block_comment_spans(text):
        for i in range(s, e):
            if out[i] != "\n":
                out[i] = " "
    return "".join(out)


# --------------------------------------------------------------------------- #
# Domain inference
# --------------------------------------------------------------------------- #

# Service/enum file-stem -> domain area. Stems are matched by "the longest
# domain keyword that is a token in the stem", so we keep this list ordered by
# specificity for the few ambiguous cases and otherwise fall back to the first
# path segment of the stem.
DOMAIN_KEYWORDS = [
    "accounting", "address", "bankaccount", "bank-account", "cart", "category",
    "config", "culture", "delivery", "dinehome", "dintero", "discount",
    "email", "feedback", "giftcard", "image", "kam", "kravia", "log",
    "notification", "offer", "order", "payment", "payout", "persistence",
    "place", "product", "request", "reward", "statistic", "store", "stripe",
    "user", "vipps", "wolt", "ai",
]

# Normalise a few keyword spellings onto a canonical domain label.
DOMAIN_CANONICAL = {
    "bank-account": "bankaccount",
    "statistics": "statistic",
}


def domain_from_stem(stem: str) -> str:
    """Infer a domain area from a kebab-case file stem like `bank-account-service`."""
    tokens = stem.split("-")
    token_set = set(tokens)
    # Prefer a multi-token keyword present as a contiguous run, else single token.
    best = None
    for kw in DOMAIN_KEYWORDS:
        parts = kw.split("-")
        if len(parts) == 1:
            if kw in token_set:
                if best is None or len(kw) > len(best):
                    best = kw
        else:
            # contiguous match
            joined = "-".join(tokens)
            if kw in joined and all(p in token_set for p in parts):
                if best is None or len(kw) > len(best):
                    best = kw
    if best is None:
        best = tokens[0]
    return DOMAIN_CANONICAL.get(best, best)


# --------------------------------------------------------------------------- #
# Model parsing  (export class / export interface -> fields)
# --------------------------------------------------------------------------- #

class Field(NamedTuple):
    name: str
    type: str
    optional: bool


class ModelDoc(NamedTuple):
    name: str
    kind: str            # "class" | "interface"
    domain: str
    source_ref: str      # path:line of the declaration
    fields: List[Field]


_DECL_RE = re.compile(r"export\s+(?:default\s+)?(?:abstract\s+)?(class|interface)\s+([A-Za-z_$][\w$]*)")

# A field line: optional modifiers, name, optional `?`, optional `: Type`,
# optional `= default`. We only keep name/type/optional; defaults & values are
# explicitly discarded (schema-only).
_FIELD_RE = re.compile(
    r"""^\s*
        (?:(?:public|private|protected|readonly|declare|static|abstract|override)\s+)*
        (?P<name>[A-Za-z_$][\w$]*)
        (?P<opt>\?)?
        \s*
        (?:!)?
        (?:\s*:\s*(?P<type>[^=;]+?))?
        \s*
        (?:=\s*[^;]+)?
        ;?\s*$
    """,
    re.VERBOSE,
)

# Lines that look like a method / getter / call, not a field.
_METHODISH_RE = re.compile(r"[A-Za-z_$][\w$]*\s*(?:<[^>]*>)?\s*\(")
_KEYWORD_NAMES = {
    "constructor", "return", "if", "for", "while", "switch", "case", "import",
    "export", "new", "this", "super", "get", "set", "async", "await", "function",
}


def _split_top_level(body: str) -> List[str]:
    """Split a class/interface body into statements at top-level `;` and newlines,
    ignoring separators nested inside (), [], {}, <> or strings."""
    stmts: List[str] = []
    depth_round = depth_square = depth_curly = depth_angle = 0
    in_s: Optional[str] = None
    cur: List[str] = []
    i = 0
    while i < len(body):
        c = body[i]
        if in_s:
            cur.append(c)
            if c == "\\":
                if i + 1 < len(body):
                    cur.append(body[i + 1])
                    i += 2
                    continue
            elif c == in_s:
                in_s = None
            i += 1
            continue
        if c in "\"'`":
            in_s = c
            cur.append(c)
        elif c == "(":
            depth_round += 1; cur.append(c)
        elif c == ")":
            depth_round -= 1; cur.append(c)
        elif c == "[":
            depth_square += 1; cur.append(c)
        elif c == "]":
            depth_square -= 1; cur.append(c)
        elif c == "{":
            depth_curly += 1; cur.append(c)
        elif c == "}":
            depth_curly -= 1; cur.append(c)
        elif c == "<":
            depth_angle += 1; cur.append(c)
        elif c == ">":
            if depth_angle > 0:
                depth_angle -= 1
            cur.append(c)
        elif (c in ";\n") and depth_round == depth_square == depth_curly == depth_angle == 0:
            stmts.append("".join(cur))
            cur = []
        else:
            cur.append(c)
        i += 1
    if cur:
        stmts.append("".join(cur))
    return stmts


def _find_body(text: str, open_brace_idx: int) -> Tuple[str, int]:
    """Return (body_without_braces, index_after_closing_brace) for a `{ ... }`
    starting at `open_brace_idx`, respecting nesting and strings."""
    depth = 0
    in_s: Optional[str] = None
    i = open_brace_idx
    start = open_brace_idx + 1
    while i < len(text):
        c = text[i]
        if in_s:
            if c == "\\":
                i += 2
                continue
            if c == in_s:
                in_s = None
        else:
            if c in "\"'`":
                in_s = c
            elif c == "{":
                depth += 1
            elif c == "}":
                depth -= 1
                if depth == 0:
                    return text[start:i], i + 1
        i += 1
    return text[start:], len(text)


def parse_model_file(path: Path) -> List[ModelDoc]:
    raw = path.read_text(encoding="utf-8")
    text = mask_block_comments(raw)
    docs: List[ModelDoc] = []

    for m in _DECL_RE.finditer(text):
        kind, name = m.group(1), m.group(2)
        brace = text.find("{", m.end())
        if brace == -1:
            continue
        body, _ = _find_body(text, brace)
        line_no = text.count("\n", 0, m.start()) + 1

        fields: List[Field] = []
        seen = set()
        for stmt in _split_top_level(body):
            line = strip_line_comment(stmt).strip()
            if not line:
                continue
            # Skip anything that is a method, getter/setter, or call expression.
            head = line.split(":", 1)[0]
            if "(" in head or "=>" in line:
                # method signature / arrow — not a data field
                if _METHODISH_RE.search(line):
                    continue
            fm = _FIELD_RE.match(line)
            if not fm:
                continue
            fname = fm.group("name")
            if fname in _KEYWORD_NAMES or fname in seen:
                continue
            ftype = (fm.group("type") or "any").strip()
            ftype = re.sub(r"\s+", " ", ftype)
            # Drop a leading `as ...` cast that can leak when no `:` type given.
            seen.add(fname)
            fields.append(Field(fname, ftype, bool(fm.group("opt"))))

        rel_dir = path.parent.name
        domain = rel_dir if path.parent != MODELS_DIR else "core"
        docs.append(ModelDoc(
            name=name,
            kind=kind,
            domain=domain,
            source_ref=f"{rel(path)}:{line_no}",
            fields=fields,
        ))
    return docs


# --------------------------------------------------------------------------- #
# Enum parsing  (export enum -> members)
# --------------------------------------------------------------------------- #

class EnumDoc(NamedTuple):
    name: str
    domain: str
    source_ref: str
    members: List[Tuple[str, Optional[str]]]   # (member, literal-kind or None)


_ENUM_RE = re.compile(r"export\s+(?:const\s+)?enum\s+([A-Za-z_$][\w$]*)")


def _member_value_kind(rhs: str) -> Optional[str]:
    """Classify the RHS of an enum member WITHOUT emitting the literal value.

    We deliberately do not reproduce string literals verbatim as "values" of the
    system; we only record the *kind* (string|number|computed) so the contract
    shows shape, not data. For this codebase enum string literals equal their
    member name, so this loses nothing meaningful while honouring schema-only.
    """
    rhs = rhs.strip()
    if rhs == "":
        return None
    if re.fullmatch(r"[\"'].*[\"']", rhs, re.DOTALL):
        return "string"
    if re.fullmatch(r"-?\d+", rhs):
        return "number"
    return "computed"


def parse_enum_file(path: Path) -> List[EnumDoc]:
    raw = path.read_text(encoding="utf-8")
    text = mask_block_comments(raw)
    docs: List[EnumDoc] = []
    for m in _ENUM_RE.finditer(text):
        name = m.group(1)
        brace = text.find("{", m.end())
        if brace == -1:
            continue
        body, _ = _find_body(text, brace)
        line_no = text.count("\n", 0, m.start()) + 1

        members: List[Tuple[str, Optional[str]]] = []
        seen = set()
        for piece in _split_top_level(body):
            line = strip_line_comment(piece).strip().rstrip(",").strip()
            if not line:
                continue
            if "=" in line:
                mem, rhs = line.split("=", 1)
                kind = _member_value_kind(rhs)
            else:
                mem, kind = line, None
            mem = mem.strip()
            if not re.fullmatch(r"[A-Za-z_$][\w$]*", mem) or mem in seen:
                continue
            seen.add(mem)
            members.append((mem, kind))

        docs.append(EnumDoc(
            name=name,
            domain=domain_from_stem(path.stem),
            source_ref=f"{rel(path)}:{line_no}",
            members=members,
        ))
    return docs


# --------------------------------------------------------------------------- #
# Service parsing  (export class *Service -> public methods + HTTP calls)
# --------------------------------------------------------------------------- #

class Method(NamedTuple):
    name: str
    signature: str       # e.g. "GetAll(): Promise<Array<Order>>"
    line: int


class HttpCall(NamedTuple):
    verb: str            # GET/POST/PUT/PATCH/DELETE
    path: str            # route literal (template placeholders preserved as ${...})


class ServiceDoc(NamedTuple):
    name: str
    domain: str
    source_ref: str
    methods: List[Method]
    calls: List[HttpCall]


_CLASS_RE = re.compile(r"export\s+(?:default\s+)?(?:abstract\s+)?class\s+([A-Za-z_$][\w$]*)")

# A public method declaration at class-body indentation. We capture the name and
# the full parameter list + return type up to the opening `{`.
_METHOD_RE = re.compile(
    r"""(?:^|\n)[ \t]*
        public\s+
        (?:static\s+)?
        (?:async\s+)?
        (?P<name>[A-Za-z_$][\w$]*)
        (?P<generics><[^>{};]*>)?
        \s*\(
    """,
    re.VERBOSE,
)

# `.<Verb>Request(` followed by the first string/template literal argument.
_REQUEST_CALL_RE = re.compile(
    r"\.(Get|Post|Put|Patch|Delete)(?:FormData)?Request\s*\(\s*(`[^`]*`|'[^']*'|\"[^\"]*\")"
)
# Form-data upload helper takes (path, method, ...) — capture path + the verb arg.
_FORMDATA_CALL_RE = re.compile(
    r"\.FormdataRequest\s*\(\s*(`[^`]*`|'[^']*'|\"[^\"]*\")\s*,\s*HttpMethod\.(\w+)"
)


def _balanced_paren(text: str, open_idx: int) -> Tuple[str, int]:
    """Return (inside, index_after_close) for `(` at open_idx."""
    depth = 0
    in_s: Optional[str] = None
    i = open_idx
    start = open_idx + 1
    while i < len(text):
        c = text[i]
        if in_s:
            if c == "\\":
                i += 2
                continue
            if c == in_s:
                in_s = None
        else:
            if c in "\"'`":
                in_s = c
            elif c == "(":
                depth += 1
            elif c == ")":
                depth -= 1
                if depth == 0:
                    return text[start:i], i + 1
        i += 1
    return text[start:], len(text)


def _unquote(lit: str) -> str:
    return lit[1:-1]


def parse_service_file(path: Path) -> Optional[ServiceDoc]:
    raw = path.read_text(encoding="utf-8")
    text = mask_block_comments(raw)

    cm = _CLASS_RE.search(text)
    if not cm:
        return None
    name = cm.group(1)
    class_line = text.count("\n", 0, cm.start()) + 1

    # Restrict method scan to the class body so we don't pick up helpers.
    brace = text.find("{", cm.end())
    body, _ = _find_body(text, brace) if brace != -1 else (text[cm.end():], len(text))
    body_offset = brace + 1 if brace != -1 else cm.end()

    methods: List[Method] = []
    seen_methods = set()
    for mm in _METHOD_RE.finditer(body):
        mname = mm.group("name")
        generics = mm.group("generics") or ""
        paren_open = mm.end() - 1  # position of '(' within body
        params, after = _balanced_paren(body, paren_open)
        # Return type: from `)` up to the next top-level `{`.
        ret_segment = body[after:]
        brace_pos = ret_segment.find("{")
        ret_raw = ret_segment[:brace_pos] if brace_pos != -1 else ""
        ret = strip_line_comment(ret_raw).strip()
        params_clean = re.sub(r"\s+", " ", strip_line_comment(params)).strip()
        sig = f"{mname}{generics}({params_clean}){ret}"
        sig = re.sub(r"\s+", " ", sig).strip()
        if mname in seen_methods:
            continue
        seen_methods.add(mname)
        line_no = text.count("\n", 0, body_offset + mm.start()) + 1
        methods.append(Method(mname, sig, line_no))

    # HTTP calls anywhere in the file (method bodies).
    calls: List[HttpCall] = []
    seen_calls = set()
    for cmt in _REQUEST_CALL_RE.finditer(text):
        verb = cmt.group(1).upper()
        route = _unquote(cmt.group(2))
        key = (verb, route)
        if key not in seen_calls:
            seen_calls.add(key)
            calls.append(HttpCall(verb, route))
    for cmt in _FORMDATA_CALL_RE.finditer(text):
        verb = cmt.group(2).upper()
        route = _unquote(cmt.group(1))
        key = (verb, route)
        if key not in seen_calls:
            seen_calls.add(key)
            calls.append(HttpCall(verb, route))

    methods.sort(key=lambda x: x.name.lower())
    calls.sort(key=lambda c: (c.path, c.verb))

    return ServiceDoc(
        name=name,
        domain=domain_from_stem(path.stem),
        source_ref=f"{rel(path)}:{class_line}",
        methods=methods,
        calls=calls,
    )


# --------------------------------------------------------------------------- #
# Markdown emission
# --------------------------------------------------------------------------- #

def frontmatter(kind: str, resource: str, title: str, description: str,
                domain: str, source_ref: str, tags: List[str]) -> str:
    lines = ["---"]
    lines.append(f"type: {kind}")
    lines.append(f"resource: {yaml_quote(resource)}")
    lines.append(f"title: {yaml_quote(title)}")
    lines.append(f"description: {yaml_quote(description)}")
    lines.append(f"domain: {domain}")
    lines.append(f"authority_tier: {AUTHORITY_TIER}")
    lines.append(f"data_classification: {DATA_CLASSIFICATION}")
    lines.append(f"source_ref: {yaml_quote(source_ref)}")
    lines.append("tags:")
    for t in tags:
        lines.append(f"  - {t}")
    lines.append("---")
    return "\n".join(lines)


def render_model(doc: ModelDoc) -> str:
    title = humanize(doc.name)
    kw = "interface" if doc.kind == "interface" else "class"
    desc = f"Shared {kw} `{doc.name}` ({len(doc.fields)} field(s)) from the okam Core library."
    fm = frontmatter(
        kind="model",
        resource=f"okam://model/{doc.name}",
        title=title,
        description=desc,
        domain=doc.domain,
        source_ref=doc.source_ref,
        tags=[doc.domain, "model", kw],
    )
    out = [fm, ""]
    out.append(f"TypeScript {kw} `{doc.name}` (vendored into okam clients via the Core library).")
    out.append("")
    out.append("# Fields")
    out.append("")
    if doc.fields:
        out.append("| Field | Type | Optional |")
        out.append("| --- | --- | --- |")
        for f in doc.fields:
            out.append(
                f"| `{md_escape_cell(f.name)}` | `{md_escape_cell(f.type)}` | "
                f"{'yes' if f.optional else 'no'} |"
            )
    else:
        out.append("_No declared fields._")
    out.append("")
    return "\n".join(out)


def render_enum(doc: EnumDoc) -> str:
    title = humanize(doc.name)
    desc = f"Shared enum `{doc.name}` ({len(doc.members)} member(s)) from the okam Core library."
    fm = frontmatter(
        kind="enum",
        resource=f"okam://enum/{doc.name}",
        title=title,
        description=desc,
        domain=doc.domain,
        source_ref=doc.source_ref,
        tags=[doc.domain, "enum"],
    )
    out = [fm, ""]
    out.append(f"TypeScript enum `{doc.name}` (vendored into okam clients via the Core library).")
    out.append("")
    out.append("# Members")
    out.append("")
    if doc.members:
        out.append("| Member | Value kind |")
        out.append("| --- | --- |")
        for mem, kind in doc.members:
            out.append(f"| `{md_escape_cell(mem)}` | {kind or 'auto'} |")
    else:
        out.append("_No declared members._")
    out.append("")
    return "\n".join(out)


def render_service(doc: ServiceDoc) -> str:
    title = humanize(doc.name)
    desc = (
        f"Shared service `{doc.name}` — {len(doc.methods)} public method(s), "
        f"{len(doc.calls)} HTTP call(s) — from the okam Core library."
    )
    fm = frontmatter(
        kind="service",
        resource=f"okam://service/{doc.name}",
        title=title,
        description=desc,
        domain=doc.domain,
        source_ref=doc.source_ref,
        tags=[doc.domain, "service"],
    )
    out = [fm, ""]
    out.append(f"TypeScript service `{doc.name}` (vendored into okam clients via the Core library).")
    out.append("")
    out.append("# Public methods")
    out.append("")
    if doc.methods:
        for mth in doc.methods:
            out.append(f"* `{mth.signature}`")
    else:
        out.append("_No public methods._")
    out.append("")
    out.append("# HTTP calls")
    out.append("")
    if doc.calls:
        out.append("| Method | Path |")
        out.append("| --- | --- |")
        for c in doc.calls:
            out.append(f"| {c.verb} | `{md_escape_cell(c.path)}` |")
    else:
        out.append("_No HTTP calls (local/utility service)._")
    out.append("")
    return "\n".join(out)


def write_file(path: Path, content: str) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    if not content.endswith("\n"):
        content += "\n"
    path.write_text(content, encoding="utf-8")


# --------------------------------------------------------------------------- #
# Index emission
# --------------------------------------------------------------------------- #

def write_models_index(docs: List[ModelDoc]) -> None:
    lines = ["# Models", "",
             "Shared TypeScript models (interfaces/classes) vendored into okam clients.",
             ""]
    for d in docs:
        lines.append(f"* [{d.name}]({d.name}.md) - {len(d.fields)} field(s) · domain `{d.domain}`")
    lines.append("")
    write_file(OUT_ROOT / "models" / "index.md", "\n".join(lines))


def write_enums_index(docs: List[EnumDoc]) -> None:
    lines = ["# Enums", "",
             "Shared TypeScript enums vendored into okam clients.",
             ""]
    for d in docs:
        lines.append(f"* [{d.name}]({d.name}.md) - {len(d.members)} member(s) · domain `{d.domain}`")
    lines.append("")
    write_file(OUT_ROOT / "enums" / "index.md", "\n".join(lines))


def write_services_index(docs: List[ServiceDoc]) -> None:
    lines = ["# Services", "",
             "Shared TypeScript services (HTTP/data access) vendored into okam clients.",
             ""]
    for d in docs:
        lines.append(
            f"* [{d.name}]({d.name}.md) - {len(d.methods)} method(s), "
            f"{len(d.calls)} HTTP call(s) · domain `{d.domain}`"
        )
    lines.append("")
    write_file(OUT_ROOT / "services" / "index.md", "\n".join(lines))


def write_root_index(n_models: int, n_services: int, n_enums: int) -> None:
    lines = [
        "---",
        f'okf_version: "{OKF_VERSION}"',
        "---",
        "# okam Core OKF Bundle",
        "",
        "Machine-readable Open Knowledge Format map of the okam **Core** shared "
        "TypeScript library — the vendored library bundled into every okam client. "
        "Generated offline and deterministically from `models/**`, `services/**` "
        "and `enums/**`. Schema and contract shape only (no values, no PII, no "
        "secrets).",
        "",
        f"* [Models](models/index.md) - one concept per shared model "
        f"(class/interface): fields + types. ({n_models})",
        f"* [Services](services/index.md) - one concept per `*Service`: public "
        f"methods + the HTTP call surface. ({n_services})",
        f"* [Enums](enums/index.md) - one concept per shared enum: its members. "
        f"({n_enums})",
        "",
        "## Conformance & scope",
        "",
        "This bundle conforms to **Open Knowledge Format v0.1**: every concept "
        "document has parseable YAML frontmatter and a non-empty `type`.",
        "",
        "**Extension keys.** Every concept document carries four extension keys "
        "beyond the canonical set:",
        "",
        "* `authority_tier` — always `source`: generated directly from the "
        "library source, the authoritative definition of these contracts.",
        "* `data_classification` — always `schema-only`: type/field/method/route "
        "shape, never values, rows, PII or secrets.",
        "* `domain` — the logical area (the `models/<area>` submodule for models; "
        "an inferred area for services and enums).",
        "* `source_ref` — the repo-relative `path:line` the concept was derived "
        "from.",
        "",
        "**Scope.**",
        "",
        "* Internal-only — feeds the okam knowledge-MCP and the \"okam is the "
        "brain\" layer; never shipped in a client bundle.",
        "* Schema-only — model field/type shape, service method signatures and "
        "the HTTP route surface they call; no request/response bodies, no "
        "values, no secrets.",
        "* Deterministic — no timestamps or randomness; re-running on an "
        "unchanged tree is byte-identical.",
        "",
    ]
    write_file(OUT_ROOT / "index.md", "\n".join(lines))


def write_log() -> None:
    lines = [
        "# Log",
        "",
        "* Bundle generated offline from `models/**`, `services/**` and "
        "`enums/**` by `tools/okf/generate_okf.py`. Schema-only; deterministic "
        "(no timestamps).",
        "",
    ]
    write_file(OUT_ROOT / "log.md", "\n".join(lines))


# --------------------------------------------------------------------------- #
# Driver
# --------------------------------------------------------------------------- #

def collect_models() -> List[ModelDoc]:
    docs: List[ModelDoc] = []
    if MODELS_DIR.is_dir():
        for path in sorted(MODELS_DIR.rglob("*.ts")):
            if path.name in SKIP_BASENAMES:
                continue
            docs.extend(parse_model_file(path))
    docs.sort(key=lambda d: d.name.lower())
    return docs


def collect_enums() -> List[EnumDoc]:
    docs: List[EnumDoc] = []
    if ENUMS_DIR.is_dir():
        for path in sorted(ENUMS_DIR.rglob("*.ts")):
            if path.name in SKIP_BASENAMES:
                continue
            docs.extend(parse_enum_file(path))
    docs.sort(key=lambda d: d.name.lower())
    return docs


def collect_services() -> List[ServiceDoc]:
    docs: List[ServiceDoc] = []
    if SERVICES_DIR.is_dir():
        for path in sorted(SERVICES_DIR.rglob("*.ts")):
            if path.name in SKIP_BASENAMES:
                continue
            doc = parse_service_file(path)
            if doc is not None:
                docs.append(doc)
    docs.sort(key=lambda d: d.name.lower())
    return docs


def main(argv: List[str]) -> int:
    ap = argparse.ArgumentParser(description="Generate the okam Core OKF bundle.")
    ap.add_argument("--check", action="store_true",
                    help="parse only; do not write any files")
    args = ap.parse_args(argv)

    models = collect_models()
    enums = collect_enums()
    services = collect_services()

    if args.check:
        print(f"[check] models={len(models)} services={len(services)} enums={len(enums)}")
        return 0

    # Concept docs
    for d in models:
        write_file(OUT_ROOT / "models" / f"{d.name}.md", render_model(d))
    for d in enums:
        write_file(OUT_ROOT / "enums" / f"{d.name}.md", render_enum(d))
    for d in services:
        write_file(OUT_ROOT / "services" / f"{d.name}.md", render_service(d))

    # Indexes + log
    write_models_index(models)
    write_enums_index(enums)
    write_services_index(services)
    write_root_index(len(models), len(services), len(enums))
    write_log()

    total = len(models) + len(services) + len(enums)
    total_calls = sum(len(s.calls) for s in services)
    print(f"OKF bundle written to {rel(OUT_ROOT)}/")
    print(f"  models:   {len(models)}")
    print(f"  services: {len(services)}  ({total_calls} HTTP calls)")
    print(f"  enums:    {len(enums)}")
    print(f"  concept docs total: {total}")
    print("  sample URIs:")
    for d in models[:3]:
        print(f"    okam://model/{d.name}   <- {d.source_ref}")
    for d in services[:2]:
        print(f"    okam://service/{d.name} <- {d.source_ref}")
    for d in enums[:2]:
        print(f"    okam://enum/{d.name}    <- {d.source_ref}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main(sys.argv[1:]))
