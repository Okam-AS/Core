
import { defineStore } from "pinia";
import { ICoreInitializer } from "../interfaces";
import {
  UserService,
  StoreService,
  CartService,
  CategoryService,
  PersistenceService,
  PaymentService,
  DiscountService,
  OrderService,
  StripeService,
  VippsService,
  NotificationService
} from "../services";
import { ref, computed } from "vue";

export const useServices = defineStore("services", () => {

  const persistenceService = computed(() => new PersistenceService())

  const bearerToken = ref(persistenceService.value.load<string>('bearerToken') || '');
  persistenceService.value.watchAndStore(bearerToken, 'bearerToken');

  const clientPlatformName = ref(persistenceService.value.load<string>('clientPlatformName') || '');
  persistenceService.value.watchAndStore(clientPlatformName, 'clientPlatformName');

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
  

  const userService =  () => new UserService(coreInitializer.value) 
  const storeService = () => new StoreService(coreInitializer.value)
  const cartService = () => new CartService(coreInitializer.value) 
  const categoryService = () => new CategoryService(coreInitializer.value) 
  const paymentService = () => new PaymentService(coreInitializer.value) 
  const discountService = () => new DiscountService(coreInitializer.value) 
  const orderService = () => new OrderService(coreInitializer.value) 
  const stripeService = () => new StripeService(coreInitializer.value) 
  const vippsService = () => new VippsService(coreInitializer.value) 
  const notificationService = () => new NotificationService(coreInitializer.value) 
  
  return {
    setBearerToken,
    setClientPlatformName,
    userService,
    storeService,
    cartService,
    categoryService,
    paymentService,
    discountService,
    orderService,
    stripeService,
    vippsService,
    notificationService,
    persistenceService
  }
});