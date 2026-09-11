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
const deferred = () => { let resolve, reject; const promise = new Promise((a, b) => { resolve = a; reject = b; }); return { promise, resolve, reject }; };
const available = { canDeliver: true, price: { amount: 5900, currency: 'NOK' }, error: '' };
const unavailable = { canDeliver: false, price: { amount: 0, currency: 'NOK' }, error: '' };

// Real pinia/store.ts and pinia/cart.ts; the availability endpoint is a deferred promise per call.
function fixture({ loggedIn = true, storeId = 1 } = {}) {
  const requests = [];
  const user = vue.reactive({ user: { id: loggedIn ? 'user-a' : undefined, fullAddress: 'Profile street 1', zipCode: '0001', city: 'Profile city' } });
  user.isLoggedIn = () => !!user.user.id;
  user.loadFavoriteProducts = () => {};
  const storeService = {
    CheckDeliveryAvailability(id, fullAddress, zipCode, city) {
      const request = { id, fullAddress, zipCode, city, ...deferred() };
      requests.push(request);
      return request.promise;
    },
    GetForConsumer: async id => ({ id, name: `Store ${id}` }),
  };
  const cartService = { Update: async payload => clone(payload), GetCartLineItem: async item => item };
  const persistenceService = { load: key => (key === 'store' ? { id: storeId } : null), watchAndStore() {} };
  const modules = new Map();
  const stores = {
    useServices: () => ({ storeService: () => storeService, cartService: () => cartService, persistenceService }),
    useStore: () => modules.get('pinia/store.ts').useStore(),
    useCart: () => modules.get('pinia/cart.ts').useCart(),
    useUser: () => user,
    useCategory: () => ({ clearCategories() {} }),
    useTranslation: () => ({ $i: value => value }),
    useTheme: () => ({ $availableStoreIds: [] }),
    useCheckout: () => ({}),
  };
  function load(relative) {
    if (modules.has(relative)) return modules.get(relative);
    const filename = resolve(root, relative);
    const { outputText, diagnostics } = ts.transpileModule(readFileSync(filename, 'utf8'), {
      fileName: filename, reportDiagnostics: true,
      compilerOptions: { target: ts.ScriptTarget.ES2020, module: ts.ModuleKind.CommonJS, useDefineForClassFields: true },
    });
    assert.equal(diagnostics.filter(d => d.category === ts.DiagnosticCategory.Error).length, 0);
    const module = { exports: {} };
    const require = name => {
      if (name === 'vue') return vue;
      if (name === 'pinia') return pinia;
      if (name === './' || name === '.') return stores;
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
    vm.runInThisContext(`(function(require,module,exports){${outputText}\n})`, { filename })(require, module, module.exports);
    modules.set(relative, module.exports);
    return module.exports;
  }
  pinia.setActivePinia(pinia.createPinia());
  load('pinia/store.ts'); load('pinia/cart.ts');
  const { DeliveryType } = load('enums/delivery-type.ts');
  const store = stores.useStore();
  const cart = stores.useCart();
  cart.getCurrentCart().deliveryType = DeliveryType.WoltDelivery;
  const address = { fullAddress: 'Cart street 2', zipCode: '0002', city: 'Cart city' };
  const state = () => ({ availability: clone(store.deliveryAvailability ?? null), loading: store.isLoadingDeliveryAvailability });
  return { store, cart, user, requests, address, state, DeliveryType };
}

test('a newer address result is kept when the older request resolves last', async () => {
  const f = fixture();
  const old = { fullAddress: 'Old street 1', zipCode: '0001', city: 'Old city' };
  f.cart.setCartRootProperties(old);
  const first = f.store.checkDeliveryAvailability(old);
  f.cart.setCartRootProperties(f.address);
  const latest = f.store.checkDeliveryAvailability(f.address);
  assert.equal(f.requests.length, 2);
  assert.equal(f.state().loading, true);
  f.requests[1].resolve(available); await latest;
  assert.deepEqual(f.state(), { availability: available, loading: false });
  f.requests[0].resolve(unavailable); await first;
  assert.deepEqual(f.state(), { availability: available, loading: false });
});

test('a stale failure and its finally cannot clear or replace the pending newer request', async () => {
  const f = fixture();
  const old = { fullAddress: 'Old street 1', zipCode: '0001', city: 'Old city' };
  f.cart.setCartRootProperties(old);
  const first = f.store.checkDeliveryAvailability(old);
  f.cart.setCartRootProperties(f.address);
  const latest = f.store.checkDeliveryAvailability(f.address);
  f.requests[0].reject(new Error('synthetic 503')); await first; await tick();
  assert.deepEqual(f.state(), { availability: null, loading: true });
  f.requests[1].resolve(available); await latest;
  assert.deepEqual(f.state(), { availability: available, loading: false });
  const failing = f.store.checkDeliveryAvailability(f.address);
  f.requests[2].reject(new Error('synthetic 503')); await failing;
  assert.deepEqual(f.state(), { availability: null, loading: false });
});

test('two requests for the same address keep loading until the latest one completes', async () => {
  const f = fixture();
  f.cart.setCartRootProperties(f.address);
  const first = f.store.checkDeliveryAvailability(f.address);
  const latest = f.store.checkDeliveryAvailability(f.address);
  f.requests[0].resolve(unavailable); await first;
  assert.deepEqual(f.state(), { availability: null, loading: true });
  f.requests[1].resolve(available); await latest;
  assert.deepEqual(f.state(), { availability: available, loading: false });
});

test('clearing the cart address hides the result, drops the in-flight request and skips the endpoint', async () => {
  const f = fixture();
  f.cart.setCartRootProperties(f.address);
  const first = f.store.checkDeliveryAvailability(f.address);
  f.requests[0].resolve(available); await first;
  assert.deepEqual(f.state(), { availability: available, loading: false });
  const cleared = { fullAddress: '', zipCode: '', city: '' };
  f.cart.setCartRootProperties(cleared);
  assert.deepEqual(f.state(), { availability: null, loading: false });
  await f.store.checkDeliveryAvailability(cleared);
  assert.equal(f.requests.length, 1);
  f.cart.setCartRootProperties(f.address);
  const pending = f.store.checkDeliveryAvailability(f.address);
  f.cart.setCartRootProperties(cleared);
  await f.store.checkDeliveryAvailability(cleared);
  assert.deepEqual(f.state(), { availability: null, loading: false });
  f.requests[1].resolve(available); await pending;
  assert.deepEqual(f.state(), { availability: null, loading: false });
  assert.equal(f.requests.length, 2);
});

test('an explicitly cleared cart address never falls back to the profile address', async () => {
  const f = fixture();
  f.cart.setCartRootProperties({ fullAddress: '', zipCode: '', city: '' });
  await f.store.checkDeliveryAvailability();
  assert.equal(f.requests.length, 0);
  assert.deepEqual(f.state(), { availability: null, loading: false });
});

test('omitted address uses the cart address, or the profile only while the cart is untouched', async () => {
  const untouched = fixture();
  const profile = untouched.store.checkDeliveryAvailability();
  assert.deepEqual(untouched.requests.map(({ id, fullAddress, zipCode, city }) => ({ id, fullAddress, zipCode, city })), [{ id: 1, fullAddress: 'Profile street 1', zipCode: '0001', city: 'Profile city' }]);
  untouched.requests[0].resolve(available); await profile;
  assert.deepEqual(untouched.state(), { availability: available, loading: false });

  const edited = fixture();
  edited.cart.setCartRootProperties(edited.address);
  const own = edited.store.checkDeliveryAvailability();
  assert.deepEqual(edited.requests.map(({ id, fullAddress, zipCode, city }) => ({ id, fullAddress, zipCode, city })), [{ id: 1, ...edited.address }]);
  edited.requests[0].resolve(available); await own;
  assert.deepEqual(edited.state(), { availability: available, loading: false });
});

test('switching store hides the result, stops the spinner and ignores the old store response', async () => {
  const f = fixture();
  f.cart.setCartRootProperties(f.address);
  const first = f.store.checkDeliveryAvailability(f.address);
  f.requests[0].resolve(available); await first;
  const pending = f.store.checkDeliveryAvailability(f.address);
  assert.equal(f.state().loading, true);
  await f.store.setCurrentStore(2);
  assert.equal(f.store.currentStore.id, 2);
  assert.deepEqual(f.state(), { availability: null, loading: false });
  f.requests[1].resolve(available); await pending;
  assert.deepEqual(f.state(), { availability: null, loading: false });
  f.store.clearCurrentStore();
  assert.deepEqual(f.state(), { availability: null, loading: false });
});

test('changing delivery type hides the result and stops requests until it is home delivery again', async () => {
  const f = fixture();
  f.cart.setCartRootProperties(f.address);
  const first = f.store.checkDeliveryAvailability(f.address);
  f.requests[0].resolve(available); await first;
  f.cart.setCartRootProperties({ deliveryType: f.DeliveryType.SelfPickup });
  assert.deepEqual(f.state(), { availability: null, loading: false });
  await f.store.checkDeliveryAvailability(f.address);
  assert.equal(f.requests.length, 1);
  f.cart.setCartRootProperties({ deliveryType: f.DeliveryType.WoltDelivery });
  const pending = f.store.checkDeliveryAvailability(f.address);
  assert.equal(f.requests.length, 2);
  assert.equal(f.state().loading, true);
  f.cart.setCartRootProperties({ deliveryType: f.DeliveryType.SelfPickup });
  assert.deepEqual(f.state(), { availability: null, loading: false });
  f.requests[1].resolve(available); await pending;
  assert.deepEqual(f.state(), { availability: null, loading: false });
});

test('a guest without a profile still checks the cart address', async () => {
  const f = fixture({ loggedIn: false });
  f.user.user = {};
  f.cart.setCartRootProperties(f.address);
  const pending = f.store.checkDeliveryAvailability(f.address);
  assert.equal(f.requests.length, 1);
  f.requests[0].resolve(available); await pending;
  assert.deepEqual(f.state(), { availability: available, loading: false });
});
