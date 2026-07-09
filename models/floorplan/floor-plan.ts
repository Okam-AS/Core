// Physical shape of a table; the API persists these exact strings.
export type TableShape = 'Round' | 'Square' | 'Rectangle';

// The complete floor plan for a store: its zones and tables. Used both as the GET response
// and as the bulk-upsert (POST) payload. New zones/tables carry a clientId so the editor can
// map its local ids to the server ids the API echoes back.
export class FloorPlan {
  zones: Array<FloorPlanZone>;
  tables: Array<Table>;
}

export class FloorPlanZone {
  id: number;
  clientId?: string;
  name: string;
  sortOrder: number;
  isActive: boolean;
}

export class Table {
  id: number;
  clientId?: string;
  zoneId: number;
  zoneClientId?: string;
  tableNumber: number;
  name: string;
  shape: TableShape;
  // Centre point and size, in centimetres.
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

// Outcome of a table delete: a hard delete, or a soft delete (deactivation) when the table is
// still referenced by an order or a future reservation.
export class TableDeleteResult {
  tableId: number;
  deleted: boolean;
  deactivated: boolean;
}
