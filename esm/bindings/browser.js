import { randomFillSync as randomFillSync_1 } from '../node_modules/.pnpm/randomfill@1.0.4/node_modules/randomfill/browser.js';
import path from '../node_modules/.pnpm/path-browserify@1.0.1/node_modules/path-browserify/index.js';
import _hrtime from './browser-hrtime.js';
import { WASIExitError, WASIKillError } from '../types.js';

const bindings = {
    hrtime: _hrtime.bigint,
    exit: (code) => {
        throw new WASIExitError(code);
    },
    kill: (signal) => {
        throw new WASIKillError(signal);
    },
    randomFillSync: randomFillSync_1,
    isTTY: () => true,
    path,
    // Let the user attach the fs at runtime
    fs: null,
};

export { bindings as default };
