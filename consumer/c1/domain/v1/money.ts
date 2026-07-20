/**
 * C1 deliberately re-exports the accepted C0 implementation. A checkout must
 * not accidentally acquire a second money formatter or a second minor-unit
 * arithmetic while C0 and C1 coexist. (There is no client-side VAT: the backend
 * is the sole VAT authority — see the C0 money module note.)
 */
export {
  addMoney,
  currencyForMarket,
  formatMoney,
  formatMoneyMinor,
  makeMoney,
  marketForCurrency,
  MoneyError,
  multiplyMoneyByQuantity,
  roundCashAmountMinor,
  roundMinorToIncrement,
  subtractMoney,
  type Money,
  type MoneyErrorCode,
} from '../../../c0/domain/v1/money';
