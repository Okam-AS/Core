/**
 * C1 deliberately re-exports the accepted C0 implementation. A checkout must
 * not accidentally acquire a second money formatter while C0 and C1 coexist.
 */
export {
  formatMoneyMinor,
  MoneyError,
  roundCashAmountMinor,
  roundMinorToIncrement,
  type MoneyErrorCode,
} from '../../../c0/domain/v1/money';
