import $config from "../helpers/configuration";
import { RequestService } from "./request-service";
import { IVuexModule } from "../interfaces";
import { DineHomeDeliveryTimesRequest, DineHomeDeliveryTimesResponse } from "../models";

export class DineHomeService {
	private _requestService: RequestService;

	constructor(vuexModule: IVuexModule) {
		this._requestService = new RequestService(vuexModule, $config.okamApiBaseUrl);
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