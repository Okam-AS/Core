export class OperatorUpsertModel {
  storeId: number;
  displayName: string;
  applicationUserId: string | null;
  isActive: boolean;
  pin: string | null;
}

export class SetOperatorPinRequest {
  pin: string | null;
}

export class OperatorModel {
  operatorId: number;
  storeId: number;
  displayName: string;
  isActive: boolean;
  hasPin: boolean;
  isLockedOut: boolean;
  applicationUserId: string | null;
  created: Date;
}

export class OperatorLoginRequest {
  cashPointId: number;
  operatorId: number;
  pin: string;
  deviceInfo: string | null;
}

export class OperatorSessionModel {
  operatorSessionId: string;
  operatorId: number;
  operatorName: string | null;
  storeId: number;
  cashPointId: number;
  startedAt: Date;
}
