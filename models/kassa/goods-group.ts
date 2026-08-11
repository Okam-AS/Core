// A goods group (SAF-T artGroupID) per store. As of the varegruppe/MVA merge the group is also the
// VAT class: it carries an optional rate profile (take-away / eat-in / delivery) that becomes the
// single source of truth for a product's VAT. A product selects a group; the rate follows from
// group x context. The profile is complete (all three set) or empty (legacy fallback).
export class GoodsGroup {
  goodsGroupId: number;
  storeId: number;
  name: string;
  code: string;
  sortOrder: number;
  isActive: boolean;

  // VAT rate profile (percent) per context. Either all three are set (complete profile → the group
  // is the authoritative VAT source for its products) or all three are null (legacy group).
  takeAwayVatPercent: number | null;
  eatInVatPercent: number | null;
  deliveryVatPercent: number | null;
}

export class GoodsGroupUpsertModel {
  storeId: number;
  name: string;
  code: string;
  sortOrder: number;
  isActive: boolean;

  // Optional VAT rate profile (percent). All three set, or all three null. A partial profile is
  // rejected by the backend. Editing the profile re-prices future sales for every product in the
  // group (poweruser-gated).
  takeAwayVatPercent: number | null;
  eatInVatPercent: number | null;
  deliveryVatPercent: number | null;
}
