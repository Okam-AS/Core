import { RequestService } from "./request-service";
import { ICoreInitializer } from "../interfaces";
import { FloorPlanModel, TableDeleteResult, ReservationSettingsModel } from "../models";

export class TableService {
  private _requestService: RequestService;

  constructor(coreInitializer: ICoreInitializer) {
    this._requestService = new RequestService(coreInitializer);
  }

  public async GetFloorPlan(storeId: number): Promise<FloorPlanModel> {
    const response = await this._requestService.GetRequest("/Table/" + storeId);
    const parsed = this._requestService.TryParseResponse(response);
    if (parsed === undefined) {
      throw new Error("Failed to get floor plan");
    }
    return parsed;
  }

  public async SaveFloorPlan(storeId: number, model: FloorPlanModel): Promise<FloorPlanModel> {
    const response = await this._requestService.PostRequest("/Table/" + storeId, model);
    const parsed = this._requestService.TryParseResponse(response);
    if (parsed === undefined) {
      throw new Error("Failed to save floor plan");
    }
    return parsed;
  }

  public async DeleteTable(storeId: number, tableId: number): Promise<TableDeleteResult> {
    const response = await this._requestService.DeleteRequest("/Table/" + storeId + "/" + tableId);
    const parsed = this._requestService.TryParseResponse(response);
    if (parsed === undefined) {
      throw new Error("Failed to delete table");
    }
    return parsed;
  }

  public async GetReservationSettings(storeId: number): Promise<ReservationSettingsModel> {
    const response = await this._requestService.GetRequest("/Table/" + storeId + "/reservation-settings");
    const parsed = this._requestService.TryParseResponse(response);
    if (parsed === undefined) {
      throw new Error("Failed to get reservation settings");
    }
    return parsed;
  }

  public async SaveReservationSettings(storeId: number, model: ReservationSettingsModel): Promise<ReservationSettingsModel> {
    const response = await this._requestService.PutRequest("/Table/" + storeId + "/reservation-settings", model);
    const parsed = this._requestService.TryParseResponse(response);
    if (parsed === undefined) {
      throw new Error("Failed to save reservation settings");
    }
    return parsed;
  }
}
