import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import ts from "typescript";
import { describe, expect, it } from "vitest";

const root = path.dirname(fileURLToPath(import.meta.url));

function productionSources(directory: string): string[] {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const absolute = path.join(directory, entry.name);
    if (entry.isDirectory()) return productionSources(absolute);
    return entry.name.endsWith(".ts") && !entry.name.endsWith(".test.ts") ? [absolute] : [];
  });
}

const allowedSelfReferences = new Set([
  "@okam/core/consumer-domain",
  "@okam/core/consumer-domain/v1",
]);

const bannedRuntimeGlobals = [
  "globalThis",
  "window",
  "document",
  "navigator",
  "localStorage",
  "sessionStorage",
  "AsyncStorage",
  "indexedDB",
  "fetch",
  "XMLHttpRequest",
  "process",
  "Buffer",
  "require",
  "Intl",
];

function stringSpecifier(expression: ts.Expression | ts.TypeNode | undefined): string | undefined {
  if (!expression) return undefined;
  if (ts.isStringLiteralLike(expression)) return expression.text;
  if (ts.isLiteralTypeNode(expression) && ts.isStringLiteralLike(expression.literal)) return expression.literal.text;
  return undefined;
}

function moduleBoundaryViolations(source: string, file: string): string[] {
  const violations: string[] = [];
  const sourceFile = ts.createSourceFile(file, source, ts.ScriptTarget.Latest, true, ts.ScriptKind.TS);

  const inspectSpecifier = (specifier: string | undefined, kind: string): void => {
    if (specifier === undefined) {
      violations.push(`${file}: ${kind} uses a non-literal module specifier`);
      return;
    }
    if (!specifier.startsWith(".") && !allowedSelfReferences.has(specifier)) {
      violations.push(`${file}: ${kind} uses non-relative module ${specifier}`);
    }
  };

  const inspectNode = (node: ts.Node): void => {
    if (ts.isImportDeclaration(node)) {
      inspectSpecifier(stringSpecifier(node.moduleSpecifier), "import");
    } else if (ts.isExportDeclaration(node) && node.moduleSpecifier) {
      inspectSpecifier(stringSpecifier(node.moduleSpecifier), "re-export");
    } else if (ts.isImportEqualsDeclaration(node) && ts.isExternalModuleReference(node.moduleReference)) {
      inspectSpecifier(stringSpecifier(node.moduleReference.expression), "import-equals");
    } else if (ts.isImportTypeNode(node)) {
      inspectSpecifier(stringSpecifier(node.argument), "import-type");
    } else if (ts.isCallExpression(node)) {
      if (node.expression.kind === ts.SyntaxKind.ImportKeyword) {
        inspectSpecifier(stringSpecifier(node.arguments[0]), "dynamic import");
      } else if (ts.isIdentifier(node.expression) && node.expression.text === "require") {
        inspectSpecifier(stringSpecifier(node.arguments[0]), "require");
      } else if (
        ts.isPropertyAccessExpression(node.expression)
        && ts.isIdentifier(node.expression.expression)
        && node.expression.expression.text === "require"
      ) {
        inspectSpecifier(stringSpecifier(node.arguments[0]), `require.${node.expression.name.text}`);
      }
    }
    ts.forEachChild(node, inspectNode);
  };

  inspectNode(sourceFile);
  return violations;
}

function ambientGlobalViolations(source: string, file: string): string[] {
  const violations: string[] = [];
  const sourceFile = ts.createSourceFile(file, source, ts.ScriptTarget.Latest, true, ts.ScriptKind.TS);
  const inspectNode = (node: ts.Node): void => {
    if (ts.isIdentifier(node) && bannedRuntimeGlobals.includes(node.text)) {
      violations.push(`${file}: banned runtime global ${node.text}`);
    }
    ts.forEachChild(node, inspectNode);
  };
  inspectNode(sourceFile);
  return violations;
}

describe("consumer-domain dependency boundary", () => {
  it("publishes only the two explicit source subpaths as side-effect-free", () => {
    const packageJson = JSON.parse(readFileSync(path.join(root, "..", "package.json"), "utf8")) as {
      sideEffects?: unknown;
      exports?: Record<string, { types?: unknown; import?: unknown; default?: unknown }>;
    };

    expect(packageJson.sideEffects).toBe(false);
    expect(packageJson.exports).toEqual({
      "./consumer-domain": {
        types: "./consumer-domain/index.ts",
        import: "./consumer-domain/index.ts",
        default: "./consumer-domain/index.ts",
      },
      "./consumer-domain/v1": {
        types: "./consumer-domain/v1/index.ts",
        import: "./consumer-domain/v1/index.ts",
        default: "./consumer-domain/v1/index.ts",
      },
    });
  });

  it("contains no framework, device, storage, transport, Node, or ambient-global dependencies", () => {
    const violations: string[] = [];

    for (const file of productionSources(root)) {
      const source = readFileSync(file, "utf8");
      const relative = path.relative(root, file);
      violations.push(...moduleBoundaryViolations(source, relative));
      violations.push(...ambientGlobalViolations(source, relative));
    }

    expect(violations).toEqual([]);

    const rejectedFixtures = [
      ['import { z } from "zod";', "zod"],
      ['import dayjs = require("dayjs");', "dayjs"],
      ['const client = await import("ky");', "ky"],
      ['import fs from "fs";', "fs"],
      ['export * from "node:fs";', "node:fs"],
      ['export { join } from "path";', "path"],
      ['import "@shopify/flash-list";', "@shopify/flash-list"],
      ['const storage = require("@react-native-async-storage/async-storage");', "@react-native-async-storage/async-storage"],
      ['type Schema = import("zod").ZodType;', "zod"],
      ['const module = require.resolve("dayjs");', "dayjs"],
    ] as const;
    for (const [source, specifier] of rejectedFixtures) {
      expect(
        moduleBoundaryViolations(source, "mutation.ts").some((violation) => violation.includes(`non-relative module ${specifier}`)),
        source,
      ).toBe(true);
    }

    for (const source of ["require(name);", "import(name);"]) {
      expect(
        moduleBoundaryViolations(source, "mutation.ts").some((violation) => violation.includes("non-literal module specifier")),
        source,
      ).toBe(true);
    }

    const allowedFixtures = [
      'import "./phone";',
      'export * from "../v1";',
      'require("./legacy/phone");',
      'import("../v1/money");',
      'import type { MoneyFormatV1 } from "@okam/core/consumer-domain";',
      'export { normalizePhoneNumberV1 } from "@okam/core/consumer-domain/v1";',
    ];
    for (const source of allowedFixtures) {
      expect(moduleBoundaryViolations(source, "allowed.ts"), source).toEqual([]);
    }
  });
});
