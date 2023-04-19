
import { defineStore } from "pinia";
import { User } from "../models";
import { useServices } from "./services"
import { ref, computed } from "vue";

export const useUser = defineStore("user", () => {

  const { userService, persistenceService, setBearerToken } = useServices()

  const user = ref(persistenceService.load<User>('user') || {} as User);
  persistenceService.watchAndStore(user, 'user');

  const isLoggedIn = computed(() => { return !!user?.value?.id });


  const toggleFavoriteProduct = async (productId: string) => {
    if (!isLoggedIn) return Promise.reject();
    if (user.value.favoriteProductIds?.includes(productId))
      await userService().RemoveFavoriteProduct(productId)
    else
      await userService().AddFavoriteProduct(productId)

    return Promise.resolve();
  }

  const secondsToWaitForVerificationToken = ref(0);
  const waitingOnVerificationTokenCountdownIntervalId = ref(null);
  const startWaitingOnVerificationTokenCountdown = () => {
    if (waitingOnVerificationTokenCountdownIntervalId.value)
      clearInterval(waitingOnVerificationTokenCountdownIntervalId.value);

    secondsToWaitForVerificationToken.value = 30;
    waitingOnVerificationTokenCountdownIntervalId.value = setInterval(() => {
      secondsToWaitForVerificationToken.value = secondsToWaitForVerificationToken.value - 1;
      if (secondsToWaitForVerificationToken.value < 1) {
        secondsToWaitForVerificationToken.value = 0
        clearInterval(waitingOnVerificationTokenCountdownIntervalId.value);
        waitingOnVerificationTokenCountdownIntervalId.value = null;
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
      user.value = response
      setBearerToken(user.value.token)
    });
  }

  const logout = () => {
    userService().Logout('notificationId', () => {
      user.value = {} as User;
      setBearerToken('')
    })
  }

  return {
    user,
    secondsToWaitForVerificationToken,
    isLoggedIn,
    phoneNumberIsValid,
    logout,
    sendVerificationToken,
    verifyToken,
    toggleFavoriteProduct
  }

});