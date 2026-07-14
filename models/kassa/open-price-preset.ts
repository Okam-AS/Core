// A named open-price button for the POS, configured per store ("Frakt", "Pant", "Diverse mat" …).
// The operator taps it to ring an ad hoc amount without typing a line name; the name and goods group
// come from the preset, and the VAT rate follows from the goods group x the check's context.
export class OpenPricePreset {
  openPricePresetId: number;
  storeId: number;
  name: string;
  goodsGroupId: number;
  sortOrder: number;
  isActive: boolean;
}

export class OpenPricePresetUpsertModel {
  storeId: number;
  name: string;
  goodsGroupId: number;
  sortOrder: number;
  isActive: boolean;
}
