
import { defineStore } from "pinia";
import { useCart, useTranslation, useServices } from "."
import { ref, computed, watch } from "vue";
import { debounce } from "../helpers/ts-debounce"

export const useCheckout = defineStore("checkout", () => {

  const { $i } = useTranslation()
  const _cart = useCart()
  const { paymentService } = useServices()

  // Requested Completion Date
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


  // Payment
  const selectedPaymentType = ref('NotSet')
  const cards = ref([])
  const selectedPaymentMethodId = ref("")
  const rememberCard = ref(true)
  const isLoadingCards = ref(true)
  const creditCardError = ref(false)
  
  const cardNumber = ref('')
  const expMonth = ref('')
  const expYear = ref('')
  const cvc = ref('')

  const getCardInfo = () => {
    return {
      number: (cardNumber.value || "").replace(/\s+/g, ""),
      expMonth: parseInt(expMonth.value),
      expYear: parseInt(expYear.value),
      cvc: cvc.value,
      isValid:
        (cardNumber.value || "").replace(/\s+/g, "").length === 16 &&
        !isNaN(parseInt(expMonth.value)) &&
        !isNaN(parseInt(expYear.value)) &&
        (cvc.value || "").toString().length === 3,
    };
  }

  const setPaymentMethod = (item) => {
    selectedPaymentMethodId.value = item === undefined ? "" : item.id;
    selectedPaymentType.value = item === undefined ? "NotSet" : item.paymentType;

    _cart.setCartRootProperties({ paymentType: selectedPaymentType.value })
  }

  const getAvailablePaymentMethods = () => {
    const currentCart = _cart.getCurrentCart()
    isLoadingCards.value = true;
    return paymentService
      .GetPaymentMethods(currentCart.id)
      .then((result) => {
       
        cards.value = Array.isArray(result) ? result : [];

        if (selectedPaymentMethodId.value) {
          setPaymentMethod(
            cards.value.find((x) => x.id === selectedPaymentMethodId.value)
          );
        } else if (cards.value.length >= 1) {
          setPaymentMethod(cards.value[0]);
        }
        isLoadingCards.value = false;
      })
      .catch(() => {
        isLoadingCards.value = false;
      });
  }


  return {
    // Requested Completion Date
    selectedRequestedCompletionDate,
    selectedRequestedCompletionTime,
    selectedRequestedCompletionDateOptionIndex,
    requestedCompletionDateOptions,
    dateOptionIndexChange,
    timeChange,

    // Payment
    cards,
    setPaymentMethod,
    getAvailablePaymentMethods,
    getCardInfo
  }
})
