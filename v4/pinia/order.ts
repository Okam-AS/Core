
import { defineStore } from "pinia";
import { Order } from "../models";
import { DeliveryType, OrderStatus } from "../enums";
import { useServices, useStore, useTranslation, useUser } from "."
import { ref, computed } from "vue";
import { orderStatusLabel } from "../helpers/tools";


export const useOrder = defineStore("order", () => {

  const { $i } = useTranslation()
  const { currentStore } = useStore()
  const _user = useUser()
  const { orderService, persistenceService } = useServices()
  const isLoading = ref(false);

  const ongoing = ref([] as Order[])
  const ordersRef = ref(persistenceService.load<Order[]>('ordersRef') || [] as Order[]);
  persistenceService.watchAndStore(ordersRef, 'ordersRef');
  const orders = computed(() => { return ordersRef.value })

  const viewingOrder = ref({} as Order);
  const setViewingOrder = (orderId) => {
    isLoading.value = true
    return orderService().GetByCode(orderId).then((order) => {
      viewingOrder.value = order
    }).finally(() => {
      isLoading.value = false
    })
  }

  const loadAll = async () => {
    isLoading.value = true
    return orderService().GetAll().then((s) => {
      ordersRef.value = s
      if (currentStore?.id) {
        loadOngoing(currentStore.id)
      }
      if (viewingOrder?.value?.id) {
        setViewingOrder(viewingOrder.value.id)
      }
    })
      .catch(() => {
        ordersRef.value = [] as Order[]
      })
      .finally(() => {
        isLoading.value = false
      })
  }

  const loadOngoing = (storeId: number) => {
    if (!_user.isLoggedIn) return Promise.resolve()
    isLoading.value = true
    return orderService().GetOngoing(storeId)
      .then((s) => {
        ongoing.value = s ?? [] as Order[]
      })
      .catch(() => {
        ongoing.value = [] as Order[]
      })
      .finally(() => {
        isLoading.value = false
      })
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
    setViewingOrder,
    progressFlow,
    loadAll,
    loadOngoing
  }
});