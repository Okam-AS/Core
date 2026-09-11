import assert from 'node:assert/strict';
import test from 'node:test';
import { addressServiceFixture } from './helpers/user-address.mjs';

const update = service => service.UpdateAddress('Testveien 1', '0123', 'Oslo', 'Ring på');

test('address update confirms only the endpoint boolean true on HTTP 200', async () => {
  for (const native of [false, true]) {
    for (const data of [true, false, '', undefined, null, { message: 'failed' }]) {
      const response = native ? { statusCode: 200, content: { toJSON: () => data } } : { status: 200, data };
      const f = addressServiceFixture({ native, transport: async () => response });
      assert.equal(await update(f.service), data === true, `${native ? 'native' : 'web'}: ${JSON.stringify(data)}`);
      assert.equal(f.calls.length, 1);
      const payload = native ? JSON.parse(f.calls[0].content) : f.calls[0].data;
      assert.deepEqual(payload, { fullAddress: 'Testveien 1', zipCode: '0123', city: 'Oslo', deliveryInstructions: 'Ring på' });
    }
  }
});

test('resolved and rejected HTTP errors never confirm address save through actual RequestService', async () => {
  for (const status of [400, 401, 403, 500, 503]) {
    const response = { status, data: { message: 'Synthetic refusal' } };
    for (const transport of [async () => response, async () => { throw { response }; }]) {
      const f = addressServiceFixture({ transport });
      assert.equal(await update(f.service), false, String(status));
    }
    const native = addressServiceFixture({ native: true, transport: async () => ({ statusCode: status, content: { toJSON: () => true } }) });
    assert.equal(await update(native.service), false, `native ${status}`);
  }
});

test('offline request rejection resolved by PostRequest remains an unsuccessful address save', async () => {
  for (const native of [false, true]) {
    const f = addressServiceFixture({ native, transport: async () => { throw Error('synthetic offline'); } });
    assert.equal(await update(f.service), false);
  }
});

test('malformed native response and missing HTTP response do not confirm a save', async () => {
  const native = addressServiceFixture({ native: true, transport: async () => ({ statusCode: 200, content: { toJSON() { throw Error('bad JSON'); } } }) });
  assert.equal(await update(native.service), false);
  const empty = addressServiceFixture({ transport: async () => undefined });
  assert.equal(await update(empty.service), false);
});

test('unsigned address update returns false without a transport call', async () => {
  const f = addressServiceFixture({ token: '', transport: async () => { throw Error('must not call'); } });
  assert.equal(await update(f.service), false);
  assert.equal(f.calls.length, 0);
});
