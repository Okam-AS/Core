import { defineStore } from "pinia";
import { Cart, CartLineItem, Product, RecommendProductsRequest, UpdateCompanyInfoModel } from "../models";
import { DeliveryType } from "../enums";
import { useServices, useStore, useUser, useTranslation, useCheckout } from "./";
import { ref, computed, toRaw } from "vue";
import { priceLabel } from "../helpers/tools";
import { debounce } from "../helpers/ts-debounce";

export const useCart = defineStore("cart", () => {
  const { cartService, persistenceService } = useServices();
  const _store = useStore();
  const _user = useUser();
  const _checkout = useCheckout();
  const { $i } = useTranslation();

  const isLoading = ref(false);
  const isLoadingRecommendations = ref(false);

  const cartsRef = ref(persistenceService.load<Cart[]>("cartsRef") || ([] as Cart[]));
  persistenceService.watchAndStore(cartsRef, "cartsRef");

  const unsavedLineItem = ref({} as CartLineItem);

  const createEmptyCart = () => {
    const cart = new Cart();
    cart.storeId = _store.currentStore.id;
    cart.ignoreLegecyIsSelfPickupBool = true;
    cart.ignoreLegecyIsWaiterOrderBool = true;
    return cart;
  };

  const getCurrentCart = () => {
    if (!_store.currentStore.id) return new Cart();
    const cart = cartsRef.value.find((x) => x.storeId === _store.currentStore.id);
    if (cart) return cart;
    const newCart = createEmptyCart();
    cartsRef.value.push(newCart);
    return newCart;
  };

  const totalItemCount = computed(() => {
    return (
      getCurrentCart()
        ?.items?.map((item) => item.quantity)
        ?.reduce((total, q) => {
          return total + q;
        }, 0) ?? 0
    );
  });

  const displayFirstProductVariantAsDropdown = computed(() => {
    if (!unsavedLineItem?.value?.product?.productVariants?.length) return false;

    const firstProductVariant = unsavedLineItem.value.product.productVariants[0];
    return firstProductVariant.required && !firstProductVariant.multiselect;
  });

  const firstProductVariantDropdownLabel = computed(() => {
    if (!displayFirstProductVariantAsDropdown.value) return "";

    const firstProductVariant = unsavedLineItem.value.product.productVariants[0];
    const selectedOption = firstProductVariant.options.find((x) => x.selected);
    if (!selectedOption) return firstProductVariant.name;

    return selectedOption.name + (selectedOption.amount ? " " + priceLabel(selectedOption.amount, true) : "");
  });

  const firstProductVariantIsSelected = computed(() => {
    if (!unsavedLineItem?.value?.product?.productVariants?.length) return false;
    const firstProductVariant = unsavedLineItem.value.product.productVariants[0];
    const selectedOption = firstProductVariant.options.find((x) => x.selected);
    return !!selectedOption;
  });

  const disabledProperties = ["storeId", "items", "homeDeliveryMethod", "calculations"];
  const availableProperties = Object.keys(new Cart()).filter((x) => !disabledProperties.includes(x));
  const setCartRootProperties = (payload: Partial<Cart>) => {
    const currentCart = getCurrentCart();
    if (!currentCart) return;

    availableProperties.forEach((propertyName) => {
      if (propertyName in payload) {
        currentCart[propertyName.toString()] = payload[propertyName];
      }
    });

    syncWithDb();
  };

  const loadRecommendations = async (): Promise<Product[]> => {
    const currentCart = getCurrentCart();
    if (!currentCart || !currentCart.storeId) return Promise.resolve([]);
    isLoadingRecommendations.value = true;
    var requestModel = new RecommendProductsRequest();

    requestModel.items = currentCart.items;
    requestModel.storeId = currentCart.storeId;
    requestModel.userId = _user.isLoggedIn() ? _user.user.id : "";
    requestModel.cartDiscountCode = currentCart.discountCode;
    requestModel.searchOptions = { deliveryType: currentCart.deliveryType };

    return cartService()
      .GetRecommendations(requestModel)
      .finally(() => {
        isLoadingRecommendations.value = false;
      });
  };

  const loadUnsavedLineItem = async (lineItem: CartLineItem) => {
    if (lineItem.quantity < 1) {
      lineItem.quantity = 1;
    }
    return cartService()
      .GetCartLineItem(lineItem)
      .then((response) => {
        unsavedLineItem.value = response;
      })
      .catch((e) => {
        unsavedLineItem.value = lineItem;
      });
  };

  const loadNewUnsavedLineItem = async (productId: string) => {
    let lineItem = new CartLineItem();
    lineItem.product = new Product();
    lineItem.product.id = productId;
    lineItem.quantity = 1;
    return cartService()
      .GetCartLineItem(lineItem)
      .then((response) => {
        unsavedLineItem.value = response;
      });
  };

  let cartSyncVersion = 0;
  let isCartSyncing = false;
  let lastGoodCartState = null;
  let pendingCartSync = false;

  const syncWithDb = async () => {
    if (!_user.isLoggedIn()) return Promise.reject();
    const currentCart = getCurrentCart();
    if (!currentCart || !currentCart.storeId) return Promise.reject();

    if (isCartSyncing) {
      pendingCartSync = true;
      return Promise.resolve();
    }
    isCartSyncing = true;
    const syncVersion = ++cartSyncVersion;
    const cartToSync = JSON.parse(JSON.stringify(getCurrentCart()));

    // Save last good cart state for rollback
    lastGoodCartState = JSON.parse(JSON.stringify(getCurrentCart()));

    try {
      // Filter out any products that don't belong to the current store
      cartToSync.items = cartToSync.items?.filter((item: any) => {
        if (item.product?.storeId && item.product.storeId !== cartToSync.storeId) {
          console.warn(`Cross-store item filtered out during sync: Product ${item.product.id} from store ${item.product.storeId} removed from cart for store ${cartToSync.storeId}`);
          return false;
        }
        return true;
      }) || [];

      // Set default delivery address
      cartToSync.fullAddress = cartToSync.fullAddress || _user.user.fullAddress;
      cartToSync.city = cartToSync.city || _user.user.city;
      cartToSync.zipCode = cartToSync.zipCode || _user.user.zipCode;
      cartToSync.deliveryInstructions = cartToSync.deliveryInstructions || _user.user.deliveryInstructions;
      const backendCart = await cartService().Update(cartToSync);
      if (syncVersion === cartSyncVersion) {
        setCart(backendCart); // safe to update
        lastGoodCartState = JSON.parse(JSON.stringify(backendCart));
      }
    } catch (e) {
      // Rollback to last good state
      if (lastGoodCartState) {
        setCart(lastGoodCartState);
      }
    } finally {
      isCartSyncing = false;
      if (pendingCartSync) {
        pendingCartSync = false;
        syncWithDb();
      }
    }
  };

  const syncWithDbDebounced = debounce(syncWithDb, 300);

  const loadCartFromServer = async (storeId?: number) => {
    if (!_user.isLoggedIn()) return Promise.reject();
    const targetStoreId = storeId || _store.currentStore.id;
    if (!targetStoreId) return Promise.reject();

    try {
      const serverCart = await cartService().GetByStoreId(targetStoreId);
      console.log("Cart received from server:", JSON.stringify(serverCart, null, 2));
      if (serverCart && serverCart.storeId === targetStoreId) {
        setCart(serverCart);
        return serverCart;
      }
    } catch (e) {
      // If cart doesn't exist on server, keep local cart
      console.log("No cart found on server, using local cart");
    }
    return getCurrentCart();
  };

  const unsavedLineItemSave = async () => {
    const currentCart = getCurrentCart();
    if (!currentCart || unsavedLineItemHasErrors() || unsavedLineItemHasCrossStoreError()) return false;

    if (!unsavedLineItem.value.id && unsavedLineItem.value.quantity === 0) return false;

    if (!unsavedLineItem.value.id) {
      const createGuid = () => {
        return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
          const r = (Math.random() * 16) | 0;
          const v = c === "x" ? r : (r & 0x3) | 0x8;
          return v.toString(16);
        });
      };
      unsavedLineItem.value.id = createGuid();
    }
    unsavedLineItem.value.product.amount = unsavedLineItem.value.product.baseAmount + unsavedLineItem.value.product.selectedOptionsAmount;

    if (unsavedLineItem.value.product.soldOut) unsavedLineItem.value.quantity = 0;

    const itemIndex = currentCart.items.findIndex((item) => item.id === unsavedLineItem.value.id);
    if (itemIndex >= 0) {
      if (unsavedLineItem.value.quantity === 0) {
        currentCart.items.splice(itemIndex, 1);
      } else {
        currentCart.items[itemIndex] = toRaw(unsavedLineItem.value);
      }
    } else if (unsavedLineItem.value.quantity > 0) {
      currentCart.items.unshift(toRaw(unsavedLineItem.value));
    }

    syncWithDbDebounced();
    return true;
  };

  const setCart = (cart: Cart) => {
    const cartIndex = cartsRef.value.findIndex((c) => c.storeId === _store.currentStore.id);
    if (cartIndex >= 0) {
      cartsRef.value[cartIndex] = cart;
    }
  };

  const clearCart = () => {
    setCart(createEmptyCart());
  };

  const clearLineItems = () => {
    const currentCart = getCurrentCart();
    if (!currentCart) return;
    currentCart.items = [];
    syncWithDbDebounced();
  };

  const cleanupCrossStoreItems = () => {
    const currentCart = getCurrentCart();
    if (!currentCart || !currentCart.items) return;

    const initialCount = currentCart.items.length;
    currentCart.items = currentCart.items.filter((item: any) => {
      if (item.product?.storeId && item.product.storeId !== _store.currentStore.id) {
        console.warn(`Cross-store item removed: Product ${item.product.id} from store ${item.product.storeId} removed from cart for store ${_store.currentStore.id}`);
        return false;
      }
      return true;
    });

    if (currentCart.items.length !== initialCount) {
      syncWithDbDebounced();
    }
  };

  const removeLineItem = (lineItemId: string) => {
    const currentCart = getCurrentCart();
    if (!currentCart) return;
    const index = currentCart.items.findIndex((item) => item.id === lineItemId);
    if (index !== -1) {
      currentCart.items.splice(index, 1);
    }
    syncWithDbDebounced();
  };

  const cartLineItemAddQuantity = (lineItemId: string, addQuantity: number) => {
    if (!addQuantity) return;
    const currentCart = getCurrentCart();
    if (!currentCart) return;
    const index = currentCart.items.findIndex((item) => item.id === lineItemId);
    if (index < 0) return;
    const newQuantity = currentCart.items[index].quantity + addQuantity;
    if (newQuantity < 1) return;
    currentCart.items[index].quantity = newQuantity;
    syncWithDbDebounced();
  };

  const unsavedLineItemAddQuantity = (addQuantity: number) => {
    if (!unsavedLineItem.value) return;
    const newQuantity = unsavedLineItem.value.quantity + addQuantity;
    if (newQuantity < 0 || (unsavedLineItem.value.product.soldOut && addQuantity > 0)) return;
    unsavedLineItem.value.quantity = newQuantity;
  };

  const unsavedLineItemSetNotes = (notes: string) => {
    unsavedLineItem.value.notes = notes;
  };

  const unsavedLineItemHasErrors = () => {
    if (unsavedLineItem.value.quantity === 0 || unsavedLineItem.value.product.soldOut) return false;

    let hasErrors = false;
    for (let variant of unsavedLineItem.value.product.productVariants) {
      if (variant.required) {
        let optionSelected = variant.options.some((option) => option.selected);
        if (!optionSelected) {
          variant.hasError = true;
          unsavedLineItem.value.product.errorMessage = $i("general_selectVariation").replace("{name}", variant.name);
          hasErrors = true;
        }
      }
    }
    return hasErrors;
  };

  const unsavedLineItemHasCrossStoreError = () => {
    if (unsavedLineItem.value.quantity === 0 || unsavedLineItem.value.product.soldOut) return false;

    // Check if the product belongs to a different store than the current cart
    if (unsavedLineItem.value.product?.storeId &&
        unsavedLineItem.value.product.storeId !== _store.currentStore.id) {
      unsavedLineItem.value.product.errorMessage = $i("general_itemNoLongerAvailable");
      return true;
    }
    return false;
  };

  const unsavedLineItemToggleProductVariantOption = (productVariantOptionId: string) => {
    const productVariants = unsavedLineItem.value.product.productVariants || [];
    if (!productVariants.length) return;

    productVariants.forEach((variant) => {
      variant.hasError = false;
      var optionIsInThisVariant = variant.options.find((x) => x.id === productVariantOptionId);
      if (optionIsInThisVariant) {
        variant.options.forEach((option) => {
          if (!variant.multiselect && option.id !== productVariantOptionId) option.selected = false;
          if (option.id === productVariantOptionId) option.selected = !option.selected;
        });
      }
    });

    const selectedOptions = productVariants.flatMap((v) => v.options.filter((option) => option.selected));
    unsavedLineItem.value.product.selectedOptionNames = selectedOptions.map((x) => x.name).join(", ");

    let optionsAmount = 0;
    selectedOptions.forEach((option) => {
      optionsAmount += option.amount * (option.negativeAmount ? -1 : 1);
    });
    unsavedLineItem.value.product.selectedOptionsAmount = optionsAmount;
    unsavedLineItem.value.product.errorMessage = "";
  };

  const getQuanityOfProductInCart = (productId) => {
    if (!productId) return 0;
    const currentCart = getCurrentCart();
    let lineItems = (currentCart?.items || []).filter((x) => x.product && x.product.id === productId);
    if (lineItems.length === 0) return 0;
    let q = 0;
    lineItems.forEach((item) => {
      q += item.quantity;
    });
    return q;
  };

  const singleLineDeliveryAddressInCart = computed(() => {
    const currentCart = getCurrentCart();
    let singleLineAddress = currentCart?.fullAddress?.toString();
    if (singleLineAddress && currentCart?.zipCode) {
      singleLineAddress += ", " + (currentCart.zipCode ?? "") + " " + (currentCart.city ?? "");
    }
    return singleLineAddress;
  });

  const deliveryAddressInCartIsValid = () => {
    const currentCart = getCurrentCart();
    if (!currentCart?.fullAddress?.toString()?.trim()?.length) return false;
    if (!currentCart?.zipCode || currentCart?.zipCode.trim().length !== 4) return false;
    if (!currentCart?.city || currentCart?.city.trim().length < 3) return false;
    return true;
  };

  const updateCompanyInfo = async (organizationNumber: string): Promise<UpdateCompanyInfoModel> => {
    const currentCart = getCurrentCart();
    if (!currentCart || !currentCart.storeId) return Promise.reject("No current cart or store ID");
    console.log(organizationNumber);
    const model = new UpdateCompanyInfoModel();
    model.companyVat = organizationNumber;

    return cartService()
      .UpdateCompanyInfo(currentCart.storeId, model)
      .then((result) => {
        console.log(result);
        if (result.success) {
          _checkout.getAvailablePaymentMethods();
        }
        return result;
      })
      .catch((error) => {
        console.error(error);
        return Promise.reject(error);
      });
  };

  const isHomeDelivery = computed(() => {
    const currentCart = getCurrentCart();
    if (!currentCart) return false;
    if (_user.isLoggedIn()) {
      return currentCart.isHomeDelivery;
    }
    return currentCart.deliveryType === DeliveryType.InstantHomeDelivery || currentCart.deliveryType === DeliveryType.WoltDelivery || currentCart.deliveryType === DeliveryType.DineHomeDelivery;
  });

  return {
    totalItemCount,
    unsavedLineItem,
    displayFirstProductVariantAsDropdown,
    firstProductVariantDropdownLabel,
    firstProductVariantIsSelected,
    singleLineDeliveryAddressInCart,
    isLoading,
    isLoadingRecommendations,
    isHomeDelivery,
    deliveryAddressInCartIsValid,
    syncWithDb,
    loadCartFromServer,
    getCurrentCart,
    getQuanityOfProductInCart,
    setCart,
    setCartRootProperties,
    clearCart,
    clearLineItems,
    cleanupCrossStoreItems,
    removeLineItem,
    cartLineItemAddQuantity,
    unsavedLineItemAddQuantity,
    unsavedLineItemSave,
    unsavedLineItemToggleProductVariantOption,
    unsavedLineItemSetNotes,
    loadUnsavedLineItem,
    loadNewUnsavedLineItem,
    loadRecommendations,
    updateCompanyInfo,
  };
});
