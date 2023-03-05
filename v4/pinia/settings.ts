import { defineStore } from "pinia";
import { ref, computed } from "vue";

export const useSettings = defineStore("settings", () => {

  const fontSizeScale = ref(1);
  const darkmode = ref(false);

  const $fontSize = (size: number) => {
    return size * fontSizeScale.value
  }

  const setFontSizeScale = (scale: number) => {
    fontSizeScale.value = scale
  }

  const setDarkmode = (value: boolean) => {
    darkmode.value = value
  }

  const $fontSizeScale = computed(() => {
    return fontSizeScale.value
  })


  const $isDarkmode = computed(() => {
    return darkmode.value
  })

  return {
    $fontSizeScale,
    $isDarkmode,
    setFontSizeScale,
    setDarkmode,
    $fontSize,
  }
});