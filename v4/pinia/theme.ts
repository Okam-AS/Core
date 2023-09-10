import { defineStore } from "pinia";
import { computed, ref } from "vue";
import { useSettings } from "./";
import getEnv from "../../../env";

export const useTheme = defineStore("theme", () => {
  const selectedTheme = getEnv("SELECTED_THEME") || "okam";
  const themes = {
    okam: {
      clientPlatformName: 'Okam Consumer',
      primaryColor: 'darkBlue',
      secondaryColor: 'darkBlue',
      backgroundColor: 'lightBlue',
      textColor: 'darkBlue',
      borderRadius: 15,
    },
    jungelPizza: {
      clientPlatformName: 'Jungel Pizza',
      primaryColor: 'jungelPizzaGreen',
      secondaryColor: 'lightJungelPizzaBeige',
      backgroundColor: 'lightJungelPizzaGreen',
      textColor: 'black',
      borderRadius: 0,
      availableStoreIds: [52, 53, 54],
      svgLogo: 'jungel_pizza',
      removeFromStoreName: 'Jungel Pizza ',
    }
  }

  const colors = ref({
    white: "#FFFFFF",
    lightBlue: "#F2F4FB",
    darkBlue: "#003058",
    red: "#CC0000",
    green: "#1BB776",
    lightYellow: "#FFF8E5",
    transparent: "transparent",
    gray: "gray",
    black: "#000000",

    //Okam
    okamGreen: "#1BB776",
    lightOkamGreen: "#D5F6E5",

    //Jungel Pizza
    jungelPizzaGreen: "#0B8827",
    lightJungelPizzaGreen: "#AFDBBD",
    lightJungelPizzaBeige: "#E9CEB3",
  });

  const $color = (key: string, darkmodeKey?: string) => {
    const useDarkModeKey =
      darkmodeKey &&
      useSettings().$isDarkmode &&
      colors.value.hasOwnProperty(darkmodeKey);
    const keyToUse = useDarkModeKey ? darkmodeKey : key;
    if (keyToUse === "primary") return $color(themes[selectedTheme].primaryColor);
    if (keyToUse === "secondary") return $color(themes[selectedTheme].secondaryColor);
    if (keyToUse === "background") return $color(themes[selectedTheme].backgroundColor);
    if (keyToUse === "text") return $color(themes[selectedTheme].textColor);
    return colors.value[keyToUse];
  };

  const $primaryColor = computed(() => {
    return $color(themes[selectedTheme].primaryColor);
  });

  const $secondaryColor = computed(() => {
    return $color(themes[selectedTheme].secondaryColor);
  });

  const $backgroundColor = computed(() => {
    return $color(themes[selectedTheme].backgroundColor);
  });

  const $textColor = computed(() => {
    return $color(themes[selectedTheme].textColor);
  });

  const $borderRadius = computed(() => {
    return themes[selectedTheme].borderRadius;
  });

  const $availableStoreIds = computed(() => {
    return themes[selectedTheme].availableStoreIds;
  });

  const $svgLogo = computed(() => {
    return themes[selectedTheme].svgLogo;
  });

  const $removeFromStoreName = computed(() => {
    return themes[selectedTheme].removeFromStoreName;
  });

  const $clientPlatformName = computed(() => {
    return themes[selectedTheme].clientPlatformName;
  });

  const $isWhiteLabel = computed(() => {
    return themes[selectedTheme].availableStoreIds && themes[selectedTheme].availableStoreIds.length > 0;
  });

  return {
    $color,
    $primaryColor,
    $secondaryColor,
    $backgroundColor,
    $textColor,
    $borderRadius,
    $availableStoreIds,
    $svgLogo,
    $removeFromStoreName,
    $isWhiteLabel,
    $clientPlatformName
  };
});
