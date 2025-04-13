import $config from '../helpers/configuration'
import { IVuexModule } from '../interfaces'
import { AssignManagerModel, KamDirectorRelationshipModel, KamUserModel } from '../models'
import { RequestService } from './'

export class KamService {
  private _requestService: RequestService;
  private _vuexModule: IVuexModule;

  constructor(vuexModule: IVuexModule) {
    this._requestService = new RequestService(vuexModule, $config.okamApiBaseUrl)
    this._vuexModule = vuexModule
  }

  /**
   * Gets all Key Account Managers
   * @returns Promise with array of Key Account Managers
   */
  public async GetAllKeyAccountManagers(): Promise<KamUserModel[]> {
    const response = await this._requestService.GetRequest('/kam/all');
    const parsedResponse = this._requestService.TryParseResponse(response);
    if (parsedResponse === undefined) { throw new Error('Failed to get Key Account Managers') }

    return parsedResponse;
  }

  /**
   * Assigns a director to a Key Account Manager
   * @param kamId The ID of the Key Account Manager
   * @param directorId The ID of the director to assign
   * @returns Promise with boolean indicating success
   */
  public async AssignManager(kamId: string, directorId: string): Promise<boolean> {
    try {
      const model: AssignManagerModel = {
        kamId,
        directorId
      };

      const response = await this._requestService.PostRequest('/kam/assign-manager', model);
      const parsedResponse = this._requestService.TryParseResponse(response);

      if (parsedResponse === undefined) {
        throw new Error('Failed to assign manager');
      }

      return parsedResponse.success === true;
    } catch (error) {
      console.error('Error in AssignManager:', error);
      throw error;
    }
  }

  /**
   * Gets all KAM-Director relationships
   * @returns Promise with array of KAM-Director relationships
   */
  public async GetKamDirectorRelationships(): Promise<KamDirectorRelationshipModel[]> {
    const response = await this._requestService.GetRequest('/kam/relationships');
    const parsedResponse = this._requestService.TryParseResponse(response);
    if (parsedResponse === undefined) { throw new Error('Failed to get KAM-Director relationships') }

    return parsedResponse;
  }

  /**
   * Unassigns a director from a Key Account Manager
   * @param kamId The ID of the Key Account Manager
   * @returns Promise with boolean indicating success
   */
  public async UnassignManager(kamId: string): Promise<boolean> {
    try {
      const response = await this._requestService.PostRequest(`/kam/unassign-manager/${kamId}`, {});
      const parsedResponse = this._requestService.TryParseResponse(response);
      
      if (parsedResponse === undefined) {
        throw new Error('Failed to unassign manager');
      }
      
      return parsedResponse.success === true;
    } catch (error) {
      console.error('Error in UnassignManager:', error);
      throw error;
    }
  }
}
