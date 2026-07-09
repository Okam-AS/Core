import { RequestService } from "./request-service";
import { ICoreInitializer } from "../interfaces";
import { DinteroTerminalStatus } from "../enums";
import {
  DinteroTerminalInitiateModel,
  DinteroTerminalInitResponse,
  DinteroTerminalStatusResponse,
  DinteroTerminalRawResponse,
  DinteroTerminalRefundModel,
  DinteroTerminalOperationModel,
  DinteroTerminalDiagnosticsResponse
} from "../models";

// Connector for the Dintero in-person (terminal / POS) sandbox endpoints (DinteroTerminalController).
export class DinteroTerminalService {
  private _requestService: RequestService;

  constructor(coreInitializer: ICoreInitializer) {
    this._requestService = new RequestService(coreInitializer);
  }

  public async Initiate(model: DinteroTerminalInitiateModel): Promise<DinteroTerminalInitResponse> {
    const response = await this._requestService.PostRequest("/dinteroterminal/initiate", model);
    const parsedResponse = this._requestService.TryParseResponse(response);
    if (parsedResponse === undefined) {
      throw new Error("Failed to initiate Dintero terminal payment");
    }
    return parsedResponse;
  }

  public async GetStatus(sessionId: string): Promise<DinteroTerminalStatusResponse> {
    const response = await this._requestService.GetRequest("/dinteroterminal/status/" + sessionId);
    const parsedResponse = this._requestService.TryParseResponse(response);
    if (parsedResponse === undefined) {
      throw new Error("Failed to fetch Dintero terminal status");
    }
    return parsedResponse;
  }

  public async Cancel(sessionId: string): Promise<DinteroTerminalRawResponse> {
    const response = await this._requestService.PostRequest("/dinteroterminal/cancel/" + sessionId, {});
    const parsedResponse = this._requestService.TryParseResponse(response);
    if (parsedResponse === undefined) {
      throw new Error("Failed to cancel Dintero terminal session");
    }
    return parsedResponse;
  }

  public async Refund(transactionId: string, model: DinteroTerminalRefundModel): Promise<DinteroTerminalRawResponse> {
    const response = await this._requestService.PostRequest("/dinteroterminal/refund/" + transactionId, model);
    const parsedResponse = this._requestService.TryParseResponse(response);
    if (parsedResponse === undefined) {
      throw new Error("Failed to refund Dintero terminal transaction");
    }
    return parsedResponse;
  }

  public async SendOperation(model: DinteroTerminalOperationModel): Promise<DinteroTerminalRawResponse> {
    const response = await this._requestService.PostRequest("/dinteroterminal/operation", model);
    const parsedResponse = this._requestService.TryParseResponse(response);
    if (parsedResponse === undefined) {
      throw new Error("Failed to send Dintero terminal operation");
    }
    return parsedResponse;
  }

  public async Diagnostics(): Promise<DinteroTerminalDiagnosticsResponse> {
    const response = await this._requestService.GetRequest("/dinteroterminal/diagnostics");
    const parsedResponse = this._requestService.TryParseResponse(response);
    if (parsedResponse === undefined) {
      throw new Error("Failed to run Dintero terminal diagnostics");
    }
    return parsedResponse;
  }

  // Poll session status until it resolves to Success/Fail. Returns a cancel function.
  public PullStatusResult(sessionId: string, onUpdate, onSuccess, onFail): () => void {
    let stopped = false;
    let intervalId;
    const stop = () => {
      stopped = true;
      if (intervalId) clearInterval(intervalId);
    };
    const handle = (result: DinteroTerminalStatusResponse) => {
      if (onUpdate) onUpdate(result);
      if (result.status === DinteroTerminalStatus.Success) {
        stop();
        if (onSuccess) onSuccess(result);
      } else if (result.status === DinteroTerminalStatus.Fail) {
        stop();
        if (onFail) onFail(result);
      }
    };
    const poll = () => {
      this.GetStatus(sessionId)
        .then((result) => { if (!stopped) handle(result); })
        .catch(() => { /* keep polling; transient errors are expected while the terminal prompts */ });
    };
    poll();
    intervalId = setInterval(poll, 2000);
    return stop;
  }
}
