import wasmImport, { WasmInstance } from "./wasm";

export let wasm: WasmInstance | undefined = undefined;

export async function init(): Promise<void> {
  if (wasm != null) {
    return;
  }
  wasm = await wasmImport("integer");
  // Initialize GMP custom allocator:
  wasm.exports.initCustomAllocator();
}
init();

class IntegerClass {
  i: number;

  constructor(n: number | string | null, i?: number) {
    if (wasm == null) throw Error("await init() first");
    if (n === null && i !== undefined) {
      this.i = i;
      return;
    }
    if (typeof n == "number") {
      this.i = wasm.exports.createIntegerInt(n);
      return;
    }
    this.i = wasm.callWithString("createIntegerStr", `${n}`);
  }

  print() {
    if (wasm == null) throw Error("await init() first");
    wasm.exports.printInteger(this.i);
  }

  nextPrime() {
    if (wasm == null) throw Error("await init() first");
    return new IntegerClass(null, wasm.exports.nextPrime(this.i));
  }

  isPseudoPrime() {
    if (wasm == null) throw Error("await init() first");
    return wasm.exports.wrappedIsPseudoPrime(this.i);
  }

  toString() {
    this.print();
    return ""; // since we don't have sending strings yet!
  }
}

export function isPseudoPrime(n: number | string): 0 | 1 | 2 {
  if (wasm == null) throw Error("await init() first");
  if (typeof n == "string") {
    return wasm.callWithString("isPseudoPrime", `${n}`);
  } else {
    return wasm.exports.isPseudoPrimeInt(n);
  }
}

export const Integer = (x) => new IntegerClass(x);
