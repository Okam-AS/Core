
import { defineStore } from "pinia";
import { Store } from "../models";
import { useServices } from "./services"
import { useCategory } from "./category";
import { ref } from "vue";

export const useStore = defineStore("store", () => {
  const { storeService, persistenceService } = useServices()
  const _category = useCategory()
  const stores = ref([] as Store[]);
  const isLoading = ref(false);

  const currentStore = ref(persistenceService.load<Store>('currentStore') || {} as Store);
  persistenceService.watchAndStore(currentStore, 'currentStore');

  const setCurrentStore = (store: Store) => {
    _category.clearCategories()
    currentStore.value = store
  }

  const loadStores = async () => {
    isLoading.value = true
    return storeService().GetAll().then((s) => {
      stores.value = s
    }).finally(() => {
      isLoading.value = false
    })
  }

  return {
    stores,
    isLoading,
    currentStore,
    setCurrentStore,
    loadStores
  }

});