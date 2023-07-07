import { defineStore } from "pinia";
import { ref, computed } from "vue";
import { useSettings } from "./";
import { defaultTheme } from "../themes";

export const useColors = defineStore("colors", () => {
  const colors = ref({
    white: "#FFFFFF",
    lightBlue: '#F2F4FB',
    darkBlue: '#1E283D',
    red: '#CC0000',
    lightOkamGreen: '#D5F6E5',
    lightYellow: '#FFF8E5',
    green: '#1BB776',
    okamGreen: '#1BB776',
    transparent: 'transparent',
  });

  const $color = (key: string, darkmodeKey?: string) => {
    const useDarkModeKey = darkmodeKey && useSettings().$isDarkmode && colors.value.hasOwnProperty(darkmodeKey)
    const keyToUse = useDarkModeKey ? darkmodeKey : key

    if (keyToUse === 'primary') return $primaryColor.value
    if (keyToUse === 'secondary') return $secondaryColor.value
    if (keyToUse === 'background') return $backgroundColor.value
    if (keyToUse === 'text') return $textColor.value

    return colors.value[keyToUse]

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