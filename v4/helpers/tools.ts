import { DeliveryType, OrderStatus } from "../enums"

const wholeAmountTool = (amount: Number): string => {
  if (!amount) { return '0' }
  const wholeAmount = amount.toString().slice(0, -2)
  return wholeAmount ? wholeAmount.replace(/\B(?=(\d{3})+(?!\d))/g, ' ') : '0'
}

const fractionAmountTool = (amount: Number): string => {
  if (!amount) { return '00' }
  const fractionAmount = amount.toString().slice(-2)
  return fractionAmount.length < 2 ? '00' : fractionAmount
}

const priceLabelTool = (totalPrice: Number, hideFractionIfZero: Boolean) => {
  const prefix = ''
  const wholeAmount = wholeAmountTool(totalPrice)
  let fraction = ''
  if (!hideFractionIfZero || parseInt(fractionAmountTool(totalPrice)) > 0) {
    fraction = ',' + fractionAmountTool(totalPrice)
  }
  const suffix = ',–'
  return prefix + wholeAmount + fraction + suffix
}


const orderStatusLabelTool = (type: OrderStatus, i: Object) => {
  const map = {
    [OrderStatus.Accepted]: i['orderStatus_accepted'],
    [OrderStatus.Processing]: i['orderStatus_processing'],
    [OrderStatus.ReadyForPickup]: i['orderStatus_readyForPickup'],
    [OrderStatus.ReadyForDriver]: i['orderStatus_readyForDriver'],
    [OrderStatus.DriverPickedUp]: i['orderStatus_driverPickedUp'],
    [OrderStatus.Served]: i['orderStatus_served'],
    [OrderStatus.Completed]: i['orderStatus_completed'],
    [OrderStatus.Canceled]: i['orderStatus_canceled'],
    default: ''
  };
  return map[type] || map.default;
}

const orderStatusHeadingTool = (type: OrderStatus, i: Object) => {
  const map = {
    [OrderStatus.Accepted]: i['orderStatus_acceptedHeading'],
    [OrderStatus.Processing]: i['orderStatus_processingHeading'],
    [OrderStatus.ReadyForPickup]: i['orderStatus_readyForPickupHeading'],
    [OrderStatus.ReadyForDriver]: i['orderStatus_readyForDriverHeading'],
    [OrderStatus.DriverPickedUp]: i['orderStatus_driverPickedUpHeading'],
    [OrderStatus.Served]: i['orderStatus_servedHeading'],
    [OrderStatus.Completed]: i['orderStatus_completedHeading'],
    [OrderStatus.Canceled]: i['orderStatus_canceledHeading'],
    default: ''
  };
  return map[type] || map.default;
}

const deliveryTypeLabelTool = (type: DeliveryType, i: Object) => {
  const map = {
    [DeliveryType.SelfPickup]: i['deliveryType_selfPickup'],
    [DeliveryType.InstantHomeDelivery]: i['deliveryType_instantHomeDelivery'],
    [DeliveryType.GroupedHomeDelivery]: i['deliveryType_groupedHomeDelivery'],
    [DeliveryType.TableDelivery]: i['deliveryType_tableDelivery'],
    default: i['deliveryType_notSet']
  };
  return map[type] || map.default;
};

const formatStringTool = (str: String, format: Object) => {
  Object.keys(format).forEach((key) => {
    str = str.replace(new RegExp('\\{' + key + '\\}', 'gi'), format[key])
  })
  return str
}

export const wholeAmount = wholeAmountTool
export const fractionAmount = fractionAmountTool
export const priceLabel = priceLabelTool
export const deliveryTypeLabel = deliveryTypeLabelTool
export const formatString = formatStringTool
export const orderStatusLabel = orderStatusLabelTool
export const orderStatusHeading = orderStatusHeadingTool
