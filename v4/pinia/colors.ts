import { defineStore } from "pinia";
import { ref, computed } from "vue";
import { useSettings } from "./";
import getEnv from "../../../env"

export const useColors = defineStore("colors", () => {

  const colors = ref({
    white: "#FFFFFF",
    lightBlue: '#F2F4FB',
    darkBlue: '#003058',
    red: '#CC0000',
    green: '#1BB776',
    lightYellow: '#FFF8E5',
    transparent: 'transparent',
    gray: 'gray',
    black: '#000000',

    //Okam
    okamGreen: '#1BB776',
    lightOkamGreen: '#D5F6E5',

    //Jungel Pizza
    jungelPizzaGreen: '#3FA856',
    lightJungelPizzaGreen: '#AFDBBD',
    lightJungelPizzaBeige: '#E9CEB3',
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

  const selectedTheme = getEnv('SELECTED_THEME')

  const $primaryColor = computed(() => {
    return $color(selectedTheme.primaryColor)
  })

  const $secondaryColor = computed(() => {
    return $color(selectedTheme.secondaryColor)
  })

  const $backgroundColor = computed(() => {
    return $color(selectedTheme.backgroundColor)
  })

  const $textColor = computed(() => {
    return $color(selectedTheme.textColor)
  })

  const $borderRadius = computed(() => {
    return selectedTheme.borderRadius;
  })

  const $svgLogo = computed(() => {
    return selectedTheme.svgLogo;
  })

  return {
    $color,
    $primaryColor,
    $secondaryColor,
    $backgroundColor,
    $textColor,
    $borderRadius,
    $svgLogo
  }
});