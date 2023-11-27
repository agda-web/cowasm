class WASIError extends Error {
    errno;
    constructor(errno) {
        super();
        this.errno = errno;
        Object.setPrototypeOf(this, WASIError.prototype);
    }
}
class WASIExitError extends Error {
    code;
    constructor(code) {
        super(`WASI Exit error: ${code}`);
        this.code = code;
        Object.setPrototypeOf(this, WASIExitError.prototype);
    }
}
class WASIKillError extends Error {
    signal;
    constructor(signal) {
        super(`WASI Kill signal: ${signal}`);
        this.signal = signal;
        Object.setPrototypeOf(this, WASIKillError.prototype);
    }
}

export { WASIError, WASIExitError, WASIKillError };
