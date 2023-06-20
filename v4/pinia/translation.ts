import en from '../translations/en'
import no from '../translations/no'
import { defineStore } from "pinia";
import { useSettings } from "./settings"

import { ref, computed } from "vue";

export const useTranslation = defineStore("translation", () => {

  const { $cultureCode } = useSettings()
  const translations = ref({ en, no });

  const updateTranslations = (key: string, value: object) => {
    translations.value[key] = value
  }

  const $i = computed(() => {
    if ($cultureCode === 'no') {
      return translations.value.no
    } else {
      return translations.value.en
    }
  })

  return {
    $i,
    updateTranslations,
  }
});