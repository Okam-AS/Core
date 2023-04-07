
import { defineStore } from "pinia";
import { Store } from "../models";
import { useServices } from "./services"
import { ref } from "vue";

export const useStore = defineStore("store", () => {
  const { storeService, persistenceService } = useServices()

  const stores = ref([] as Store[]);

  const currentStore = ref(persistenceService.load<Store>('currentStore') || {} as Store);
  persistenceService.watchAndStore(currentStore, 'currentStore');

  const setCurrentStore = (store: Store) => {
    currentStore.value = store
  }

  const loadStores = async () => {
    return storeService.GetAll().then((s) => {
      stores.value = s
    })
  }

  return {
    stores,
    currentStore,
    setCurrentStore,
    loadStores
  }

});