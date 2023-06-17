import { defineStore } from "pinia";
import { useServices } from "./services"
import { ref, computed, reactive } from "vue";

export const useSettings = defineStore("settings", () => {

  const { setCultureCode, coreInitializer } = useServices()


  const fontSizeScale = ref(1);
  const darkmode = ref(false);
  const disableActionBarToggleAnimation = ref(false);
  const location = reactive({
    lat: 0,
    lng: 0,
    isWatching: false,
  });

  const $cultureCode = computed(() => {
    return coreInitializer.cultureCode
  })

  const $fontSize = (size: number) => {
    return size * fontSizeScale.value
  }

  const setFontSizeScale = (scale: number) => {
    fontSizeScale.value = scale
  }

  const setDisableActionBarToggleAnimation = (value: boolean) => {
    disableActionBarToggleAnimation.value = value
  }

  const setDarkmode = (value: boolean) => {
    darkmode.value = value
  }

  const setLocation = (lat: number, lng: number, isWatching: boolean = true) => {
    location.lat = lat;
    location.lng = lng;
    location.isWatching = isWatching;
  }

  const setCulture = (cultureCode: string) => {
    setCultureCode(cultureCode)
  }

  const $fontSizeScale = computed(() => {
    return fontSizeScale.value
  })

  const $isDarkmode = computed(() => {
    return darkmode.value
  })

  const $location = computed(() => { 
    return location
  })

  const $disableActionBarToggleAnimation = computed(() => { 
    return disableActionBarToggleAnimation
  })

  return {
    $cultureCode,
    $fontSizeScale,
    $isDarkmode,
    $location,
    $disableActionBarToggleAnimation,
    setDisableActionBarToggleAnimation,
    setLocation,
    setFontSizeScale,
    setDarkmode,
    setCulture,
    $fontSize,
  }
});