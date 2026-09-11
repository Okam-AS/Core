import assert from 'node:assert/strict';
import test from 'node:test';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import vm from 'node:vm';

// Core uses the consuming app's dependencies. No application bootstrap/config is loaded.
const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const dependencies = createRequire(resolve(process.env.CORE_TEST_DEPENDENCIES || root, 'package.json'));
const ts = dependencies('typescript');
const vue = dependencies('vue');
const pinia = dependencies('pinia');
const clone = value => JSON.parse(JSON.stringify(value));
const tick = async () => { for (let i = 0; i < 12; i++) await Promise.resolve(); };

function fixture({ loggedIn = true, savedCarts = [], serverRevision } = {}) {
  const timers = new Map();
  let timerId = 0;
  const setTimeout = fn => { timers.set(++timerId, fn); return timerId; };
  const clearTimeout = id => timers.delete(id);
  const requests = [];
  const store = vue.reactive({ currentStore: { id: 1 } });
  const user = vue.reactive({ user: { id: 'user-a', fullAddress: 'Synthetic street', city: 'Test', zipCode: '0001' }, loggedIn });
  user.isLoggedIn = () => user.loggedIn;
  const service = {
    Update(payload) {
      return new Promise((resolve, reject) => requests.push({ payload: clone(payload), resolve, reject }));
    },
    GetCartLineItem: async item => item,
  };
  const stores = {
    useServices: () => ({ cartService: () => service, persistenceService: { load: () => clone(savedCarts), watchAndStore() {} } }),
    useStore: () => store, useUser: () => user, useTranslation: () => ({ $i: value => value }), useCheckout: () => ({}),
  };
  const modules = new Map();
  function load(relative) {
    if (modules.has(relative)) return modules.get(relative);
    const filename = resolve(root, relative);
    const source = readFileSync(filename, 'utf8');
    const { outputText, diagnostics } = ts.transpileModule(source, {
      fileName: filename, reportDiagnostics: true,
      compilerOptions: { target: ts.ScriptTarget.ES2020, module: ts.ModuleKind.CommonJS, useDefineForClassFields: true },
    });
    assert.equal(diagnostics.filter(d => d.category === ts.DiagnosticCategory.Error).length, 0);
    const module = { exports: {} };
    const require = name => {
      if (name === 'vue') return vue;
      if (name === 'pinia') return pinia;
      if (name === './' && relative === 'pinia/cart.ts') return stores;
      if (name.endsWith('/models')) return {
        Cart: load('models/cart/cart.ts').Cart,
        CartLineItem: load('models/cart/cart-line-item.ts').CartLineItem,
        Product: load('models/product/product.ts').Product,
        RecommendProductsRequest: load('models/cart/recommend-products-request.ts').RecommendProductsRequest,
        UpdateCompanyInfoModel: load('models/cart/update-company-info-model.ts').UpdateCompanyInfoModel,
      };
      if (name.endsWith('/enums')) return { ...load('enums/delivery-type.ts'), ...load('enums/payment-type.ts') };
      if (name === '../helpers/tools') return { priceLabel: value => String(value) };
      if (name === '../helpers/ts-debounce') return load('helpers/ts-debounce.ts');
      throw new Error(`Unexpected source dependency: ${relative}: ${name}`);
    };
    vm.runInThisContext(`(function(require,module,exports,setTimeout,clearTimeout){${outputText}\n})`, { filename })(require, module, module.exports, setTimeout, clearTimeout);
    modules.set(relative, module.exports);
    return module.exports;
  }
  pinia.setActivePinia(pinia.createPinia());
  const cart = load('pinia/cart.ts').useCart();
  const line = () => ({ id: 'line-1', quantity: 1, product: { id: 'product-1', baseAmount: 18900, selectedOptionsAmount: 0, productVariants: [], soldOut: false } });
  function addLine() { cart.getCurrentCart().items.push(line()); }
  function respond(index, transform = value => value) {
    const request = requests[index];
    if (serverRevision !== undefined && request.payload.revision != null && request.payload.revision !== serverRevision) {
      request.reject(new Error('412 cart precondition failed'));
      return;
    }
    const response = clone(request.payload);
    if (serverRevision !== undefined) response.revision = ++serverRevision;
    // Synthetic server owns totals; deliberately no client calculation implementation here.
    response.calculations = { finalAmount: response.items.reduce((sum, item) => sum + 18900 * item.quantity, 0) };
    request.resolve(transform(response));
  }
  async function fireTimers() {
    const queued = [...timers.values()]; timers.clear(); queued.forEach(fn => fn()); await tick();
  }
  return { cart, store, user, requests, timers, line, addLine, respond, fireTimers, service, externalWrite: () => { serverRevision++; } };
}

test('product save cannot report success/navigation before the server confirms the item', async () => {
  const f = fixture(); f.cart.unsavedLineItem = f.line();
  let navigated = false;
  const save = f.cart.unsavedLineItemSave().then(value => { navigated = value; });
  await tick(); assert.equal(navigated, false); assert.equal(f.requests.length, 1);
  f.respond(0); await save;
  assert.equal(navigated, true); assert.equal(f.cart.getCurrentCart().calculations.finalAmount, 18900);
  assert.equal(f.timers.size, 0);
});

test('persisted local cart recovery explicitly awaits server totals', async () => {
  const first = fixture(); first.addLine();
  const f = fixture({ savedCarts: [clone(first.cart.getCurrentCart())] });
  const sync = f.cart.syncWithDb(); await tick(); f.respond(0); await sync;
  assert.equal(f.cart.getCurrentCart().calculations.finalAmount, 18900);
});

test('untouched delivery fields inherit profile defaults for both missing and null values', async () => {
  for (const initial of [undefined, null]) {
    const f = fixture(); f.addLine();
    f.user.user.deliveryInstructions = 'Use the side entrance';
    const fields = ['fullAddress', 'city', 'zipCode', 'deliveryInstructions'];
    for (const field of fields) f.cart.getCurrentCart()[field] = initial;
    const sync = f.cart.syncWithDb(); await tick();
    for (const field of fields) assert.equal(f.requests[0].payload[field], f.user.user[field]);
    f.respond(0); await sync;
    for (const field of fields) assert.equal(f.cart.getCurrentCart()[field], f.user.user[field]);
  }
});

test('clearing delivery details during synchronization survives the old response and profile defaults', async () => {
  const f = fixture(); f.addLine();
  f.user.user.deliveryInstructions = 'Old profile instruction';
  const fields = ['fullAddress', 'city', 'zipCode', 'deliveryInstructions'];
  const first = f.cart.syncWithDb(); await tick();
  f.cart.setCartRootProperties(Object.fromEntries(fields.map(field => [field, ''])));
  const latest = f.cart.syncWithDb();
  f.respond(0); await tick();
  assert.equal(f.requests.length, 2);
  for (const field of fields) {
    assert.equal(f.cart.getCurrentCart()[field], '');
    assert.equal(f.requests[1].payload[field], '');
  }
  f.respond(1); await Promise.all([first, latest]);
  for (const field of fields) assert.equal(f.cart.getCurrentCart()[field], '');
});

test('whitespace delivery instructions stay empty for validation after synchronization', async () => {
  const f = fixture(); f.addLine();
  f.user.user.deliveryInstructions = 'Old profile instruction';
  f.cart.setCartRootProperties({ deliveryInstructions: ' \t\n ' });
  const sync = f.cart.syncWithDb(); await tick();
  assert.equal(f.requests[0].payload.deliveryInstructions, ' \t\n ');
  f.respond(0); await sync;
  assert.equal(f.cart.getCurrentCart().deliveryInstructions.trim(), '');
});

test('503 rejects save, keeps local edits, and a retry confirms them', async () => {
  const f = fixture(); f.cart.unsavedLineItem = f.line();
  const failure = new Error('synthetic 503');
  const outcome = f.cart.unsavedLineItemSave().then(() => ({ ok: true }), error => ({ error }));
  await tick(); if (!f.requests.length) await f.fireTimers();
  f.requests[0].reject(failure); assert.equal((await outcome).error, failure);
  assert.equal(f.cart.getCurrentCart().items[0].quantity, 1);
  const retry = f.cart.unsavedLineItemSave(); await tick(); f.respond(1); assert.equal(await retry, true);
  assert.equal(f.cart.getCurrentCart().items.length, 1);
});

test('queued explicit await waits for the latest edit and server response', async () => {
  const f = fixture(); f.addLine();
  const first = f.cart.syncWithDb(); await tick();
  f.cart.cartLineItemAddQuantity('line-1', 1);
  let finished = false; const queued = f.cart.syncWithDb().then(() => { finished = true; });
  await tick(); assert.equal(finished, false);
  f.respond(0); await tick();
  assert.equal(f.cart.getCurrentCart().items[0].quantity, 2);
  assert.deepEqual(f.requests.map(r => r.payload.items[0].quantity), [1, 2]);
  assert.equal(finished, false); f.respond(1); await Promise.all([first, queued]);
  assert.equal(f.cart.getCurrentCart().calculations.finalAmount, 37800);
  await f.fireTimers(); assert.equal(f.requests.length, 2);
});

test('natural debounced edit survives an older in-flight response without an explicit second sync', async () => {
  const f = fixture(); f.addLine();
  const sync = f.cart.syncWithDb(); await tick(); f.cart.cartLineItemAddQuantity('line-1', 1);
  await f.fireTimers(); f.respond(0); await tick();
  assert.equal(f.cart.getCurrentCart().items[0].quantity, 2);
  assert.deepEqual(f.requests.map(r => r.payload.items[0].quantity), [1, 2]);
  f.respond(1); await sync; assert.equal(f.cart.getCurrentCart().calculations.finalAmount, 37800);
});

test('sequential edits still save [1, 2] and use authoritative server totals', async () => {
  const f = fixture(); f.addLine(); const first = f.cart.syncWithDb(); await tick(); f.respond(0); await first;
  f.cart.cartLineItemAddQuantity('line-1', 1); await f.fireTimers(); f.respond(1); await tick();
  assert.deepEqual(f.requests.map(r => r.payload.items[0].quantity), [1, 2]);
  assert.equal(f.cart.getCurrentCart().calculations.finalAmount, 37800);
});

test('unchanged concurrent callers share one request', async () => {
  const f = fixture(); f.addLine(); const calls = [f.cart.syncWithDb(), f.cart.syncWithDb(), f.cart.syncWithDb()];
  await tick(); assert.equal(f.requests.length, 1); f.respond(0); await Promise.all(calls);
  assert.equal(f.requests.length, 1);
});

test('failed in-flight sync retains newer quantity, removal and notes for retry', async () => {
  const f = fixture(); f.addLine(); const rejected = assert.rejects(f.cart.syncWithDb(), /503/); await tick();
  f.cart.getCurrentCart().items[0].notes = 'new note';
  f.cart.cartLineItemAddQuantity('line-1', 1);
  f.requests[0].reject(new Error('503')); await rejected;
  assert.equal(f.cart.getCurrentCart().items[0].quantity, 2);
  assert.equal(f.cart.getCurrentCart().items[0].notes, 'new note');
  f.cart.removeLineItem('line-1'); const retry = f.cart.syncWithDb(); await tick();
  assert.deepEqual(f.requests[1].payload.items, []); f.respond(1); await retry;
  await f.fireTimers(); assert.equal(f.requests.length, 2);
});

test('a late store A response and its queued edits cannot replace store B', async () => {
  const f = fixture(); f.addLine(); const a = f.cart.syncWithDb(); await tick();
  f.cart.cartLineItemAddQuantity('line-1', 1);
  f.store.currentStore.id = 2; f.addLine(); f.cart.getCurrentCart().items[0].notes = 'store B';
  const b = f.cart.syncWithDb(); await tick(); f.respond(0); await tick();
  assert.equal(f.cart.getCurrentCart().storeId, 2);
  assert.equal(f.cart.getCurrentCart().items[0].notes, 'store B');
  assert.deepEqual(f.requests.map(r => r.payload.storeId), [1, 2, 1]);
  f.respond(1); f.respond(2); await Promise.all([a, b]);
  assert.equal(f.cart.getCurrentCart().storeId, 2);
  assert.equal(f.cart.getCurrentCart().items[0].notes, 'store B');
  assert.equal(f.cart.getCurrentCart().calculations.finalAmount, 18900);
  f.store.currentStore.id = 1; assert.equal(f.cart.getCurrentCart().items[0].quantity, 2);
});

test('debounce captures the edited store even if navigation switches before it fires', async () => {
  const f = fixture(); f.addLine(); f.cart.cartLineItemAddQuantity('line-1', 1);
  f.store.currentStore.id = 2; f.addLine(); await f.fireTimers();
  assert.equal(f.requests[0].payload.storeId, 1); f.respond(0); await tick();
  assert.equal(f.cart.getCurrentCart().storeId, 2); assert.equal(f.cart.getCurrentCart().items[0].quantity, 1);
});

test('session change rejects the old drain without applying or sending the newer edits', async () => {
  const f = fixture(); f.addLine(); const rejected = assert.rejects(f.cart.syncWithDb(), /same signed-in user/); await tick();
  f.cart.cartLineItemAddQuantity('line-1', 1); f.user.user.id = 'user-b';
  f.respond(0); await rejected; await f.fireTimers();
  assert.equal(f.requests.length, 1); assert.equal(f.cart.getCurrentCart().items[0].quantity, 2);
});

test('session change before a debounce fires sends no cart under the new user', async () => {
  const f = fixture(); f.addLine(); f.cart.cartLineItemAddQuantity('line-1', 1);
  f.user.user.id = 'user-b'; await f.fireTimers(); assert.equal(f.requests.length, 0);
});

test('guest save and edits stay local without timers or requests', async () => {
  const f = fixture({ loggedIn: false }); f.cart.unsavedLineItem = f.line();
  assert.equal(await f.cart.unsavedLineItemSave(), true); f.cart.cartLineItemAddQuantity('line-1', 1);
  await f.fireTimers(); assert.equal(f.requests.length, 0); assert.equal(f.timers.size, 0);
  assert.equal(f.cart.getCurrentCart().items[0].quantity, 2);
  await assert.rejects(f.cart.syncWithDb(), /same signed-in user/);
});

test('wrong-store or malformed responses reject and never replace the local cart', async () => {
  for (const transform of [response => ({ ...response, storeId: 9 }), () => null, response => ({ ...response, items: undefined })]) {
    const f = fixture(); f.addLine(); const rejected = assert.rejects(f.cart.syncWithDb(), /Unexpected cart/); await tick();
    f.respond(0, transform); await rejected; assert.equal(f.cart.getCurrentCart().storeId, 1);
    assert.equal(f.cart.getCurrentCart().items[0].quantity, 1);
  }
});

test('background root-property and debounced failures are handled without an unhandled rejection', async () => {
  const f = fixture(); f.addLine(); f.cart.setCartRootProperties({ comment: 'retryable' }); await tick();
  f.requests[0].reject(new Error('503')); await tick();
  f.cart.cartLineItemAddQuantity('line-1', 1); await f.fireTimers(); f.requests[1].reject(new Error('503')); await tick();
  // Node's test runner fails the test on any unhandled rejection, including Pinia action wrappers.
  await new Promise(resolve => globalThis.setTimeout(resolve, 0));
  assert.equal(f.cart.getCurrentCart().comment, 'retryable'); assert.equal(f.cart.getCurrentCart().items[0].quantity, 2);
});

test('background error is store/user scoped and clears only after a confirmed retry', async () => {
  const f = fixture(); f.addLine(); assert.equal(f.cart.syncError, false);
  f.cart.cartLineItemAddQuantity('line-1', 1); await f.fireTimers();
  f.requests[0].reject(new Error('provider detail must not escape as UI state')); await tick();
  assert.equal(f.cart.syncError, true);
  f.store.currentStore.id = 2; assert.equal(f.cart.syncError, false);
  f.store.currentStore.id = 1; assert.equal(f.cart.syncError, true);
  f.user.user.id = 'user-b'; assert.equal(f.cart.syncError, false);
  f.user.user.id = 'user-a'; const retry = f.cart.syncWithDb(); await tick();
  assert.equal(f.cart.syncError, true); f.respond(1); await retry;
  assert.equal(f.cart.syncError, false);
});

test('user B awaiting an existing user A request cannot receive confirmation or send A cart as B', async () => {
  const f = fixture(); f.addLine();
  const a = assert.rejects(f.cart.syncWithDb(), /same signed-in user/); await tick();
  f.user.user.id = 'user-b';
  const b = assert.rejects(f.cart.syncWithDb(), /same signed-in user/); await tick();
  assert.equal(f.requests.length, 1); f.respond(0); await Promise.all([a, b]);
  assert.equal(f.requests.length, 1);
  assert.equal(f.cart.getCurrentCart().calculations.finalAmount, undefined);
});

test('removing a line while a request is pending drains an empty cart and keeps the removal', async () => {
  const f = fixture(); f.addLine(); const sync = f.cart.syncWithDb(); await tick();
  f.cart.removeLineItem('line-1'); f.respond(0); await tick();
  assert.deepEqual(f.cart.getCurrentCart().items, []);
  assert.deepEqual(f.requests.map(r => r.payload.items.length), [1, 0]);
  f.respond(1); await sync; assert.equal(f.cart.getCurrentCart().calculations.finalAmount, 0);
  await f.fireTimers(); assert.equal(f.requests.length, 2);
});

test('queued edits use only the successful server revision while keeping newer quantity and notes', async () => {
  const f = fixture({ serverRevision: 7 }); f.addLine(); f.cart.getCurrentCart().revision = 7;
  const result = f.cart.syncWithDb().then(() => ({ ok: true }), error => ({ error })); await tick();
  f.cart.cartLineItemAddQuantity('line-1', 1); f.cart.getCurrentCart().items[0].notes = 'new local note';
  f.respond(0); await tick();
  assert.deepEqual(f.requests.map(r => r.payload.revision), [7, 8]);
  assert.deepEqual(f.requests.map(r => r.payload.items[0].quantity), [1, 2]);
  assert.equal(f.requests[1].payload.items[0].notes, 'new local note');
  assert.equal(f.requests[1].payload.calculations.finalAmount, undefined, 'old response totals are not copied over local state');
  f.respond(1); assert.equal((await result).ok, true);
  assert.equal(f.cart.getCurrentCart().revision, 9); assert.equal(f.cart.getCurrentCart().calculations.finalAmount, 37800);
});

test('first legacy-shaped request adopts the returned revision before its queued write', async () => {
  const f = fixture({ serverRevision: 0 }); f.addLine();
  const result = f.cart.syncWithDb(); await tick(); f.cart.removeLineItem('line-1'); f.respond(0); await tick();
  assert.deepEqual(f.requests.map(r => r.payload.revision), [undefined, 1]);
  f.respond(1); await result; assert.equal(f.cart.getCurrentCart().revision, 2); assert.deepEqual(f.cart.getCurrentCart().items, []);
});

test('a real 412 conflict rejects, preserves edits and token, and never retries automatically', async () => {
  const f = fixture({ serverRevision: 7 }); f.addLine(); f.cart.getCurrentCart().revision = 7;
  const result = assert.rejects(f.cart.syncWithDb(), /412/); await tick();
  f.cart.cartLineItemAddQuantity('line-1', 1); f.externalWrite(); f.respond(0); await result;
  assert.equal(f.cart.syncError, true); assert.equal(f.cart.getCurrentCart().revision, 7);
  assert.equal(f.cart.getCurrentCart().items[0].quantity, 2);
  await f.fireTimers(); assert.equal(f.requests.length, 1);
});

test('an external update between accepted queued writes remains a visible 412', async () => {
  const f = fixture({ serverRevision: 7 }); f.addLine(); f.cart.getCurrentCart().revision = 7;
  const result = assert.rejects(f.cart.syncWithDb(), /412/); await tick();
  f.cart.cartLineItemAddQuantity('line-1', 1); f.respond(0); await tick();
  f.externalWrite(); f.respond(1); await result;
  assert.equal(f.cart.getCurrentCart().revision, 8); assert.equal(f.cart.getCurrentCart().items[0].quantity, 2);
  await f.fireTimers(); assert.equal(f.requests.length, 2); assert.equal(f.cart.syncError, true);
});

test('a separately changed revision is not replaced by an older successful acknowledgement', async () => {
  const f = fixture({ serverRevision: 7 }); f.addLine(); f.cart.getCurrentCart().revision = 7;
  const result = assert.rejects(f.cart.syncWithDb(), /revision changed/); await tick();
  f.cart.getCurrentCart().revision = 9; f.cart.getCurrentCart().items[0].notes = 'newer state';
  f.respond(0); await result;
  assert.equal(f.cart.getCurrentCart().revision, 9); assert.equal(f.cart.getCurrentCart().items[0].notes, 'newer state');
  await f.fireTimers(); assert.equal(f.requests.length, 1); assert.equal(f.cart.syncError, true);
});

test('root-property edits cannot change the server-owned revision even with enumerable class fields', async () => {
  const f = fixture({ serverRevision: 7 }); f.addLine(); f.cart.getCurrentCart().revision = 7;
  assert.ok(Object.keys(f.cart.getCurrentCart()).includes('revision'));
  f.cart.setCartRootProperties({ revision: 100, comment: 'legitimate edit' }); await tick();
  assert.equal(f.cart.getCurrentCart().revision, 7); assert.equal(f.requests[0].payload.revision, 7);
  assert.equal(f.requests[0].payload.comment, 'legitimate edit'); f.respond(0); await tick();
  assert.equal(f.cart.getCurrentCart().revision, 8);
});
