import _Buffer from '../../node_modules/.pnpm/buffer@6.0.3/node_modules/buffer/index.js';

// looks like it is a limitation of @rollup/plugin-inject...
const { Buffer } = _Buffer;

export { Buffer };
