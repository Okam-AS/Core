import { FloorPlan, TableDeleteResult, ReservationSettings } from "../models";
import { ICoreInitializer } from "../interfaces";
import { RequestService } from "./";

// Floor plan (zones + tables) and reservation settings administration. The editor works on the
// whole map at once, so the plan is read via GET and saved via a single bulk-upsert POST. Maps
// to the API's TableController (/Table/...).
export class TableService {
  private _requestService: RequestService;

  constructor(coreInitializer: ICoreInitializer) {
    this._requestService = new RequestService(coreInitializer);
  }

  public async GetFloorPlan(storeId: number): Promise<FloorPlan> {
    const response = await this._requestService.GetRequest("/Table/" + storeId);
    const parsedResponse = this._requestService.TryParseResponse(response);
    if (parsedResponse === undefined) {
      throw new Error("Failed to get floor plan");
    }
    return parsedResponse;
  }

  public async SaveFloorPlan(storeId: number, plan: FloorPlan): Promise<FloorPlan> {
    const response = await this._requestService.PostRequest("/Table/" + storeId, plan);
    const { data, error } = this._requestService.TryParseResponseWithError(response);
    if (error) {
      throw new Error(error);
    }
    return data;
  }

  public async DeleteTable(storeId: number, tableId: number): Promise<TableDeleteResult> {
    const response = await this._requestService.DeleteRequest("/Table/" + storeId + "/" + tableId);
    const { data, error } = this._requestService.TryParseResponseWithError(response);
    if (error) {
      throw new Error(error);
    }
    return data;
  }

  public async GetReservationSettings(storeId: number): Promise<ReservationSettings> {
    const response = await this._requestService.GetRequest("/Table/" + storeId + "/reservation-settings");
    const parsedResponse = this._requestService.TryParseResponse(response);
    if (parsedResponse === undefined) {
      throw new Error("Failed to get reservation settings");
    }
    return parsedResponse;
  }

  public async SaveReservationSettings(storeId: number, settings: ReservationSettings): Promise<ReservationSettings> {
    const response = await this._requestService.PutRequest("/Table/" + storeId + "/reservation-settings", settings);
    const { data, error } = this._requestService.TryParseResponseWithError(response);
    if (error) {
      throw new Error(error);
    }
    return data;
  }
}
