import { RequestService } from './request-service';
import { ICoreInitializer } from '../interfaces';
import {
  CashSaleRequest,
  CardInitiateRequest,
  CardCaptureRequest,
  CardVoidRequest,
  CardRefundRequest,
  CashRefundRequest,
  CardTimeoutRequest,
  CardInitiateResult,
  UnreferencedCashReturnRequest,
  UnreferencedCardReturnRequest,
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
  TerminalRefundResult,
  Category
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
    const { data, error } = this._requestService.TryParseResponseWithError(response);
    if (error) { throw new Error(error); }
    return data;
  }

  // --- Catalog ---

  // Whole-store product catalog for the sales grid (categories with product-list items + variants).
  // Store read access only — no operator session, so the grid can load before PIN login.
  public async GetCatalog(storeId: number): Promise<Array<Category>> {
    const response = await this._requestService.GetRequest('/pos/catalog/' + storeId);
    const parsed = this._requestService.TryParseResponse(response);
    if (parsed === undefined) { throw new Error('Failed to load POS catalog'); }
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
    const { data, error } = this._requestService.TryParseResponseWithError(response);
    if (error) { throw new Error(error); }
    return data;
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

  // Refunds a finalized cash sale (RETREC + cash out of the drawer). Requires a Leder-level PIN.
  public async RefundCash(journalEntryId: number, request: CashRefundRequest): Promise<PosReceiptModel> {
    const response = await this._requestService.PostRequest('/pos/payment/cash/' + journalEntryId + '/refund', request, this.sessionHeaders());
    const { data, error } = this._requestService.TryParseResponseWithError(response);
    if (error) { throw new Error(error); }
    return data;
  }

  // Polls a card refund awaiting cardholder approval on the terminal (the in-person refund is
  // asynchronous). Returns Confirmed with the Return receipt once it settles, otherwise Pending.
  public async RefundStatusCard(transactionId: string, cashPointId: number): Promise<TerminalRefundResult> {
    const response = await this._requestService.GetRequest('/pos/payment/card/' + transactionId + '/refund-status?cashPointId=' + encodeURIComponent(cashPointId), this.sessionHeaders());
    const parsed = this._requestService.TryParseResponse(response);
    if (parsed === undefined) { throw new Error('Failed to get refund status'); }
    return parsed;
  }

  // --- Unreferenced (open) returns: a refund rung in without an original sale ---

  // Unreferenced cash return: RETREC + cash out of the drawer, from operator-entered lines. Leder PIN.
  public async ReturnCash(request: UnreferencedCashReturnRequest): Promise<PosReceiptModel> {
    const response = await this._requestService.PostRequest('/pos/return/cash', request, this.sessionHeaders());
    const { data, error } = this._requestService.TryParseResponseWithError(response);
    if (error) { throw new Error(error); }
    return data;
  }

  // Initiate an unreferenced card return on the terminal (cardholder taps any card). Asynchronous —
  // poll the returned paymentTransactionId via RefundStatusCard until the RETREC is written.
  public async InitiateReturnCard(request: UnreferencedCardReturnRequest): Promise<TerminalRefundResult> {
    const response = await this._requestService.PostRequest('/pos/return/card/initiate', request, this.sessionHeaders());
    const { data, error } = this._requestService.TryParseResponseWithError(response);
    if (error) { throw new Error(error); }
    return data;
  }

  // Records a terminal timeout / offline and voids any authorization. Returns true on success.
  public async TerminalTimeout(transactionId: string, request: CardTimeoutRequest): Promise<boolean> {
    const response = await this._requestService.PostRequest('/pos/payment/card/' + transactionId + '/timeout', request, this.sessionHeaders());
    return this._requestService.TryParseResponse(response) !== undefined;
  }

  // --- Settlement (split / multi-tender) ---

  public async OpenSettlement(request: SettlementOpenRequest): Promise<SettlementModel> {
    const response = await this._requestService.PostRequest('/pos/settlement/open', request, this.sessionHeaders());
    const { data, error } = this._requestService.TryParseResponseWithError(response);
    if (error) { throw new Error(error); }
    return data;
  }

  // Resumes an in-progress (split) settlement after a refresh. Rejects when the settlement is not
  // found or the operator session is not on its cash point / store.
  public async GetSettlement(settlementId: string): Promise<SettlementModel> {
    const response = await this._requestService.GetRequest('/pos/settlement/' + settlementId, this.sessionHeaders());
    const parsed = this._requestService.TryParseResponse(response);
    if (parsed === undefined) { throw new Error('Failed to get settlement'); }
    return parsed;
  }

  public async AddSettlementAllocation(settlementId: string, request: SettlementAllocationRequest): Promise<SettlementAllocationResult> {
    const response = await this._requestService.PostRequest('/pos/settlement/' + settlementId + '/allocation', request, this.sessionHeaders());
    const { data, error } = this._requestService.TryParseResponseWithError(response);
    if (error) { throw new Error(error); }
    return data;
  }

  public async FinalizeSettlement(settlementId: string, request: SettlementActionRequest): Promise<PosReceiptModel> {
    const response = await this._requestService.PostRequest('/pos/settlement/' + settlementId + '/finalize', request, this.sessionHeaders());
    const { data, error } = this._requestService.TryParseResponseWithError(response);
    if (error) { throw new Error(error); }
    return data;
  }

  public async AbortSettlement(settlementId: string, request: SettlementActionRequest): Promise<SettlementModel> {
    const response = await this._requestService.PostRequest('/pos/settlement/' + settlementId + '/abort', request, this.sessionHeaders());
    const { data, error } = this._requestService.TryParseResponseWithError(response);
    if (error) { throw new Error(error); }
    return data;
  }
}
