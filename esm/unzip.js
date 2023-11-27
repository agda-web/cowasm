import { p as pathBrowserify } from './node_modules/.pnpm/path-browserify@1.0.1/node_modules/path-browserify/index.js';
import { unzipSync } from './node_modules/.pnpm/fflate@0.7.3/node_modules/fflate/esm/browser.js';

function unzip({ data, fs, directory }) {
    // const t0 = new Date().valueOf();
    if (data instanceof ArrayBuffer) {
        data = new Uint8Array(data);
    }
    if (!(data instanceof Uint8Array)) {
        throw Error("impossible"); // was converted above. this is for typescript.
    }
    const z = unzipSync(data);
    for (const [relativePath, content] of Object.entries(z)) {
        const outputFilename = pathBrowserify.join(directory, relativePath);
        fs.mkdirSync(pathBrowserify.dirname(outputFilename), { recursive: true });
        if (outputFilename.endsWith('/')) {
            // it is a directory, not a file.
            continue;
        }
        fs.writeFileSync(outputFilename, content);
        fs.chmodSync(outputFilename, 0o777);
    }
    //   console.log(
    //     `extract ${data.length / 10 ** 6} MB in ${new Date().valueOf() - t0}ms`
    //   );
}

export { unzip as default };
