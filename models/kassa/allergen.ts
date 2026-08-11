export class Allergen {
  allergenId: number;
  storeId: number;
  name: string;
  code: string;
  sortOrder: number;
  isActive: boolean;
  created: Date;
}

export class AllergenUpsertModel {
  storeId: number;
  name: string;
  code: string;
  sortOrder: number;
  isActive: boolean;
}
