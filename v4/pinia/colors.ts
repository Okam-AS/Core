import { defineStore } from "pinia";
import { ref, computed } from "vue";
import { useSettings } from "./";
import { jungelPizzaTheme, defaultTheme } from "../themes";
import { light } from "~/src/assets/map_styles";

export const useColors = defineStore("colors", () => {

  const selectedTheme = defaultTheme// jungelPizzaTheme;
  const selectedBorderRadius = 15;

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

  const $primaryColor = computed(() => {
    return $color(selectedTheme.light.primaryColor, selectedTheme.dark.primaryColor)
  })

  const $secondaryColor = computed(() => {
    return $color(selectedTheme.light.secondaryColor, selectedTheme.dark.secondaryColor)
  })

  const $backgroundColor = computed(() => {
    return $color(selectedTheme.light.backgroundColor, selectedTheme.dark.backgroundColor)
  })

  const $textColor = computed(() => {
    return $color(selectedTheme.light.textColor, selectedTheme.dark.textColor)
  })

  const $borderRadius = computed(() => {
    return selectedBorderRadius
  })

  return {
    $color,
    $primaryColor,
    $secondaryColor,
    $backgroundColor,
    $textColor,
    $borderRadius,
  }
});