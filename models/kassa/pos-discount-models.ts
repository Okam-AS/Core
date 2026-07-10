export class ApplyLineDiscountRequest {
  lineId: string;
  discountReasonId: number;
  approverOperatorId: number;
  pin: string;
}

export class ApplyOrderDiscountRequest {
  discountReasonId: number;
  approverOperatorId: number;
  pin: string;
}

export class VoidCheckRequest {
  approverOperatorId: number;
  pin: string;
  reason: string;
}
