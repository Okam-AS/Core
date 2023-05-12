
import { defineStore } from "pinia";
import { Order } from "../models";
import { DeliveryType, OrderStatus } from "../enums";
import { useServices, useTranslation } from "."
import { ref, computed } from "vue";
import { orderStatusLabel } from "../helpers/tools";


export const useOrder = defineStore("order", () => {

  const { $i } = useTranslation()
  const { orderService, persistenceService } = useServices()
  const isLoading = ref(false);

  const ordersRef = ref(persistenceService.load<Order[]>('ordersRef') || [] as Order[]);
  persistenceService.watchAndStore(ordersRef, 'ordersRef');

  const orders = computed(() => { return ordersRef.value })

  const ongoing = ref([] as Order[])

  const loadAll = async () => {
    isLoading.value = true
    return orderService().GetAll().then((s) => {
      ordersRef.value = s
    })
    .catch(() => {
      ordersRef.value = [] as Order[]
    })
    .finally(() => {
      isLoading.value = false
    })
  }

  const loadOngoing = (storeId: number) => {
    isLoading.value = true
    return orderService().GetOngoing(storeId)
    .then((s) => {
      ongoing.value = s ?? [] as Order[] //s?.length < 1? [] : s.slice(0, 2);  //TODO: Remove temp code. This should be: s ?? [] as Order[]
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
        label: orderStatusLabel(s, $i),
        isLastStep: s === OrderStatus.Completed
      }))
    }

    if(deliveryType === DeliveryType.SelfPickup)
      return createSteps(currentStatus,
        [
          OrderStatus.Accepted,
          OrderStatus.Processing, 
          OrderStatus.ReadyForPickup,
          OrderStatus.Completed
        ])
    
    if(deliveryType === DeliveryType.InstantHomeDelivery)
      return createSteps(currentStatus,
        [
          OrderStatus.Accepted,
          OrderStatus.Processing, 
          OrderStatus.ReadyForDriver,
          OrderStatus.Completed
        ])

    if(deliveryType === DeliveryType.TableDelivery)
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
    progressFlow,
    loadAll,
    loadOngoing
  }
});