import type WasmInstance from "./instance";
import { Options } from "./import";

export default function initWorker({
  wasmImport,
  parent,
  log,
  captureOutput,
}: {
  wasmImport: Function;
  parent: {
    // on events:
    //   'message', (message) => ...
    //   'exit'
    on: Function;
    postMessage: Function;
  };
  log?: (...args) => void;
  // if captureOutput is true, we will send stdout and stderr events when such output is
  // written, instead of writing to /dev/stdout and /dev/stderr.  This saves trouble having
  // to watch and read from those filesystems.  For browser xterm.js integration, we use
  // this, but for a nodejs terminal, we don't.
  captureOutput?: boolean;
}) {
  let wasm: undefined | WasmInstance = undefined;
  parent.on("message", async (message) => {
    log?.("worker got message ", message);
    switch (message.event) {
      case "init":
        try {
          const opts: Options = { ...message.options };
          const { spinLockBuffer, stdinLockBuffer } = message.locks ?? {};
          if (spinLockBuffer == null) {
            throw Error("must define spinLockBuffer");
          }
          if (stdinLockBuffer == null) {
            throw Error("must define stdinLockBuffer");
          }

          if (opts.stdinBuffer == null) {
            throw Error("must define stdinBuffer");
          }

          const spinLock = new Int32Array(spinLockBuffer);
          opts.spinLock = (time: number) => {
            log?.("spinLock starting, time=", time);
            // We ask main thread to do the lock:
            parent.postMessage({ event: "sleep", time });
            // We wait a moment for that message to be processed:
            while (spinLock[0] != 1) {
              // wait for it to change from what it is now.
              Atomics.wait(spinLock, 0, spinLock[0], 100);
            }
            // now the lock is set, and we wait for it to get unset:
            Atomics.wait(spinLock, 0, 1, time);
            log?.("spinLock done, time=", time);
          };

          const stdinBuffer = opts.stdinBuffer;
          const stdinLock = new Int32Array(stdinLockBuffer);
          opts.waitForStdin = () => {
            parent.postMessage({ event: "waitForStdin" });
            while (stdinLock[0] != -1) {
              Atomics.wait(stdinLock, 0, stdinLock[0]);
            }
            // wait to change from -1
            Atomics.wait(stdinLock, 0, -1);
            // how much was read
            const bytes = stdinLock[0];
            const data = Buffer.from(stdinBuffer.slice(0, bytes)); // not a copy
            return data;
          };

          const { signalBuffer } = message.options;
          if (signalBuffer == null) {
            throw Error("must define signalBuffer");
          }
          const signalState = new Int32Array(signalBuffer);
          opts.wasmEnv = {
            wasmGetSignalState: () => {
              const signal = Atomics.load(signalState, 0);
              if (signal) {
                log?.("signalState", signalState[0]);
                Atomics.store(signalState, 0, 0);
                return signal;
              }
              return 0;
            },
          };

          if (captureOutput) {
            opts.sendStdout = (data) => {
              log?.("sendStdout", data);
              parent.postMessage({ event: "stdout", data });
            };

            opts.sendStderr = (data) => {
              log?.("sendStderr", data);
              parent.postMessage({ event: "stderr", data });
            };
          }

          wasm = await wasmImport(message.name, opts, log);
          parent.postMessage({ event: "init", status: "ok" });
        } catch (err) {
          parent.postMessage({
            event: "init",
            status: "error",
            error: err.toString(),
          });
        }
        return;

      case "callWithString":
        if (wasm == null) {
          throw Error("wasm must be initialized");
        }
        try {
          parent.postMessage({
            id: message.id,
            result: wasm.callWithString(
              message.name,
              message.str, // this is a string or string[]
              ...message.args
            ),
          });
        } catch (error) {
          parent.postMessage({
            id: message.id,
            error,
          });
        }
        return;

      case "call":
        if (wasm == null) {
          throw Error("wasm must be initialized");
        }
        parent.postMessage({
          id: message.id,
          result: wasm.callWithString(message.name, "", []),
        });
        return;
    }
  });
}
