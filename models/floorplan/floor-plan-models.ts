import { TableShape } from "../../enums";

export class FloorPlanModel {
  zones: Array<FloorPlanZoneModel>;
  tables: Array<TableModel>;
}

export class FloorPlanZoneModel {
  id: number;
  clientId: string | null;
  name: string;
  sortOrder: number;
  isActive: boolean;
}

export class TableModel {
  id: number;
  clientId: string | null;
  zoneId: number;
  zoneClientId: string | null;
  tableNumber: number;
  name: string;
  shape: TableShape;
  posX: number;
  posY: number;
  width: number;
  height: number;
  rotation: number;
  seats: number;
  seatsAuto: boolean;
  minCapacity: number;
  maxCapacity: number;
  isActive: boolean;
}

export class TableDeleteResult {
  tableId: number;
  deleted: boolean;
  deactivated: boolean;
}
