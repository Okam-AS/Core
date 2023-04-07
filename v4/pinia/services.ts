
import { defineStore } from "pinia";
import { ICoreInitializer } from "../interfaces";
import {
  UserService,
  StoreService,
  CartService,
  CategoryService,
  PersistenceService
} from "../services";
import { ref, computed } from "vue";

export const useServices = defineStore("services", () => {

  const bearerToken = ref('');
  const clientPlatformName = ref('');


  const setBearerToken = (token: string) => {
    bearerToken.value = token
  }

  const setClientPlatformName = (name: string) => {
    clientPlatformName.value = name
  }
  
  const coreInitializer = computed(() => ({
    bearerToken: bearerToken.value,
    clientPlatformName: clientPlatformName.value
  } as ICoreInitializer))
  

  const userService = computed(() => new UserService(coreInitializer.value))
  const storeService = computed(() => new StoreService(coreInitializer.value))
  const cartService = computed(() => new CartService(coreInitializer.value))
  const categoryService = computed(() => new CategoryService(coreInitializer.value))
  const persistenceService = computed(() => new PersistenceService())
  

  return {
    setBearerToken,
    setClientPlatformName,
    userService,
    storeService,
    cartService,
    categoryService,
    persistenceService
  }
});