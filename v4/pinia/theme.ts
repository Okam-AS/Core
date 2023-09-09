import { defineStore } from "pinia";
import { computed, ref } from "vue";
import { useSettings } from "./";
import getEnv from "../../../env";

export const useTheme = defineStore("theme", () => {
  const selectedTheme = getEnv("SELECTED_THEME");

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
    jungelPizzaGreen: "#3FA856",
    lightJungelPizzaGreen: "#AFDBBD",
    lightJungelPizzaBeige: "#E9CEB3",
  });

  const $color = (key: string, darkmodeKey?: string) => {
    const useDarkModeKey =
      darkmodeKey &&
      useSettings().$isDarkmode &&
      colors.value.hasOwnProperty(darkmodeKey);
    const keyToUse = useDarkModeKey ? darkmodeKey : key;
    if (keyToUse === "primary") return $color(selectedTheme.primaryColor);
    if (keyToUse === "secondary") return $color(selectedTheme.secondaryColor);
    if (keyToUse === "background") return $color(selectedTheme.backgroundColor);
    if (keyToUse === "text") return $color(selectedTheme.textColor);
    return colors.value[keyToUse];
  };

  const $primaryColor = computed(() => {
    return $color(selectedTheme.primaryColor);
  });

  const $secondaryColor = computed(() => {
    return $color(selectedTheme.secondaryColor);
  });

  const $backgroundColor = computed(() => {
    return $color(selectedTheme.backgroundColor);
  });

  const $textColor = computed(() => {
    return $color(selectedTheme.textColor);
  });

  const $borderRadius = computed(() => {
    return selectedTheme.borderRadius;
  });

  const $availableStoreIds = computed(() => {
    return selectedTheme.availableStoreIds;
  });

  const $svgLogo = computed(() => {
    return selectedTheme.svgLogo;
  });

  const $removeFromStoreName = computed(() => {
    return selectedTheme.removeFromStoreName;
  });


  const $isWhiteLabel = computed(() => {
    return selectedTheme.availableStoreIds && selectedTheme.availableStoreIds.length > 0;
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
  };
});
