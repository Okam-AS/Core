
import { defineStore } from "pinia";
import { Store } from "../models";
import { useServices } from "./services"
import { ref } from "vue";

export const useStore = defineStore("store", () => {
  const { storeService } = useServices()

  const stores = ref([] as Store[]);
  const currentStore = ref({} as Store);

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