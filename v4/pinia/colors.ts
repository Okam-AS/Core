import { defineStore } from "pinia";
import { ref } from "vue";
import { useSettings } from "./";

export const useColors = defineStore("colors", () => {
  const colors = ref({
    white: "#FFFFFF",
    lightBlue: '#F2F4FA',
    darkBlue: '#20283B',
  });

  const $color = (key: string, darkmodeKey?: string) => {
    return darkmodeKey && useSettings().$isDarkmode && colors.value.hasOwnProperty(darkmodeKey)? 
      colors.value[darkmodeKey] :
      colors.value[key]
  }

  return {
    $color
  }
});