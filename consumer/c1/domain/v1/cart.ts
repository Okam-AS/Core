import {
  cartEventV1Schema,
  cartSnapshotV1Schema,
  consumerCurrencyV1Schema,
  type CartEventWireV1,
  type CartLineInputWireV1,
  type CartSnapshotWireV1,
} from '../../contracts/v1';
import type { FulfilmentCapabilityV1 } from './fulfilment';
import { selectFulfilmentV1 } from './fulfilment';
import { deepFreezeV1, type DeepReadonlyV1 } from './immutable';
import {
  isCompiledAuthorizedStoreScopeV1,
  type AuthorizedStoreScopeV1,
} from './store-authorization';

declare const consumerCartBrandV1: unique symbol;

export type ConsumerCartLineV1 = DeepReadonlyV1<CartLineInputWireV1>;
export type ConsumerCartEventV1 = DeepReadonlyV1<CartEventWireV1>;
export type ConsumerCartV1 = DeepReadonlyV1<CartSnapshotWireV1> & {
  readonly [consumerCartBrandV1]: true;
};

export type CartParseFailureV1 =
  | 'cart-invalid'
  | 'authorization-unavailable'
  | 'authorization-stale';

export type CartParseV1 =
  | Readonly<{ ok: true; cart: ConsumerCartV1 }>
  | Readonly<{ ok: false; reason: CartParseFailureV1 }>;

export type CartReductionFailureV1 =
  | 'scope-unverified'
  | 'authorization-stale'
  | 'event-invalid'
  | 'line-not-found'
  | 'line-identity-conflict'
  | 'fulfilment-unavailable'
  | 'revision-exhausted'
  | 'cart-total-overflow';

export type CartReductionV1 =
  | Readonly<{ ok: true; cart: ConsumerCartV1; changed: boolean }>
  | Readonly<{
      ok: false;
      cart: ConsumerCartV1;
      reason: CartReductionFailureV1;
    }>;

export type CartStoreSwitchV1 =
  | Readonly<{
      ok: true;
      cart: ConsumerCartV1;
      changed: boolean;
      discarded: boolean;
    }>
  | Readonly<{
      ok: false;
      cart: ConsumerCartV1;
      reason:
        | 'scope-unverified'
        | 'authorization-stale'
        | 'cart-not-empty'
        | 'revision-exhausted';
    }>;

const trustedCartsV1 = new WeakSet<object>();

function scopeEvidenceV1(scope: AuthorizedStoreScopeV1) {
  return {
    manifestId: scope.manifestId,
    manifestVersion: scope.manifestVersion,
    brandKey: scope.brandKey,
    storeId: scope.storeId,
    market: scope.market,
    currency: scope.currency,
  } as const;
}

function cartMatchesScopeV1(
  cart: Pick<
    CartSnapshotWireV1,
    | 'manifestId'
    | 'manifestVersion'
    | 'brandKey'
    | 'storeId'
    | 'market'
    | 'currency'
  >,
  scope: AuthorizedStoreScopeV1,
): boolean {
  return (
    cart.manifestId === scope.manifestId &&
    cart.manifestVersion === scope.manifestVersion &&
    cart.brandKey === scope.brandKey &&
    cart.storeId === scope.storeId &&
    cart.market === scope.market &&
    cart.currency === scope.currency
  );
}

function trustCartV1(cart: CartSnapshotWireV1): ConsumerCartV1 {
  const frozen = deepFreezeV1(cart) as ConsumerCartV1;
  trustedCartsV1.add(frozen);
  return frozen;
}

function nextRevisionV1(revision: number): number | undefined {
  const next = revision + 1;
  return Number.isSafeInteger(next) ? next : undefined;
}

function lineConfigurationEqualsV1(
  left: ConsumerCartLineV1,
  right: ConsumerCartLineV1,
): boolean {
  return (
    JSON.stringify(left.product) === JSON.stringify(right.product) &&
    (left.modifier ?? '') === (right.modifier ?? '') &&
    (left.note ?? '') === (right.note ?? '') &&
    JSON.stringify(left.selections) === JSON.stringify(right.selections) &&
    (
      left.serverLineItemId === undefined ||
      right.serverLineItemId === undefined ||
      left.serverLineItemId === right.serverLineItemId
    )
  );
}

/**
 * Matches the current native cartLineKey exactly while preserving full line
 * metadata separately for persistence and conflict review.
 */
export function cartLineIdentityV1(line: ConsumerCartLineV1): string {
  return JSON.stringify({
    itemId: line.product.id,
    unitPriceMinor: line.product.unitPriceMinor,
    modifier: line.modifier ?? '',
    note: line.note ?? '',
    selections: JSON.stringify(
      line.selections.map((selection) => ({
        variantId: selection.variantId,
        optionIds: selection.options.map((option) => option.optionId),
      })),
    ),
  });
}

function cartInvariantReasonV1(
  candidate: unknown,
): 'cart-total-overflow' | 'event-invalid' {
  const parsed = cartSnapshotV1Schema.safeParse(candidate);
  if (parsed.success) return 'event-invalid';
  return parsed.error.issues.some((issue) =>
    issue.message === 'Cart total exceeds safe integer range.'
  )
    ? 'cart-total-overflow'
    : 'event-invalid';
}

function changedCartV1(
  current: ConsumerCartV1,
  changes: Partial<ConsumerCartV1>,
): CartReductionV1 {
  const revision = nextRevisionV1(current.revision);
  if (revision === undefined) {
    return { ok: false, cart: current, reason: 'revision-exhausted' };
  }
  const candidate = {
    ...current,
    ...changes,
    revision,
  };
  const parsed = cartSnapshotV1Schema.safeParse(candidate);
  if (!parsed.success) {
    return {
      ok: false,
      cart: current,
      reason: cartInvariantReasonV1(candidate),
    };
  }
  return { ok: true, cart: trustCartV1(parsed.data), changed: true };
}

export function createConsumerCartV1(
  scope: AuthorizedStoreScopeV1,
  options: Readonly<{ revision?: number }> = {},
): ConsumerCartV1 {
  if (!isCompiledAuthorizedStoreScopeV1(scope)) {
    throw new TypeError('Consumer cart requires a compiled authorized store scope.');
  }
  const parsed = cartSnapshotV1Schema.parse({
    version: 1,
    ...scopeEvidenceV1(scope),
    revision: options.revision ?? 0,
    lines: [],
  });
  return trustCartV1(parsed);
}

/** Parses persisted JSON only against the currently compiled authorization. */
export function parseConsumerCartV1(input: Readonly<{
  cart: unknown;
  scope: AuthorizedStoreScopeV1 | null;
}>): CartParseV1 {
  if (input.scope === null || !isCompiledAuthorizedStoreScopeV1(input.scope)) {
    return { ok: false, reason: 'authorization-unavailable' };
  }
  if (trustedCartsV1.has(input.cart as object)) {
    const trusted = input.cart as ConsumerCartV1;
    return cartMatchesScopeV1(trusted, input.scope)
      ? { ok: true, cart: trusted }
      : { ok: false, reason: 'authorization-stale' };
  }
  const parsed = cartSnapshotV1Schema.safeParse(input.cart);
  if (!parsed.success) return { ok: false, reason: 'cart-invalid' };
  if (!cartMatchesScopeV1(parsed.data, input.scope)) {
    return { ok: false, reason: 'authorization-stale' };
  }
  return { ok: true, cart: trustCartV1(parsed.data) };
}

export function cartTotalMinorV1(cart: ConsumerCartV1): number {
  let totalMinor = 0;
  for (const line of cart.lines) {
    const lineTotal = line.product.unitPriceMinor * line.quantity;
    totalMinor += lineTotal;
    if (!Number.isSafeInteger(lineTotal) || !Number.isSafeInteger(totalMinor)) {
      throw new RangeError('Trusted cart total exceeded safe integer range.');
    }
  }
  return totalMinor;
}

/** Parses and deeply freezes one native-compatible line projection. */
export function parseConsumerCartLineV1(
  input: unknown,
): ConsumerCartLineV1 | undefined {
  const event = cartEventV1Schema.safeParse({ type: 'line-added', line: input });
  return event.success && event.data.type === 'line-added'
    ? deepFreezeV1(event.data.line)
    : undefined;
}

/**
 * Pure atomic reducer. Every failure and accepted no-op returns the exact
 * current frozen cart reference.
 */
export function reduceConsumerCartV1(input: Readonly<{
  cart: ConsumerCartV1;
  scope: AuthorizedStoreScopeV1;
  event: unknown;
  availableFulfilment?: readonly FulfilmentCapabilityV1[];
}>): CartReductionV1 {
  if (
    !trustedCartsV1.has(input.cart) ||
    !isCompiledAuthorizedStoreScopeV1(input.scope)
  ) {
    return { ok: false, cart: input.cart, reason: 'scope-unverified' };
  }
  if (!cartMatchesScopeV1(input.cart, input.scope)) {
    return { ok: false, cart: input.cart, reason: 'authorization-stale' };
  }

  const parsedEvent = cartEventV1Schema.safeParse(input.event);
  if (!parsedEvent.success) {
    return { ok: false, cart: input.cart, reason: 'event-invalid' };
  }
  const event = deepFreezeV1(parsedEvent.data);

  switch (event.type) {
    case 'line-added': {
      if (
        event.line.product.storeId !== input.cart.storeId ||
        event.line.product.currency !== input.cart.currency
      ) {
        return { ok: false, cart: input.cart, reason: 'event-invalid' };
      }
      if (event.line.product.soldOut === true) {
        return { ok: true, cart: input.cart, changed: false };
      }
      const identity = cartLineIdentityV1(event.line);
      const index = input.cart.lines.findIndex(
        (line) => cartLineIdentityV1(line) === identity,
      );
      let lines: readonly ConsumerCartLineV1[];
      if (index === -1) {
        lines = [...input.cart.lines, event.line];
      } else {
        const currentLine = input.cart.lines[index]!;
        if (
          !lineConfigurationEqualsV1(currentLine, event.line)
        ) {
          return {
            ok: false,
            cart: input.cart,
            reason: 'line-identity-conflict',
          };
        }
        const quantity = Math.min(
          99,
          currentLine.quantity + event.line.quantity,
        );
        if (quantity === currentLine.quantity) {
          return { ok: true, cart: input.cart, changed: false };
        }
        lines = input.cart.lines.map((line, lineIndex) =>
          lineIndex === index ? { ...line, quantity } : line,
        );
      }
      return changedCartV1(input.cart, { lines: [...lines] });
    }
    case 'line-quantity-set': {
      const index = input.cart.lines.findIndex(
        (line) => cartLineIdentityV1(line) === event.identity,
      );
      if (index === -1) {
        return { ok: false, cart: input.cart, reason: 'line-not-found' };
      }
      const line = input.cart.lines[index]!;
      const quantity = line.product.soldOut
        ? Math.min(line.quantity, event.quantity)
        : event.quantity;
      if (quantity === line.quantity) {
        return { ok: true, cart: input.cart, changed: false };
      }
      const lines = quantity === 0
        ? input.cart.lines.filter((_, lineIndex) => lineIndex !== index)
        : input.cart.lines.map((candidate, lineIndex) =>
            lineIndex === index ? { ...candidate, quantity } : candidate,
          );
      return changedCartV1(input.cart, { lines: [...lines] });
    }
    case 'line-removed': {
      const lines = input.cart.lines.filter(
        (line) => cartLineIdentityV1(line) !== event.identity,
      );
      return lines.length === input.cart.lines.length
        ? { ok: false, cart: input.cart, reason: 'line-not-found' }
        : changedCartV1(input.cart, { lines: [...lines] });
    }
    case 'line-reconfigured': {
      const index = input.cart.lines.findIndex(
        (line) => cartLineIdentityV1(line) === event.identity,
      );
      if (index === -1) {
        return { ok: false, cart: input.cart, reason: 'line-not-found' };
      }
      if (
        event.line.product.soldOut === true ||
        event.line.product.storeId !== input.cart.storeId ||
        event.line.product.currency !== input.cart.currency
      ) {
        return { ok: true, cart: input.cart, changed: false };
      }
      const remaining = input.cart.lines.filter(
        (_, lineIndex) => lineIndex !== index,
      );
      const replacementIdentity = cartLineIdentityV1(event.line);
      const mergeIndex = remaining.findIndex(
        (line) => cartLineIdentityV1(line) === replacementIdentity,
      );
      if (
        mergeIndex !== -1 &&
        !lineConfigurationEqualsV1(remaining[mergeIndex]!, event.line)
      ) {
        return {
          ok: false,
          cart: input.cart,
          reason: 'line-identity-conflict',
        };
      }
      const lines = mergeIndex === -1
        ? [...remaining, event.line]
        : remaining.map((line, lineIndex) =>
            lineIndex === mergeIndex
              ? {
                  ...line,
                  quantity: Math.min(99, line.quantity + event.line.quantity),
                }
              : line,
          );
      return changedCartV1(input.cart, { lines: [...lines] });
    }
    case 'fulfilment-selected': {
      const selection = selectFulfilmentV1({
        available: input.availableFulfilment ?? [],
        selection: event.selection,
      });
      if (!selection.accepted) {
        return {
          ok: false,
          cart: input.cart,
          reason: 'fulfilment-unavailable',
        };
      }
      if (
        JSON.stringify(input.cart.fulfilment) ===
        JSON.stringify(selection.selection)
      ) {
        return { ok: true, cart: input.cart, changed: false };
      }
      return changedCartV1(input.cart, {
        fulfilment: selection.selection,
      });
    }
    case 'cart-cleared':
      return input.cart.lines.length === 0
        ? { ok: true, cart: input.cart, changed: false }
        : changedCartV1(input.cart, { lines: [] });
  }
}

export function switchConsumerCartStoreV1(input: Readonly<{
  cart: ConsumerCartV1;
  currentScope: AuthorizedStoreScopeV1;
  targetScope: AuthorizedStoreScopeV1;
  discardExistingLines: boolean;
}>): CartStoreSwitchV1 {
  if (
    !trustedCartsV1.has(input.cart) ||
    !isCompiledAuthorizedStoreScopeV1(input.currentScope) ||
    !isCompiledAuthorizedStoreScopeV1(input.targetScope)
  ) {
    return { ok: false, cart: input.cart, reason: 'scope-unverified' };
  }
  if (!cartMatchesScopeV1(input.cart, input.currentScope)) {
    return { ok: false, cart: input.cart, reason: 'authorization-stale' };
  }
  if (cartMatchesScopeV1(input.cart, input.targetScope)) {
    return {
      ok: true,
      cart: input.cart,
      changed: false,
      discarded: false,
    };
  }
  if (input.cart.lines.length > 0 && !input.discardExistingLines) {
    return { ok: false, cart: input.cart, reason: 'cart-not-empty' };
  }
  const revision = nextRevisionV1(input.cart.revision);
  if (revision === undefined) {
    return { ok: false, cart: input.cart, reason: 'revision-exhausted' };
  }
  const next = createConsumerCartV1(input.targetScope, { revision });
  return {
    ok: true,
    cart: next,
    changed: true,
    discarded: input.cart.lines.length > 0,
  };
}

export function parseConsumerCartEventV1(
  input: unknown,
): ConsumerCartEventV1 | undefined {
  const parsed = cartEventV1Schema.safeParse(input);
  return parsed.success ? deepFreezeV1(parsed.data) : undefined;
}

export function parseConsumerCurrencyV1(
  input: unknown,
): 'CHF' | 'NOK' | undefined {
  const parsed = consumerCurrencyV1Schema.safeParse(input);
  return parsed.success ? parsed.data : undefined;
}
