
import { defineStore } from "pinia";
import { ICoreInitializer } from "../interfaces";
import { UserService, StoreService, CartService } from "../services";

export const useCore = defineStore({
  id: "useCore",
  state: ():ICoreInitializer =>
    ({
      bearerToken: 'en',
      clientPlatformName: 'web',
    }),
  actions: {
    setBearerToken(bearerToken: string){
      this.bearerToken = bearerToken
    },
    setClientPlatformName(clientPlatformName: string) {
      this.clientPlatformName = clientPlatformName
    },
  },
  getters: {
   coreInitializer(): ICoreInitializer {
      return ({ bearerToken: this.bearerToken, clientPlatformName: this.clientPlatformName})
   },
   userService() { return new UserService(this.coreInitializer) },
   storeService() { return new StoreService(this.coreInitializer) },
   cartService() { return new CartService(this.coreInitializer) }
  }
});