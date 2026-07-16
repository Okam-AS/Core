import { PosReasonType } from '../../enums';

export class ApplyLineDiscountRequest {
  // The targeted lines — typically every member line behind one visible POS row. A percentage is
  // taken off each line; a fixed amount is granted once and split proportionally across them.
  lineIds: string[];
  regularDiscountId: string;
}

export class ApplyOrderDiscountRequest {
  regularDiscountId: string;
}

// The acting operator authorizes the void. A predefined reason type is recorded for the audit trail
// (optional at the backend; the UI offers fixed reason buttons). reasonText is only used for Annet.
export class VoidCheckRequest {
  reasonType: PosReasonType;
  reasonText: string;
}
