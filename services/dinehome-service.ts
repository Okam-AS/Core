import { ICoreInitializer } from "../interfaces";
import { RequestService } from "./request-service";
import { DineHomeDeliveryTimesRequest, DineHomeDeliveryTimesResponse } from "../models";

export class DineHomeService {
	private _requestService: RequestService;

	constructor(coreInitializer: ICoreInitializer) {
		this._requestService = new RequestService(coreInitializer);
	}

	public async getDeliveryTimes(request: DineHomeDeliveryTimesRequest): Promise<DineHomeDeliveryTimesResponse[]> {
		const response = await this._requestService.PostRequest("/dinehome/delivery-times", request);
		const parsedResponse = this._requestService.TryParseResponse(response);
		if (parsedResponse === undefined) {
			throw new Error("Failed to get delivery times");
		}

		return parsedResponse;
	}
}
