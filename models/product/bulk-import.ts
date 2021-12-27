import { BulkImportRow } from '../index'
export class BulkImport {
    storeId: number;
    currency: string;
    ReplaceAll: boolean;
    VerifyOnly: boolean;
    rows: Array<BulkImportRow>;
}