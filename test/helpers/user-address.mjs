import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import vm from 'node:vm';

const coreRoot = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const dependencies = createRequire(resolve(process.env.CORE_TEST_DEPENDENCIES || coreRoot, 'package.json'));
const ts = dependencies('typescript');

// Loads the real service and RequestService without application initialization,
// credentials, or a real HTTP adapter. Only the final transport is replaced.
export function addressServiceFixture({ native = false, token = 'synthetic-token', transport } = {}) {
  const calls = [];
  const config = { isNativeScript: native, okamApiBaseUrl: 'http://127.0.0.1:9', version: 'test', selectedTheme: '' };
  class HttpModule {
    httpClient = request => { calls.push(request); return transport(request); };
  }
  const modules = new Map();
  function load(relative) {
    if (modules.has(relative)) return modules.get(relative);
    const filename = resolve(coreRoot, relative);
    const { outputText, diagnostics } = ts.transpileModule(readFileSync(filename, 'utf8'), {
      fileName: filename, reportDiagnostics: true,
      compilerOptions: { target: ts.ScriptTarget.ES2020, module: ts.ModuleKind.CommonJS },
    });
    assert.equal(diagnostics.filter(item => item.category === ts.DiagnosticCategory.Error).length, 0);
    const module = { exports: {} };
    const require = name => {
      if (name === '../helpers/configuration') return { default: config };
      if (name === '../platform') return { getHttpModule: () => HttpModule };
      if (name === '../enums') return { ...load('enums/http-method.ts'), ...load('enums/http-property.ts') };
      if (name === '../models') return {};
      if (name === './index') return { RequestService: load('services/request-service.ts').RequestService, NotificationService: class {} };
      throw new Error(`Unexpected source dependency: ${relative}: ${name}`);
    };
    vm.runInThisContext(`(function(require,module,exports){${outputText}\n})`, { filename })(require, module, module.exports);
    modules.set(relative, module.exports);
    return module.exports;
  }
  const service = new (load('services/user-service.ts').UserService)({ bearerToken: token, cultureCode: 'no', clientPlatformName: 'synthetic' });
  return { service, calls };
}
