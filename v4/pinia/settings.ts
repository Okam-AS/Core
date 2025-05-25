import { defineStore } from "pinia";
import { ref, computed, reactive } from "vue";
import { useServices } from "./services";

export const useSettings = defineStore("settings", () => {
  const { persistenceService } = useServices();

  const fontSizeScale = ref(persistenceService.load<number>("fontSizeScale") || 1);
  persistenceService.watchAndStore(fontSizeScale, "fontSizeScale");

  const introIsSeen = ref(persistenceService.load<boolean>("introIsSeen") || false);
  persistenceService.watchAndStore(introIsSeen, "introIsSeen");

  const currentPage = ref(persistenceService.load<string>("currentPage") || "");
  persistenceService.watchAndStore(currentPage, "currentPage");

  const currentModal = ref(persistenceService.load<string>("currentModal") || "");
  persistenceService.watchAndStore(currentModal, "currentModal");

  const viewedOrderIds = ref(persistenceService.load<string[]>("viewedOrderIds") || []);
  persistenceService.watchAndStore(viewedOrderIds, "viewedOrderIds");

  const hasInternet = ref(true);
  const darkmode = ref(false);
  const launchIdPrivate = ref("");
  const resumeIdPrivate = ref("");
  const disableActionBarToggleAnimation = ref(false);
  const location = reactive({
    lat: 0,
    lng: 0,
    isWatching: false,
  });

  const createId = () => {
    let result = "h";
    const characters = "abcdefghijklmnopqrstuvwxyz0123456789";
    for (let i = 0; i < 10; i++) {
      result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return result;
  };

  const setHasInternet = (value) => {
    hasInternet.value = value;
  };

  const $hasInternet = () => {
    return hasInternet.value;
  };

  const $introIsSeen = () => {
    return introIsSeen.value;
  };

  const $fontSize = (size: number) => {
    return size * fontSizeScale.value;
  };

  const createLaunchId = () => {
    launchIdPrivate.value = createId();
  };

  const createResumeId = () => {
    resumeIdPrivate.value = createId();
  };

  const setFontSizeScale = (scale: number) => {
    fontSizeScale.value = scale;
  };

  const setDisableActionBarToggleAnimation = (value: boolean) => {
    disableActionBarToggleAnimation.value = value;
  };

  const setDarkmode = (value: boolean) => {
    darkmode.value = value;
  };

  const setIntroIsSeen = (value: boolean) => {
    introIsSeen.value = value;
  };

  const setCurrentPage = (value: string) => {
    currentPage.value = value;
  };

  const setCurrentModal = (value: string) => {
    currentModal.value = value;
  };

  const addViewedOrderId = (orderId: string) => {
    if (!viewedOrderIds.value.includes(orderId)) {
      viewedOrderIds.value.push(orderId);
      // Keep only the last 50 viewed order IDs to prevent unlimited growth
      if (viewedOrderIds.value.length > 50) {
        viewedOrderIds.value = viewedOrderIds.value.slice(-50);
      }
    }
  };

  const setLocation = (lat: number, lng: number, isWatching: boolean = true) => {
    location.lat = lat;
    location.lng = lng;
    location.isWatching = isWatching;
  };

  const $fontSizeScale = () => {
    return fontSizeScale.value;
  };

  const $isDarkmode = computed(() => {
    return darkmode.value;
  });

  const $location = computed(() => {
    return location;
  });

  const $disableActionBarToggleAnimation = computed(() => {
    return disableActionBarToggleAnimation;
  });

  const $launchId = computed(() => {
    return launchIdPrivate.value;
  });

  const $resumeId = computed(() => {
    return resumeIdPrivate.value;
  });

  const $currentPage = computed(() => {
    return currentPage.value;
  });

  const $currentModal = computed(() => {
    return currentModal.value;
  });

  const $viewedOrderIds = computed(() => {
    return viewedOrderIds.value;
  });

  return {
    $isDarkmode,
    $location,
    $disableActionBarToggleAnimation,
    $launchId,
    $resumeId,
    $hasInternet,
    setHasInternet,
    $introIsSeen,
    $currentPage,
    $currentModal,
    $viewedOrderIds,
    setIntroIsSeen,
    setDisableActionBarToggleAnimation,
    setLocation,
    setFontSizeScale,
    setDarkmode,
    setCurrentPage,
    setCurrentModal,
    addViewedOrderId,
    $fontSize,
    $fontSizeScale,
    createLaunchId,
    createResumeId,
  };
});
