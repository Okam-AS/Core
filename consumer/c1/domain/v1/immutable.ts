export type DeepReadonlyV1<T> =
  T extends (...arguments_: never[]) => unknown
    ? T
    : T extends readonly (infer TItem)[]
      ? readonly DeepReadonlyV1<TItem>[]
      : T extends object
        ? { readonly [TKey in keyof T]: DeepReadonlyV1<T[TKey]> }
        : T;

/**
 * Recursively freezes a newly validated workflow value. Core never stores a
 * mutable nested array or object behind a readonly TypeScript annotation.
 */
export function deepFreezeV1<T>(value: T): DeepReadonlyV1<T> {
  if (typeof value !== 'object' || value === null) {
    return value as DeepReadonlyV1<T>;
  }

  const record = value as Record<PropertyKey, unknown>;
  for (const key of Reflect.ownKeys(record)) {
    deepFreezeV1(record[key]);
  }
  return (Object.isFrozen(value) ? value : Object.freeze(value)) as
    DeepReadonlyV1<T>;
}
