export const CONSUMER_MARKETS = ['CH', 'NO'] as const;
export type ConsumerMarket = (typeof CONSUMER_MARKETS)[number];

/**
 * Stable translation-catalog identifiers. `no` remains the public catalog key
 * while the standards-based locale used for formatting is `nb-NO`.
 */
export const CONSUMER_UI_LANGUAGES = [
  'en',
  'de',
  'fr',
  'it',
  'no',
] as const;
export type ConsumerUiLanguage =
  (typeof CONSUMER_UI_LANGUAGES)[number];

/**
 * Compatibility aliases retained while callers move from the ambiguous
 * "locale" name to the explicit UI-language axis.
 */
export const CONSUMER_LOCALES = CONSUMER_UI_LANGUAGES;
export type ConsumerLocale = ConsumerUiLanguage;

export type ConsumerRegionalFormatTag =
  | 'de-CH'
  | 'en-CH'
  | 'en-NO'
  | 'fr-CH'
  | 'it-CH'
  | 'nb-NO';
export type ConsumerLocaleTag = ConsumerRegionalFormatTag;

export type ConsumerCurrency = 'CHF' | 'NOK';

export type ConsumerMarketProfile = Readonly<{
  currency: ConsumerCurrency;
  fractionDigits: 2;
  cashRoundingMinor: number;
  callingCode: '+41' | '+47';
  defaultLocale: ConsumerLocale;
  supportedLocales: readonly ConsumerLocale[];
}>;

export const CONSUMER_MARKET_PROFILES: Readonly<
  Record<ConsumerMarket, ConsumerMarketProfile>
> = {
  CH: {
    currency: 'CHF',
    fractionDigits: 2,
    cashRoundingMinor: 5,
    callingCode: '+41',
    defaultLocale: 'de',
    supportedLocales: ['de', 'fr', 'it', 'en'],
  },
  NO: {
    currency: 'NOK',
    fractionDigits: 2,
    cashRoundingMinor: 100,
    callingCode: '+47',
    defaultLocale: 'no',
    supportedLocales: ['no', 'en'],
  },
};

const LOCALE_TAGS: Readonly<
  Record<
    ConsumerMarket,
    Partial<Record<ConsumerUiLanguage, ConsumerRegionalFormatTag>>
  >
> = {
  CH: {
    de: 'de-CH',
    en: 'en-CH',
    fr: 'fr-CH',
    it: 'it-CH',
  },
  NO: {
    en: 'en-NO',
    no: 'nb-NO',
  },
};

export type MarketLocaleErrorCode =
  | 'unsupported-locale'
  | 'unknown-locale'
  | 'unknown-market';

export class MarketLocaleError extends Error {
  override readonly name = 'MarketLocaleError';

  constructor(
    readonly code: MarketLocaleErrorCode,
    message: string,
  ) {
    super(message);
  }
}

export function isConsumerMarket(value: unknown): value is ConsumerMarket {
  return (
    typeof value === 'string' &&
    CONSUMER_MARKETS.includes(value as ConsumerMarket)
  );
}

export function isConsumerLocale(value: unknown): value is ConsumerLocale {
  return (
    typeof value === 'string' &&
    CONSUMER_UI_LANGUAGES.includes(value as ConsumerUiLanguage)
  );
}

export const isConsumerUiLanguage = isConsumerLocale;

export function getConsumerMarketProfile(
  market: ConsumerMarket,
): ConsumerMarketProfile {
  if (!isConsumerMarket(market)) {
    throw new MarketLocaleError('unknown-market', 'Unknown consumer market.');
  }
  return CONSUMER_MARKET_PROFILES[market];
}

export function resolveConsumerLocale({
  locale,
  market,
}: {
  locale: ConsumerUiLanguage;
  market: ConsumerMarket;
}): ConsumerRegionalFormatTag {
  const parsedMarket = parseConsumerMarket(market);
  const parsedLocale = parseConsumerLocale(locale);
  const tag = LOCALE_TAGS[parsedMarket][parsedLocale];

  if (!tag) {
    throw new MarketLocaleError(
      'unsupported-locale',
      `Locale "${parsedLocale}" is not available in market "${parsedMarket}".`,
    );
  }

  return tag;
}

export const resolveConsumerRegionalFormatTag = resolveConsumerLocale;

export function parseConsumerMarket(value: unknown): ConsumerMarket {
  if (!isConsumerMarket(value)) {
    throw new MarketLocaleError('unknown-market', 'Unknown consumer market.');
  }
  return value;
}

export function parseConsumerLocale(value: unknown): ConsumerLocale {
  if (!isConsumerLocale(value)) {
    throw new MarketLocaleError('unknown-locale', 'Unknown consumer locale.');
  }
  return value;
}

export const parseConsumerUiLanguage = parseConsumerLocale;
