import { Feedback } from "../models";
import { ICoreInitializer } from "../interfaces";
import { RequestService } from "./request-service";

export class FeedbackService {
  private _requestService: RequestService;

  constructor(coreInitializer: ICoreInitializer) {
    this._requestService = new RequestService(coreInitializer);
  }

  public async FeedbackShown(): Promise<boolean> {
    const response = await this._requestService.PutRequest("/feedback/shown");
    const parsedResponse = this._requestService.TryParseResponse(response);
    if (parsedResponse === undefined) {
      throw new Error("Kunne ikke markere feedback som vist");
    }
    return parsedResponse;
  }

  public async CreateFeedback(model: Feedback): Promise<boolean> {
    const response = await this._requestService.PostRequest("/feedback", model);
    const parsedResponse = this._requestService.TryParseResponse(response);
    if (parsedResponse === undefined) {
      throw new Error("Kunne ikke opprette feedback");
    }
    return parsedResponse;
  }
}
