import { Config } from "../models";
import { ICoreInitializer } from "../interfaces";
import { RequestService, UserService } from "./";

export class ConfigService {
  private _requestService: RequestService;

  constructor(coreInitializer: ICoreInitializer) {
    this._requestService = new RequestService(coreInitializer);
  }
  public async Get(): Promise<Config> {
    const response = await this._requestService.GetRequest("/config");
    const parsedResponse = this._requestService.TryParseResponse(response);
    if (parsedResponse === undefined) {
      throw new Error("Failed to get config");
    }

    return parsedResponse;
  }
}
