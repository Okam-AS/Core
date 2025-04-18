import { defineStore } from "pinia";
import { computed, ref } from "vue";
import { useSettings } from "./";
import getEnv from "../../../env";

export const useTheme = defineStore("theme", () => {
  const selectedTheme = getEnv("SELECTED_THEME") || "okam";
  const themes = {
    okam: {
      clientPlatformName: "Okam",
      primaryColor: "darkBlue",
      secondaryColor: "darkBlue",
      backgroundColor: "lightBlue",
      secondaryBackgroundColor: "white",
      shadows: true,
      textColor: "darkBlue",
      borderRadius: 15,
      itunesAppId: "1514296965",
      androidPackageName: "no.okam.consumer",
    },
    okamDark: {
      clientPlatformName: "Okam",
      primaryColor: "almostBlack",
      secondaryColor: "lightGray", // Different from primary for contrast
      backgroundColor: "darkGray", // App background
      secondaryBackgroundColor: "mediumGray", // Background on buttons
      shadows: true,
      textColor: "lightGray",
      borderRadius: 15,
      itunesAppId: "1514296965",
      androidPackageName: "no.okam.consumer",
    },
    jungelPizza: {
      clientPlatformName: "Jungel Pizza",
      primaryColor: "jungelPizzaGreen",
      secondaryColor: "lightJungelPizzaBeige",
      backgroundColor: "lightJungelPizzaGreen",
      secondaryBackgroundColor: "white",
      shadows: true,
      textColor: "black",
      borderRadius: 0,
      availableStoreIds: [52, 53, 54, 57],
      svgLogo: "jungel_pizza",
      itunesAppId: "6465692106",
      androidPackageName: "no.okam.jungelpizza",
    },
    mathavna: {
      clientPlatformName: "Mathavna",
      primaryColor: "mathavnaGreen",
      secondaryColor: "mathavnaGreen",
      backgroundColor: "mathavnaYellow",
      secondaryBackgroundColor: "white",
      shadows: true,
      textColor: "mathavnaGreen",
      borderRadius: 0,
      availableStoreIds: [106],
      svgLogo: "mathavna",
      itunesAppId: "6744123402",
      androidPackageName: "no.okam.mathavna",
      homePath: "/store/mathavna",
    },
  };

  const colors = ref({
    white: "#FFFFFF",
    lightBlue: "#F2F4FB",
    darkBlue: "#003058", // darkBlue: "#1E283D",

    red: "#CC0000",
    green: "#1BB776",
    lightYellow: "#FFF8E5",
    transparent: "transparent",
    gray: "gray",
    black: "#000000",

    //Okam
    okamGreen: "#1BB776",
    lightOkamGreen: "#D5F6E5",

    //Okam Dark Theme
    darkGray: "#252525",
    almostBlack: "#181818",
    mediumGray: "#3A3A3A",
    lightGray: "#E0E0E0",

    //Jungel Pizza
    jungelPizzaGreen: "#000000",
    lightJungelPizzaGreen: "#AFDBBD",
    lightJungelPizzaBeige: "#E9CEB3",

    //Mathavna
    mathavnaGreen: "#19474E", //"#1A464D",
    mathavnaYellow: "#F8F3E0",
  });

  const $color = (key: string, darkmodeKey?: string) => {
    const useDarkModeKey = darkmodeKey && useSettings().$isDarkmode && colors.value.hasOwnProperty(darkmodeKey);
    const keyToUse = useDarkModeKey ? darkmodeKey : key;
    if (keyToUse === "primary") return $color(themes[selectedTheme].primaryColor);
    if (keyToUse === "secondary") return $color(themes[selectedTheme].secondaryColor);
    if (keyToUse === "background") return $color(themes[selectedTheme].backgroundColor);
    if (keyToUse === "secondaryBackground") return $color(themes[selectedTheme].secondaryBackgroundColor);
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

  const $secondaryBackgroundColor = computed(() => {
    return $color(themes[selectedTheme].secondaryBackgroundColor);
  });

  const $shadows = computed(() => {
    return themes[selectedTheme].shadows;
  });

  const $textColor = computed(() => {
    return $color(themes[selectedTheme].textColor);
  });

  const $borderRadius = computed(() => {
    return themes[selectedTheme].borderRadius;
  });

  const $availableStoreIds = computed(() => {
    return themes[selectedTheme].availableStoreIds || [];
  });

  const $svgLogo = computed(() => {
    return themes[selectedTheme].svgLogo;
  });

  const $clientPlatformName = computed(() => {
    return themes[selectedTheme].clientPlatformName;
  });

  const $isWhiteLabel = computed(() => {
    return themes[selectedTheme].availableStoreIds && themes[selectedTheme].availableStoreIds.length > 0;
  });

  const $itunesAppId = computed(() => {
    return themes[selectedTheme].itunesAppId || themes["okam"].itunesAppId;
  });

  const $androidPackageName = computed(() => {
    return themes[selectedTheme].androidPackageName || themes["okam"].androidPackageName;
  });

  const $homePath = computed(() => {
    return themes[selectedTheme].homePath || "";
  });

  return {
    $color,
    $primaryColor,
    $secondaryColor,
    $backgroundColor,
    $secondaryBackgroundColor,
    $shadows,
    $textColor,
    $borderRadius,
    $availableStoreIds,
    $svgLogo,
    $clientPlatformName,
    $isWhiteLabel,
    $itunesAppId,
    $androidPackageName,
    $homePath,
  };
});
