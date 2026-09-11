import { defineStore } from "pinia";
import { Store } from "../models";
import { DeliveryType } from "../enums";
import { useServices, useUser, useCategory, useTranslation, useTheme, useCart } from ".";
import { ref, computed } from "vue";

export const useStore = defineStore("store", () => {
  const { storeService, persistenceService } = useServices();
  const _category = useCategory();
  const _user = useUser();
  const { $i } = useTranslation();
  const { $availableStoreIds } = useTheme();
  const _cart = useCart();
  const stores = ref([] as Store[]);
  const isLoading = ref(false);

  const store = ref(persistenceService.load<Store>("store") || ({} as Store));
  persistenceService.watchAndStore(store, "store");

  const currentStore = computed(() => {
    return store.value;
  });

  const clearCurrentStore = () => {
    store.value = {} as Store;
  };

  const setCurrentStore = (id: number, reload: boolean = false) => {
    if (!id || ($availableStoreIds?.length && !$availableStoreIds.includes(id))) return Promise.resolve();

    if (!reload) {
      isLoading.value = true;
      _category.clearCategories();
    }
    const cashedStore = stores.value.find((x) => x.id === id);
    if (cashedStore) {
      store.value = cashedStore;
    }
    return storeService()
      .GetForConsumer(id, null)
      .then((s) => {
        store.value = s;
      })
      .finally(() => {
        isLoading.value = false;
        _user.loadFavoriteProducts({ deliveryType: _cart.getCurrentCart()?.deliveryType || DeliveryType.NotSet });
      });
  };

  const reloadCurrentStore = () => {
    return setCurrentStore(store.value.id, true);
  };

  const loadStores = async (latitude?, longitude?) => {
    isLoading.value = true;
    return storeService()
      .GetAll({ latitude, longitude })
      .then((s) => {
        if ($availableStoreIds?.length) {
          stores.value = s.filter((x) => $availableStoreIds.includes(x.id));
        } else {
          stores.value = s;
        }
      })
      .finally(() => {
        isLoading.value = false;
      });
  };

  const singleLineStoreAddress = computed(() => {
    let singleLineAddress = store.value?.address?.fullAddress?.toString();
    if (singleLineAddress && store.value?.address?.zipCode) {
      singleLineAddress += ", " + (store.value?.address?.zipCode ?? "") + " " + (store.value?.address?.city ?? "");
    }
    return singleLineAddress;
  });

  const openingHourLabel = computed(() => {
    if (store.value?.openingHours?.length === 0 || !store.value.isOpenNow) return $i("general_closed");
    const day = new Date().getDay();
    const dayOfWeekNow = day === 0 ? 6 : day - 1;
    const todaysOpening = store.value?.openingHours?.find((x) => x.dayOfWeek === dayOfWeekNow);
    if (!todaysOpening || !todaysOpening.open) return $i("general_closed");
    return $i("general_openTo") + " " + todaysOpening.closingTime;
  });

  const openingHoursList = computed(() => {
    if (store.value?.openingHours?.length === 0) return [];
    const days = [$i("general_monday"), $i("general_tuesday"), $i("general_wednesday"), $i("general_thursday"), $i("general_friday"), $i("general_saturday"), $i("general_sunday")];
    const result = [];
    const day = new Date().getDay();
    const dayOfWeekNow = day === 0 ? 6 : day - 1;
    days.forEach((day, index) => {
      const openingHour = store.value?.openingHours?.find((x) => x.dayOfWeek === index);
      if (!openingHour) return;
      result.push({
        day,
        openingHour,
        isToday: dayOfWeekNow === openingHour.dayOfWeek,
      });
    });
    return result;
  });

  type DeliveryAvailability = { canDeliver: boolean; price: { amount: number; currency: string }; error: string };
  type DeliveryAddress = { fullAddress?: string; zipCode?: string; city?: string };
  const availabilityResult = ref<{ key: string; value: DeliveryAvailability | null } | null>(null);
  const pendingAvailabilityKey = ref<string | null>(null);
  let availabilityRequest = 0;

  // Only untouched cart fields inherit the profile, so an explicit clear never falls back to an old address.
  const cartDeliveryAddress = (): DeliveryAddress => {
    const cart = _cart.getCurrentCart();
    return {
      fullAddress: cart?.fullAddress ?? _user.user?.fullAddress,
      zipCode: cart?.zipCode ?? _user.user?.zipCode,
      city: cart?.city ?? _user.user?.city,
    };
  };

  const availabilityKey = (storeId: number, address: DeliveryAddress) => JSON.stringify([storeId, address.fullAddress, address.zipCode, address.city]);

  // A result only describes the store, delivery type and address it was requested for; any change hides it.
  const currentAvailabilityKey = () => {
    if (!store.value?.id || _cart.getCurrentCart()?.deliveryType !== DeliveryType.WoltDelivery) return null;
    const address = cartDeliveryAddress();
    return address.fullAddress ? availabilityKey(store.value.id, address) : null;
  };

  const deliveryAvailability = computed(() => {
    const result = availabilityResult.value;
    return result && result.key === currentAvailabilityKey() ? result.value : null;
  });

  const isLoadingDeliveryAvailability = computed(() => pendingAvailabilityKey.value !== null && pendingAvailabilityKey.value === currentAvailabilityKey());

  const checkDeliveryAvailability = async (address?: DeliveryAddress) => {
    const addressToCheck = address || cartDeliveryAddress();
    // Every call supersedes earlier in-flight requests so a slow old address cannot land after a new one.
    const request = ++availabilityRequest;
    pendingAvailabilityKey.value = null;

    if (!store.value?.id || !addressToCheck.fullAddress || _cart.getCurrentCart()?.deliveryType !== DeliveryType.WoltDelivery) {
      availabilityResult.value = null;
      return;
    }

    const key = availabilityKey(store.value.id, addressToCheck);
    pendingAvailabilityKey.value = key;
    return storeService()
      .CheckDeliveryAvailability(store.value.id, addressToCheck.fullAddress, addressToCheck.zipCode, addressToCheck.city)
      .then((result) => {
        if (request === availabilityRequest) availabilityResult.value = { key, value: result };
      })
      .catch(() => {
        if (request === availabilityRequest) availabilityResult.value = { key, value: null };
      })
      .finally(() => {
        if (request === availabilityRequest) pendingAvailabilityKey.value = null;
      });
  };

  return {
    stores,
    isLoading,
    isLoadingDeliveryAvailability,
    singleLineStoreAddress,
    openingHourLabel,
    currentStore,
    openingHoursList,
    reloadCurrentStore,
    setCurrentStore,
    clearCurrentStore,
    loadStores,
    deliveryAvailability,
    checkDeliveryAvailability,
  };
});
