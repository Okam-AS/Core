import { DinteroTerminalStatus } from '../../enums'

export class DinteroTerminalStatusResponse {
  sessionId: string;
  transactionId: string;
  status: DinteroTerminalStatus;
  // Raw Dintero transaction status (e.g. AUTHORIZED, CAPTURED, DECLINED).
  transactionStatus: string;
  rawSession: string;
  rawTransaction: string;
}
