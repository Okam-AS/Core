import { createStore, type StoreApi } from 'zustand/vanilla';

/**
 * A framework-neutral transition owned by Core domain/application code.
 *
 * Transitions must be deterministic and return immutable snapshots. Returning
 * the same snapshot reference is treated as a no-op and does not notify
 * subscribers.
 */
export type StateTransition<TState, TEvent> = (
  state: Readonly<TState>,
  event: TEvent,
) => TState;

export type ReducerStoreState<TState, TEvent> = {
  readonly value: TState;
  dispatch: (event: TEvent) => void;
  replace: (value: TState) => void;
  reset: () => void;
};

export type ReducerStore<TState, TEvent> = StoreApi<
  ReducerStoreState<TState, TEvent>
>;

export type ReducerStoreOptions<TState, TEvent> = {
  /**
   * A factory prevents state from leaking between app roots, tests, SSR
   * requests, merchants, or signed white-label builds.
   */
  createInitialState: () => TState;
  transition: StateTransition<TState, TEvent>;
};

/**
 * Adapts a pure Core transition to a small vanilla Zustand store.
 *
 * This function deliberately creates an instance instead of exporting a
 * singleton. The host app owns the instance lifecycle, persistence adapter,
 * and React provider. Server data remains in the host's query cache.
 */
export function createReducerStore<TState, TEvent>({
  createInitialState,
  transition,
}: ReducerStoreOptions<TState, TEvent>): ReducerStore<TState, TEvent> {
  const initialValue = createInitialState();

  return createStore<ReducerStoreState<TState, TEvent>>()((set, get) => ({
    value: initialValue,
    dispatch: (event) => {
      const currentValue = get().value;
      const nextValue = transition(currentValue, event);

      if (!Object.is(currentValue, nextValue)) {
        set({ value: nextValue });
      }
    },
    replace: (value) => {
      if (!Object.is(get().value, value)) {
        set({ value });
      }
    },
    reset: () => {
      const value = createInitialState();

      if (!Object.is(get().value, value)) {
        set({ value });
      }
    },
  }));
}
