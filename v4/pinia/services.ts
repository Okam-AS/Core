
import { defineStore } from "pinia";
import { ICoreInitializer } from "../interfaces";
import { 
  UserService,
  StoreService,
  CartService,
  CategoryService
} from "../services";

export const useServices = defineStore({
  id: "useServices",
  state: (): ICoreInitializer => ({
    bearerToken: 'en',
    clientPlatformName: 'web',
  }),
  actions: {
    setBearerToken(bearerToken: string) {
      this.bearerToken = bearerToken
    },
    setClientPlatformName(clientPlatformName: string) {
      this.clientPlatformName = clientPlatformName
    },
  },
  getters: {
    coreInitializer(): ICoreInitializer {
      return ({ bearerToken: this.bearerToken, clientPlatformName: this.clientPlatformName })
    },
    userService() { return new UserService(this.coreInitializer) },
    storeService() { return new StoreService(this.coreInitializer) },
    cartService() { return new CartService(this.coreInitializer) },
    categoryService() { return new CategoryService(this.coreInitializer) }
  }
});