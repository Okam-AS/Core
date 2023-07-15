
import { defineStore } from "pinia";
import { Order } from "../models";
import { DeliveryType, OrderStatus, PaymentType } from "../enums";
import { useServices, useStore, useTranslation, useUser } from "."
import { ref, computed } from "vue";
import { orderStatusLabel } from "../helpers/tools";

export const useOrder = defineStore("order", () => {

  const { $i } = useTranslation()
  const { currentStore } = useStore()
  const _user = useUser()
  const { orderService, persistenceService } = useServices()
  const isLoadingPrivate = ref(false);
  const isLoading = computed(() => { return isLoadingPrivate.value })

  const ongoingPrivate = ref([] as Order[])
  const ongoing = computed(() => { return ongoing.value })
  const ordersRef = ref(persistenceService.load<Order[]>('ordersRef') || [] as Order[]);
  persistenceService.watchAndStore(ordersRef, 'ordersRef');
  const orders = computed(() => { return ordersRef.value })

  const viewingOrderPrivate = ref({} as Order);
  const viewingOrder = computed(() => { return viewingOrderPrivate.value })
  const setViewingOrder = (orderId) => {
    isLoadingPrivate.value = true
    return orderService().GetByCode(orderId).then((order) => {
      viewingOrderPrivate.value = order
    }).finally(() => {
      isLoadingPrivate.value = false
    })
  }

  const loadAll = async () => {
    isLoadingPrivate.value = true
    return orderService().GetAll().then((s) => {
      ordersRef.value = s
      if (currentStore?.id) {
        loadOngoing(currentStore.id)
      }
      if (viewingOrderPrivate?.value?.id) {
        setViewingOrder(viewingOrderPrivate.value.id)
      }
    })
      .catch(() => {
        ordersRef.value = [] as Order[]
      })
      .finally(() => {
        isLoadingPrivate.value = false
      })
  }

  const loadOngoing = (storeId: number) => {
    if (!_user.isLoggedIn) return Promise.resolve()
    isLoadingPrivate.value = true
    return orderService().GetOngoing(storeId)
      .then((s) => {
        ongoingPrivate.value = s ?? [] as Order[]
      })
      .catch(() => {
        ongoingPrivate.value = [] as Order[]
      })
      .finally(() => {
        isLoadingPrivate.value = false
      })
  }

  const payedLabel = (paymentType: PaymentType) => {
    if (paymentType === PaymentType.Stripe)
      return $i('paymentType_stripe')
    if (paymentType === PaymentType.Vipps)
      return $i('paymentType_vipps')
    if (paymentType === PaymentType.PayInStore)
      return $i('paymentType_payInStore')
    return $i('paymentType_unknown')
  }

  const progressFlow = (deliveryType: DeliveryType, currentStatus: OrderStatus) => {

    const createSteps = (status, flow) => {
      return flow.map(s => ({
        completed: flow.indexOf(s) < flow.indexOf(currentStatus) || currentStatus === OrderStatus.Completed || s === OrderStatus.Accepted,
        current: s === status,
        label: orderStatusLabel(s),
        isLastStep: s === OrderStatus.Completed
      }))
    }

    if (deliveryType === DeliveryType.SelfPickup)
      return createSteps(currentStatus,
        [
          OrderStatus.Accepted,
          OrderStatus.Processing,
          OrderStatus.ReadyForPickup,
          OrderStatus.Completed
        ])

    if (deliveryType === DeliveryType.InstantHomeDelivery)
      return createSteps(currentStatus,
        [
          OrderStatus.Accepted,
          OrderStatus.Processing,
          OrderStatus.ReadyForDriver,
          OrderStatus.Completed
        ])

    if (deliveryType === DeliveryType.TableDelivery)
      return createSteps(currentStatus,
        [
          OrderStatus.Accepted,
          OrderStatus.Processing,
          OrderStatus.Served,
          OrderStatus.Completed
        ])

    return []
  }

  return {
    isLoading,
    orders,
    ongoing,
    viewingOrder,
    payedLabel,
    setViewingOrder,
    progressFlow,
    loadAll,
    loadOngoing
  }
});