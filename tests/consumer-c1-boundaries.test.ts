import { readFileSync, readdirSync } from 'node:fs';
import { dirname, extname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

const repositoryRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const c1Root = join(repositoryRoot, 'consumer', 'c1');

function sourceFiles(directory: string): string[] {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name);
    return entry.isDirectory()
      ? sourceFiles(path)
      : extname(entry.name) === '.ts' ? [path] : [];
  });
}

describe('consumer C1 workflow boundary', () => {
  it('does not couple domain/contracts to a framework, native runtime, storage, or legacy state library', () => {
    const forbidden = /(?:from\s+|import\s*\(|require\s*\()\s*['"](?:vue|pinia|react|react-native|expo|zustand)(?:[/.'"])/;
    const storage = /(?:localStorage|sessionStorage|AsyncStorage|SecureStore|process\.env)/;

    for (const path of sourceFiles(c1Root)) {
      const source = readFileSync(path, 'utf8');
      expect(source, path).not.toMatch(forbidden);
      expect(source, path).not.toMatch(storage);
      expect(source, path).not.toMatch(/\bany\b/);
    }
  });

  it('publishes only declared C1 subpaths', () => {
    const packageJson = JSON.parse(readFileSync(join(repositoryRoot, 'package.json'), 'utf8')) as {
      exports: Record<string, string>;
    };
    expect(packageJson.exports).toMatchObject({
      './consumer/c1': './consumer/c1/index.ts',
      './consumer/c1/contracts': './consumer/c1/contracts/index.ts',
      './consumer/c1/contracts/v1': './consumer/c1/contracts/v1/index.ts',
      './consumer/c1/domain': './consumer/c1/domain/index.ts',
      './consumer/c1/domain/v1': './consumer/c1/domain/v1/index.ts',
    });
  });
});
