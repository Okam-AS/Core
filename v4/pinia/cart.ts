
import { defineStore } from "pinia";
import { Cart, CartLineItem, Product } from "../models";
import { useServices, useStore } from "./"
import { ref, computed } from "vue";

export const useCart = defineStore("cart", () => {
  const { cartService } = useServices()
  const { currentStore } = useStore()

  const carts = ref([] as Cart[]);
  const unsavedLineItem = ref({} as CartLineItem);

  const createEmptyCart = () => {
    const cart = new Cart();
    cart.storeId = currentStore.id;
    cart.ignoreLegecyIsSelfPickupBool = true;
    cart.ignoreLegecyIsWaiterOrderBool = true;
    return cart;
  }

  const currentCart = computed(() => {
    if (!currentStore.id) return createEmptyCart()
    const cart = carts.value.find(c => c.storeId === currentStore.id)
    return cart ?? createEmptyCart();
  })

  const disabledProperties = ["storeId", "items", "homeDeliveryMethod", "deliveryType", "paymentType", "calculations"]
  const availableProperties = Object.keys(new Cart()).filter(x => !disabledProperties.includes(x))
  const setCartRootProperties = (payload) => {
    if (!currentStore.id) return;
    if (!currentCart.value) {
      carts.value.push(createEmptyCart())
    }
    availableProperties.forEach((propertyName) => {
      if (payload[propertyName] != undefined) {
        currentCart.value[propertyName.toString()] = payload[propertyName]
      }
    })
  }

  const loadUnsavedLineItem = async (lineItem: CartLineItem) => {
    if (lineItem.quantity < 1) {
      lineItem.quantity = 1;
    }
    return cartService.GetCartLineItem(lineItem).then(() => {
      unsavedLineItem.value = lineItem;
    })
  }

  const loadNewUnsavedLineItem = async (productId: string) => {
    let lineItem = new CartLineItem()
    let product = new Product()
    product.id = productId;
    lineItem.product = product;
    lineItem.quantity = 1;
    return cartService.GetCartLineItem(lineItem).then(() => {
      unsavedLineItem.value = lineItem;
    })
  }

  const unsavedLineItemSave = async () => {
    if (unsavedLineItemInvalidFields()) return;

    if (!unsavedLineItem.value.id && unsavedLineItem.value.quantity === 0) return;

    if (!unsavedLineItem.value.id) {
      const createGuid = () => {
        return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
          const r = Math.random() * 16 | 0;
          const v = c === "x" ? r : (r & 0x3 | 0x8);
          return v.toString(16);
        });
      };
      unsavedLineItem.value.id = createGuid();
    }
    unsavedLineItem.value.product.amount = unsavedLineItem.value.product.baseAmount + unsavedLineItem.value.product.selectedOptionsAmount;

    if (unsavedLineItem.value.product.soldOut) unsavedLineItem.value.quantity = 0;

    const itemIndex = currentCart.value.items.findIndex(item => item.id === unsavedLineItem.value.id)
    const copyUnsavedLineItem = JSON.parse(JSON.stringify(unsavedLineItem.value));
    if (itemIndex >= 0) {
      currentCart.value.items[itemIndex] = copyUnsavedLineItem
    } else {
      currentCart.value.items.unshift(copyUnsavedLineItem);
    }
  }

  const setCart = (cart: Cart) => {
    const cartIndex = carts.value.findIndex(c => c.storeId === currentStore.id)
    if (cartIndex >= 0) {
      carts.value[cartIndex] = cart;
    }
  }

  const clearCart = () => {
    setCart(createEmptyCart());
  }

  const clearLineItems = () => {
    currentCart.value.items = [];
  }

  const removeLineItem = (lineItemId: string) => {
    const index = currentCart.value.items.findIndex(item => item.id === lineItemId)
    delete currentCart.value.items[index];
  }

  const unsavedLineItemAddQuantity = (addQuantity: number) => {
    if (!unsavedLineItem.value) return;
    const newQuantity = unsavedLineItem.value.quantity + addQuantity;
    if (newQuantity < 0 || (unsavedLineItem.value.product.soldOut && addQuantity > 0))
      return;
    unsavedLineItem.value.quantity = newQuantity;
  }

  const unsavedLineItemInvalidFields = () => {
    if (unsavedLineItem.value.quantity === 0 || unsavedLineItem.value.product.soldOut)
      return ""

    // TODO: 
    // Hvis unsavedLineItem.value.product.productVariants[x].required er true 
    // og det ikke finnes noen unsavedLineItem.value.product.productVariants[x].options[y].selected
    // så må bruker få feilmelding: 
    // 'Velg ' + unsavedLineItem.value.product.productVariants[x].name + ' for å legge vare i handlevogn'

  }

  const unsavedLineItemToggleProductVariantOption = (productVariantOptionId: string) => {
    const productVariants = unsavedLineItem.value.product.productVariants || [];
    if (!productVariants.length) return;

    productVariants.forEach((variant) => {
      var optionIsInThisVariant = variant.options.find(
        (x) => x.id === productVariantOptionId
      );
      if (optionIsInThisVariant) {
        variant.options.forEach((option) => {
          if (!variant.multiselect && option.id !== productVariantOptionId)
            option.selected = false;
          if (option.id === productVariantOptionId) option.selected = !option.selected;
        });
      }
    });

    const selectedOptions = productVariants.flatMap(v => v.options.filter(option => option.selected));
    unsavedLineItem.value.product.selectedOptionNames = selectedOptions.map((x) => x.name).join(", ");

    let optionsAmount = 0;
    selectedOptions.forEach((option) => {
      optionsAmount += option.amount * (option.negativeAmount ? -1 : 1);
    });
    unsavedLineItem.value.product.selectedOptionsAmount = optionsAmount;
  }

  return {
    currentCart,
    unsavedLineItem,
    setCart,
    setCartRootProperties,
    clearCart,
    clearLineItems,
    removeLineItem,
    unsavedLineItemAddQuantity,
    unsavedLineItemSave,
    unsavedLineItemToggleProductVariantOption,
    loadUnsavedLineItem,
    loadNewUnsavedLineItem,
  }
})
