import {
  normalizePhoneNumber,
  type PhoneInput,
} from '@okam/core/consumer/c0/application/v1';
import {
  formatMoneyMinor,
  type ConsumerMarket,
} from '@okam/core/consumer/c0/domain/v1';
import {
  createReducerStore,
  type StateTransition,
} from '@okam/core/consumer/adapters/state';
import { useOkamStore } from '@okam/core/consumer/adapters/react';

type State = Readonly<{ market: ConsumerMarket }>;
type Event = { type: 'market-selected'; market: ConsumerMarket };

const transition: StateTransition<State, Event> = (_state, event) => ({
  market: event.market,
});

export const packageConsumerStore = createReducerStore({
  createInitialState: (): State => ({ market: 'CH' }),
  transition,
});

export function useSelectedMarket(): ConsumerMarket {
  return useOkamStore(packageConsumerStore, (state) => state.value.market);
}

const phone: PhoneInput = {
  market: packageConsumerStore.getState().value.market,
  value: '79 123 45 67',
};

export const packageConsumerExamples = {
  formatted: formatMoneyMinor(1_234, 'CH'),
  phone: normalizePhoneNumber(phone),
};
