
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
  const srdRef = ref(persistenceService.load<number>('srdRef') || 0);
  persistenceService.watchAndStore(srdRef, 'srdRef');
  const selectedRequestedCompletionDateOptionIndex = computed(() => { return srdRef.value })

  const srtRef = ref(persistenceService.load<Date>('srtRef') || (new Date()));
  persistenceService.watchAndStore(srtRef, 'srtRef');
  const selectedRequestedCompletionTime = computed(() => { return srtRef.value })

  const tempRequestedCompletion = ref('')
  const requestedCompletionDateOptions = computed(() => {
    const getRequestedCompletionDateLabel = (index, date) => {
      if (index === 0) return $i['general_asap']
      if (index === 1) return $i['general_today']
      if (index === 2) return $i['general_tomorrow']
      const days = [$i['general_threeLetterSunday'],
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
    if (!event.value) { 
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
      return $i['general_asap']?.toLowerCase()

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
    selectedPaymentType.value = item === undefined ? PaymentType.NotSet : item.paymentType;

    _cart.setCartRootProperties({ paymentType: selectedPaymentType.value })
  }

  const getAvailablePaymentMethods = () => {
    const currentCart = _cart.getCurrentCart()
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
  }

  const toggleRememberCard = () => {
    rememberCard.value = !rememberCard.value
  }

  const isProcessingPayment = ref(false)
  const isLoading = computed(() => isLoadingPaymentMethods.value || isValidating.value || _cart.isLoading || isProcessingPayment.value);
  const isValidating = ref(false)
  const errorMessage = ref('')

  type CreatePaymentResult = { isPaid: Boolean, redirectUrl: string, returnUrl: string };

  const createStripePaymentIntent = async (paymentMethodId, setupFutureUsage): Promise<CreatePaymentResult> => {
    isProcessingPayment.value = true;
    return new Promise((resolve, reject) => {
      const currentCart = _cart.getCurrentCart()
      stripeService().CreatePaymentIntent(
        currentCart?.calculations?.finalAmount ?? 0,
        "NOK",
        paymentMethodId,
        currentCart.id,
        setupFutureUsage
      )
        .then((result) => {
          if (!result || !result.paymentIntentId) {
            errorMessage.value = "Din betaling kunne ikke behandles akkurat nå. Vennligst prøv igjen litt senere.";
            isProcessingPayment.value = false;
            return reject()
          }

          if (!result.nextAction) {
            //SUCCESS
            resolve({
              isPaid: true,
              redirectUrl: '',
              returnUrl: '',
            });
          } else if (result.nextAction.type === "redirect_to_url") {
            //3D SECURE
            isProcessingPayment.value = false;
            resolve({
              isPaid: false,
              redirectUrl: result.nextAction.redirect_to_url.url,
              returnUrl: result.nextAction.redirect_to_url.return_url,
            });
          } else {
            //NOT HANDLED
            errorMessage.value = "Oops! Din betaling kunne ikke behandles akkurat nå. Vennligst prøv igjen litt senere.";
            isProcessingPayment.value = false;
            reject()
          }
        })
        .catch(() => {
          errorMessage.value = "Betalingen kunne ikke gjennomføres på grunn av manglende dekning eller ugyldig kortinformasjon";
          isProcessingPayment.value = false;
          reject()
        });

    })
  }

  const initiateVippsPayment = async (): Promise<CreatePaymentResult> => {
    isProcessingPayment.value = true;
    return new Promise((resolve, reject) => {
      const currentCart = _cart.getCurrentCart()
      vippsService()
        .Initiate(
          currentCart.id,
          currentCart.calculations.finalAmount,
          true
        )
        .then((result) => {
          resolve({
            isPaid: false,
            redirectUrl: result.url,
            returnUrl: '',
          });
        })
        .catch((err) => {
          errorMessage.value = "Betaling med Vipps kunne ikke gjennomføres for øyeblikket.";
          isProcessingPayment.value = false;
          return reject()
        });
    })
  }

  const isValid = (): Promise<Boolean> => {
    // TODO: Flytt til tekstene til no.ts og en.ts
    return new Promise((resolve) => {

      if (_cart.isLoading || isLoading.value) {
        resolve(false);
      }


      errorMessage.value = '';
      isValidating.value = true;

      if (!(selectedPaymentMethodId.value || getCardInfo().isValid)) {
        errorMessage.value = 'Kortinformasjonen er ugyldig';
        isValidating.value = false;
        resolve(false);
      }

      const currentCart = _cart.getCurrentCart()
      if (currentCart.deliveryType === DeliveryType.InstantHomeDelivery && !_cart.deliveryAddressInCartIsValid()) {
        errorMessage.value = "Legg inn en gyldig leveringsadresse";
        isValidating.value = false;
        resolve(false);
      }

      if (currentCart.deliveryType === DeliveryType.NotSet) {
        errorMessage.value = "Velg leveringsmetode";
        isValidating.value = false;
        resolve(false);
      }

      cartService().Validate(_store.currentStore.id)
        .then((result: CartValidation) => {

          if (result.priceTooLowError)
            errorMessage.value = 'Beløpet er for lite. Du må minst handle for ' + priceLabel(result.minimumPrice, true);

          if (result.paymentTypeError)
            errorMessage.value = 'Betalingsmetoden er midlertidig utilgjengelig';

          if (result.priceDifferError)
            errorMessage.value = "Prisene er endret siden sist. Gå tilbake for å oppdatere handlevogna.";

          if (result.deliveryAddressError)
            errorMessage.value = "Leveringsadressen er ikke gyldig";

          if (result.deliveryMethodError)
            errorMessage.value = "Butikken leverer ikke til din adresse for øyeblikket";

          if (result.storeIsClosed)
            errorMessage.value = _store.currentStore.name + " er stengt for øyeblikket";

          if (result.cartIsEmpty)
            errorMessage.value = "Handlevogna er tom";

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
            errorMessage.value = `Det er ikke nok av ${itemNames} på lager. Gå tilbake for å fjerne ${result.itemsOutOfStock.length === 1 ? "den" : "de"
              } fra handlevogna.`;
          }

          if (result.hasErrors && !errorMessage.value) {
            errorMessage.value = "Beklager, vi støter på et problem med handlevognen din";
          }

          isValidating.value = false;
          resolve(!result.hasErrors);
        })
        .catch(() => {
          errorMessage.value = "Noe gikk galt. Prøv igjen senere";
          isValidating.value = false;
          resolve(false);
        })
    })
  }



  const completeCart = async () => {
    isProcessingPayment.value = true;
    return cartService().Complete(_store.currentStore.id)
      .catch(() => {
        errorMessage.value = "Bestillingen kunne ikke gjennomføres. Vennligst prøv igjen litt senere.";
      }).finally(() => {
        isProcessingPayment.value = false;
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
    errorMessage,

    getCardInfo,
    isValid,
    createStripePaymentIntent,
    initiateVippsPayment,
    completeCart,
  }
})
