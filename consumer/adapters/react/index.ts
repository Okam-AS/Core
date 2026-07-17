import { useStore } from 'zustand';
import type { StoreApi } from 'zustand/vanilla';

/**
 * React/React Native binding for an explicitly provided vanilla store.
 *
 * Store creation and ownership stay outside this hook so React Native app
 * roots and web request roots cannot accidentally share merchant/user state.
 */
export function useOkamStore<TState, TSelected>(
  store: StoreApi<TState>,
  selector: (state: TState) => TSelected,
): TSelected {
  return useStore(store, selector);
}
