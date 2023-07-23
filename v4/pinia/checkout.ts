
import { defineStore } from "pinia";
import { useCart, useTranslation, useServices, useStore } from "."
import { ref, computed, watch } from "vue";
import { debounce } from "../helpers/ts-debounce"
import { priceLabel } from "../helpers/tools";
import { PaymentMethod, CartValidation } from "../models";
import { DeliveryType, PaymentType } from "../enums";


export const useCheckout = defineStore("checkout", () => {

  const { $i } = useTranslation()
  const _cart = useCart()
  const _store = useStore()
  const { paymentService, persistenceService, discountService, cartService, stripeService, vippsService } = useServices()

  const totalAmountText = computed(() => {
    const currentCart = _cart.getCurrentCart()
    const priceAmount = currentCart?.calculations?.finalAmount ?? 0
    return (priceAmount > 0 ? ' ' + priceLabel(priceAmount, true) : '')
  })

  const paymentLabel = (paymentMethod: PaymentMethod) => {
    if (paymentMethod?.paymentType === PaymentType.Stripe)
      return 'xxxx xxxx xxxx ' + paymentMethod.last4 + '   ' + paymentMethod.expMonth + '/' + paymentMethod.expYear
    if (paymentMethod?.paymentType === PaymentType.Vipps)
      return 'Vipps'
    if (paymentMethod?.paymentType === PaymentType.PayInStore)
      return $i('checkoutPage_payInStore')
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
  const srdRef = ref(persistenceService.load<number>('srdRef') || 0);
  persistenceService.watchAndStore(srdRef, 'srdRef');
  const selectedRequestedCompletionDateOptionIndex = computed(() => { return srdRef.value })

  const srtRef = ref(persistenceService.load<Date>('srtRef') || (new Date()));
  persistenceService.watchAndStore(srtRef, 'srtRef');
  const selectedRequestedCompletionTime = computed(() => { return srtRef.value })

  const tempRequestedCompletion = ref('')
  const requestedCompletionDateOptions = computed(() => {
    const getRequestedCompletionDateLabel = (index, date) => {
      if (index === 0) return $i('general_asap')
      if (index === 1) return $i('general_today')
      if (index === 2) return $i('general_tomorrow')
      const days = [$i('general_threeLetterSunday'),
      $i('general_threeLetterMonday'),
      $i('general_threeLetterTuesday'),
      $i('general_threeLetterWednesday'),
      $i('general_threeLetterThursday'),
      $i('general_threeLetterFriday'),
      $i('general_threeLetterSaturday')];
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
    let options = [] as any[];
    for (let index = 0; index < 7; index++) {
      const tempDate = new Date(today);
      if (index > 1)
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
      srdRef.value
    ].value;
  })

  const dateOptionIndexChange = (event) => {
    if (!event.value && event.value !== 0) {
      return
    }
    srdRef.value = event.value
    requestedCompletionChange()
  }

  const timeChange = (event) => {
    if (!event.value) {
      return
    }
    srtRef.value = new Date(event.value)
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
    if (!removeTimezoneOffset) return selected
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
    if (srdRef.value === 0 ||
      !selectedRequestedCompletionDate.value ||
      !srtRef.value ||
      requestedCompletionDateOptions.value.length <= srdRef.value || dateTimeIsUnderTenMinutesFromNow())
      return $i('general_asap')?.toLowerCase()

    return (requestedCompletionDateOptions.value[srdRef.value]?.label?.toLowerCase()) + ', ' + (('0' + selectedRequestedCompletionTimeHours()).slice(-2)) + ':' + (('0' + selectedRequestedCompletionTimeMinutes()).slice(-2))
  })


  const selectedRequestedCompletionTimeHours = () => {
    return new Date(srtRef.value).getHours()
  }

  const selectedRequestedCompletionTimeMinutes = () => {
    return new Date(srtRef.value).getMinutes()
  }

  const requestedCompletionChange = () => {
    tempRequestedCompletion.value = (srdRef.value === 0 ||
      !selectedRequestedCompletionDate.value ||
      !srtRef.value) ? '' : selectedDateTime(true).toISOString().slice(0, -1);
  };

  watch(tempRequestedCompletion, debounce(function () {
    _cart.setCartRootProperties({ requestedCompletion: tempRequestedCompletion.value })
  }, 400))


  // Payment
  const selectedPaymentType = ref(PaymentType.NotSet)
  const paymentMethods = ref([] as any[])
  const selectedPaymentMethodId = ref("")
  const isLoadingPaymentMethods = ref(true)
  const rememberCard = ref(true)

  const cardNumber = ref('')
  const expMonth = ref('')
  const expYear = ref('')
  const cvc = ref('')
  const overrideIsValidCardInfo = ref(false)

  const getCardInfo = () => {
    return {
      number: (cardNumber.value || "").replace(/\s+/g, ""),
      expMonth: parseInt(expMonth.value),
      expYear: parseInt(expYear.value),
      cvc: cvc.value,
      isValid: overrideIsValidCardInfo.value ||
        ((cardNumber.value || "").replace(/\s+/g, "").length === 16 &&
          !isNaN(parseInt(expMonth.value)) &&
          !isNaN(parseInt(expYear.value)) &&
          (cvc.value || "").toString().length === 3),
    };
  }

  const setPaymentMethod = (item) => {
    selectedPaymentMethodId.value = item === undefined ? "" : item.id;
    selectedPaymentType.value = item === undefined ? PaymentType.NotSet : item.paymentType;

    _cart.setCartRootProperties({ paymentType: selectedPaymentType.value })
  }

  const getAvailablePaymentMethods = () => {
    const currentCart = _cart.getCurrentCart()
    if (!currentCart.id || currentCart.deliveryType === DeliveryType.NotSet) return Promise.resolve()
    isLoadingPaymentMethods.value = true;
    return paymentService()
      .GetPaymentMethods(currentCart.id)
      .then((result) => {

        paymentMethods.value = Array.isArray(result) ? result : [];

        if (selectedPaymentMethodId.value) {
          setPaymentMethod(
            paymentMethods.value.find((x) => x.id === selectedPaymentMethodId.value)
          );
        } else if (paymentMethods.value.length >= 1) {
          setPaymentMethod(paymentMethods.value[0]);
        }
      })
      .finally(() => {
        isLoadingPaymentMethods.value = false;
      });
  }

  const setCardInput = (key, value) => {
    if (key === 'cardNumber')
      cardNumber.value = value
    if (key === 'expMonth')
      expMonth.value = value
    if (key === 'expYear')
      expYear.value = value
    if (key === 'cvc')
      cvc.value = value
    if (key === 'overrideIsValidCardInfo')
      overrideIsValidCardInfo.value = value
  }

  const toggleRememberCard = () => {
    rememberCard.value = !rememberCard.value
  }

  const setIsProcessingLabel = (value) => {
    isProcessingLabelPrivate.value = value;
  }

  const setIsProcessingPayment = (value) => {
    isProcessingPaymentPrivate.value = value;
  }

  const setErrorMessage = (value) => {
    errorMessagePrivate.value = value;
  }

  const isProcessingPayment = computed(() => isProcessingPaymentPrivate.value)
  const isProcessingPaymentPrivate = ref(false)
  const isProcessingLabelPrivate = ref('')
  const isProcessingLabel = computed(() => isProcessingLabelPrivate.value)
  const isLoading = computed(() => isLoadingPaymentMethods.value || isValidating.value || _cart.isLoading);
  const isValidating = ref(false)
  const errorMessagePrivate = ref('')
  const errorMessage = computed(() => errorMessagePrivate.value)

  type CreatePaymentResult = { isPaid: Boolean, redirectUrl: string, returnUrl: string };

  const createStripePaymentIntent = async (paymentMethodId, setupFutureUsage, clientMajorVersion): Promise<CreatePaymentResult> => {
    isProcessingPaymentPrivate.value = true;
    return new Promise((resolve, reject) => {
      const currentCart = _cart.getCurrentCart()
      stripeService().CreatePaymentIntent(
        currentCart?.calculations?.finalAmount ?? 0,
        "NOK",
        paymentMethodId,
        currentCart.id,
        setupFutureUsage,
        clientMajorVersion
      )
        .then((result) => {
          if (!result || !result.paymentIntentId) {
            errorMessagePrivate.value = "Din betaling kunne ikke behandles akkurat nå. Vennligst prøv igjen litt senere.";
            isProcessingPaymentPrivate.value = false;
            return reject()
          }

          if (!result.nextAction) {
            //SUCCESS
            return resolve({
              isPaid: true,
              redirectUrl: '',
              returnUrl: '',
            });
          } else if (result.nextAction.type === "redirect_to_url") {
            //3D SECURE
            return resolve({
              isPaid: false,
              redirectUrl: result.nextAction.redirect_to_url.url,
              returnUrl: result.nextAction.redirect_to_url.return_url,
            });
          } else {
            //NOT HANDLED
            errorMessagePrivate.value = "Oops! Din betaling kunne ikke behandles akkurat nå. Vennligst prøv igjen litt senere.";
            isProcessingPaymentPrivate.value = false;
            reject()
          }
        })
        .catch(() => {
          errorMessagePrivate.value = "Betalingen kunne ikke gjennomføres på grunn av manglende dekning eller ugyldig kortinformasjon";
          isProcessingPaymentPrivate.value = false;
          reject()
        });

    })
  }

  const initiateVippsPayment = async (isApp): Promise<CreatePaymentResult> => {
    isProcessingPaymentPrivate.value = true;
    return new Promise((resolve, reject) => {
      const currentCart = _cart.getCurrentCart()
      vippsService()
        .Initiate(
          currentCart.id,
          currentCart.calculations.finalAmount,
          isApp
        )
        .then((result) => {
          return resolve({
            isPaid: false,
            redirectUrl: result.url,
            returnUrl: '',
          });
        })
        .catch((err) => {
          errorMessagePrivate.value = "Betaling med Vipps kunne ikke gjennomføres for øyeblikket.";
          isProcessingPaymentPrivate.value = false;
          return reject()
        });
    })
  }

  const isValid = (): Promise<Boolean> => {
    // TODO: Flytt til tekstene til no.ts og en.ts
    return new Promise((resolve) => {

      if (_cart.isLoading || isLoading.value) {
        return resolve(false);
      }

      setIsProcessingLabel('')
      errorMessagePrivate.value = '';
      isValidating.value = true;

      if (!(selectedPaymentMethodId.value || getCardInfo().isValid)) {
        errorMessagePrivate.value = $i("checkoutPage_paymentFailedCheckCardDetails");
        isValidating.value = false;
        return resolve(false);
      }

      const currentCart = _cart.getCurrentCart()
      if (currentCart.deliveryType === DeliveryType.InstantHomeDelivery && !_cart.deliveryAddressInCartIsValid()) {
        errorMessagePrivate.value = "Legg inn en gyldig leveringsadresse lengre opp";
        isValidating.value = false;
        return resolve(false);
      }

      if (currentCart.deliveryType === DeliveryType.NotSet) {
        errorMessagePrivate.value = "Gå tilbake og velg leveringsmetode";
        isValidating.value = false;
        return resolve(false);
      }

      cartService().Validate(_store.currentStore.id)
        .then((result: CartValidation) => {

          if (result.priceTooLowError)
            errorMessagePrivate.value = 'Beløpet er for lite. Du må minst handle for ' + priceLabel(result.minimumPrice, true);

          if (result.paymentTypeError)
            errorMessagePrivate.value = 'Betalingsmetoden er midlertidig utilgjengelig';

          if (result.priceDifferError)
            errorMessagePrivate.value = "Prisene er endret siden sist. Gå tilbake for å oppdatere handlevogna.";

          if (result.deliveryAddressError)
            errorMessagePrivate.value = "Leveringsadressen er ikke gyldig";

          if (result.deliveryMethodError)
            errorMessagePrivate.value = "Butikken leverer ikke til din adresse for øyeblikket";

          if (result.storeIsClosed)
            errorMessagePrivate.value = _store.currentStore.name + " er stengt for øyeblikket";

          if (result.cartIsEmpty)
            errorMessagePrivate.value = "Handlevogna er tom";

          if (result.itemsOutOfStock.length > 0) {
            let itemNames = "";
            if (result.itemsOutOfStock.length === 1) {
              itemNames = `'${result.itemsOutOfStock[0].name}'`;
            } else if (result.itemsOutOfStock.length === 2) {
              itemNames = `'${result.itemsOutOfStock[0].name}' og '${result.itemsOutOfStock[1].name}'`;
            } else {
              itemNames = `'${result.itemsOutOfStock[0].name}', '${result.itemsOutOfStock[1].name
                }' og ${result.itemsOutOfStock.length - 2} ${result.itemsOutOfStock.length - 2 === 1 ? "annen vare" : "andre varer"
                }`;
            }
            errorMessagePrivate.value = `Det er ikke nok av ${itemNames} på lager. Gå tilbake for å fjerne ${result.itemsOutOfStock.length === 1 ? "den" : "de"
              } fra handlevogna.`;
          }

          if (result.hasErrors && !errorMessagePrivate.value) {
            errorMessagePrivate.value = "Beklager, vi støter på et problem med handlevognen din";
          }

          isValidating.value = false;
          return resolve(!result.hasErrors);
        })
        .catch(() => {
          errorMessagePrivate.value = "Noe gikk galt. Prøv igjen senere";
          isValidating.value = false;
          return resolve(false);
        })
    })
  }



  const completeCart = async () => {
    if (isValidating.value) return;
    isValidating.value = true;
    return cartService().Complete(_store.currentStore.id)
      .catch(() => {
        errorMessagePrivate.value = "Bestillingen kunne ikke gjennomføres";
      }).finally(() => {
        isValidating.value = false;
        isProcessingPaymentPrivate.value = false;
      })
  }

  return {
    totalAmountText,
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
    rememberCard,
    paymentMethods,
    selectedPaymentMethodId,
    isLoadingPaymentMethods,
    toggleRememberCard,
    setPaymentMethod,
    getAvailablePaymentMethods,
    setCardInput,

    isLoading,
    isProcessingPayment,
    isProcessingLabel,
    errorMessage,
    setErrorMessage,
    setIsProcessingLabel,
    setIsProcessingPayment,

    getCardInfo,
    isValid,
    createStripePaymentIntent,
    initiateVippsPayment,
    completeCart,
  }
})
