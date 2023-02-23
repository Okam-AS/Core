
import { defineStore } from "pinia";
import { Category, CategorySearchOptions } from "../models";
import { useServices, useStore } from "."
import { ref } from "vue";

export const useCategory = defineStore("category", () => {
  const { categoryService } = useServices()

  const categories = ref([] as Category[]);

  const loadCategories = async (searchOptions: CategorySearchOptions) => {
   const currentStore = useStore().currentStore
    if(!currentStore.id || !searchOptions) return Promise.reject();
    return categoryService.GetAllForConsumer(currentStore.id, searchOptions).then((result) => {
      categories.value = result
    })
  }

  const loadCategory = async (categoryId: string, searchOptions: CategorySearchOptions) => {
    const currentStore = useStore().currentStore
    if(!currentStore.id || !searchOptions) return Promise.reject();
    return categoryService.GetForConsumer(categoryId, searchOptions).then((result) => {
      const index = categories.value.findIndex(x => x.id === categoryId);
      if(index >= 0){
        categories.value[index] = result
      }
    })
  }

  return {
    categories,
    loadCategories,
    loadCategory
  }

})
