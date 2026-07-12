import { TerminalProvider } from '../../enums/terminal-provider'

export class StorePaymentConfig {
  payInStoreAvailable: boolean;
  stripeAvailable: boolean;
  vippsAvailable: boolean;
  giftcardAvailable: boolean;
  dinteroAvailable: boolean;
  dinteroPrice: number;
  dinteroBillieAvailable: boolean;
  dinteroKlarnaAvailable: boolean;
  dinteroBilliePrice: string;
  dinteroKlarnaPrice: string;
  surfboardAvailable: boolean;
  surfboardPrice: string;
  // In-person (POS/terminal) card acquirer for the store. Auto falls back to the per-cash-point rule.
  terminalProvider: TerminalProvider;
}