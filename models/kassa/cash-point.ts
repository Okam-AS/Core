import { TerminalProvider } from '../../enums';

export class CashPoint {
  cashPointId: number;
  storeId: number;
  name: string;
  registerId: string;
  dinteroStoreId: string;
  dinteroTerminalId: string;
  dinteroPayoutDestinationId: string;
  dinteroProfileId: string;
  surfboardTerminalId: string;
  surfboardAutoPrintReceipt: boolean;
  // Store-level rollout flag for split payments (partial payments), projected onto the cash point
  // by the backend so the POS can hide the action when it is off (the server enforces it anyway).
  partialPaymentsEnabled: boolean;
  // Whether the resolved terminal provider supports unreferenced (open) card returns AND the
  // acquirer has enabled them on the account; projected by the backend so the POS hides the card
  // option in the unreferenced-return flow (the server refuses the initiate regardless).
  unreferencedCardReturnEnabled: boolean;
  terminalProvider: TerminalProvider;
  isActive: boolean;
  grandTotalSales: number;
  grandTotalReturns: number;
  grandTotalNet: number;
  grandTotalTips: number;
  maxCashDifference: number;
  // When true, switching the active operator needs no PIN (default false).
  allowFastOperatorSwitch: boolean;
  created: Date;
}

export class CashPointUpsertModel {
  storeId: number;
  name: string;
  registerId: string;
  dinteroStoreId: string;
  dinteroTerminalId: string;
  dinteroPayoutDestinationId: string;
  dinteroProfileId: string;
  surfboardTerminalId: string;
  surfboardAutoPrintReceipt: boolean;
  terminalProvider: TerminalProvider;
  isActive: boolean;
  maxCashDifference: number;
  allowFastOperatorSwitch: boolean;
}
