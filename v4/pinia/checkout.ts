
import { defineStore } from "pinia";
import { useCart, useTranslation, useServices } from "."
import { ref, computed, watch } from "vue";
import { debounce } from "../helpers/ts-debounce"
import { priceLabel } from "../helpers/tools";
import { PaymentMethod } from "../models";
import { PaymentType } from "../enums";


export const useCheckout = defineStore("checkout", () => {

  const { $i } = useTranslation()
  const _cart = useCart()
  const { paymentService, persistenceService, discountService } = useServices()

  const submitButtonLabel = computed(() => { 
    const currentCart = _cart.getCurrentCart()
    const priceAmount = currentCart?.calculations?.finalAmount ?? 0
    return $i['checkoutPage_submit'] + (priceAmount > 0 ? ' ' + priceLabel(priceAmount, true) : '')
  })

  const paymentLabel = (card: PaymentMethod) => {
    if (card.paymentType === PaymentType.Stripe)
      return 'xxxx xxxx xxxx ' + card.last4 + '   ' + card.expMonth + '/' + card.expYear
    if (card.paymentType === PaymentType.Vipps)
      return 'Vipps'
    if (card.paymentType === PaymentType.PayInStore)
      return $i['checkoutPage_payInStore']
    return ''
  }

  // Discount code
  const addDiscountCode = async (code) => {
    const currentCart = _cart.getCurrentCart()
    if (code === currentCart.discountCode) return true;
    return discountService()
        .Exists(currentCart.storeId, code)
        .then((exists) => {
          if (exists || code === "") {
            _cart.setCartRootProperties({ discountCode: code })
            return true;
          } else {
            return false;
          }
        }).catch(() => {
          return false;
        })
  }
  

  // Requested Completion Date
  const selectedRequestedCompletionDateOptionIndex = ref(persistenceService.load<number>('selectedRequestedCompletionDateOptionIndex') || 0);
  persistenceService.watchAndStore(selectedRequestedCompletionDateOptionIndex, 'selectedRequestedCompletionDateOptionIndex');

  const selectedRequestedCompletionTime = ref(persistenceService.load<Date>('selectedRequestedCompletionTime') || (new Date()));
  persistenceService.watchAndStore(selectedRequestedCompletionTime, 'selectedRequestedCompletionTime');


  const tempRequestedCompletion = ref('')
  const requestedCompletionDateOptions = computed(() => {
    const getRequestedCompletionDateLabel = (index, date) => {
      if (index === 0) return $i['general_asap'] 
      if (index === 1) return $i['general_today'] 
      if (index === 2) return $i['general_tomorrow']
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
      if(index > 1)
        tempDate.setDate(tempDate.getDate() + index - 1);
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

  const selectedDateTime = (removeTimezoneOffset = false) => {
    const selected = new Date(
      selectedRequestedCompletionDate.value.getFullYear(),
      selectedRequestedCompletionDate.value.getMonth(),
      selectedRequestedCompletionDate.value.getDate(),
      selectedRequestedCompletionTimeHours(),
      selectedRequestedCompletionTimeMinutes(),
    );
    if(!removeTimezoneOffset) return selected
    const tzoffset = selected.getTimezoneOffset() * 60000;
    const localDateTime = new Date(selected.getTime() - tzoffset);
    return localDateTime
  }

  const dateTimeIsUnderTenMinutesFromNow = () => {
    const diff = selectedDateTime().getTime() - new Date().getTime();
    const minutesDiff = Math.floor(diff / 1000 / 60);
    return minutesDiff < 10
  }

  const singleLineSelectedDateTime = computed(() => {
    if(selectedRequestedCompletionDateOptionIndex.value === 0 || 
      !selectedRequestedCompletionDate.value || 
      !selectedRequestedCompletionTime.value ||
      requestedCompletionDateOptions.value.length <= selectedRequestedCompletionDateOptionIndex.value || dateTimeIsUnderTenMinutesFromNow())
    return $i['general_asap']?.toLowerCase()

    return (requestedCompletionDateOptions.value[selectedRequestedCompletionDateOptionIndex.value]?.label?.toLowerCase()) + ', ' + (('0'+selectedRequestedCompletionTimeHours()).slice(-2)) + ':' + (('0'+selectedRequestedCompletionTimeMinutes()).slice(-2))
  })




  const selectedRequestedCompletionTimeHours = () => {
    return new Date(selectedRequestedCompletionTime.value).getHours()
  }

  const selectedRequestedCompletionTimeMinutes = () => {
    return new Date(selectedRequestedCompletionTime.value).getMinutes()
  }

  const requestedCompletionChange = () => {
    tempRequestedCompletion.value = (selectedRequestedCompletionDateOptionIndex.value === 0 || 
      !selectedRequestedCompletionDate.value || 
      !selectedRequestedCompletionTime.value) ? '' : selectedDateTime(true).toISOString().slice(0, -1);
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
    return paymentService()
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
    submitButtonLabel,

    paymentLabel,
    addDiscountCode,

    // Requested Completion Date
    selectedRequestedCompletionDate,
    selectedRequestedCompletionTime,
    selectedRequestedCompletionDateOptionIndex,
    requestedCompletionDateOptions,
    singleLineSelectedDateTime,
    selectedRequestedCompletionTimeHours,
    selectedRequestedCompletionTimeMinutes,
    dateOptionIndexChange,
    timeChange,

    // Payment
    cards,
    setPaymentMethod,
    getAvailablePaymentMethods,
    getCardInfo
  }
})
