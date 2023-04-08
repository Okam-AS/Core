
import { defineStore } from "pinia";
import { useCart, useTranslation } from "."
import { ref, computed, watch } from "vue";
import { debounce} from "../helpers/ts-debounce"

export const useCheckout = defineStore("checkout", () => {

  const { $i } = useTranslation()
  const _cart = useCart()

  const selectedRequestedCompletionDateOptionIndex = ref(0)
  const selectedRequestedCompletionTime = ref(new Date())
  const tempRequestedCompletion = ref('')

  const requestedCompletionDateOptions = computed(() => {
    const getRequestedCompletionDateLabel = (index, date) => {
      if (index === 0) return $i['general_today'] 
      if (index === 1) return $i['general_tomorrow']
      const days =  [$i['general_threeLetterSunday'], 
      $i['general_threeLetterMonday'],
      $i['general_threeLetterTuesday'],
      $i['general_threeLetterWednesday'],
      $i['general_threeLetterThursday'],
      $i['general_threeLetterFriday'],
      $i['general_threeLetterSaturday']];
      return (
        days[date.getDay()] +
        ". " +
        date.getDate() +
        "." +
        (date.getMonth() + 1) +
        "."
      );
    }
    const today = new Date();
    let options = [];
    for (let index = 0; index < 7; index++) {
      const tempDate = new Date(today);
      tempDate.setDate(tempDate.getDate() + index);
      options.push({
        label: getRequestedCompletionDateLabel(index, tempDate),
        value: tempDate,
      });
    }
    return options;
  })

  const selectedRequestedCompletionDate = computed(() => {
    return requestedCompletionDateOptions.value[
      selectedRequestedCompletionDateOptionIndex.value
    ].value;
  })

  const dateOptionIndexChange = (event) => {
    selectedRequestedCompletionDateOptionIndex.value = event.value
    requestedCompletionChange()
  }

  const timeChange = (event) => {
    selectedRequestedCompletionTime.value = new Date(event.value)
    requestedCompletionChange()
  }

  const requestedCompletionChange = () => {
    const selectedDateTime = new Date(
      selectedRequestedCompletionDate.value.getFullYear(),
      selectedRequestedCompletionDate.value.getMonth(),
      selectedRequestedCompletionDate.value.getDate(),
      selectedRequestedCompletionTime.value.getHours(),
      selectedRequestedCompletionTime.value.getMinutes()
    );
  
    const tzoffset = selectedDateTime.getTimezoneOffset() * 60000;
    const localDateTime = new Date(selectedDateTime.getTime() - tzoffset);
    const localDateTimeISOString = localDateTime.toISOString().slice(0, -1);
    tempRequestedCompletion.value = localDateTimeISOString;
  };

  watch(tempRequestedCompletion, debounce(function () {
    _cart.setCartRootProperties({ requestedCompletion: tempRequestedCompletion.value })
  }, 400))


  return {
    selectedRequestedCompletionDate,
    selectedRequestedCompletionTime,
    selectedRequestedCompletionDateOptionIndex,
    requestedCompletionDateOptions,
    dateOptionIndexChange,
    timeChange,
  }
})
