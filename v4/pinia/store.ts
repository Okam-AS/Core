
import { defineStore } from "pinia";
import { Store } from "../models";
import { useCore } from "./core"
import { ref } from "vue";

export const useStore = defineStore("store", () => {
  const { storeService } = useCore()

  const stores = ref([] as Store[]);
  const currentStore = ref({} as Store);

  const setCurrentStore = (store: Store) => {
    currentStore.value = store
  }

  const loadStores = () => {
    storeService.GetAll().then((s) => {
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