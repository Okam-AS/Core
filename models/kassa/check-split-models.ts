import { CheckSplitMode } from '../../enums';

export class CheckSplitRequest {
  mode: CheckSplitMode;
  partCount: number | null;
  parts: Array<CheckSplitPartRequest>;
}

export class CheckSplitPartRequest {
  orderLineItemIds: Array<string>;
}

export class CheckSplitModel {
  checkSplitId: string;
  orderId: number;
  storeId: number;
  cashPointId: number;
  mode: CheckSplitMode;
  partCount: number;
  totalAmount: number;
  created: Date;
  parts: Array<CheckSplitPartModel>;
}

export class CheckSplitPartModel {
  partNumber: number;
  partOrderId: number;
  posSettlementId: string;
  amount: number;
  taxBreakdown: Array<CheckSplitTaxModel>;
}

export class CheckSplitTaxModel {
  vatPercent: number;
  gross: number;
  basis: number;
  vatAmount: number;
}
