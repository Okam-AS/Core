import { defineStore } from "pinia";
import { Category, CategorySearchOptions, CategoryProductListItem } from "../models";
import { useServices, useStore } from ".";
import { ref, computed } from "vue";

export const useCategory = defineStore("category", () => {
  const { categoryService } = useServices();

  const categories = ref([] as Category[]);
  const searchResults = ref([] as CategoryProductListItem[]);
  const isLoadingPrivate = ref(false);
  const isSearchingPrivate = ref(false);
  const isLoading = computed(() => {
    return isLoadingPrivate.value;
  });
  const isSearching = computed(() => {
    return isSearchingPrivate.value;
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

  const searchProducts = async (searchTerm: string, searchOptions: CategorySearchOptions) => {
    const currentStore = useStore().currentStore;
    if (!currentStore.id || !searchOptions || !searchTerm?.trim()) {
      searchResults.value = [];
      return Promise.resolve();
    }
    isSearchingPrivate.value = true;
    return categoryService()
      .SearchProducts(currentStore.id, searchTerm.trim(), searchOptions)
      .then((result) => {
        searchResults.value = result;
      })
      .finally(() => {
        isSearchingPrivate.value = false;
      });
  };

  const clearSearch = () => {
    searchResults.value = [] as CategoryProductListItem[];
  };

  const clearCategories = () => {
    categories.value = [] as Category[];
  };

  return {
    isLoading,
    isSearching,
    categories,
    searchResults,
    loadCategories,
    loadCategory,
    searchProducts,
    clearSearch,
    clearCategories,
  };
});
