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
  terminalProvider: TerminalProvider;
  isActive: boolean;
  grandTotalSales: number;
  grandTotalReturns: number;
  grandTotalNet: number;
  grandTotalTips: number;
  maxCashDifference: number;
  // Internal-control gates (default true): require a Godkjenner to authorize money-out actions.
  requireManagerForVoid: boolean;
  requireManagerForRefund: boolean;
  requireManagerForReturn: boolean;
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
  requireManagerForVoid: boolean;
  requireManagerForRefund: boolean;
  requireManagerForReturn: boolean;
  allowFastOperatorSwitch: boolean;
}
