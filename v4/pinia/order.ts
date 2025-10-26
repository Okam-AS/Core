import { defineStore } from "pinia";
import { Order } from "../models";
import { DeliveryType, OrderStatus, PaymentType } from "../enums";
import { useServices, useStore, useTranslation, useUser, useTheme, useSettings } from ".";
import { ref, computed } from "vue";
import { orderStatusLabel } from "../helpers/tools";

export const useOrder = defineStore("order", () => {
  const { $i } = useTranslation();
  const { currentStore } = useStore();
  const _user = useUser();
  const { orderService, persistenceService } = useServices();
  const { $availableStoreIds } = useTheme();
  const { addViewedOrderId } = useSettings();
  const isLoadingPrivate = ref(false);
  const isLoading = computed(() => {
    return isLoadingPrivate.value;
  });

  const ongoingPrivate = ref(persistenceService.load<Order[]>("ongoingOrders") || ([] as Order[]));
  persistenceService.watchAndStore(ongoingPrivate, "ongoingOrders");
  const ongoing = computed(() => {
    return ongoingPrivate.value;
  });
  const ordersRef = ref(persistenceService.load<Order[]>("ordersRef") || ([] as Order[]));
  persistenceService.watchAndStore(ordersRef, "ordersRef");
  const orders = computed(() => {
    return ordersRef.value;
  });

  const viewingOrderPrivate = ref({} as Order);
  const viewingOrder = computed(() => {
    return viewingOrderPrivate.value;
  });
  const setViewingOrder = (orderId) => {
    isLoadingPrivate.value = true;
    addViewedOrderId(orderId);
    return orderService()
      .GetByCode(orderId)
      .then((order) => {
        if (!$availableStoreIds?.length || $availableStoreIds.includes(order.storeId)) {
          viewingOrderPrivate.value = order;
        }
      })
      .finally(() => {
        isLoadingPrivate.value = false;
      });
  };

  const loadAll = async () => {
    if (!_user.isLoggedIn()) {
      ordersRef.value = [] as Order[];
      return Promise.resolve();
    }

    isLoadingPrivate.value = true;
    return orderService()
      .GetAll()
      .then((s) => {
        ordersRef.value = $availableStoreIds?.length ? s.filter((order) => $availableStoreIds.includes(order.storeId)) : s;
        if (currentStore?.id) {
          loadOngoing(currentStore.id);
        }
        if (viewingOrderPrivate?.value?.id) {
          setViewingOrder(viewingOrderPrivate.value.id);
        }
      })
      .catch(() => {
        ordersRef.value = [] as Order[];
      })
      .finally(() => {
        isLoadingPrivate.value = false;
      });
  };

  const loadOngoing = (storeId: number) => {
    if (!_user.isLoggedIn() || ($availableStoreIds?.length && !$availableStoreIds.includes(storeId))) {
      ongoingPrivate.value = [] as Order[];
      return Promise.resolve();
    }
    isLoadingPrivate.value = true;
    return orderService()
      .GetOngoing(storeId)
      .then((s) => {
        ongoingPrivate.value = s ?? ([] as Order[]);
      })
      .catch(() => {
        ongoingPrivate.value = [] as Order[];
      })
      .finally(() => {
        isLoadingPrivate.value = false;
      });
  };

  const cancelViewingOrder = () => {
    if (!_user.isLoggedIn() || !viewingOrderPrivate.value) return Promise.resolve();
    return orderService()
      .UpdateStatus(viewingOrderPrivate.value.id, OrderStatus.Canceled)
      .finally(() => {
        setViewingOrder(viewingOrderPrivate.value.id);
      });
  };

  const completeViewingOrder = () => {
    if (!_user.isLoggedIn() || !viewingOrderPrivate.value) return Promise.resolve();
    return orderService()
      .UpdateStatus(viewingOrderPrivate.value.id, OrderStatus.Completed)
      .finally(() => {
        setViewingOrder(viewingOrderPrivate.value.id);
      });
  };

  const payedLabel = (paymentType: PaymentType) => {
    if (paymentType === PaymentType.Stripe) return $i("paymentType_stripe");
    if (paymentType === PaymentType.Vipps || paymentType === PaymentType.DinteroVipps) return $i("paymentType_vipps");
    if (paymentType === PaymentType.PayInStore) return $i("paymentType_payInStore");
    if (paymentType === PaymentType.Giftcard) return $i("paymentType_giftcard");
    if (paymentType === PaymentType.Dintero) return $i("paymentType_dintero");
    if (paymentType === PaymentType.DinteroBillie) return $i("paymentType_dinteroBillie");
    if (paymentType === PaymentType.DinteroKlarna) return $i("paymentType_dinteroKlarna");
    if (paymentType === PaymentType.WoltMarketplace) return $i("paymentType_woltMarketplace");
    return $i("paymentType_unknown");
  };

  const progressFlow = (deliveryType: DeliveryType, currentStatus: OrderStatus) => {
    const createSteps = (flow) => {
      return flow.map((s) => ({
        completed: flow.indexOf(s) < flow.indexOf(currentStatus) || (s !== OrderStatus.Completed && currentStatus === OrderStatus.ReadyForPickup) || currentStatus === OrderStatus.Completed || s === OrderStatus.Accepted || (currentStatus === OrderStatus.Served && s !== OrderStatus.Completed),
        current: s === currentStatus,
        label: orderStatusLabel(s),
        isLastStep: s === OrderStatus.Completed,
      }));
    };

    if (deliveryType === DeliveryType.SelfPickup) return createSteps([OrderStatus.Accepted, OrderStatus.Processing, OrderStatus.ReadyForPickup, OrderStatus.Completed]);

    if (deliveryType === DeliveryType.InstantHomeDelivery || deliveryType === DeliveryType.DineHomeDelivery || deliveryType === DeliveryType.WoltDelivery) return createSteps([OrderStatus.Accepted, OrderStatus.Processing, OrderStatus.ReadyForDriver, OrderStatus.Completed]);

    if (deliveryType === DeliveryType.TableDelivery) return createSteps([OrderStatus.Accepted, OrderStatus.Processing, OrderStatus.Served, OrderStatus.Completed]);

    return [];
  };

  const sendReceiptByMail = (orderCode: string) => {
    return orderService().SendReceiptByMail(orderCode);
  };

  return {
    isLoading,
    orders,
    ongoing,
    viewingOrder,
    completeViewingOrder,
    cancelViewingOrder,
    payedLabel,
    setViewingOrder,
    progressFlow,
    loadAll,
    loadOngoing,
    sendReceiptByMail,
  };
});
