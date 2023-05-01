import { DeliveryType } from "../enums"

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

const deliveryTypeLabelTool = (type: DeliveryType, i: Object) => {
  const labels = {
    [DeliveryType.SelfPickup]: i['deliveryType_selfPickup'] || 'Hent selv',
    [DeliveryType.InstantHomeDelivery]: i['deliveryType_instantHomeDelivery'] || 'Hjemlevering',
    [DeliveryType.GroupedHomeDelivery]: i['deliveryType_groupedHomeDelivery'] || 'Hjemlevering',
    [DeliveryType.TableDelivery]: i['deliveryType_tableDelivery'] || 'Spis inne',
    default: i['deliveryType_notSet'] || 'Ikke valgt'
  };

  return labels[type] || labels.default;
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
