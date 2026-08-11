import type {
  MoneyFormatV1,
  PhoneInputV1,
  StoreManifestV1,
} from "@okam/core/consumer-domain";
import type { MoneyProfileV1 } from "@okam/core/consumer-domain/v1";

const phoneInput: PhoneInputV1 = { market: "CH", value: "076 123 45 67" };
const moneyFormat: MoneyFormatV1 = {
  prefix: "CHF ",
  suffix: "",
  decimalSeparator: ".",
  thousandSeparator: "'",
  fractionDigits: 2,
};
const manifest: StoreManifestV1 = {
  id: "brand-modul",
  key: "modul",
  version: 1,
  publicationState: "published",
  displayName: "Modul",
  showOkamTrace: false,
  storeScope: { kind: "explicit", allowedStoreIds: ["6"] },
};
const profile: MoneyProfileV1 = {
  market: "CH",
  currency: "CHF",
  locale: "de-CH",
  format: moneyFormat,
};

void phoneInput;
void moneyFormat;
void manifest;
void profile;
