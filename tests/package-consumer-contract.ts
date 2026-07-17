import {
  ConsumerCatalogueScopeError,
  mapConsumerStorefront,
  normalizePhoneNumber,
  type PhoneInput,
} from '@okam/core/consumer/c0/application/v1';
import {
  type ConsumerProductScope,
  type ConsumerStorefrontScope,
  type StorefrontCatalog,
  formatMoneyMinor,
  type ConsumerMarket,
} from '@okam/core/consumer/c0/domain/v1';
import {
  consumerStorefrontSchema,
  type ConsumerStorefrontWire,
} from '@okam/core/consumer/c0/contracts';
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

const packageStorefrontWire: ConsumerStorefrontWire =
  consumerStorefrontSchema.parse({
    id: 6,
    name: 'Bahnhof Beizli',
    slug: 'bahnhof-beizli',
    currencyCode: 'CHF',
    isOpenNow: true,
    selfPickUp: true,
    categories: [],
  });

const packageStorefrontScope: ConsumerStorefrontScope = {
  storeId: 6,
  slug: 'bahnhof-beizli',
};

export const packageProductScope: ConsumerProductScope = {
  storeId: packageStorefrontScope.storeId,
  currencyCode: packageStorefrontWire.currencyCode,
};

export const packageCatalogueMismatchCode =
  new ConsumerCatalogueScopeError('contract probe').code;

export const packageStorefront: StorefrontCatalog = mapConsumerStorefront(
  packageStorefrontWire,
  'https://api.example.test',
  packageStorefrontScope,
);
