import type { WasmInstance } from "../wasm/types";
import { Options } from "../wasm/import";
import type { FileSystemSpec } from "wasi-js";

export let wasm: WasmInstance | undefined = undefined;

export async function terminal(argv: string[]): Promise<number> {
  if (wasm == null) throw Error("call init - wasm must be initialized");
  return await wasm.terminal(argv);
}

type WASMImportFunction = (
  wasmSource: string,
  options: Options,
  log?: (...args) => void
) => Promise<WasmInstance>;

interface InitOpts {
  wasmSource: string; // file path in node.js; a URL in browser.
  programName?: string; // file path to executable script, e.g., /.../python-wasm[-debug] in nodejs; fine to leave blank in browser (?).
  wasmImport: WASMImportFunction;
  fs: FileSystemSpec[];
  env: { [name: string]: string };
}

export async function _init({
  wasmSource,
  wasmImport,
  fs,
  env,
}: InitOpts): Promise<void> {
  if (wasm != null) {
    // already initialized
    return;
  }
  wasm = await wasmImport(wasmSource, {
    env,
    fs,
  });
  // critical to do this first, because otherwise process.cwd() gets
  // set to '/' (the default in WASM) when any posix call happens.
  await wasm.callWithString("chdir", process.cwd());
}
