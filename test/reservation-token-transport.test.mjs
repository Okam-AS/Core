import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const reservationServicePath = new URL("../services/reservation-service.ts", import.meta.url);

test("reservation cancellation tokens travel only in the dedicated request header", async () => {
  const source = await readFile(reservationServicePath, "utf8");

  assert.match(source, /CancelTokenHeader\s*=\s*"X-Reservation-Cancel-Token"/);
  assert.match(source, /GetRequest\("\/Reservation\/by-token", this\.cancelTokenHeader\(token\)\)/);
  assert.match(source, /PostRequest\("\/Reservation\/cancel", undefined, this\.cancelTokenHeader\(token\)\)/);

  assert.doesNotMatch(source, /\/Reservation\/by-token\/"\s*\+\s*token/);
  assert.doesNotMatch(source, /\/Reservation\/cancel\/"\s*\+\s*token/);
  assert.doesNotMatch(source, /[?&]token=/i);
});
