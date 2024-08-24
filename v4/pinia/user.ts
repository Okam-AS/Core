import { defineStore } from "pinia";
import { User, Product, PaymentMethod } from "../models";
import { useServices } from "./services";
import { useStore, useCart, useCheckout } from ".";
import { ref, computed } from "vue";
import { debounce } from "../helpers/ts-debounce";

export const useUser = defineStore("user", () => {
  const { userService, persistenceService, productService, setBearerToken, paymentService, stripeService } = useServices();
  const _cart = useCart();
  const _checkout = useCheckout();
  const userRef = ref(persistenceService.load<User>("userRef") || ({} as User));
  persistenceService.watchAndStore(userRef, "userRef");

  const favoriteProductsPrivate = ref([] as Product[]);
  const registeredCardsPrivate = ref([] as PaymentMethod[]);
  const isLoadingCardsPrivate = ref(false);

  const user = computed(() => {
    return userRef.value;
  });
  const isLoggedIn = () => {
    return !!userRef?.value?.id;
  };
  const favoriteProducts = computed(() => {
    return favoriteProductsPrivate.value;
  });
  const registeredCards = computed(() => {
    return registeredCardsPrivate.value;
  });
  const isLoadingCards = computed(() => {
    return isLoadingCardsPrivate.value;
  });

  const deleteRegisteredCard = (cardId: string) => {
    if (!isLoggedIn()) return Promise.reject();
    isLoadingCardsPrivate.value = true;

    return stripeService()
      .DeletePaymentMethod(cardId)
      .then((success) => {
        if (!success) return;
        registeredCardsPrivate.value = registeredCardsPrivate.value.filter((card) => card.id !== cardId);
      })
      .finally(() => {
        isLoadingCardsPrivate.value = false;
      });
  };

  const loadRegisteredCards = () => {
    if (!isLoggedIn()) return;
    isLoadingCardsPrivate.value = true;
    paymentService()
      .GetPaymentMethods()
      .then((result) => {
        if (Array.isArray(result)) {
          registeredCardsPrivate.value = result;
        }
      })
      .finally(() => {
        isLoadingCardsPrivate.value = false;
      });
  };

  const toggleFavoriteProduct = async (productId: string) => {
    if (!isLoggedIn()) return Promise.reject();
    const previouslyFavorite = userRef.value.favoriteProductIds?.includes(productId);
    const serverFunction = previouslyFavorite ? userService().RemoveFavoriteProduct(productId) : userService().AddFavoriteProduct(productId);

    serverFunction
      .then((success) => {
        if (!success) return;

        if (previouslyFavorite) {
          userRef.value.favoriteProductIds = userRef.value.favoriteProductIds.filter((id) => id !== productId);
        } else {
          userRef.value.favoriteProductIds = [...userRef.value.favoriteProductIds, productId];
        }

        return Promise.resolve();
      })
      .catch(Promise.reject);
  };

  const updateAddress = debounce((address) => {
    if (!isLoggedIn() || !address) return;
    const fullAddress = address.fullAddress || userRef.value.fullAddress;
    const zipCode = address.zipCode || userRef.value.zipCode;
    const city = address.city || userRef.value.city;

    // No need to update if nothing has changed
    if (fullAddress === userRef.value.fullAddress && zipCode === userRef.value.zipCode && city === userRef.value.city) return;

    userService()
      .UpdateAddress(fullAddress, zipCode, city)
      .then((success) => {
        if (success) {
          userRef.value.fullAddress = fullAddress;
          userRef.value.zipCode = zipCode;
          userRef.value.city = city;
        }
      });
  }, 800);

  const loadFavoriteProducts = () => {
    if (!isLoggedIn() || !useStore().currentStore) {
      favoriteProductsPrivate.value = [];
    } else {
      productService()
        .GetFavorites(useStore().currentStore.id)
        .then((products) => {
          favoriteProductsPrivate.value = products;
          userRef.value.favoriteProductIds = products.map((p) => p.id);
        });
    }
  };

  const secondsToWaitForVerificationTokenPrivate = ref(0);
  const secondsToWaitForVerificationToken = computed(() => {
    return secondsToWaitForVerificationTokenPrivate.value;
  });
  const waitingOnVerificationTokenCountdownIntervalId = ref();
  const startWaitingOnVerificationTokenCountdown = () => {
    if (waitingOnVerificationTokenCountdownIntervalId.value) clearInterval(waitingOnVerificationTokenCountdownIntervalId.value);

    secondsToWaitForVerificationTokenPrivate.value = 30;
    waitingOnVerificationTokenCountdownIntervalId.value = setInterval(() => {
      secondsToWaitForVerificationTokenPrivate.value = secondsToWaitForVerificationTokenPrivate.value - 1;
      if (secondsToWaitForVerificationTokenPrivate.value < 1) {
        secondsToWaitForVerificationTokenPrivate.value = 0;
        clearInterval(waitingOnVerificationTokenCountdownIntervalId.value);
        waitingOnVerificationTokenCountdownIntervalId.value = undefined;
      }
    }, 1000);
  };

  const phoneNumberIsValid = (landcode, phoneNumber) => {
    const phoneNumberTrimmed = phoneNumber?.replace(/\s+/g, "") || "";
    return landcode === "+47" && phoneNumberTrimmed?.length === 8 && parseInt(phoneNumberTrimmed) >= 40000000;
  };

  const sendVerificationToken = async (landcode, phoneNumber) => {
    if (!phoneNumberIsValid(landcode, phoneNumber)) return Promise.reject();
    const success = await userService().SendVerificationToken(landcode + phoneNumber);
    if (!success) return Promise.reject();
    startWaitingOnVerificationTokenCountdown();
    return Promise.resolve();
  };

  const verifyToken = async (landcode, phoneNumber, token) => {
    if (!token || !phoneNumberIsValid(landcode, phoneNumber)) return Promise.reject();
    return userService()
      .Login(landcode + phoneNumber, token)
      .then((response) => {
        userRef.value = response;
        setBearerToken(userRef.value.token);
      });
  };

  const logout = (notificationId, clearNotificationIdFunction?) => {
    userService().Logout(notificationId, () => {
      userRef.value = {} as User;
      favoriteProductsPrivate.value = [];
      registeredCardsPrivate.value = [];
      _cart.clearCart();
      _checkout.resetTimeAndDatePickers();
      useStore().clearCurrentStore();
      setBearerToken("");
      if (clearNotificationIdFunction) clearNotificationIdFunction();
    });
  };

  const deleteAccount = () => {
    if (!isLoggedIn()) return;
    userService().Delete(logout);
  };

  const logoutIfTokenExpired = (notificationId, clearNotificationIdFunction?) => {
    if (!isLoggedIn()) return;
    userService()
      .TokenIsValid()
      .then((isValid) => {
        if (!isValid) logout(notificationId, clearNotificationIdFunction);
      });
  };

  const reloadUser = () => {
    if (!isLoggedIn()) return;
    userService()
      .Get()
      .then((response) => {
        if (!response?.id) return;
        userRef.value.email = response.email;
        userRef.value.emailConfirmed = response.emailConfirmed;
        userRef.value.fullAddress = response.fullAddress;
        userRef.value.zipCode = response.zipCode;
        userRef.value.city = response.city;
      });
  };

  return {
    user,
    secondsToWaitForVerificationToken,
    isLoggedIn,
    favoriteProducts,
    updateAddress,
    registeredCards,
    isLoadingCards,
    deleteRegisteredCard,
    loadRegisteredCards,
    phoneNumberIsValid,
    logout,
    sendVerificationToken,
    verifyToken,
    toggleFavoriteProduct,
    loadFavoriteProducts,
    deleteAccount,
    logoutIfTokenExpired,
    reloadUser,
  };
});
