import en from '../translations/en'
import no from '../translations/no'
import { defineStore } from "pinia";
import { ref, computed } from "vue";

export const useTranslation = defineStore("translation", () => {

  const selectedLanguage = ref('en');
  const translations = ref({ en, no });

  const setLanguage = (lang: string) => {
    selectedLanguage.value = lang
  }

  const updateTranslations = (key: string, value: object) => {
    translations.value[key] = value
  }

  const $i = computed(() => {
    if (selectedLanguage.value === 'no') {
      return translations.value.no
    } else {
      return translations.value.en
    }
  })

  return {
    $i,
    setLanguage,
    updateTranslations,
  }
});