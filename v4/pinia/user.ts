
import { defineStore } from "pinia";
import { User } from "../models";
import { useServices } from "./services"
import { ref, computed } from "vue";

export const useUser = defineStore("user", () => {

  const { userService } = useServices()

  const user = ref({} as User);

  const isLoggedIn = computed(() => { return !!user?.value?.id });


  const toggleFavoriteProduct = async (productId: string) => {
    if(!isLoggedIn) return Promise.reject();
    if(user.value.favoriteProductIds?.includes(productId))
      await userService.RemoveFavoriteProduct(productId)
    else
      await userService.AddFavoriteProduct(productId)

    return Promise.resolve();
  }

  return {
    user,
    isLoggedIn,
    toggleFavoriteProduct
  }
  
});