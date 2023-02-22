
import { defineStore } from "pinia";
import { Cart, CartLineItem, Product} from "../models";
import { ICartRootProperties } from "../interfaces";
import { useCore, useStore } from "./"
import { ref, computed } from "vue";
import { keys } from 'ts-transformer-keys';

export const useCart = defineStore("cart", () => {
  const { cartService } = useCore()
  const { currentStore } = useStore()

  const carts = ref([] as Cart[]);

  const createEmptyCart = () => {
    const cart = new Cart();
    cart.storeId = currentStore.id;
    cart.ignoreLegecyIsSelfPickupBool = true;
    cart.ignoreLegecyIsWaiterOrderBool = true;
    return cart;
  }

  const currentCart = computed(() => {
    if(!currentStore.id) return {} as Cart
    const cart = carts.value.find(c => c.storeId === currentStore.id)
    return cart ?? createEmptyCart();
  })

  const cartRootProperties = keys<ICartRootProperties>();
  const setCartRootProperties = (payload) => {
    if(!currentStore.id) return;
    if(!currentCart.value){
      carts.value.push(createEmptyCart())
    }
    cartRootProperties.forEach((propertyName) => {
      if (payload[propertyName] != undefined && propertyName != 'storeId'){
        currentCart.value[propertyName.toString()] = payload[propertyName]
      }
    })
  }

  const loadCartLineItem = (lineItem: CartLineItem) => {
    if(lineItem.quantity < 1){
      lineItem.quantity = 1;
    }
    return cartService.GetCartLineItem(lineItem);
  }

  const loadProductLineItem = (productId: string) => {
    let lineItem: CartLineItem;
    let product: Product;
    product.id = productId;
    lineItem.product = product;
    lineItem.quantity = 1;
    return cartService.GetCartLineItem(lineItem);
  }

  return {
    currentCart,
    loadCartLineItem,
    loadProductLineItem,
    setCartRootProperties
  }
})
