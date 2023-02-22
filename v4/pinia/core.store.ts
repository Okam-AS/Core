
import { defineStore } from "pinia";
import { ICoreInitializer } from "../interfaces";
import { UserService, StoreService } from "../services";

export const useCoreStore = defineStore({
  id: "coreStore",
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
   userService() {
    return new UserService(this.coreInitializer)
   },
   storeService() {
    return new StoreService(this.coreInitializer)
   }
  }
});