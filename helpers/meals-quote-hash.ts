// Type-only: keeps this helper importable by the plain-`node` contract check in __checks__,
// which cannot resolve core/models as a directory.
import type { Cart } from "../models";
import { sha256Hex } from "./sha256";

// THE QUOTE-HASH CONTRACT.
//
// `createMealsQuote` (POST /v1/stores/{storeId}/meals/quotes) takes a `quoteHash` that the backend
// stores VERBATIM on the reservation and uses in the idempotency fingerprint. It pins no algorithm
// and validates nothing, so whatever the first client sends becomes the contract by default. This
// file is that decision, written down on purpose rather than left to a call site.
//
// v1, and the only version any client may send until this comment says otherwise:
//
//   quoteHash = "sha256:" + lowercase-hex SHA-256 of the UTF-8 bytes of the canonical form
//
//   canonical form = these lines, in this order, joined with "\n", with a trailing "\n":
//
//     meals-quote-v1
//     <storeId as a base-10 integer>
//     <currency, uppercased ASCII>
//     <cartTotalMinor as a base-10 integer, currency MINOR units>
//     <item line>            one per cart line item, sorted ascending by the line's own text
//
//   item line = <productId lowercased>|<quantity>|<unit amount in minor units>|<option ids>
//   option ids = the SELECTED product-variant option ids, lowercased, sorted ascending, joined ","
//
// WHY THESE FIELDS. The hash exists so a cart edited after the quote was minted invalidates that
// quote, so it must cover everything that changes what the company is being asked to fund: the
// corridor (store), the money (currency + total), and the basket that produced the total (product,
// quantity, unit price and the chosen options, which move the price). It deliberately covers
// NOTHING else — not the delivery address, not the comment, not the tip's presentation — because a
// hash that changes when a note is typed would invalidate quotes for edits that cost nothing.
//
// WHY SORTED. Cart item order is presentation, not price: dragging a line up must not mint a
// different funding fingerprint. Sorting the rendered lines (rather than the objects) makes the
// order-independence a property of the text, which is the thing being hashed.
//
// WHY MINOR UNITS EVERYWHERE. Core carries all amounts as integer minor units already (see
// helpers/tools `wholeAmount`, which slices the last two digits), and `cartTotalMinor` on the
// request is minor units. Emitting anything else here would put a float in a money contract.
//
// CHANGING IT is a breaking change to a stored value: bump the version line to `meals-quote-v2`,
// never edit v1 in place, or two clients will disagree about the same cart.

const HASH_PREFIX = "sha256:";
const CANONICAL_VERSION = "meals-quote-v1";

function selectedOptionIds(item: any): string {
  const variants = item?.product?.productVariants || [];
  const ids: string[] = [];
  variants.forEach((variant: any) => {
    (variant?.options || []).forEach((option: any) => {
      if (option?.selected && option?.id) { ids.push(String(option.id).toLowerCase()); }
    });
  });
  return ids.sort().join(",");
}

function itemLine(item: any): string {
  const productId = String(item?.product?.id || "").toLowerCase();
  const quantity = Math.trunc(Number(item?.quantity) || 0);
  const unitAmountMinor = Math.trunc(Number(item?.product?.amount) || 0);
  return [productId, quantity, unitAmountMinor, selectedOptionIds(item)].join("|");
}

/** The canonical text v1 hashes. Exported so a client can log or diff it without re-deriving it. */
export function mealsQuoteCanonicalForm(cart: Cart, currency: string, cartTotalMinor: number): string {
  const lines = (cart?.items || []).map(itemLine).sort();
  return [
    CANONICAL_VERSION,
    String(Math.trunc(Number(cart?.storeId) || 0)),
    String(currency || "").toUpperCase(),
    String(Math.trunc(Number(cartTotalMinor) || 0)),
    ...lines
  ].join("\n") + "\n";
}

/** The value to send as `CreateMealsQuoteRequest.quoteHash`. Self-describing: it names its algorithm. */
export function mealsQuoteHash(cart: Cart, currency: string, cartTotalMinor: number): string {
  return HASH_PREFIX + sha256Hex(mealsQuoteCanonicalForm(cart, currency, cartTotalMinor));
}
