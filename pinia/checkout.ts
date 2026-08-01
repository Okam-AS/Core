import { defineStore } from "pinia";
import { useCart, useTranslation, useServices, useStore } from ".";
import { ref, computed, watch } from "vue";
import { debounce } from "../helpers/ts-debounce";
import { priceLabel } from "../helpers/tools";
import { PaymentMethod, CartValidation, StripeCreatePaymentIntent, DinteroInitResponse, DinteroInitiatePaymentModel, MealsCompany, MealsContext } from "../models";
import { DeliveryType, PaymentType } from "../enums";
import { mealsQuoteHash } from "../helpers/meals-quote-hash";

export const useCheckout = defineStore("checkout", () => {
  const { $i } = useTranslation();
  const _cart = useCart();
  const _store = useStore();
  const { paymentService, persistenceService, discountService, cartService, stripeService, vippsService, dinteroService, mealsService } = useServices();
  const invoiceCustomerReference = ref("");

  const totalAmountText = () => {
    const currentCart = _cart.getCurrentCart();
    const priceAmount = currentCart?.calculations?.finalAmount ?? 0;
    return priceAmount > 0 ? " " + priceLabel(priceAmount, true) : "";
  };

  const paymentLabel = (paymentMethod: PaymentMethod) => {
    const currentCart = _cart.getCurrentCart();

    if (paymentMethod?.paymentType === PaymentType.Stripe) return "xxxx xxxx xxxx " + paymentMethod.last4 + "   " + paymentMethod.expMonth + "/" + paymentMethod.expYear;
    if (paymentMethod?.paymentType === PaymentType.Vipps) return "Vipps";
    if (paymentMethod?.paymentType === PaymentType.PayInStore) return $i("checkoutPage_payInStore");
    if (paymentMethod?.paymentType === PaymentType.Giftcard) return $i("checkoutPage_giftcard");
    if (paymentMethod?.paymentType === PaymentType.Dintero) return $i("checkoutPage_payNow");
    if (paymentMethod?.paymentType === PaymentType.DinteroVipps) return $i("checkoutPage_payWithVipps");
    if (paymentMethod?.paymentType === PaymentType.DinteroBillie) return $i("checkoutPage_payWithBillie") + (currentCart.companyName ? " " + $i("checkoutPage_payWithBillieTo") + " " + currentCart.companyName : "");
    if (paymentMethod?.paymentType === PaymentType.DinteroKravia) return $i("checkoutPage_payWithKravia") + (currentCart.companyName ? " " + $i("checkoutPage_payWithKraviaTo") + " " + currentCart.companyName : "");
    if (paymentMethod?.paymentType === PaymentType.DinteroKlarna) return $i("checkoutPage_payWithKlarna");
    if (paymentMethod?.paymentType === PaymentType.Twint) return $i("checkoutPage_payWithTwint");
    return "";
  };

  // Discount code
  const addDiscountCode = async (code) => {
    const currentCart = _cart.getCurrentCart();
    if (code === currentCart.discountCode) return true;
    return discountService()
      .Exists(currentCart.storeId, code)
      .then((exists) => {
        if (exists || code === "") {
          _cart.setCartRootProperties({ discountCode: code });
          return true;
        } else {
          return false;
        }
      })
      .catch(() => {
        return false;
      });
  };

  // Requested Completion Date
  const srdRef = ref(persistenceService.load<number>("srdRef") || 0);
  persistenceService.watchAndStore(srdRef, "srdRef");
  const selectedRequestedCompletionDateOptionIndex = computed(() => {
    return srdRef.value;
  });

  const srtRef = ref(persistenceService.load<Date>("srtRef") || new Date());
  persistenceService.watchAndStore(srtRef, "srtRef");
  const selectedRequestedCompletionTime = computed(() => {
    return srtRef.value;
  });

  const tempRequestedCompletion = ref("");
  const requestedCompletionDateOptions = computed(() => {
    const getRequestedCompletionDateLabel = (index, date) => {
      if (index === 0) return $i("general_asap");
      if (index === 1) return $i("general_today");
      if (index === 2) return $i("general_tomorrow");
      const days = [$i("general_threeLetterSunday"), $i("general_threeLetterMonday"), $i("general_threeLetterTuesday"), $i("general_threeLetterWednesday"), $i("general_threeLetterThursday"), $i("general_threeLetterFriday"), $i("general_threeLetterSaturday")];
      return days[date.getDay()] + ". " + date.getDate() + "." + (date.getMonth() + 1) + ".";
    };
    const today = new Date();
    let options = [] as any[];
    for (let index = 0; index < 30; index++) {
      const tempDate = new Date(today);
      if (index > 1) tempDate.setDate(tempDate.getDate() + index - 1);
      options.push({
        label: getRequestedCompletionDateLabel(index, tempDate),
        value: tempDate,
      });
    }
    return options;
  });

  const selectedRequestedCompletionDate = computed(() => {
    return requestedCompletionDateOptions.value[srdRef.value].value;
  });

  const resetTimeAndDatePickers = () => {
    srdRef.value = 0;
    srtRef.value = new Date();
    requestedCompletionChange();
  };

  const dateOptionIndexChange = (event) => {
    if (!event.value && event.value !== 0) {
      return;
    }
    srdRef.value = event.value;

    // If the date option changed, we need to ensure the time is properly set
    // This ensures the time component is preserved when changing dates
    if (srdRef.value > 0 && srtRef.value) {
      // Make sure srtRef.value is a valid Date object
      let currentHours = 0;
      let currentMinutes = 0;

      // Check if srtRef.value is a Date object or can be converted to one
      if (srtRef.value instanceof Date && !isNaN(srtRef.value.getTime())) {
        currentHours = srtRef.value.getHours();
        currentMinutes = srtRef.value.getMinutes();
      } else {
        // If not a valid Date, create a new Date object
        const now = new Date();
        currentHours = now.getHours();
        currentMinutes = now.getMinutes();
      }

      // Create a new Date object with the correct hours and minutes
      const newDate = new Date(srtRef.value);
      newDate.setHours(currentHours);
      newDate.setMinutes(currentMinutes);
      srtRef.value = newDate;
    }

    requestedCompletionChange();
  };

  const timeChange = (event) => {
    if (!event.value) {
      return;
    }
    srtRef.value = new Date(event.value);
    requestedCompletionChange();
  };

  const selectedDateTime = (removeTimezoneOffset = false) => {
    const selected = new Date(selectedRequestedCompletionDate.value.getFullYear(), selectedRequestedCompletionDate.value.getMonth(), selectedRequestedCompletionDate.value.getDate(), selectedRequestedCompletionTimeHours(), selectedRequestedCompletionTimeMinutes());
    if (!removeTimezoneOffset) return selected;
    const tzoffset = selected.getTimezoneOffset() * 60000;
    const localDateTime = new Date(selected.getTime() - tzoffset);
    return localDateTime;
  };

  const dateTimeIsUnderLimitMinutesFromNow = () => {
    const diff = selectedDateTime().getTime() - new Date().getTime();
    const minutesDiff = Math.floor(diff / 1000 / 60);
    return minutesDiff < 30;
  };

  const singleLineSelectedDateTime = computed(() => {
    if (srdRef.value === 0 || !selectedRequestedCompletionDate.value || !srtRef.value || requestedCompletionDateOptions.value.length <= srdRef.value || dateTimeIsUnderLimitMinutesFromNow()) return $i("general_asap")?.toLowerCase();

    return requestedCompletionDateOptions.value[srdRef.value]?.label?.toLowerCase() + ", " + ("0" + selectedRequestedCompletionTimeHours()).slice(-2) + ":" + ("0" + selectedRequestedCompletionTimeMinutes()).slice(-2);
  });

  const selectedRequestedCompletionTimeHours = () => {
    return new Date(srtRef.value).getHours();
  };

  const selectedRequestedCompletionTimeMinutes = () => {
    return new Date(srtRef.value).getMinutes();
  };

  const requestedCompletionChange = () => {
    tempRequestedCompletion.value = srdRef.value === 0 || !selectedRequestedCompletionDate.value || !srtRef.value ? "" : selectedDateTime(true).toISOString().slice(0, -1);
  };

  watch(
    tempRequestedCompletion,
    debounce(function () {
      // Get the selected time components directly
      const selectedHours = selectedRequestedCompletionTimeHours();
      const selectedMinutes = selectedRequestedCompletionTimeMinutes();
      let requestedCompletionValue = null;

      // Only proceed if we have valid selections and time is at least 1 hour in future
      if (srdRef.value !== 0 && selectedRequestedCompletionDate.value && srtRef.value && !dateTimeIsUnderLimitMinutesFromNow()) {
        const selectedDate = selectedRequestedCompletionDate.value;

        // Format the date as a string in the exact format we want to send to the backend
        // YYYY-MM-DDTHH:MM:SS format with no timezone information
        const year = selectedDate.getFullYear();
        const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
        const day = String(selectedDate.getDate()).padStart(2, '0');
        const hours = String(selectedHours).padStart(2, '0');
        const minutes = String(selectedMinutes).padStart(2, '0');

        // Create the formatted string
        requestedCompletionValue = `${year}-${month}-${day}T${hours}:${minutes}:00`;
      }

      _cart.setCartRootProperties({
        requestedCompletion: requestedCompletionValue,
      });
    }, 400)
  );

  // Payment
  const selectedPaymentType = ref(PaymentType.NotSet);
  const paymentMethodsPrivate = ref([] as any[]);
  const selectedPaymentMethodIdPrivate = ref("");
  const isLoadingPaymentMethodsPrivate = ref(false);
  const rememberCardPrivate = ref(true);

  const paymentMethods = computed(() => paymentMethodsPrivate.value);
  const selectedPaymentMethodId = computed(() => selectedPaymentMethodIdPrivate.value);
  const isLoadingPaymentMethods = computed(() => isLoadingPaymentMethodsPrivate.value);
  const rememberCard = computed(() => rememberCardPrivate.value);

  const cardNumber = ref("");
  const expMonth = ref("");
  const expYear = ref("");
  const cvc = ref("");
  const overridePaymentMethodId = ref("");

  // PCI SAQ-A gate (NOR-69). Swiss stores must NEVER capture a raw PAN/CVC in the
  // client: CH checkout routes only to Stripe-hosted card entry or TWINT, so the raw
  // card fields are never populated and getCardInfo() must never surface (or require)
  // one. The single CH signal available on the store is the region charge currency
  // "CHF" (Store.currencyCode, added by the earlier Swiss work); there is no country
  // field to key off. Norway (and any legacy NOK/absent-currency store) is unchanged
  // and continues to allow raw card entry exactly as before.
  const isSwissStore = computed(() => (_store.currentStore?.currencyCode || "").toUpperCase() === "CHF");

  const getCardInfo = () => {
    // SAQ-A: for a Swiss store never read the raw card refs. Return an empty,
    // never-valid card so no PAN/CVC can leave this store and the raw-card branch
    // can never be treated as a valid payment source. CH validity is driven solely
    // by a selected (Stripe-hosted / TWINT) payment method — see isValid().
    if (isSwissStore.value) {
      return {
        number: "",
        expMonth: NaN,
        expYear: NaN,
        cvc: "",
        isValid: false,
      };
    }
    return {
      number: (cardNumber.value || "").replace(/\s+/g, ""),
      expMonth: parseInt(expMonth.value),
      expYear: parseInt(expYear.value),
      cvc: cvc.value,
      isValid: overridePaymentMethodId.value || ((cardNumber.value || "").replace(/\s+/g, "").length === 16 && !isNaN(parseInt(expMonth.value)) && !isNaN(parseInt(expYear.value)) && (cvc.value || "").toString().length === 3),
    };
  };

  const setPaymentMethod = (item) => {
    // Choosing a rail is choosing NOT to put it on the company tab. Releasing the reservation here
    // (rather than leaving it to the page) is what makes the two tenders mutually exclusive
    // wherever the choice is made from: a held reservation plus a card tender would send a token
    // the backend ignores and strand the member's allowance until it expires.
    if (mealsReservationHeld()) { clearCompanyAccountTender(false); }

    selectedPaymentMethodIdPrivate.value = item === undefined ? "" : item.id;
    selectedPaymentType.value = item === undefined ? PaymentType.NotSet : item.paymentType;

    _cart.setCartRootProperties({ paymentType: selectedPaymentType.value });
  };

  const getAvailablePaymentMethods = () => {
    const currentCart = _cart.getCurrentCart();
    if (!currentCart.id || currentCart.deliveryType === DeliveryType.NotSet) return Promise.resolve();
    isLoadingPaymentMethodsPrivate.value = true;
    return paymentService()
      .GetPaymentMethods(currentCart.id, true)
      .then((result) => {
        paymentMethodsPrivate.value = Array.isArray(result) ? result : [];

        if (currentCart.paymentType) {
          const existingPaymentMethod = paymentMethods.value.find((x) => x.id === currentCart.paymentType);
          if (existingPaymentMethod) {
            setPaymentMethod(existingPaymentMethod);
            return;
          }
        }

        if (selectedPaymentMethodId.value) {
          setPaymentMethod(paymentMethods.value.find((x) => x.id === selectedPaymentMethodId.value));
        } else if (paymentMethods.value.length >= 1) {
          setPaymentMethod(paymentMethods.value[0]);
        }
      })
      .finally(() => {
        isLoadingPaymentMethodsPrivate.value = false;
      });
  };

  const setCardInput = (key, value) => {
    // SAQ-A (NOR-69): on a Swiss store the raw card fields must never be written to
    // state, so a PAN/CVC/expiry can never be captured client-side even if a caller
    // still tries to feed one. overridePaymentMethodId is a Stripe payment-method id
    // (a token, not card data) so it stays allowed for the CH Stripe-hosted flow.
    if (isSwissStore.value) {
      if (key === "overridePaymentMethodId") overridePaymentMethodId.value = value;
      return;
    }
    if (key === "cardNumber") cardNumber.value = value;
    if (key === "expMonth") expMonth.value = value;
    if (key === "expYear") expYear.value = value;
    if (key === "cvc") cvc.value = value;
    if (key === "overridePaymentMethodId") overridePaymentMethodId.value = value;
  };

  const toggleRememberCard = () => {
    rememberCardPrivate.value = !rememberCardPrivate.value;
  };

  const setIsProcessingLabel = (value) => {
    isProcessingLabelPrivate.value = value;
  };

  const setIsProcessingPayment = (value) => {
    isProcessingPaymentPrivate.value = value;
  };

  const setErrorMessage = (value) => {
    errorMessagePrivate.value = value;
  };

  const isProcessingPayment = computed(() => isProcessingPaymentPrivate.value);
  const isProcessingPaymentPrivate = ref(false);
  const isProcessingLabelPrivate = ref("");
  const isProcessingLabel = computed(() => isProcessingLabelPrivate.value);
  const isLoading = computed(() => isLoadingPaymentMethods.value || isValidating.value || _cart.isLoading);
  const isValidating = ref(false);

  const errorMessagePrivate = ref(persistenceService.load<String>("errorMessagePrivate") || "");
  persistenceService.watchAndStore(errorMessagePrivate, "errorMessagePrivate");

  const errorMessage = computed(() => errorMessagePrivate.value);

  type CreatePaymentResult = {
    isPaid: Boolean;
    redirectUrl: string;
    returnUrl: string;
    // Set for web TWINT (Confirm=false): the client must run stripe.confirmTwintPayment
    // with this secret. Completion is verified server-side (webhook + verify polling),
    // NOT inferred from a missing nextAction.
    clientSecret?: string;
    requiresClientConfirmation?: boolean;
  };

  const createStripePaymentIntent = async (model: StripeCreatePaymentIntent): Promise<CreatePaymentResult> => {
    // Region-aware charge currency, derived from the store context (server-driven).
    // Falls back to Norway's "NOK" when no region currency is available, preserving
    // existing NO behaviour; Swiss stores expose currencyCode "CHF".
    model.currency = model.currency || _store.currentStore?.currencyCode || "NOK";
    isProcessingPaymentPrivate.value = true;
    return new Promise((resolve, reject) => {
      stripeService()
        .CreatePaymentIntent(model)
        .then((result) => {
          if (!result || !result.paymentIntentId) {
            errorMessagePrivate.value = $i("checkoutPage_couldNotProcessPayment");
            isProcessingPaymentPrivate.value = false;
            return reject();
          }

          // WEB TWINT (server creates the intent with Confirm=false): the intent is
          // NOT paid yet and returns NO nextAction. We must never treat a missing
          // nextAction as success here — that would book a free order before the
          // customer approves in TWINT. Hand the client secret back so the caller can
          // run stripe.confirmTwintPayment; the order completes via the backend webhook
          // and GET /stripe/verify/{paymentIntentId} polling (the server is the truth).
          // (Native TWINT is server-confirmed and returns a redirect, so it is excluded
          // here and falls through to the redirect branch below.)
          if (model.paymentMethodType === "twint" && !model.isApp) {
            if (!result.secret) {
              // backend returns the client secret as "secret" (not "clientSecret")
              errorMessagePrivate.value = $i("checkoutPage_couldNotProcessPayment");
              isProcessingPaymentPrivate.value = false;
              return reject();
            }
            return resolve({
              isPaid: false,
              requiresClientConfirmation: true,
              clientSecret: result.secret,
              redirectUrl: "",
              returnUrl: "",
            });
          }

          if (!result.nextAction) {
            // CARD / native TWINT confirmed server-side: no nextAction means captured.
            return resolve({
              isPaid: true,
              redirectUrl: "",
              returnUrl: "",
            });
          } else if (result.nextAction.type === "redirect_to_url") {
            //3D SECURE / hosted redirect (also native TWINT server-confirm)
            return resolve({
              isPaid: false,
              redirectUrl: result.nextAction.redirect_to_url.url,
              returnUrl: result.nextAction.redirect_to_url.return_url,
            });
          } else {
            //NOT HANDLED
            errorMessagePrivate.value = $i("checkoutPage_couldNotHandlePayment");
            isProcessingPaymentPrivate.value = false;
            reject();
          }
        })
        .catch((e) => {
          errorMessagePrivate.value = $i("checkoutPage_paymentFailed");
          isProcessingPaymentPrivate.value = false;
          reject();
        });
    });
  };

  const initiateVippsPayment = async (cartId: string, giftcardId: string, amount: number, isApp: boolean): Promise<CreatePaymentResult> => {
    isProcessingPaymentPrivate.value = true;
    return new Promise((resolve, reject) => {
      vippsService()
        .Initiate(cartId, giftcardId, amount, isApp)
        .then((result) => {
          return resolve({
            isPaid: false,
            redirectUrl: result.url,
            returnUrl: "",
          });
        })
        .catch(() => {
          errorMessagePrivate.value = $i("checkoutPage_couldNotPayWithVipps");
          isProcessingPaymentPrivate.value = false;
          return reject();
        });
    });
  };

  const initiateDinteroPayment = async (model: DinteroInitiatePaymentModel): Promise<DinteroInitResponse> => {
    isProcessingPaymentPrivate.value = true;
    return new Promise((resolve, reject) => {
      dinteroService()
        .Initiate(model)
        .then((result) => {
          return resolve(result);
        })
        .catch(() => {
          errorMessagePrivate.value = $i("checkoutPage_couldNotPayWithDintero");
          isProcessingPaymentPrivate.value = false;
          return reject();
        });
    });
  };

  const setInvoiceCustomerReference = (value: string) => {
    invoiceCustomerReference.value = value || "";
  };

  const isValid = (): Promise<Boolean> => {
    return new Promise((resolve) => {
      if (_cart.isLoading || isLoading.value) {
        return resolve(false);
      }

      setIsProcessingLabel("");
      errorMessagePrivate.value = "";
      isValidating.value = true;
      const currentCart = _cart.getCurrentCart();

      if (currentCart.deliveryType === DeliveryType.NotSet) {
        errorMessagePrivate.value = $i("checkoutPage_deliveryTypeNotSetError");
        isValidating.value = false;
        return resolve(false);
      }

      if (!_cart.deliveryAddressInCartIsValid() && (currentCart.deliveryType === DeliveryType.InstantHomeDelivery || currentCart.deliveryType === DeliveryType.DineHomeDelivery || currentCart.deliveryType === DeliveryType.WoltDelivery)) {
        errorMessagePrivate.value = $i("checkoutPage_deliveryAddressNotSetError");
        isValidating.value = false;
        return resolve(false);
      }

      if (currentCart.deliveryType === DeliveryType.TableDelivery && (!currentCart.tableName || currentCart.tableName.trim() === "")) {
        errorMessagePrivate.value = $i("checkoutPage_tableNameNotSetError");
        isValidating.value = false;
        return resolve(false);
      }

      // SAQ-A (NOR-69): a Swiss store must have a selected payment method (Stripe-hosted
      // card or TWINT) and must never fall back to the raw-card path, so getCardInfo() is
      // not consulted at all for CH. Norway keeps the original "saved method OR raw card"
      // gate unchanged.
      // A company-funded order has no card and no rail: its payment source IS the funding
      // reservation, so the card gate below would refuse a perfectly valid checkout. The token is
      // still re-validated server-side at completion — this branch decides what to ASK for, never
      // what to trust.
      const isCompanyAccount = currentCart.paymentType === PaymentType.CompanyAccount;
      if (isCompanyAccount && !mealsReservationHeld()) {
        errorMessagePrivate.value = mealsErrorPrivate.value || $i("checkoutPage_mealsQuoteFailed");
        isValidating.value = false;
        return resolve(false);
      }

      const paymentSourceIsValid = isCompanyAccount ? true : isSwissStore.value ? !!selectedPaymentMethodId.value : selectedPaymentMethodId.value || getCardInfo().isValid;
      if (!paymentSourceIsValid) {
        errorMessagePrivate.value = $i("checkoutPage_paymentFailedCheckCardDetails");
        isValidating.value = false;
        return resolve(false);
      }

      cartService()
        .Validate(_store.currentStore.id)
        .then((result: CartValidation) => {
          if (result.priceTooLowError) errorMessagePrivate.value = $i("checkoutPage_minimumAmountError") + priceLabel(result.minimumPrice, true);

          if (result.paymentTypeError) errorMessagePrivate.value = $i("checkoutPage_paymentMethodUnavailable");

          if (result.priceDifferError) errorMessagePrivate.value = $i("checkoutPage_priceDifferError");

          if (result.deliveryAddressError) errorMessagePrivate.value = $i("checkoutPage_deliveryAddressError");

          if (result.deliveryMethodError) errorMessagePrivate.value = $i("checkoutPage_deliveryMethodError");

          if (result.sameDayAfterHoursOrderNotAllowed) errorMessagePrivate.value = $i("checkoutPage_sameDayAfterHoursOrderNotAllowed");

          if (result.storeIsClosed && !errorMessagePrivate.value) errorMessagePrivate.value = _store.currentStore.name + $i("checkoutPage_isClosedNow");

          if (result.giftcardBalanceTooLow) errorMessagePrivate.value = $i("checkoutPage_giftcardBalanceTooLowError");

          if (result.cartIsEmpty) errorMessagePrivate.value = $i("checkoutPage_cartIsEmptyError");

          if (result.itemsOutOfStock.length > 0) {
            let itemNames = "";
            if (result.itemsOutOfStock.length === 1) {
              itemNames = `'${result.itemsOutOfStock[0].name}'`;
            } else if (result.itemsOutOfStock.length === 2) {
              itemNames = `'${result.itemsOutOfStock[0].name}' og '${result.itemsOutOfStock[1].name}'`;
            } else {
              itemNames = `'${result.itemsOutOfStock[0].name}', '${result.itemsOutOfStock[1].name}' og ${result.itemsOutOfStock.length - 2} ${result.itemsOutOfStock.length - 2 === 1 ? "annen vare" : "andre varer"}`;
            }
            errorMessagePrivate.value = `Det er ikke nok av ${itemNames} på lager. Gå tilbake for å fjerne ${result.itemsOutOfStock.length === 1 ? "den" : "de"} fra handlekurven.`;
          }

          if (result.hasErrors && !errorMessagePrivate.value) {
            errorMessagePrivate.value = $i("checkoutPage_cartHasUnknownError");
          }

          isValidating.value = false;
          return resolve(!result.hasErrors);
        })
        .catch(() => {
          errorMessagePrivate.value = $i("checkoutPage_somethingWentWrong");
          isValidating.value = false;
          return resolve(false);
        });
    });
  };

  // ---- Company Meals: the company tab as a tender -----------------------------------------------
  //
  // This is the ONLY thing in any client that puts `PaymentType.CompanyAccount` on a cart, and the
  // only thing that carries a funding reservation token into cart completion. The backend has
  // refused a company-account tender without one since the module shipped; nothing had ever sent it.
  //
  // THE TOKEN IS NOT STATE. It is returned exactly once (the API persists only its hash), it
  // authorises money, and every other ref in this store is mirrored into localStorage by
  // `persistenceService.watchAndStore`. So it is held in a plain closure variable — not a ref, not
  // returned from the store, never logged — and dies with the tab. What IS exposed is whether one
  // is held, which is all a page needs to render the choice.
  let mealsToken = "";
  let mealsIdempotencyKey = "";
  let mealsQuotedHash = "";

  const mealsCompaniesPrivate = ref([] as MealsCompany[]);
  const mealsContextPrivate = ref(null as MealsContext);
  const mealsSelectedCompanyIdPrivate = ref("");
  const mealsIsLoadingPrivate = ref(false);
  const mealsErrorPrivate = ref("");
  const mealsReservationPrivate = ref(null as { reservationId: string; reservedCapMinor: number; currency: string; expiresAtUtc: string });

  const mealsCompanies = computed(() => mealsCompaniesPrivate.value);
  const mealsContext = computed(() => mealsContextPrivate.value);
  const mealsSelectedCompanyId = computed(() => mealsSelectedCompanyIdPrivate.value);
  const mealsIsLoading = computed(() => mealsIsLoadingPrivate.value);
  const mealsError = computed(() => mealsErrorPrivate.value);
  const mealsReservation = computed(() => mealsReservationPrivate.value);
  const mealsReservationHeld = () => !!mealsToken;
  const companyAccountSelected = computed(() => !!mealsReservationPrivate.value);

  /** Only a company whose agreement corridor IS this store, and whose membership is live, can pay here. */
  const mealsAvailableCompanies = computed(() =>
    mealsCompaniesPrivate.value.filter((c) => c.storeId && c.storeId === _store.currentStore?.id && (c.membershipState || "").toLowerCase() === "active")
  );

  const mealsCurrency = () => (_store.currentStore?.currencyCode || "NOK").toUpperCase();
  const mealsCartTotalMinor = () => _cart.getCurrentCart()?.calculations?.finalAmount ?? 0;
  const currentQuoteHash = () => mealsQuoteHash(_cart.getCurrentCart(), mealsCurrency(), mealsCartTotalMinor());

  const newIdempotencyKey = () => {
    return "meals-quote-" + Date.now().toString(36) + "-" + Math.random().toString(36).slice(2, 10);
  };

  /**
   * The entry read. Silent by design: a guest who belongs to no company, or a deployment with the
   * module dark, must see an ordinary checkout rather than an error about a feature they have never
   * heard of (the API answers those two cases with the same opaque 404).
   */
  const loadMealsCompanies = async () => {
    if (!_store.currentStore?.id) return;
    mealsIsLoadingPrivate.value = true;
    try {
      const result = await mealsService().GetMyCompanies();
      mealsCompaniesPrivate.value = result?.companies || [];
      const only = mealsAvailableCompanies.value;
      if (only.length && !mealsSelectedCompanyIdPrivate.value) {
        await selectMealsCompany(only[0].companyId);
      }
    } finally {
      mealsIsLoadingPrivate.value = false;
    }
  };

  /** Loads one company's eligibility. An INELIGIBLE answer is kept — its reason is what the guest is owed. */
  const selectMealsCompany = async (companyId: string) => {
    mealsSelectedCompanyIdPrivate.value = companyId || "";
    mealsContextPrivate.value = null;
    if (!companyId) return;
    mealsIsLoadingPrivate.value = true;
    try {
      mealsContextPrivate.value = await mealsService().GetContext(companyId);
    } finally {
      mealsIsLoadingPrivate.value = false;
    }
  };

  /**
   * Mints (or re-mints) the reservation and puts the company tender on the cart.
   *
   * The idempotency key is per CART VERSION, not per click: pressing the option twice must not
   * reserve the allowance twice, but a cart whose total changed is a different thing to fund and
   * gets a new key. That is why the quote hash is remembered alongside it.
   */
  const chooseCompanyAccount = async (): Promise<boolean> => {
    const companyId = mealsSelectedCompanyIdPrivate.value;
    if (!companyId || !_store.currentStore?.id) return false;
    mealsErrorPrivate.value = "";
    mealsIsLoadingPrivate.value = true;

    const hash = currentQuoteHash();
    if (hash !== mealsQuotedHash || !mealsIdempotencyKey) { mealsIdempotencyKey = newIdempotencyKey(); }

    try {
      const quote = await mealsService().CreateQuote(
        _store.currentStore.id,
        { companyId, cartTotalMinor: mealsCartTotalMinor(), currency: mealsCurrency(), quoteHash: hash },
        mealsIdempotencyKey
      );
      mealsToken = quote.authorizationToken;
      mealsQuotedHash = hash;
      mealsReservationPrivate.value = {
        reservationId: quote.reservationId,
        reservedCapMinor: quote.reservedCapMinor,
        currency: quote.currency,
        expiresAtUtc: quote.expiresAtUtc
      };

      // The tender only goes on the cart once the reservation exists, so the cart can never carry a
      // CompanyAccount tender this client has no token for.
      selectedPaymentMethodIdPrivate.value = "";
      selectedPaymentType.value = PaymentType.CompanyAccount;
      _cart.setCartRootProperties({ paymentType: PaymentType.CompanyAccount });
      return true;
    } catch (error: any) {
      clearCompanyAccountTender(false);
      mealsErrorPrivate.value = mealsRefusalText(error?.reasonCode) || error?.message || $i("checkoutPage_mealsQuoteFailed");
      return false;
    } finally {
      mealsIsLoadingPrivate.value = false;
    }
  };

  /** Drops the reservation this client holds. `resetTender` puts the cart back to an unchosen tender. */
  const clearCompanyAccountTender = (resetTender: boolean = true) => {
    mealsToken = "";
    mealsQuotedHash = "";
    mealsIdempotencyKey = "";
    mealsReservationPrivate.value = null;
    if (resetTender) {
      selectedPaymentType.value = PaymentType.NotSet;
      _cart.setCartRootProperties({ paymentType: PaymentType.NotSet });
    }
  };

  /** The MEALS_* vocabulary, in the guest's language. An unknown code falls through to the server's prose. */
  const mealsRefusalText = (reasonCode: string) => {
    if (!reasonCode) return "";
    const map = {
      MEALS_INELIGIBLE_TIME_WINDOW: $i("checkoutPage_mealsIneligibleTimeWindow"),
      MEALS_ALLOWANCE_EXCEEDED: $i("checkoutPage_mealsAllowanceExceeded"),
      MEALS_MEMBERSHIP_REVOKED: $i("checkoutPage_mealsMembershipRevoked"),
      MEALS_OVER_RESERVED_CAP: $i("checkoutPage_mealsOverReservedCap"),
      MEALS_RESERVATION_EXPIRED: $i("checkoutPage_mealsReservationExpired"),
      MEALS_RESERVATION_NOT_FOUND: $i("checkoutPage_mealsReservationExpired"),
      MEALS_CURRENCY_MISMATCH: $i("checkoutPage_mealsCurrencyMismatch"),
      MEALS_MODULE_UNAVAILABLE: $i("checkoutPage_mealsUnavailable")
    };
    return map[reasonCode] || "";
  };

  // A quote is pinned to the cart that produced it, and the checkout page can still change the
  // total after one is minted (a tip, a discount code). Leaving the stale reservation in place
  // would let the guest press "pay" and be refused at the very last step with MEALS_OVER_RESERVED_CAP.
  // So the held reservation follows the cart.
  watch(
    () => (companyAccountSelected.value ? currentQuoteHash() : ""),
    debounce(function (hash: string) {
      if (!hash || !mealsToken || hash === mealsQuotedHash) return;
      chooseCompanyAccount();
    }, 400)
  );

  const completeCart = async () => {
    if (isValidating.value || !_store.currentStore.id) return Promise.reject();
    errorMessagePrivate.value = "";
    isValidating.value = true;
    // Company-funded orders and only those carry the reservation token; every other tender sends
    // nothing, exactly as before.
    const token = _cart.getCurrentCart()?.paymentType === PaymentType.CompanyAccount ? mealsToken : "";
    return cartService()
      .Complete(_store.currentStore.id, token)
      .then((order) => {
        // The reservation is spent the moment the order binds it: holding the token afterwards
        // could only produce a second, refused attempt.
        if (token) { clearCompanyAccountTender(false); }
        return order;
      })
      .catch((error: any) => {
        errorMessagePrivate.value = mealsRefusalText(error?.reasonCode) || $i("checkoutPage_completeCartFailedError");
      })
      .finally(() => {
        isValidating.value = false;
        isProcessingPaymentPrivate.value = false;
      });
  };

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
    resetTimeAndDatePickers,

    // Payment
    rememberCard,
    paymentMethods,
    selectedPaymentMethodId,
    isLoadingPaymentMethods,
    toggleRememberCard,
    setPaymentMethod,
    getAvailablePaymentMethods,
    setCardInput,
    // SAQ-A signal (NOR-69): true when the current store charges in CHF, i.e. a Swiss
    // store where raw card entry must be hidden and only Stripe-hosted / TWINT is offered.
    isSwissStore,

    isLoading,
    isProcessingPayment,
    isProcessingLabel,
    invoiceCustomerReference,
    errorMessage,
    setErrorMessage,
    setIsProcessingLabel,
    setIsProcessingPayment,
    setInvoiceCustomerReference,

    getCardInfo,
    isValid,
    createStripePaymentIntent,
    initiateVippsPayment,
    initiateDinteroPayment,
    completeCart,

    // Company Meals. `mealsToken` is deliberately NOT here — see the section header above.
    mealsCompanies,
    mealsAvailableCompanies,
    mealsContext,
    mealsSelectedCompanyId,
    mealsIsLoading,
    mealsError,
    mealsReservation,
    companyAccountSelected,
    loadMealsCompanies,
    selectMealsCompany,
    chooseCompanyAccount,
    clearCompanyAccountTender,
  };
});
