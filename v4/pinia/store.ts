
import { defineStore } from "pinia";
import { Store } from "../models";
import { useServices, useUser, useCategory, useTranslation, useTheme } from "."
import { ref, computed } from "vue";

export const useStore = defineStore("store", () => {
  const { storeService, persistenceService } = useServices()
  const _category = useCategory()
  const _user = useUser()
  const { $i } = useTranslation()
  const { $availableStoreIds } = useTheme()
  const stores = ref([] as Store[]);
  const isLoading = ref(false);

  const store = ref(persistenceService.load<Store>('store') || {} as Store);
  persistenceService.watchAndStore(store, 'store');

  const currentStore = computed(() => { return store.value })

  const clearCurrentStore = () => {
    store.value = {} as Store
  }

  const setCurrentStore = (id: number, reload: boolean = false) => {
    if ($availableStoreIds?.length && !$availableStoreIds.includes(id)) return Promise.resolve()

    if (!reload) {
      isLoading.value = true
      _category.clearCategories()
    }
    const cashedStore = stores.value.find(x => x.id === id)
    if (cashedStore) {
      store.value = cashedStore
    }
    return storeService().GetForConsumer(id, null).then((s) => {
      store.value = s
    }).finally(() => {
      isLoading.value = false
      _user.loadFavoriteProducts()
    })
  }

  const reloadCurrentStore = () => {
    return setCurrentStore(store.value.id, true)
  }

  const loadStores = async (latitude?, longitude?) => {
    isLoading.value = true
    return storeService().GetAll({ latitude, longitude }).then((s) => {
      if ($availableStoreIds?.length) {
        stores.value = s.filter(x => $availableStoreIds.includes(x.id))
      } else {
        stores.value = s
      }
    }).finally(() => {
      isLoading.value = false
    })
  }

  const singleLineStoreAddress = computed(() => {
    let singleLineAddress = store.value?.address?.fullAddress?.toString()
    if (singleLineAddress && store.value?.address?.zipCode) {
      singleLineAddress += ", " + (store.value?.address?.zipCode ?? '') + " " + (store.value?.address?.city ?? '');
    }
    return singleLineAddress
  })

  const openingHourLabel = computed(() => {
    if (store.value?.openingHours?.length === 0 || !store.value.isOpenNow) return $i('general_closed')
    const day = new Date().getDay();
    const dayOfWeekNow = day === 0 ? 6 : day - 1;
    const todaysOpening = store.value?.openingHours?.find(x => x.dayOfWeek === dayOfWeekNow);
    if (!todaysOpening || !todaysOpening.open) return $i('general_closed')
    return $i('general_openTo') + ' ' + todaysOpening.closingTime;
  })

  const openingHoursList = computed(() => {
    if (store.value?.openingHours?.length === 0) return [];
    const days = [$i('general_monday'), $i('general_tuesday'), $i('general_wednesday'), $i('general_thursday'), $i('general_friday'), $i('general_saturday'), $i('general_sunday')];
    const result = [];
    const day = new Date().getDay();
    const dayOfWeekNow = day === 0 ? 6 : day - 1;
    days.forEach((day, index) => {
      const openingHour = store.value?.openingHours?.find(x => x.dayOfWeek === index);
      if (!openingHour) return;
      result.push({
        day,
        openingHour,
        isToday: dayOfWeekNow === openingHour.dayOfWeek
      })
    });
    return result;
  })

  return {
    stores,
    isLoading,
    singleLineStoreAddress,
    openingHourLabel,
    currentStore,
    openingHoursList,
    reloadCurrentStore,
    setCurrentStore,
    clearCurrentStore,
    loadStores
  }

});