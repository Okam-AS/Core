import $config from "../helpers/configuration";
import { Order } from "../models";
import { OrderStatus, MutationName } from "../enums";
import { IVuexModule } from "../interfaces";
import { RequestService } from "./request-service";

export class OrderService {
  private _requestService: RequestService;
  private _vuexModule: IVuexModule;

  constructor(vuexModule: IVuexModule) {
    this._requestService = new RequestService(vuexModule, $config.okamApiBaseUrl);
    this._vuexModule = vuexModule;
  }

  public async CompleteAll(storeId: number): Promise<Array<Order>> {
    const response = await this._requestService.PostRequest("/orders/complete-all/" + storeId);
    const parsedResponse = this._requestService.TryParseResponse(response);
    if (parsedResponse === undefined) {
      throw new Error("Failed to complete all orders");
    }

    return parsedResponse;
  }

  public async GetAll(): Promise<Array<Order>> {
    const response = await this._requestService.GetRequest("/orders");
    const parsedResponse = this._requestService.TryParseResponse(response);
    if (parsedResponse === undefined) {
      throw new Error("Failed to get orders");
    }

    return parsedResponse;
  }

  public async GetAllOngoing(): Promise<Array<Order>> {
    const response = await this._requestService.GetRequest("/orders/ongoing");
    const parsedResponse = this._requestService.TryParseResponse(response);
    if (parsedResponse === undefined) {
      throw new Error("Failed to get orders");
    }

    return parsedResponse;
  }

  public async UpdateStatus(orderId: string, status: OrderStatus): Promise<Order> {
    const response = await this._requestService.PutRequest("/orders/update/", { id: orderId, status });
    const parsedResponse = this._requestService.TryParseResponse(response);
    if (parsedResponse === undefined) {
      throw new Error("Failed to update orderstatus");
    }

    return parsedResponse;
  }

  public async Refund(orderId: string): Promise<boolean> {
    const response = await this._requestService.GetRequest("/orders/refund/" + orderId);
    const parsedResponse = this._requestService.TryParseResponse(response);
    if (parsedResponse === undefined) {
      throw new Error("Failed to refund order");
    }

    return parsedResponse;
  }

  public async GetStoresOrders(storeId: number, partially: boolean): Promise<Array<Order>> {
    const response = await this._requestService.GetRequest("/orders/store/" + storeId + "?partially=" + (partially === true));
    const parsedResponse = this._requestService.TryParseResponse(response);
    if (parsedResponse === undefined) {
      throw new Error("Failed to get orders");
    }
    return parsedResponse;
  }

  public async Processing(orderId: string, remainingMinutes: number, remainingMinutesToStartProcessing: number = 0): Promise<Order> {
    const response = await this._requestService.PutRequest("/orders/processing/", { id: orderId, remainingMinutes, remainingMinutesToStartProcessing });
    const parsedResponse = this._requestService.TryParseResponse(response);
    if (parsedResponse === undefined) {
      throw new Error("Failed to update orderstatus");
    }

    return parsedResponse;
  }

  public GetOrdersAndSetState = (thenHandler?, catchHandler?) => {
    const comp = this;
    comp
      .GetAll()
      .then((orders) => {
        if (comp._vuexModule.commit && Array.isArray(orders)) {
          comp._vuexModule.commit(MutationName.SetOrders, orders);
        }
        if (thenHandler) {
          thenHandler(orders);
        }
      })
      .catch(() => {
        if (catchHandler) {
          catchHandler();
        }
      });
  };

  public GetStoresOrdersAndSetState = (storeId, partially = false, thenHandler?, catchHandler?) => {
    if (!storeId || storeId < 1) {
      return;
    }
    const comp = this;
    comp
      .GetStoresOrders(storeId, partially)
      .then((orders) => {
        if (Array.isArray(orders)) {
          comp._vuexModule.commit(MutationName.SetOrders, orders);
        }
        if (thenHandler) {
          thenHandler(orders);
        }
      })
      .catch(() => {
        if (catchHandler) {
          catchHandler();
        }
      });
  };
}
