
import { defineStore } from "pinia";
import { User, Product } from "../models";
import { useServices } from "./services"
import { useStore } from "./store";
import { ref, computed } from "vue";

export const useUser = defineStore("user", () => {

  const { userService, persistenceService, productService, setBearerToken } = useServices()

  const userRef = ref(persistenceService.load<User>('userRef') || {} as User);
  persistenceService.watchAndStore(userRef, 'userRef');

  const favoriteProducts = ref([] as Product[])

  const user = computed(() => { return userRef.value })

  const isLoggedIn = computed(() => { return !!userRef?.value?.id });

  const toggleFavoriteProduct = async (productId: string) => {
    if (!isLoggedIn) return Promise.reject();
    const previouslyFavorite = userRef.value.favoriteProductIds?.includes(productId);
    const serverFunction = previouslyFavorite ? userService().RemoveFavoriteProduct(productId) : userService().AddFavoriteProduct(productId);

    serverFunction.then((success) => {
      if (!success) return;

      if (previouslyFavorite) {
        userRef.value.favoriteProductIds = userRef.value.favoriteProductIds.filter(id => id !== productId);
      } else {
        userRef.value.favoriteProductIds = [...userRef.value.favoriteProductIds, productId];
      }

      return Promise.resolve();
    }).catch(Promise.reject);

  }

  const loadFavoriteProducts = () => {
    if (!isLoggedIn || !useStore().currentStore) {
      favoriteProducts.value = [];
    } else {
      productService().GetFavorites(useStore().currentStore.id).then((products) => {
        favoriteProducts.value = products;
      })
    }
  }

  const secondsToWaitForVerificationToken = ref(0);
  const waitingOnVerificationTokenCountdownIntervalId = ref();
  const startWaitingOnVerificationTokenCountdown = () => {
    if (waitingOnVerificationTokenCountdownIntervalId.value)
      clearInterval(waitingOnVerificationTokenCountdownIntervalId.value);

    secondsToWaitForVerificationToken.value = 30;
    waitingOnVerificationTokenCountdownIntervalId.value = setInterval(() => {
      secondsToWaitForVerificationToken.value = secondsToWaitForVerificationToken.value - 1;
      if (secondsToWaitForVerificationToken.value < 1) {
        secondsToWaitForVerificationToken.value = 0
        clearInterval(waitingOnVerificationTokenCountdownIntervalId.value);
        waitingOnVerificationTokenCountdownIntervalId.value = undefined;
      }
    }, 1000);
  }

  const phoneNumberIsValid = (landcode, phoneNumber) => {
    const phoneNumberTrimmed = phoneNumber?.replace(/\s+/g, '') || '';
    return landcode === '+47' && phoneNumberTrimmed?.length === 8 && parseInt(phoneNumberTrimmed) >= 40000000;
  }

  const sendVerificationToken = async (landcode, phoneNumber) => {
    if (!phoneNumberIsValid(landcode, phoneNumber)) return Promise.reject();
    const success = await userService().SendVerificationToken(landcode + phoneNumber);
    if (!success) return Promise.reject()
    startWaitingOnVerificationTokenCountdown();
    return Promise.resolve();
  }

  const verifyToken = async (landcode, phoneNumber, token) => {
    if (!token || !phoneNumberIsValid(landcode, phoneNumber)) return Promise.reject();
    return userService().Login(landcode + phoneNumber, token).then((response) => {
      userRef.value = response
      setBearerToken(userRef.value.token)
    });
  }

  const logout = () => {
    userService().Logout('notificationId', () => {
      userRef.value = {} as User;
      favoriteProducts.value = [];
      setBearerToken('')
    })
  }

  return {
    user,
    secondsToWaitForVerificationToken,
    isLoggedIn,
    favoriteProducts,
    phoneNumberIsValid,
    logout,
    sendVerificationToken,
    verifyToken,
    toggleFavoriteProduct,
    loadFavoriteProducts
  }

});