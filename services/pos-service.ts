import { RequestService } from './request-service';
import { ICoreInitializer } from '../interfaces';
import {
  CashSaleRequest,
  CardInitiateRequest,
  CardCaptureRequest,
  CardVoidRequest,
  CardRefundRequest,
  CardTimeoutRequest,
  CardInitiateResult,
  CopyReceiptRequest,
  ProvisionalReceiptRequest,
  TrainingReceiptRequest,
  ReceiptSmsRequest,
  ReceiptSmsResult,
  SettlementOpenRequest,
  SettlementAllocationRequest,
  SettlementActionRequest,
  SettlementAllocationResult,
  SettlementModel,
  PosReceiptModel,
  TerminalCaptureResult,
  TerminalVoidResult,
  TerminalRefundResult
} from '../models';

// POS sale / card payment / settlement / receipt operations (PosController, base /pos). Every
// endpoint requires the operator session: set operatorSessionId after Operator/login so the
// X-Operator-Session header is sent on each call.
export class PosService {
  private _requestService: RequestService;
  public operatorSessionId: string = '';

  constructor(coreInitializer: ICoreInitializer) {
    this._requestService = new RequestService(coreInitializer);
  }

  private sessionHeaders(): Record<string, string> | undefined {
    return this.operatorSessionId ? { 'X-Operator-Session': this.operatorSessionId } : undefined;
  }

  // --- Cash sale ---

  public async PayCash(request: CashSaleRequest): Promise<PosReceiptModel> {
    const response = await this._requestService.PostRequest('/pos/payment/cash', request, this.sessionHeaders());
    const parsed = this._requestService.TryParseResponse(response);
    if (parsed === undefined) { throw new Error('Failed to take cash payment'); }
    return parsed;
  }

  // --- Receipts ---

  public async GetReceipt(journalEntryId: number): Promise<PosReceiptModel> {
    const response = await this._requestService.GetRequest('/pos/receipt/' + journalEntryId, this.sessionHeaders());
    const parsed = this._requestService.TryParseResponse(response);
    if (parsed === undefined) { throw new Error('Failed to get receipt'); }
    return parsed;
  }

  public async CopyReceipt(journalEntryId: number, request: CopyReceiptRequest): Promise<PosReceiptModel> {
    const response = await this._requestService.PostRequest('/pos/receipt/' + journalEntryId + '/copy', request, this.sessionHeaders());
    const parsed = this._requestService.TryParseResponse(response);
    if (parsed === undefined) { throw new Error('Failed to copy receipt'); }
    return parsed;
  }

  public async ProvisionalReceipt(request: ProvisionalReceiptRequest): Promise<PosReceiptModel> {
    const response = await this._requestService.PostRequest('/pos/receipt/provisional', request, this.sessionHeaders());
    const parsed = this._requestService.TryParseResponse(response);
    if (parsed === undefined) { throw new Error('Failed to produce provisional receipt'); }
    return parsed;
  }

  public async TrainingReceipt(request: TrainingReceiptRequest): Promise<PosReceiptModel> {
    const response = await this._requestService.PostRequest('/pos/receipt/training', request, this.sessionHeaders());
    const parsed = this._requestService.TryParseResponse(response);
    if (parsed === undefined) { throw new Error('Failed to produce training receipt'); }
    return parsed;
  }

  public async SendReceiptSms(journalEntryId: number, request: ReceiptSmsRequest): Promise<ReceiptSmsResult> {
    const response = await this._requestService.PostRequest('/pos/receipt/' + journalEntryId + '/sms', request, this.sessionHeaders());
    const parsed = this._requestService.TryParseResponse(response);
    if (parsed === undefined) { throw new Error('Failed to send receipt SMS'); }
    return parsed;
  }

  // --- Card payment (terminal) ---

  // Starts an in-person card payment; poll status via the terminal provider or wait for the callback.
  public async InitiateCard(request: CardInitiateRequest): Promise<CardInitiateResult> {
    const response = await this._requestService.PostRequest('/pos/payment/card/initiate', request, this.sessionHeaders());
    const parsed = this._requestService.TryParseResponse(response);
    if (parsed === undefined) { throw new Error('Failed to initiate card payment'); }
    return parsed;
  }

  public async CaptureCard(transactionId: string, request: CardCaptureRequest): Promise<TerminalCaptureResult> {
    const response = await this._requestService.PostRequest('/pos/payment/card/' + transactionId + '/capture', request, this.sessionHeaders());
    const parsed = this._requestService.TryParseResponse(response);
    if (parsed === undefined) { throw new Error('Failed to capture card payment'); }
    return parsed;
  }

  public async VoidCard(transactionId: string, request: CardVoidRequest): Promise<TerminalVoidResult> {
    const response = await this._requestService.PostRequest('/pos/payment/card/' + transactionId + '/void', request, this.sessionHeaders());
    const parsed = this._requestService.TryParseResponse(response);
    if (parsed === undefined) { throw new Error('Failed to void card payment'); }
    return parsed;
  }

  // Refunds a finalized card sale. Requires a Leder-level operator PIN (carried in the request).
  public async RefundCard(transactionId: string, request: CardRefundRequest): Promise<TerminalRefundResult> {
    const response = await this._requestService.PostRequest('/pos/payment/card/' + transactionId + '/refund', request, this.sessionHeaders());
    const parsed = this._requestService.TryParseResponse(response);
    if (parsed === undefined) { throw new Error('Failed to refund card payment'); }
    return parsed;
  }

  // Records a terminal timeout / offline and voids any authorization. Returns true on success.
  public async TerminalTimeout(transactionId: string, request: CardTimeoutRequest): Promise<boolean> {
    const response = await this._requestService.PostRequest('/pos/payment/card/' + transactionId + '/timeout', request, this.sessionHeaders());
    return this._requestService.TryParseResponse(response) !== undefined;
  }

  // --- Settlement (split / multi-tender) ---

  public async OpenSettlement(request: SettlementOpenRequest): Promise<SettlementModel> {
    const response = await this._requestService.PostRequest('/pos/settlement/open', request, this.sessionHeaders());
    const parsed = this._requestService.TryParseResponse(response);
    if (parsed === undefined) { throw new Error('Failed to open settlement'); }
    return parsed;
  }

  public async AddSettlementAllocation(settlementId: string, request: SettlementAllocationRequest): Promise<SettlementAllocationResult> {
    const response = await this._requestService.PostRequest('/pos/settlement/' + settlementId + '/allocation', request, this.sessionHeaders());
    const parsed = this._requestService.TryParseResponse(response);
    if (parsed === undefined) { throw new Error('Failed to add settlement allocation'); }
    return parsed;
  }

  public async FinalizeSettlement(settlementId: string, request: SettlementActionRequest): Promise<PosReceiptModel> {
    const response = await this._requestService.PostRequest('/pos/settlement/' + settlementId + '/finalize', request, this.sessionHeaders());
    const parsed = this._requestService.TryParseResponse(response);
    if (parsed === undefined) { throw new Error('Failed to finalize settlement'); }
    return parsed;
  }

  public async AbortSettlement(settlementId: string, request: SettlementActionRequest): Promise<SettlementModel> {
    const response = await this._requestService.PostRequest('/pos/settlement/' + settlementId + '/abort', request, this.sessionHeaders());
    const parsed = this._requestService.TryParseResponse(response);
    if (parsed === undefined) { throw new Error('Failed to abort settlement'); }
    return parsed;
  }
}
