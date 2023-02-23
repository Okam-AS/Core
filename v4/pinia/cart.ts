
import { defineStore } from "pinia";
import { Cart, CartLineItem, Product} from "../models";
import { useServices, useStore } from "./"
import { ref, computed } from "vue";

export const useCart = defineStore("cart", () => {
  const { cartService } = useServices()
  const { currentStore } = useStore()

  const carts = ref([] as Cart[]);
  const viewingLineItems = ref([] as CartLineItem[]);

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

  const disabledProperties = ["storeId", "items", "homeDeliveryMethod", "deliveryType", "paymentType", "calculations"]
  const availableProperties = Object.keys(new Cart()).filter(x => !disabledProperties.includes(x))
  const setCartRootProperties = (payload) => {
    if(!currentStore.id) return;
    if(!currentCart.value){
      carts.value.push(createEmptyCart())
    }
    availableProperties.forEach((propertyName) => {
      if (payload[propertyName] != undefined){
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
    let lineItem = new CartLineItem()
    let product = new Product()
    product.id = productId;
    lineItem.product = product;
    lineItem.quantity = 1;
    return cartService.GetCartLineItem(lineItem)
  }

  return {
    currentCart,
    loadCartLineItem,
    loadProductLineItem,
    setCartRootProperties
  }
})
