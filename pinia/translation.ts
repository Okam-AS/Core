import en from '../translations/en'
import no from '../translations/no'
import de from '../translations/de'
import { defineStore } from "pinia";
import { useServices } from "./services"
import { setTranslationProvider } from "../helpers/tools"

import { ref, computed } from "vue";

export const useTranslation = defineStore("translation", () => {

  const { getCoreInitializer } = useServices()
  const translations = ref({ en, no, de });

  const updateTranslations = (key: string, value: object) => {
    translations.value[key] = value
  }

  const $i = (key) => {
    const t = translations.value[getCoreInitializer().cultureCode] || translations.value.en;
    return t[key] || key;
  }

  // Wire up translation provider for helpers/tools.ts
  setTranslationProvider(() => ({ $i }));

  return {
    $i,
    updateTranslations,
  }
});