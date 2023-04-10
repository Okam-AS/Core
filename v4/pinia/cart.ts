
import { defineStore } from "pinia";
import { Cart, CartLineItem, Product } from "../models";
import { useServices, useStore } from "./"
import { ref, computed } from "vue";
import { priceLabel } from "../helpers/tools"

export const useCart = defineStore("cart", () => {

  const { cartService, persistenceService } = useServices()
  const _store = useStore()

  const carts = ref(persistenceService.load<Cart[]>('carts') || [] as Cart[]);
  persistenceService.watchAndStore(carts, 'carts');

  const unsavedLineItem = ref({} as CartLineItem);

  const createEmptyCart = () => {
    const cart = new Cart();
    cart.storeId = _store.currentStore.id;
    cart.ignoreLegecyIsSelfPickupBool = true;
    cart.ignoreLegecyIsWaiterOrderBool = true;
    return cart;
  }

  const getCurrentCart = () => {
    if(!_store.currentStore.id) return new Cart();
    const cart = carts.value.find(x => x.storeId === _store.currentStore.id);
    if(cart) return cart
    carts.value.push(createEmptyCart())
    return carts.value.find(x => x.storeId === _store.currentStore.id);
  }

  const totalItemCount = computed(() => {
    return getCurrentCart()?.items?.map(item => item.quantity)?.reduce((total, q) => {
      return total + q;
    }, 0) ?? 0;
  })

  const displayFirstProductVariantAsDropdown = computed(() => {
   if(!unsavedLineItem?.value?.product?.productVariants?.length) return false;

   const firstProductVariant = unsavedLineItem.value.product.productVariants[0];
   return firstProductVariant.required && !firstProductVariant.multiselect
  })

  const firstProductVariantDropdownLabel = computed(() => {
   if(!displayFirstProductVariantAsDropdown.value) return '';

   const firstProductVariant = unsavedLineItem.value.product.productVariants[0];
   const selectedOption = firstProductVariant.options.find(x => x.selected);
   if(!selectedOption) return firstProductVariant.name

   return selectedOption.name + (selectedOption.amount ? (' ' + priceLabel(selectedOption.amount, true)) : '')
   
  })

  const firstProductVariantIsSelected = computed(() => {
    if(!unsavedLineItem?.value?.product?.productVariants?.length) return false;
    const firstProductVariant = unsavedLineItem.value.product.productVariants[0];
    const selectedOption = firstProductVariant.options.find(x => x.selected);
    return selectedOption
   })


  const disabledProperties = ["storeId", "items", "homeDeliveryMethod", "deliveryType", "paymentType", "calculations"]
  const availableProperties = Object.keys(new Cart()).filter(x => !disabledProperties.includes(x))
  const setCartRootProperties = (payload) => {
    const currentCart = getCurrentCart();
    if (!currentCart) return;
  
    availableProperties.forEach((propertyName) => {
      if (payload[propertyName] != undefined) {
        currentCart[propertyName.toString()] = payload[propertyName]
      }
    })
    // TODO: lagre til db med userService.Update(cart)
  }

  const loadUnsavedLineItem = async (lineItem: CartLineItem) => {
    if (lineItem.quantity < 1) {
      lineItem.quantity = 1;
    }
    return cartService.GetCartLineItem(lineItem).then((response) => {
      unsavedLineItem.value = response;
    }).catch((e) => {
      unsavedLineItem.value = lineItem;
    })
  }

  const loadNewUnsavedLineItem = async (product: Product) => {
    let lineItem = new CartLineItem()
    lineItem.product = product;
    lineItem.quantity = 1;
    return cartService.GetCartLineItem(lineItem).then((response) => {
      unsavedLineItem.value = response;
    })
  }

  const unsavedLineItemSave = async () => {
    const currentCart = getCurrentCart();
    if (!currentCart || unsavedLineItemInvalidFields()) return;

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

    const itemIndex = currentCart.items.findIndex(item => item.id === unsavedLineItem.value.id)
    const copyUnsavedLineItem = JSON.parse(JSON.stringify(unsavedLineItem.value));
    if (itemIndex >= 0) {
      currentCart.items[itemIndex] = copyUnsavedLineItem
    } else {
      currentCart.items.unshift(copyUnsavedLineItem);
    }
    // TODO: lagre til db med userService.Update(cart)
  }

  const setCart = (cart: Cart) => {
    const cartIndex = carts.value.findIndex(c => c.storeId === _store.currentStore.id)
    if (cartIndex >= 0) {
      carts.value[cartIndex] = cart;
    }
  }

  const clearCart = () => {
    setCart(createEmptyCart());
  }

  const clearLineItems = () => {
    const currentCart = getCurrentCart();
    if(!currentCart) return;
    currentCart.items = [];
  }

  const removeLineItem = (lineItemId: string) => {
    const currentCart = getCurrentCart();
    if(!currentCart) return;
    const index = currentCart.items.findIndex(item => item.id === lineItemId)
    delete currentCart.items[index];
  }

  const unsavedLineItemAddQuantity = (addQuantity: number) => {
    if (!unsavedLineItem.value) return;
    const newQuantity = unsavedLineItem.value.quantity + addQuantity;
    if (newQuantity < 0 || (unsavedLineItem.value.product.soldOut && addQuantity > 0))
      return;
    unsavedLineItem.value.quantity = newQuantity;
  }

  const unsavedLineItemSetNotes = (notes: string) => {
    unsavedLineItem.value.notes = notes;
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
    totalItemCount,
    unsavedLineItem,
    displayFirstProductVariantAsDropdown,
    firstProductVariantDropdownLabel,
    firstProductVariantIsSelected,
    getCurrentCart,
    setCart,
    setCartRootProperties,
    clearCart,
    clearLineItems,
    removeLineItem,
    unsavedLineItemAddQuantity,
    unsavedLineItemSave,
    unsavedLineItemToggleProductVariantOption,
    unsavedLineItemSetNotes,
    loadUnsavedLineItem,
    loadNewUnsavedLineItem,
  }
})
