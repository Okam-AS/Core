/**
 * C1 deliberately re-exports the accepted C0 implementation. A checkout must
 * not accidentally acquire a second money formatter or a second minor-unit /
 * VAT arithmetic while C0 and C1 coexist.
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
  vatFromGross,
  type Money,
  type MoneyErrorCode,
  type Permille,
  type VatBreakdown,
} from '../../../c0/domain/v1/money';
