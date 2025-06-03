import { defineStore } from "pinia";
import { computed, ref } from "vue";
import { useSettings } from "./";
import getEnv from "../../../env";

export const useTheme = defineStore("theme", () => {
  const selectedTheme = getEnv("SELECTED_THEME") || "okamDark";

  const themes = {
    okam: {
      clientPlatformName: "Okam",
      primaryColor: "darkBlue",
      secondaryColor: "darkBlue", // Different from primary for contrast
      backgroundColor: "lightBlue", // App background
      secondaryBackgroundColor: "white", // Background on buttons
      shadows: true,
      textColor: "darkBlue",
      borderRadius: 15,
      itunesAppId: "1514296965",
      androidPackageName: "no.okam.consumer",
    },
    okamDark: {
      clientPlatformName: "Okam",
      primaryColor: "almostBlack",
      secondaryColor: "lightGray",
      backgroundColor: "darkGray",
      secondaryBackgroundColor: "mediumGray",
      shadows: false,
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
      availableStoreIds: [52, 53, 54, 57, 140],
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
    const currentTheme = getCurrentTheme();
    if (keyToUse === "primary") return $color(themes[currentTheme].primaryColor);
    if (keyToUse === "secondary") return $color(themes[currentTheme].secondaryColor);
    if (keyToUse === "background") return $color(themes[currentTheme].backgroundColor);
    if (keyToUse === "secondaryBackground") return $color(themes[currentTheme].secondaryBackgroundColor);
    if (keyToUse === "text") return $color(themes[currentTheme].textColor);
    return colors.value[keyToUse];
  };

  const getCurrentTheme = () => {
    const settings = useSettings();
    const isDarkMode = settings.$isDarkmode;

    // If the base theme is okam, switch between okam and okamDark based on dark mode setting
    if (selectedTheme === "okam" || selectedTheme === "okamDark") {
      return isDarkMode ? "okamDark" : "okam";
    }

    // For other themes, return the selected theme as-is
    return selectedTheme;
  };

  const $primaryColor = computed(() => {
    const currentTheme = getCurrentTheme();
    return $color(themes[currentTheme].primaryColor);
  });

  const $secondaryColor = computed(() => {
    const currentTheme = getCurrentTheme();
    return $color(themes[currentTheme].secondaryColor);
  });

  const $backgroundColor = computed(() => {
    const currentTheme = getCurrentTheme();
    return $color(themes[currentTheme].backgroundColor);
  });

  const $secondaryBackgroundColor = computed(() => {
    const currentTheme = getCurrentTheme();
    return $color(themes[currentTheme].secondaryBackgroundColor);
  });

  const $shadows = computed(() => {
    const currentTheme = getCurrentTheme();
    return themes[currentTheme].shadows;
  });

  const $textColor = computed(() => {
    const currentTheme = getCurrentTheme();
    return $color(themes[currentTheme].textColor);
  });

  const $borderRadius = computed(() => {
    const currentTheme = getCurrentTheme();
    return themes[currentTheme].borderRadius;
  });

  const $availableStoreIds = computed(() => {
    const currentTheme = getCurrentTheme();
    return themes[currentTheme].availableStoreIds || [];
  });

  const $svgLogo = computed(() => {
    const currentTheme = getCurrentTheme();
    return themes[currentTheme].svgLogo;
  });

  const $clientPlatformName = computed(() => {
    const currentTheme = getCurrentTheme();
    return themes[currentTheme].clientPlatformName;
  });

  const $isWhiteLabel = computed(() => {
    const currentTheme = getCurrentTheme();
    return themes[currentTheme].availableStoreIds && themes[currentTheme].availableStoreIds.length > 0;
  });

  const $itunesAppId = computed(() => {
    const currentTheme = getCurrentTheme();
    return themes[currentTheme].itunesAppId || themes["okam"].itunesAppId;
  });

  const $androidPackageName = computed(() => {
    const currentTheme = getCurrentTheme();
    return themes[currentTheme].androidPackageName || themes["okam"].androidPackageName;
  });

  const $homePath = computed(() => {
    const currentTheme = getCurrentTheme();
    return themes[currentTheme].homePath || "";
  });

  const $isThemeSwitchingAvailable = computed(() => {
    return selectedTheme === "okam" || selectedTheme === "okamDark";
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
    $isThemeSwitchingAvailable,
  };
});
