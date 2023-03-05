import { defineStore } from "pinia";
import { ref, computed } from "vue";
import { useSettings } from "./";
import { defaultTheme } from "../themes";

export const useColors = defineStore("colors", () => {
  const colors = ref({
    white: "#FFFFFF",
    lightBlue: '#F2F4FA',
    darkBlue: '#20283B',
  });

  const $color = (key: string, darkmodeKey?: string) => {
    return darkmodeKey && useSettings().$isDarkmode && colors.value.hasOwnProperty(darkmodeKey) ?
      colors.value[darkmodeKey] :
      colors.value[key]
  }

  const $primaryColor = computed(() => {
    return $color(defaultTheme.light.primaryColor, defaultTheme.dark.primaryColor)
  })

  const $secondaryColor = computed(() => {
    return $color(defaultTheme.light.secondaryColor, defaultTheme.dark.secondaryColor)
  })

  const $backgroundColor = computed(() => {
    return $color(defaultTheme.light.backgroundColor, defaultTheme.dark.backgroundColor)
  })

  const $textColor = computed(() => {
    return $color(defaultTheme.light.textColor, defaultTheme.dark.textColor)
  })

  return {
    $color,
    $primaryColor,
    $secondaryColor,
    $backgroundColor,
    $textColor
  }
});