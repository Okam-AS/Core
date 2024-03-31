import { defineStore } from "pinia";
import { Category, CategorySearchOptions } from "../models";
import { useServices, useStore } from ".";
import { ref, computed } from "vue";

export const useCategory = defineStore("category", () => {
  const { categoryService } = useServices();

  const categories = ref([] as Category[]);
  const isLoadingPrivate = ref(false);
  const isLoading = computed(() => {
    return isLoadingPrivate.value;
  });

  const loadCategories = async (searchOptions: CategorySearchOptions) => {
    const currentStore = useStore().currentStore;
    if (!currentStore.id || !searchOptions) return Promise.reject();
    isLoadingPrivate.value = true;
    return categoryService()
      .GetAllForConsumer(currentStore.id, searchOptions)
      .then((result) => {
        categories.value = result;
      })
      .finally(() => {
        isLoadingPrivate.value = false;
      });
  };

  const loadCategory = async (categoryId: string, searchOptions: CategorySearchOptions) => {
    const currentStore = useStore().currentStore;
    if (!currentStore.id || !searchOptions) return Promise.reject();
    return categoryService()
      .GetForConsumer(categoryId, searchOptions)
      .then((result) => {
        const index = categories.value.findIndex((x) => x.id === categoryId);
        if (index >= 0) {
          result.loaded = true;
          categories.value[index] = result;
        }
      });
  };

  const clearCategories = () => {
    categories.value = [] as Category[];
  };

  return {
    isLoading,
    categories,
    loadCategories,
    loadCategory,
    clearCategories,
  };
});
