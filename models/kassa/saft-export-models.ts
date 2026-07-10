export class SaftEmailExportModel {
  storeId: number;
  from: Date;
  to: Date;
  email: string;
}

export class SaftEmailExportResult {
  sent: boolean;
  fileName: string;
}
