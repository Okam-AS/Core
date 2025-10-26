import { DeliveryType, OrderStatus } from "../enums";
import dayjs from "dayjs";
import { useTranslation } from "../pinia";

const currencyInfoTool = () => {
  return {
    prefix: "",
    suffix: ",–",
    decimalSeparator: ",",
    thousandSeparator: " ",
    fractionLength: 2,
    symbol: "kr",
  };
};

const wholeAmountTool = (amount: Number): string => {
  if (!amount) {
    return "0";
  }
  const wholeAmount = amount.toString().slice(0, -2);
  return wholeAmount ? wholeAmount.replace(/\B(?=(\d{3})+(?!\d))/g, " ") : "0";
};

const fractionAmountTool = (amount: Number): string => {
  if (!amount) {
    return "00";
  }
  const fractionAmount = amount.toString().slice(-2);
  return fractionAmount.length < 2 ? "00" : fractionAmount;
};

const priceLabelTool = (totalPrice: Number, hideFractionIfZero: Boolean = false, hidePrefixAndSuffix: Boolean = false) => {
  const currencyInfo = currencyInfoTool();
  const wholeAmount = wholeAmountTool(totalPrice);
  let fraction = "";
  if (!hideFractionIfZero || parseInt(fractionAmountTool(totalPrice)) > 0) {
    fraction = "," + fractionAmountTool(totalPrice);
  }
  return (hidePrefixAndSuffix ? "" : currencyInfo.prefix) + wholeAmount + fraction + (hidePrefixAndSuffix ? "" : currencyInfo.suffix);
};

const orderStatusLabelTool = (type: OrderStatus) => {
  const map = {
    [OrderStatus.Accepted]: useTranslation().$i("orderStatus_accepted"),
    [OrderStatus.Processing]: useTranslation().$i("orderStatus_processing"),
    [OrderStatus.ReadyForPickup]: useTranslation().$i("orderStatus_readyForPickup"),
    [OrderStatus.ReadyForDriver]: useTranslation().$i("orderStatus_readyForDriver"),
    [OrderStatus.DriverPickedUp]: useTranslation().$i("orderStatus_driverPickedUp"),
    [OrderStatus.Served]: useTranslation().$i("orderStatus_served"),
    [OrderStatus.Completed]: useTranslation().$i("orderStatus_completed"),
    [OrderStatus.Canceled]: useTranslation().$i("orderStatus_canceled"),
    default: "",
  };
  return map[type] || map.default;
};

const orderStatusHeadingTool = (type: OrderStatus) => {
  const map = {
    [OrderStatus.Accepted]: useTranslation().$i("orderStatus_acceptedHeading"),
    [OrderStatus.Processing]: useTranslation().$i("orderStatus_processingHeading"),
    [OrderStatus.ReadyForPickup]: useTranslation().$i("orderStatus_readyForPickupHeading"),
    [OrderStatus.ReadyForDriver]: useTranslation().$i("orderStatus_readyForDriverHeading"),
    [OrderStatus.DriverPickedUp]: useTranslation().$i("orderStatus_driverPickedUpHeading"),
    [OrderStatus.Served]: useTranslation().$i("orderStatus_servedHeading"),
    [OrderStatus.Completed]: useTranslation().$i("orderStatus_completedHeading"),
    [OrderStatus.Canceled]: useTranslation().$i("orderStatus_canceledHeading"),
    default: "",
  };
  return map[type] || map.default;
};

const deliveryTypeLabelTool = (type: DeliveryType) => {
  const map = {
    [DeliveryType.SelfPickup]: useTranslation().$i("deliveryType_selfPickup"),
    [DeliveryType.InstantHomeDelivery]: useTranslation().$i("deliveryType_instantHomeDelivery"),
    [DeliveryType.DineHomeDelivery]: useTranslation().$i("deliveryType_dineHomeDelivery"),
    [DeliveryType.TableDelivery]: useTranslation().$i("deliveryType_tableDelivery"),
    [DeliveryType.WoltDelivery]: useTranslation().$i("deliveryType_woltDelivery"),
    [DeliveryType.WoltMarketplaceDelivery]: useTranslation().$i("deliveryType_woltMarketplaceDelivery"),
    default: useTranslation().$i("deliveryType_notSet"),
  };
  return map[type] || map.default;
};

const formatStringTool = (str: String, format: Object) => {
  Object.keys(format).forEach((key) => {
    str = str.replace(new RegExp("\\{" + key + "\\}", "gi"), format[key]);
  });
  return str;
};

const formatDateTimeTool = (dateTime, hideTime = false) => {
  return !dateTime ? "" : dayjs(dateTime).format(hideTime ? "DD.MM.YY" : "DD.MM.YY HH:mm");
};

export const currencyInfo = currencyInfoTool;
export const wholeAmount = wholeAmountTool;
export const fractionAmount = fractionAmountTool;
export const priceLabel = priceLabelTool;
export const deliveryTypeLabel = deliveryTypeLabelTool;
export const formatString = formatStringTool;
export const orderStatusLabel = orderStatusLabelTool;
export const orderStatusHeading = orderStatusHeadingTool;
export const formatDateTime = formatDateTimeTool;
