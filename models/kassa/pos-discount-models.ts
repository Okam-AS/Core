export class ApplyLineDiscountRequest {
  lineId: string;
  regularDiscountId: string;
  approverOperatorId: number;
  pin: string;
}

export class ApplyOrderDiscountRequest {
  regularDiscountId: string;
  approverOperatorId: number;
  pin: string;
}

export class VoidCheckRequest {
  approverOperatorId: number;
  pin: string;
  reason: string;
}
