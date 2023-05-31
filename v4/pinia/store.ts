
import { defineStore } from "pinia";
import { Store } from "../models";
import { useServices } from "./services"
import { useCategory } from "./category";
import { ref, computed } from "vue";

export const useStore = defineStore("store", () => {
  const { storeService, persistenceService } = useServices()
  const _category = useCategory()
  const stores = ref([] as Store[]);
  const isLoading = ref(false);

  const store = ref(persistenceService.load<Store>('store') || {} as Store);
  persistenceService.watchAndStore(store, 'store');

  const currentStore = computed(() => { return store.value })

  const setCurrentStore = (id: number) => {
    isLoading.value = true
    _category.clearCategories()
    const cashedStore = stores.value.find(x => x.id === id)
    if(cashedStore){
      store.value = cashedStore
    }
    return storeService().Get(id).then((s) => {
      store.value = s
    }).finally(() => {
      isLoading.value = false
    })
  }

  const loadStores = async () => {
    isLoading.value = true
    return storeService().GetAll().then((s) => {
      stores.value = s
    }).finally(() => {
      isLoading.value = false
    })
  }

  const singleLineStoreAddress = computed(() => {
    let singleLineAddress =   store.value?.address?.fullAddress?.toString()
    if(singleLineAddress && store.value?.address?.zipCode){
      singleLineAddress += ", " + (store.value?.address?.zipCode ?? '') + " " + (store.value?.address?.city?? '');
    }
    return singleLineAddress
  })

  return {
    stores,
    isLoading,
    singleLineStoreAddress,
    currentStore,
    setCurrentStore,
    loadStores
  }

});