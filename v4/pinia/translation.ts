import en from '../translations/en'
import no from '../translations/no'
import { defineStore } from "pinia";
import { useServices } from "./services"

import { ref, computed } from "vue";

export const useTranslation = defineStore("translation", () => {

  const { getCoreInitializer } = useServices()
  const translations = ref({ en, no });

  const updateTranslations = (key: string, value: object) => {
    translations.value[key] = value
  }

  const $i = (key) => {
    const t = getCoreInitializer().cultureCode === 'no' ? translations.value.no : translations.value.en;
    return t[key] || key;
  }

  return {
    $i,
    updateTranslations,
  }
});