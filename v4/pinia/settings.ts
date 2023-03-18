import { defineStore } from "pinia";
import { ref, computed, reactive } from "vue";

export const useSettings = defineStore("settings", () => {

  const fontSizeScale = ref(1);
  const darkmode = ref(false);
  const location = reactive({
    lat: 0,
    lng: 0,
    isWatching: false,
  });

  const $fontSize = (size: number) => {
    return size * fontSizeScale.value
  }

  const setFontSizeScale = (scale: number) => {
    fontSizeScale.value = scale
  }

  const setDarkmode = (value: boolean) => {
    darkmode.value = value
  }

  const setLocation = (lat: number, lng: number, isWatching: boolean = true) => {
    location.lat = lat;
    location.lng = lng;
    location.isWatching = isWatching;
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

  return {
    $fontSizeScale,
    $isDarkmode,
    $location,
    setLocation,
    setFontSizeScale,
    setDarkmode,
    $fontSize,
  }
});