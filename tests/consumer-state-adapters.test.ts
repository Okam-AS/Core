import { readFileSync, readdirSync } from 'node:fs';
import { dirname, extname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { describe, expect, it, vi } from 'vitest';

import {
  createReducerStore,
  type StateTransition,
} from '../consumer/adapters/state';

type CounterState = Readonly<{
  count: number;
  label: string;
}>;

type CounterEvent =
  | { type: 'increment'; by: number }
  | { type: 'rename'; label: string }
  | { type: 'unchanged' };

const transition: StateTransition<CounterState, CounterEvent> = (
  state,
  event,
) => {
  switch (event.type) {
    case 'increment':
      return { ...state, count: state.count + event.by };
    case 'rename':
      return { ...state, label: event.label };
    case 'unchanged':
      return state;
  }
};

function createCounterStore() {
  return createReducerStore({
    createInitialState: (): CounterState => ({ count: 0, label: 'cart' }),
    transition,
  });
}

describe('consumer state adapter', () => {
  it('creates isolated instances instead of leaking root state', () => {
    const first = createCounterStore();
    const second = createCounterStore();

    first.getState().dispatch({ type: 'increment', by: 2 });

    expect(first.getState().value).toEqual({ count: 2, label: 'cart' });
    expect(second.getState().value).toEqual({ count: 0, label: 'cart' });
  });

  it('delegates state changes to the supplied pure transition', () => {
    const store = createCounterStore();

    store.getState().dispatch({ type: 'increment', by: 3 });
    store.getState().dispatch({ type: 'rename', label: 'checkout' });

    expect(store.getState().value).toEqual({
      count: 3,
      label: 'checkout',
    });
  });

  it('does not notify subscribers when a transition returns the same snapshot', () => {
    const store = createCounterStore();
    const subscriber = vi.fn();
    const unsubscribe = store.subscribe(subscriber);

    store.getState().dispatch({ type: 'unchanged' });

    expect(subscriber).not.toHaveBeenCalled();
    unsubscribe();
  });

  it('supports explicit validated rehydration and reset without owning storage', () => {
    const store = createCounterStore();

    store.getState().replace({ count: 4, label: 'rehydrated' });
    expect(store.getState().value).toEqual({
      count: 4,
      label: 'rehydrated',
    });

    store.getState().reset();
    expect(store.getState().value).toEqual({ count: 0, label: 'cart' });
  });
});

const repositoryRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const adaptersRoot = join(repositoryRoot, 'consumer', 'adapters');
const c0Root = join(repositoryRoot, 'consumer', 'c0');

function sourceFiles(directory: string): string[] {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) {
      return sourceFiles(path);
    }
    return extname(entry.name) === '.ts' ? [path] : [];
  });
}

describe('consumer adapter boundaries', () => {
  it('keeps the framework-neutral C0 surface independent from state adapters', () => {
    const forbiddenDependency =
      /(?:from\s+|import\s*\(|require\s*\()\s*['"][^'"]*(?:zustand|consumer\/adapters|\.\.\/adapters)(?:[/.'"])/;

    for (const path of sourceFiles(c0Root)) {
      const source = readFileSync(path, 'utf8');
      expect(source, path).not.toMatch(forbiddenDependency);
    }
  });

  it('keeps Vue, Pinia, native runtimes, and environment globals out', () => {
    const forbiddenModule =
      /(?:from\s+|import\s*\(|require\s*\()\s*['"](?:vue|pinia|react-native|expo)(?:[/.'"])/;
    const environmentEscape =
      /(?:localStorage|sessionStorage|AsyncStorage|SecureStore|process\.env)/;

    for (const path of sourceFiles(adaptersRoot)) {
      const source = readFileSync(path, 'utf8');
      expect(source, path).not.toMatch(forbiddenModule);
      expect(source, path).not.toMatch(environmentEscape);
      expect(source, path).not.toMatch(/\bany\b/);
    }
  });

  it('keeps the vanilla adapter free of React bindings', () => {
    const stateRoot = join(adaptersRoot, 'state');

    for (const path of sourceFiles(stateRoot)) {
      const source = readFileSync(path, 'utf8');
      expect(source, path).not.toMatch(
        /(?:from\s+|import\s*\(|require\s*\()\s*['"]react(?:[/.'"])/,
      );
      expect(source, path).not.toMatch(
        /(?:from\s+|import\s*\(|require\s*\()\s*['"]zustand['"]/,
      );
    }
  });

  it('publishes explicit state and React adapter subpaths', () => {
    const packageJson = JSON.parse(
      readFileSync(join(repositoryRoot, 'package.json'), 'utf8'),
    ) as {
      dependencies: Record<string, string>;
      exports: Record<string, string>;
      peerDependencies: Record<string, string>;
      peerDependenciesMeta: Record<string, { optional?: boolean }>;
    };

    expect(packageJson.exports).toMatchObject({
      './consumer/adapters/state': './consumer/adapters/state/index.ts',
      './consumer/adapters/react': './consumer/adapters/react/index.ts',
    });
    expect(packageJson.dependencies.zustand).toBe('5.0.14');
    expect(packageJson.peerDependencies.react).toBe('>=18.0.0');
    expect(packageJson.peerDependenciesMeta.react).toEqual({
      optional: true,
    });
  });
});
