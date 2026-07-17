import { readFileSync, readdirSync } from 'node:fs';
import { dirname, extname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

const repositoryRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const surfaceRoot = join(repositoryRoot, 'consumer', 'c0');

function sourceFiles(directory: string): string[] {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) {
      return sourceFiles(path);
    }
    return extname(entry.name) === '.ts' ? [path] : [];
  });
}

describe('consumer C0 package boundary', () => {
  it('does not import UI frameworks, platform runtimes, or the legacy env escape hatch', () => {
    const forbiddenModule = /(?:from\s+|import\s*\(|require\s*\()\s*['"](?:vue|pinia|react|react-native|expo)(?:[/.'"])/;
    const legacyEnvEscape = /['"]\.\.\/\.\.\/env['"]/;

    for (const path of sourceFiles(surfaceRoot)) {
      const source = readFileSync(path, 'utf8');
      expect(source, path).not.toMatch(forbiddenModule);
      expect(source, path).not.toMatch(legacyEnvEscape);
    }
  });

  it('does not introduce explicit unsafe types', () => {
    for (const path of sourceFiles(surfaceRoot)) {
      const source = readFileSync(path, 'utf8');
      expect(source, path).not.toMatch(/\bany\b/);
    }
  });

  it('publishes every C0 layer through an explicit package subpath', () => {
    const packageJson = JSON.parse(
      readFileSync(join(repositoryRoot, 'package.json'), 'utf8'),
    ) as {
      exports: Record<string, string>;
    };

    expect(packageJson.exports).toMatchObject({
      './consumer/c0': './consumer/c0/index.ts',
      './consumer/c0/domain': './consumer/c0/domain/index.ts',
      './consumer/c0/contracts': './consumer/c0/contracts/index.ts',
      './consumer/c0/application': './consumer/c0/application/index.ts',
      './consumer/c0/ports': './consumer/c0/ports/index.ts',
    });
  });
});
