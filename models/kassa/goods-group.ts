export class GoodsGroup {
  goodsGroupId: number;
  storeId: number;
  name: string;
  code: string;
  sortOrder: number;
  isActive: boolean;
}

export class GoodsGroupUpsertModel {
  storeId: number;
  name: string;
  code: string;
  sortOrder: number;
  isActive: boolean;
}
