import { DeliveryType, OrderStatus } from "../enums";
import dayjs from "dayjs";
import { formatLegacyPriceLabelV1 } from "../consumer-domain/legacy/money";

let _translationProvider: (() => { $i: (key: string) => string }) | null = null;

export function setTranslationProvider(provider: () => { $i: (key: string) => string }) {
  _translationProvider = provider;
}

function getTranslation() {
  if (_translationProvider) {
    return _translationProvider();
  }
  return { $i: (key: string) => key };
}

type CurrencyFormatOverride = Partial<{ prefix: string; suffix: string; decimalSeparator: string; thousandSeparator: string; fractionLength: number; symbol: string }>;
let _currencyFormatOverride: CurrencyFormatOverride | null = null;

// Apps may override the display format (e.g. admin keeps the "kr " prefix). Defaults to the consumer "100,–" format.
export function setCurrencyFormat(override: CurrencyFormatOverride) {
  _currencyFormatOverride = override;
}

const currencyInfoTool = () => {
  const base = {
    prefix: "",
    suffix: ",–",
    decimalSeparator: ",",
    thousandSeparator: " ",
    fractionLength: 2,
    symbol: "kr",
  };
  return _currencyFormatOverride ? { ...base, ..._currencyFormatOverride } : base;
};

const wholeAmountTool = (amount: Number, thousandSeparator: string = " "): string => {
  if (!amount) {
    return "0";
  }
  const wholeAmount = amount.toString().slice(0, -2);
  return wholeAmount ? wholeAmount.replace(/\B(?=(\d{3})+(?!\d))/g, thousandSeparator) : "0";
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
  // Keep the legacy public helper's permissive behavior while moving the
  // formatting implementation behind the framework-free compatibility adapter.
  return formatLegacyPriceLabelV1(totalPrice, {
    prefix: currencyInfo.prefix,
    suffix: currencyInfo.suffix,
    decimalSeparator: currencyInfo.decimalSeparator,
    thousandSeparator: currencyInfo.thousandSeparator,
    fractionDigits: currencyInfo.fractionLength,
  }, hideFractionIfZero, hidePrefixAndSuffix);
};

const orderStatusLabelTool = (type: OrderStatus) => {
  const t = getTranslation();
  const map = {
    [OrderStatus.Accepted]: t.$i("orderStatus_accepted"),
    [OrderStatus.Processing]: t.$i("orderStatus_processing"),
    [OrderStatus.ReadyForPickup]: t.$i("orderStatus_readyForPickup"),
    [OrderStatus.ReadyForDriver]: t.$i("orderStatus_readyForDriver"),
    [OrderStatus.DriverPickedUp]: t.$i("orderStatus_driverPickedUp"),
    [OrderStatus.Served]: t.$i("orderStatus_served"),
    [OrderStatus.Completed]: t.$i("orderStatus_completed"),
    [OrderStatus.Canceled]: t.$i("orderStatus_canceled"),
    default: "",
  };
  return map[type] || map.default;
};

const orderStatusHeadingTool = (type: OrderStatus) => {
  const t = getTranslation();
  const map = {
    [OrderStatus.Accepted]: t.$i("orderStatus_acceptedHeading"),
    [OrderStatus.Processing]: t.$i("orderStatus_processingHeading"),
    [OrderStatus.ReadyForPickup]: t.$i("orderStatus_readyForPickupHeading"),
    [OrderStatus.ReadyForDriver]: t.$i("orderStatus_readyForDriverHeading"),
    [OrderStatus.DriverPickedUp]: t.$i("orderStatus_driverPickedUpHeading"),
    [OrderStatus.Served]: t.$i("orderStatus_servedHeading"),
    [OrderStatus.Completed]: t.$i("orderStatus_completedHeading"),
    [OrderStatus.Canceled]: t.$i("orderStatus_canceledHeading"),
    default: "",
  };
  return map[type] || map.default;
};

const deliveryTypeLabelTool = (type: DeliveryType) => {
  const t = getTranslation();
  const map = {
    [DeliveryType.SelfPickup]: t.$i("deliveryType_selfPickup"),
    [DeliveryType.InstantHomeDelivery]: t.$i("deliveryType_instantHomeDelivery"),
    [DeliveryType.DineHomeDelivery]: t.$i("deliveryType_dineHomeDelivery"),
    [DeliveryType.TableDelivery]: t.$i("deliveryType_tableDelivery"),
    [DeliveryType.WoltDelivery]: t.$i("deliveryType_woltDelivery"),
    [DeliveryType.WoltMarketplaceDelivery]: t.$i("deliveryType_woltMarketplaceDelivery"),
    default: t.$i("deliveryType_notSet"),
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
